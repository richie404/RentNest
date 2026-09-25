import java.sql.*;
import java.util.*;
import java.util.stream.Collectors;

/** Standalone checks; optional disposable-schema argument enables rollback-only DML tests. */
public class DomainConsistencyCheck {
    public static void main(String[] args) throws Exception {
        check(Role.fromDatabase(" owner ") == Role.OWNER, "Role normalization");
        check(InquiryStatus.fromDatabase("REPLIED").databaseValue().equals("Replied"), "Inquiry storage case");
        check(new Booking().getBookingStatus() == BookingStatus.PENDING, "Booking default");
        check(new Listing().getApprovalStatus() == ApprovalStatus.PENDING, "Approval default");
        check(new Listing().getType() == null, "Unknown listing type preserved");
        check(BookingStatus.PENDING.isPending() && BookingStatus.PENDING_OWNER_APPROVAL.isPending(), "Both pending states");
        for (BookingStatus status : BookingStatus.values())
            check(status.blocksAvailability() == Set.of(BookingStatus.PENDING, BookingStatus.PENDING_OWNER_APPROVAL,
                    BookingStatus.APPROVED, BookingStatus.CONFIRMED).contains(status), "Availability states");
        rejects(() -> new User().setRoles("SUPERADMIN"));
        rejects(() -> new Listing().setListingType("HOUSE"));
        rejects(() -> new Listing().setStatus("CONFIRMED"));
        rejects(() -> new Booking().setStatus("CANCELLED_BY_RENTER"));
        rejects(() -> new Booking().setStatus(null));
        rejects(() -> new AdminService().updateListingStatus(-1, "INVALID"));
        rejects(() -> new AdminService().updateUserRole(-1, "OWNER,ADMIN"));
        rejects(() -> BookingStatus.fromDatabase("INVALID"));
        rejects(() -> InquiryStatus.fromDatabase("RESPONDED"));
        rejects(() -> new AuthenticationService().register("unused", "unused", "unused", "unused", "INVALID"));
        rejects(() -> Validation.dates(null, null));

        if (args.length != 0 && !args[0].matches("rentnest_(phase2|flyway)_test_[a-z0-9_]+"))
            throw new IllegalArgumentException("DML checks require an explicitly named disposable schema");
        try (Connection db = Database.getConnection()) {
            if (args.length != 0 && !args[0].equals(db.getCatalog()))
                throw new IllegalArgumentException("External configuration must select the requested disposable schema");
            db.setReadOnly(args.length == 0);
            db.setAutoCommit(false);
            try {
                enumMatches(db, "users", "role", Arrays.stream(Role.values()).map(Enum::name).toList());
                enumMatches(db, "users", "status", Arrays.stream(UserStatus.values()).map(Enum::name).toList());
                enumMatches(db, "listings", "listing_type", Arrays.stream(ListingType.values()).map(Enum::name).toList());
                enumMatches(db, "listings", "approval_status", Arrays.stream(ApprovalStatus.values()).map(Enum::name).toList());
                enumMatches(db, "bookings", "status", Arrays.stream(BookingStatus.values()).map(Enum::name).toList());
                enumMatches(db, "inquiries", "status", Arrays.stream(InquiryStatus.values()).map(InquiryStatus::databaseValue).toList());
                checkForeignKeys(db);
                if (args.length != 0) checkConstraints(db);
            } finally {
                db.rollback();
            }
        }
        System.out.println("PASS: canonical enums, invalid inputs, model defaults, FK integrity"
                + (args.length == 0 ? " (read-only SQL)" : ", and migrated constraints (test writes rolled back)"));
    }

    private static void enumMatches(Connection db, String table, String column, List<String> values) throws SQLException {
        try (PreparedStatement ps = db.prepareStatement("""
                SELECT COLUMN_TYPE FROM information_schema.COLUMNS
                WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=?
                """)) {
            ps.setString(1, table);
            ps.setString(2, column);
            try (ResultSet rs = ps.executeQuery()) {
                check(rs.next(), table + "." + column + " exists");
                String expected = values.stream().map(v -> "'" + v + "'").collect(Collectors.joining(",", "enum(", ")"));
                check(expected.equals(rs.getString(1)), "Exact Java/DB enum parity: " + table + "." + column);
            }
        }
    }

    private static void checkForeignKeys(Connection db) throws SQLException {
        int count = 0;
        try (Statement st = db.createStatement(); ResultSet rs = st.executeQuery("""
                SELECT TABLE_NAME,COLUMN_NAME,REFERENCED_TABLE_NAME,REFERENCED_COLUMN_NAME
                FROM information_schema.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA=DATABASE() AND REFERENCED_TABLE_NAME IS NOT NULL
                """)) {
            while (rs.next()) {
                String child = rs.getString(1), column = rs.getString(2);
                String parent = rs.getString(3), key = rs.getString(4);
                try (Statement query = db.createStatement(); ResultSet orphans = query.executeQuery(
                        "SELECT COUNT(*) FROM " + child + " c LEFT JOIN " + parent
                                + " p ON c." + column + "=p." + key
                                + " WHERE c." + column + " IS NOT NULL AND p." + key + " IS NULL")) {
                    orphans.next();
                    check(orphans.getInt(1) == 0, "No orphans: " + child + "." + column);
                }
                count++;
            }
        }
        check(count == 16, "All sixteen foreign keys present");
    }

