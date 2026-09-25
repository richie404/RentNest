import java.sql.*;
import java.time.LocalDateTime;
/** Internal JDBC-to-domain mapping, shared only by persistence classes. */
final class DaoMappers {
    private DaoMappers() {}
    static LocalDateTime time(ResultSet r, String column) throws SQLException {
        Timestamp value=r.getTimestamp(column);
        return value == null ? null : value.toLocalDateTime();
    }
    private static Boolean bool(ResultSet r, String column) throws SQLException {
        boolean value=r.getBoolean(column); return r.wasNull() ? null : value;
    }
    static Listing listing(ResultSet r) throws SQLException {
        return new Listing().setId(r.getInt("id")).setTitle(r.getString("title"))
            .setListingType(r.getString("listing_type")).setLocation(r.getString("location"))
            .setDescription(r.getString("description")).setPriceAmount(r.getBigDecimal("price_month"))
            .setDepositAmount(r.getBigDecimal("deposit")).setSizeSqft(r.getObject("size_sqft", Long.class))
            .setBedrooms(r.getObject("bedrooms", Integer.class)).setBathrooms(r.getObject("bathrooms", Integer.class))
            .setFurnishedValue(bool(r,"furnished")).setBachelorAllowedValue(bool(r,"bachelor_allowed"))
            .setFamilyAllowedValue(bool(r,"family_allowed")).setOwnerId(r.getObject("owner_id", Integer.class))
            .setStatus(r.getString("approval_status")).setAvailable(r.getBoolean("is_available"))
            .setCreatedAt(time(r,"created_at")).setUpdatedAt(time(r,"updated_at")).setImageUrl(r.getString("image_url"));
    }
    static User user(ResultSet r) throws SQLException {
        User u=new User(r.getInt("id"),r.getString("username"),r.getString("email"),
                r.getBoolean("active"),r.getString("role"));
        u.setStatus(UserStatus.fromDatabase(r.getString("status")));
        u.setCreatedAt(time(r,"created_at")); return u;
    }
    static Booking booking(ResultSet r) throws SQLException {
        Booking b=new Booking();
        b.setId(r.getInt("id")); b.setListingId(r.getInt("listing_id")); b.setRenterId(r.getInt("renter_id"));
        b.setOwnerId(r.getObject("owner_id",Integer.class));
        Date start=r.getDate("start_date"), end=r.getDate("end_date");
        b.setStartDate(start == null ? null : start.toLocalDate());
        b.setEndDate(end == null ? null : end.toLocalDate());
        b.setTotalAmountValue(r.getBigDecimal("total_amount")); b.setStatus(r.getString("status"));
        b.setCreatedAt(time(r,"created_at")); return b;
    }
    static Message message(ResultSet r) throws SQLException {
        return new Message(r.getInt("id"),r.getObject("listing_id",Integer.class),
            r.getInt("sender_id"),r.getInt("receiver_id"),r.getString("message_text"),time(r,"timestamp"));
    }
    static AdminAction action(ResultSet r) throws SQLException {
        AdminAction a=new AdminAction(r.getInt("admin_id"),r.getString("action_type"),r.getInt("target_id"),r.getString("details"));
        a.setId(r.getInt("id")); a.setCreatedAt(time(r,"created_at")); return a;
    }
    static Inquiry inquiry(ResultSet r) throws SQLException {
        return new Inquiry(r.getInt("id"),r.getInt("listing_id"),r.getInt("renter_id"),
            r.getString("message"),r.getString("contact"),InquiryStatus.fromDatabase(r.getString("status")),time(r,"created_at"));
    }
}
