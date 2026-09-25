import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.sql.*;
import java.sql.Date;
import java.util.*;
import javax.sql.DataSource;

/**
 * Standalone, non-destructive schema regression check. Run against an existing schema.
 * SELECTs execute in read-only transactions. Writes are server-prepared to validate
 * their columns, but executeUpdate is intercepted: no INSERT/UPDATE/DELETE is executed.
 * Generated keys and affected-row counts for those intercepted writes are synthetic.
 */
public class SchemaAlignmentCheck {
    private static final List<Write> WRITES = new ArrayList<>();
    private static boolean preparingWrites;
    private record Write(String sql, Map<Integer, Object> parameters) { }

    public static void main(String[] args) throws Exception {
        DataSource pooled = Database.dataSource();
        DataSource intercepted = (DataSource) Proxy.newProxyInstance(
                SchemaAlignmentCheck.class.getClassLoader(), new Class<?>[]{DataSource.class},
                (proxy, method, arguments) -> {
                    if (!method.getName().equals("getConnection")) return invoke(pooled, method, arguments);
                    Connection connection = pooled.getConnection();
                    try {
                        connection.setReadOnly(!preparingWrites);
                        connection.setAutoCommit(false);
                        return guard(connection);
                    } catch (Throwable failure) {
                        connection.close();
                        throw failure;
                    }
                });
        try (AutoCloseable ignored = Database.overrideForTest(intercepted);
             Connection db = Database.getConnection()) {
            checkListings(db);
            checkOtherReads(db);
            preparingWrites = true;
            checkWrites();
        }
        check(Database.dataSource().getHikariPoolMXBean().getActiveConnections() == 0,
                "All DAO leases returned to the pool");
        Database.close();
        System.out.println("PASS: DAO reads, listing mappings, server-prepared write SQL and parameter order; "
                + WRITES.size() + " intercepted writes, zero executed writes");
    }

    private static void checkListings(Connection db) throws Exception {
        ListingDAO dao = new ListingDAO();
        
        List<Listing> all = dao.findAll();
        check(all.size() == count(db, "SELECT COUNT(*) FROM listings"), "All listings count");
        check(new ListingDAO().findAll().size() == all.size(), "Admin listings count");
        check(new ListingDAO().findByApprovalStatus(ApprovalStatus.PENDING).size() == count(db,
                "SELECT COUNT(*) FROM listings WHERE approval_status='PENDING'"), "Pending count");
        check(dao.findFeatured(3).size() == Math.min(3, all.size()), "Featured limit binding");
        check(dao.findFeatured(0).isEmpty(), "Zero featured limit");
        check(dao.findById(-1).isEmpty(), "Missing listing");
        check(!all.isEmpty(), "At least one existing listing is needed to verify real row mappings");

        for (Listing listing : all) {
            try (PreparedStatement ps = db.prepareStatement("SELECT * FROM listings WHERE id=?")) {
                ps.setInt(1, listing.getId());
                try (ResultSet rs = ps.executeQuery()) {
                    check(rs.next(), "Existing listing");
                    compareListing(listing, rs);
                    compareListing(dao.findById(listing.getId()).orElseThrow(), rs);
                    Listing adminListing = new ListingDAO().findAll().stream()
                            .filter(value -> value.getId() == listing.getId()).findFirst().orElseThrow();
                    compareListing(adminListing, rs);
                }
            }
        }
        Listing first = all.getFirst();
        check(dao.search(first.getTitle()).stream().anyMatch(l -> l.getId() == first.getId()), "Title search");
        check(dao.search(first.getLocation()).stream().anyMatch(l -> l.getId() == first.getId()), "Location search");
        check(dao.findByOwner(first.getOwnerId()).stream().anyMatch(l -> l.getId() == first.getId()), "Owner filter");
        check(Objects.equals(dao.findOwnerIdByListing(first.getId()).orElseThrow(), first.getOwnerId()), "Owner lookup");
        check(dao.findPhotosByListingId(first.getId()).length == count(db,
                "SELECT COUNT(*) FROM listing_photos WHERE listing_id=" + first.getId()), "Photos");

        // Synthetic SELECT tests non-null attributes even when seed rows contain only NULLs.
        try (Statement st = db.createStatement(); ResultSet row = st.executeQuery("""
                SELECT 987 AS id, 'Schema fixture' AS title, 'Dhaka' AS location,
                       12345.67 AS price_month, 2 AS owner_id, 'ROOM' AS listing_type,
                       'Description' AS description, 2500 AS deposit, 900 AS size_sqft,
                       3 AS bedrooms, 2 AS bathrooms, 1 AS furnished, 0 AS bachelor_allowed,
                       1 AS family_allowed, 'REJECTED' AS approval_status, 0 AS is_available,
                       NULL AS image_url, NOW() AS created_at, NOW() AS updated_at
                """)) {
            check(row.next(), "Synthetic row");
            Listing mapped = DaoMappers.listing(row);
            compareListing(mapped, row);
            check(mapped.getBeds() == 3 && mapped.getBaths() == 2, "Bedroom/bathroom getters");
        }
    }