    private static void checkConstraints(Connection db) throws SQLException {
        // ENUM checks must work even without strict mode. NULL input rejection requires
        // strict mode: permissive servers may replace NULL with a column's default.
        try (Statement st = db.createStatement()) {
            for (String sql : List.of(
                    "UPDATE users SET role='INVALID' LIMIT 1",
                    "UPDATE users SET active=2 LIMIT 1",
                    "UPDATE users SET active=0,status='ACTIVE' LIMIT 1",
                    "UPDATE listings SET listing_type='HOUSE' LIMIT 1",
                    "UPDATE listings SET approval_status='INVALID' LIMIT 1",
                    "UPDATE bookings SET status='INVALID' LIMIT 1",
                    "UPDATE bookings SET start_date=NULL LIMIT 1",
                    "UPDATE bookings SET end_date=NULL LIMIT 1",
                    "UPDATE bookings SET total_amount=NULL LIMIT 1",
                    "UPDATE bookings SET status=NULL LIMIT 1",
                    "UPDATE bookings SET end_date=DATE_SUB(start_date, INTERVAL 1 DAY) LIMIT 1",
                    "UPDATE bookings SET total_amount=-1 LIMIT 1",
                    "INSERT INTO payments(booking_id,amount) SELECT id,-1 FROM bookings LIMIT 1",
                    "INSERT INTO inquiries(listing_id,renter_id,status) SELECT listing_id,renter_id,'INVALID' FROM bookings LIMIT 1",
                    "INSERT INTO inquiries(listing_id,renter_id,status) SELECT listing_id,renter_id,NULL FROM bookings LIMIT 1",
                    "INSERT INTO listing_photos(listing_id,url,is_primary) SELECT listing_id,'test-only',1 FROM listing_photos WHERE is_primary=1 LIMIT 1",
                    "INSERT INTO favorites(user_id,listing_id) SELECT user_id,listing_id FROM favorites LIMIT 1")) {
                st.execute("SET SESSION sql_mode='" +
                        (sql.contains("NULL") ? "STRICT_TRANS_TABLES" : "") + "'");
                boolean rejected = false;
                try { st.executeUpdate(sql); } catch (SQLException expected) {
                    // Data/constraint errors only; syntax errors must fail this check.
                    rejected = expected.getSQLState().startsWith("23") || expected.getSQLState().equals("45000")
                            || expected.getErrorCode() == 4025 || expected.getErrorCode() == 3819
                            || expected.getErrorCode() == 1048;
                }
                check(rejected, "Constraint must reject: " + sql);
            }
            for (BookingStatus status : BookingStatus.values())
                st.executeUpdate("UPDATE bookings SET status='" + status.name() + "' LIMIT 1");
            for (Role role : Role.values())
                st.executeUpdate("UPDATE users SET role='" + role.name() + "' LIMIT 1");
            for (UserStatus status : UserStatus.values())
                st.executeUpdate("UPDATE users SET status='" + status.name()
                        + "',active=" + (status == UserStatus.ACTIVE ? 1 : 0) + " LIMIT 1");
            for (ListingType type : ListingType.values())
                st.executeUpdate("UPDATE listings SET listing_type='" + type.name() + "' LIMIT 1");
            for (ApprovalStatus status : ApprovalStatus.values())
                st.executeUpdate("UPDATE listings SET approval_status='" + status.name() + "' LIMIT 1");
            for (InquiryStatus status : InquiryStatus.values())
                st.executeUpdate("INSERT INTO inquiries(listing_id,renter_id,status) SELECT listing_id,renter_id,'"
                        + status.databaseValue() + "' FROM bookings LIMIT 1");
            // Multiple secondary images remain valid; unique primary rule only applies to is_primary=1.
            st.executeUpdate("INSERT INTO listing_photos(listing_id,url) SELECT id,'test-secondary' FROM listings LIMIT 1");
            st.executeUpdate("INSERT INTO listing_photos(listing_id,url) SELECT id,'test-secondary-2' FROM listings LIMIT 1");
        }
    }

    @FunctionalInterface private interface Action { void run() throws Exception; }
    private static void rejects(Action action) throws Exception {
        try { action.run(); } catch (IllegalArgumentException expected) { return; }
        throw new AssertionError("Invalid domain input accepted");
    }
    private static void check(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }
}
