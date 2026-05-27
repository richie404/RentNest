import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class BookingDAO {

    /* -----------------------------------------------------------
       🔹 Create New Booking
       ----------------------------------------------------------- */
    public boolean createBooking(Booking booking) {
        String sql = "INSERT INTO bookings (listing_id, renter_id, owner_id, start_date, end_date, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, booking.getListingId());
            stmt.setInt(2, booking.getRenterId());
            stmt.setInt(3, booking.getOwnerId());
            stmt.setDate(4, booking.getStartDate());
            stmt.setDate(5, booking.getEndDate());
            stmt.setDouble(6, booking.getTotalAmount());
            stmt.setString(7, booking.getStatus());

            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            System.err.println("❌ [BookingDAO] createBooking failed: " + e.getMessage());
            return false;
        }
    }

    /* -----------------------------------------------------------
       🔹 Check Property Availability
       ----------------------------------------------------------- */
    public boolean isPropertyAvailable(int listingId, Date startDate, Date endDate) {
        String sql = """
        SELECT COUNT(*) FROM bookings
        WHERE listing_id = ?
          AND status IN ('PENDING','APPROVED','CONFIRMED','PENDING_OWNER_APPROVAL')
          AND (? BETWEEN start_date AND end_date OR ? BETWEEN start_date AND end_date)
    """;

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, listingId);
            ps.setDate(2, startDate);
            ps.setDate(3, endDate);

            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                return rs.getInt(1) == 0; // ✅ available if no overlaps
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /* -----------------------------------------------------------
       🔹 Admin: Get All Bookings
       ----------------------------------------------------------- */
    public List<Booking> getAllBookings() {
        List<Booking> list = new ArrayList<>();
        String sql = "SELECT * FROM bookings ORDER BY created_at DESC";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) list.add(extractBooking(rs));

        } catch (SQLException e) {
            System.err.println("❌ [BookingDAO] getAllBookings failed: " + e.getMessage());
            e.printStackTrace();
        }
        return list;
    }

    /* -----------------------------------------------------------
       🔹 Update Booking Status (for Admin / Owner)
       ----------------------------------------------------------- */
    public boolean updateBookingStatus(int bookingId, String newStatus) {
        String sql = "UPDATE bookings SET status = ? WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setString(1, newStatus);
            stmt.setInt(2, bookingId);
            return stmt.executeUpdate() > 0;

        } catch (SQLException e) {
            System.err.println("❌ [BookingDAO] updateBookingStatus failed: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    /* -----------------------------------------------------------
       🔹 Delete Booking (Admin cleanup)
       ----------------------------------------------------------- */
    public boolean deleteBooking(int bookingId) {
        String sql = "DELETE FROM bookings WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {

            stmt.setInt(1, bookingId);
            return stmt.executeUpdate() > 0;

        } catch (SQLException e) {
            System.err.println("❌ [BookingDAO] deleteBooking failed: " + e.getMessage());
            e.printStackTrace();
        }
        return false;
    }

    public List<Booking> getBookingsByRenter(int renterId) {
        List<Booking> list = new ArrayList<>();
        String sql = "SELECT * FROM bookings WHERE renter_id = ? ORDER BY created_at DESC";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, renterId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) list.add(extractBooking(rs));
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    public List<Booking> getBookingsByOwner(int ownerId) {
        List<Booking> list = new ArrayList<>();
        String sql = "SELECT * FROM bookings WHERE owner_id = ? ORDER BY created_at DESC";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, ownerId);
            ResultSet rs = stmt.executeQuery();
            while (rs.next()) list.add(extractBooking(rs));
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return list;
    }

    private Booking extractBooking(ResultSet rs) throws SQLException {
        Booking b = new Booking();
        b.setId(rs.getInt("id"));
        b.setListingId(rs.getInt("listing_id"));
        b.setRenterId(rs.getInt("renter_id"));
        b.setOwnerId(rs.getInt("owner_id"));
        b.setStartDate(rs.getDate("start_date"));
        b.setEndDate(rs.getDate("end_date"));
        b.setTotalAmount(rs.getDouble("total_amount"));
        b.setStatus(rs.getString("status"));
        b.setCreatedAt(rs.getTimestamp("created_at"));
        return b;
    }
    public boolean cancelBooking(int bookingId) {
        String sql = "UPDATE bookings SET status = 'CANCELLED_BY_RENTER' WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, bookingId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }


}