    private static void compareListing(Listing value, ResultSet row) throws SQLException {
        check(Objects.equals(value.getTitle(), row.getString("title")), "Title mapping");
        check(value.getPricePerMonth() == row.getDouble("price_month"), "Monthly price mapping");
        check(Objects.equals(value.getListingType(), row.getString("listing_type")), "Type mapping");
        check(Objects.equals(value.getDescription(), row.getString("description")), "Description mapping");
        check(value.getDeposit() == row.getDouble("deposit"), "Deposit mapping");
        check(Objects.equals(value.getSizeSqft(), row.getObject("size_sqft", Long.class)), "Size mapping");
        check(Objects.equals(value.getBedrooms(), row.getObject("bedrooms", Integer.class)), "Bedrooms mapping");
        check(Objects.equals(value.getBathrooms(), row.getObject("bathrooms", Integer.class)), "Bathrooms mapping");
        check(value.isFurnished() == row.getBoolean("furnished"), "Furnished mapping");
        check(value.isBachelorAllowed() == row.getBoolean("bachelor_allowed"), "Bachelor mapping");
        check(value.isFamilyAllowed() == row.getBoolean("family_allowed"), "Family mapping");
        check(Objects.equals(value.getStatus(), row.getString("approval_status")), "Approval mapping");
        check(value.isAvailable() == row.getBoolean("is_available"), "Availability mapping");
    }

    private static void checkOtherReads(Connection db) throws Exception {
        UserDAO users = new UserDAO();
        
        check(users.findAll().size() == count(db, "SELECT COUNT(*) FROM users"), "Users aliases");
        check(users.findAll().size() == users.findAll().size(), "Admin user aliases");
        for (User user : users.findAll()) {
            check(users.existsByEmail(user.getEmail()), "Email query");
            check(users.findByEmail(user.getEmail()).orElseThrow().getId() == user.getId(), "User mapping");
            new FavoritesDAO().findListingsByUser(user.getId());
            new BookingDAO().findByRenter(user.getId());
            new BookingDAO().findByOwner(user.getId());
            new InquiryDAO().findByOwner(user.getId());
            new InquiryDAO().findByRenter(user.getId());
            new InquiryDAO().countByOwnerAndStatus(user.getId(), InquiryStatus.PENDING);
            new MessageDAO().findByReceiver(user.getId());
            new MessageDAO().findByUser(user.getId());
        }
        check(!new AuthenticationService().checkCredentials("schema-check-does-not-exist.invalid", "unused"), "Credential query");
        check(new BookingDAO().findAll().size() == count(db, "SELECT COUNT(*) FROM bookings"), "Bookings");
        check(new BookingDAO().findAll().size() == count(db, "SELECT COUNT(*) FROM bookings"), "Admin bookings");
        new FavoritesDAO().exists(-1, -1);
        new FavoritesDAO().countByListing(-1);
        check(new InquiryDAO().findById(-1).isEmpty(), "Missing inquiry");
        new MessageDAO().findConversation(null, 2, 3);
        new MessageDAO().findConversation(1, 2, 3);
        new MessageDAO().findByListing(1);
        new AdminActionDAO().findRecent(10);
        check(new AdminDAO().findSummary().size() == 4, "Admin summary queries");
        // These tables currently have no application DAO. Verify their documented columns only.
        try (Statement st = db.createStatement()) {
            st.executeQuery("SELECT id, booking_id, amount, payment_date FROM payments LIMIT 0").close();
            st.executeQuery("SELECT id, code, name FROM amenities LIMIT 0").close();
            st.executeQuery("SELECT listing_id, amenity_id FROM listing_amenities LIMIT 0").close();
        }
    }

    private static void checkWrites() throws Exception {
        Listing listing = new Listing("Schema title", "ROOM", "Schema location", 4321.25, 17).setId(91);
        new ListingDAO().insert(listing);
        expect("INSERT INTO listings", "Schema title", "Schema location", 4321.25, 17,
                "ROOM", null, 0, null, null, null, false, true, true, "PENDING", true);
        new ListingDAO().update(listing);
        expect("UPDATE listings", "Schema title", "Schema location", 4321.25, 17,
                "ROOM", null, 0, null, null, null, false, true, true, "PENDING", true, 91);
        new ListingDAO().delete(91,17);
        expect("DELETE FROM listings",91,17);
        
        new ListingDAO().updatePrice(91,new java.math.BigDecimal("8765.50"));
        expect("UPDATE listings SET price_month",8765.50,91);
        new ListingDAO().updateStatus(91,ApprovalStatus.APPROVED);
        expect("UPDATE listings","APPROVED",91);
        new ListingDAO().delete(91);
        new UserDAO().updateStatus(17,UserStatus.BANNED);
        expect("UPDATE users",false,"BANNED",17);
        new UserDAO().updateStatus(17,UserStatus.ACTIVE);
        expect("UPDATE users",true,"ACTIVE",17);
        new UserDAO().updateRole(17,Role.OWNER);
        new UserDAO().delete(17);
        new BookingDAO().updateStatus(81,BookingStatus.CANCELLED);
        expect("UPDATE bookings","CANCELLED",81);
        new UserDAO().updateStatus(17,UserStatus.BANNED);
        expect("UPDATE users",false,"BANNED",17);
        new AuthenticationService().register("Schema user","schema@example.invalid","unused-fixture","unused-fixture","RENTER");
        new BookingDAO().insert(new Booking(91,13,17,java.time.LocalDate.parse("2099-01-01"),
                java.time.LocalDate.parse("2099-02-01"),4321.25,"PENDING_OWNER_APPROVAL"));
        expect("INSERT INTO bookings",91,13,17,Date.valueOf("2099-01-01"),
                Date.valueOf("2099-02-01"),4321.25,"PENDING_OWNER_APPROVAL");
        new BookingDAO().updateStatus(81,BookingStatus.CANCELLED);
        expect("UPDATE bookings","CANCELLED",81);
        new BookingDAO().updateStatus(81,BookingStatus.CONFIRMED);
        expect("UPDATE bookings","CONFIRMED",81);
        new BookingDAO().delete(81);
        new FavoritesDAO().insert(13,91);
        expect("INSERT INTO favorites",13,91);
        new FavoritesDAO().delete(13,91);
        expect("DELETE FROM favorites",13,91);
        new InquiryDAO().insert(91,13,"Inquiry fixture");
        expect("INSERT INTO inquiries",91,13,"Inquiry fixture");
        for(InquiryStatus status : InquiryStatus.values()) {
            new InquiryDAO().updateStatus(71,status);
            expect("UPDATE inquiries",status.databaseValue(),71);
        }
        new MessageDAO().insert(new Message(null,13,17,"Message fixture"));
        expect("INSERT INTO messages",null,13,17,"Message fixture");
        new AdminActionDAO().insert(1,"TEST",91,"Audit fixture");
        expect("INSERT INTO admin_actions",1,"TEST",91,"Audit fixture");
        new AdminActionDAO().deleteAll();
    }
    private static Connection guard(Connection connection) {
        return (Connection) Proxy.newProxyInstance(SchemaAlignmentCheck.class.getClassLoader(),
                new Class<?>[]{Connection.class}, (proxy, method, args) -> {
                    if (method.getName().equals("createStatement")) {
                        Statement statement = (Statement) invoke(connection, method, args);
                        return Proxy.newProxyInstance(SchemaAlignmentCheck.class.getClassLoader(),
                                new Class<?>[]{Statement.class}, (p, m, a) -> {
                                    if (m.getName().equals("executeQuery")) {
                                        check(((String) a[0]).stripLeading().startsWith("SELECT "), "Only SELECT may execute");
                                    } else if (m.getName().startsWith("execute") || m.getName().contains("Batch")) {
                                        throw new AssertionError("Statement mutation blocked");
                                    }
                                    return invoke(statement, m, a);
                                });
                    }
                    if (method.getName().equals("prepareStatement")) {
                        String sql = (String) args[0];
                        PreparedStatement ps;
                        try { ps = (PreparedStatement) invoke(connection, method, args); }
                        catch (SQLException ex) { throw new AssertionError("SQL failed to prepare: " + sql, ex); }
                        check(ps.isWrapperFor(com.mysql.cj.jdbc.ServerPreparedStatement.class), "Must validate SQL on server");
                        Map<Integer, Object> parameters = new TreeMap<>();
                        return Proxy.newProxyInstance(SchemaAlignmentCheck.class.getClassLoader(),
                                new Class<?>[]{PreparedStatement.class}, (p, m, a) -> {
                                    if (m.getName().startsWith("set") && a != null && a.length >= 2 && a[0] instanceof Integer index) {
                                        parameters.put(index, m.getName().equals("setNull") ? null : a[1]);
                                    }
                                    if (m.getName().equals("executeUpdate")) {
                                        check(parameters.size() == ps.getParameterMetaData().getParameterCount(), "All write parameters bound");
                                        WRITES.add(new Write(sql, new TreeMap<>(parameters)));
                                        return 1; // Intentionally never delegate a mutation.
                                    }
                                    if (m.getName().equals("getGeneratedKeys")) {
                                        boolean[] first = {true};
                                        return Proxy.newProxyInstance(SchemaAlignmentCheck.class.getClassLoader(),
                                                new Class<?>[]{ResultSet.class}, (r, rm, ra) -> switch (rm.getName()) {
                                                    case "next" -> { boolean value = first[0]; first[0] = false; yield value; }
                                                    case "getInt" -> 999;
                                                    case "close" -> null;
                                                    default -> throw new UnsupportedOperationException(rm.getName());
                                                });
                                    }
                                    if (m.getName().equals("executeQuery")) {
                                        check(sql.stripLeading().startsWith("SELECT "), "Only prepared SELECT may execute");
                                    } else if (m.getName().startsWith("execute") || m.getName().contains("Batch")) {
                                        throw new AssertionError("Unexpected execution path: " + m.getName());
                                    }
                                    return invoke(ps, m, a);
                                });
                    }
                    return invoke(connection, method, args);
                });
    }

    private static Object invoke(Object target, Method method, Object[] args) throws Throwable {
        try { return method.invoke(target, args); }
        catch (InvocationTargetException ex) { throw ex.getCause(); }
    }

    private static void expect(String prefix, Object... values) {
        Write write = WRITES.getLast();
        check(write.sql().startsWith(prefix), "Expected SQL: " + prefix);
        check(write.parameters().values().stream().map(SchemaAlignmentCheck::normalized).toList().equals(
                Arrays.stream(values).map(SchemaAlignmentCheck::normalized).toList()), "Parameter order: " + prefix);
    }

    private static Object normalized(Object value) {
        return value instanceof Number n ? new java.math.BigDecimal(n.toString()).stripTrailingZeros() : value;
    }

    private static long count(Connection connection, String sql) throws SQLException {
        try (Statement st = connection.createStatement(); ResultSet rs = st.executeQuery(sql)) {
            rs.next();
            return rs.getLong(1);
        }
    }

    private static void check(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }
}
