import java.sql.*;
import java.util.*;

public class AdminDAO {

    /* -----------------------------------------------------------
       🔹 FETCH ALL PENDING LISTINGS
       ----------------------------------------------------------- */
    public List<Listing> getPendingListings() {
        List<Listing> pendingList = new ArrayList<>();
        String sql = "SELECT * FROM listings WHERE approval_status = 'PENDING'";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Listing listing = new Listing()
                        .setId(rs.getInt("id"))
                        .setStatus(rs.getString("approval_status"))
                        .setTitle(rs.getString("name")) // DB column is 'name'
                        .setListingType(null)
                        .setLocation(rs.getString("location"))
                        .setDescription(null)
                        .setPricePerMonth(rs.getDouble("price"))
                        .setDeposit(0.0)
                        .setSizeSqft(null)
                        .setFurnished(false)
                        .setBachelorAllowed(true)
                        .setFamilyAllowed(true)
                        .setOwnerId(rs.getInt("owner_id"))
                        .setImageUrl(null);
                pendingList.add(listing);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return pendingList;
    }

    /* -----------------------------------------------------------
       🔹 APPROVE / REJECT LISTING
       ----------------------------------------------------------- */
    public boolean approveListing(int listingId) {
        return updateListingStatus(listingId, "APPROVED");
    }

    public boolean rejectListing(int listingId) {
        return updateListingStatus(listingId, "REJECTED");
    }

    public boolean updateListingStatus(int id, String status) {
        String sql = "UPDATE listings SET approval_status=? WHERE id=?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, status);
            stmt.setInt(2, id);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }


    /* -----------------------------------------------------------
       🔹 FETCH ALL USERS
       ----------------------------------------------------------- */
    public List<User> getAllUsers() {
        List<User> users = new ArrayList<>();
        String sql = "SELECT id, username AS name, email, role AS roles, active FROM users";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                User u = new User();
                u.setId(rs.getInt("id"));
                u.setName(rs.getString("name"));
                u.setEmail(rs.getString("email"));
                u.setRoles(rs.getString("roles"));
                u.setActive(rs.getBoolean("active"));
                users.add(u);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return users;
    }

    /* -----------------------------------------------------------
       🔹 USER MANAGEMENT (Ban / Unban / Delete / Role)
       ----------------------------------------------------------- */
    public boolean banUser(int userId) {
        return updateUserStatus(userId, false);
    }

    public boolean unbanUser(int userId) {
        return updateUserStatus(userId, true);
    }

    private boolean updateUserStatus(int userId, boolean active) {
        String status = active ? "ACTIVE" : "BANNED";
        String sql = "UPDATE users SET active = ?, status = ? WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setBoolean(1, active);
            stmt.setString(2, status);
            stmt.setInt(3, userId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean deleteUser(int userId) {
        String sql = "DELETE FROM users WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, userId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateUserRole(int userId, String newRole) {
        String sql = "UPDATE users SET role = ? WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, newRole);
            stmt.setInt(2, userId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /* -----------------------------------------------------------
       🔹 LISTING MANAGEMENT (Delete / Price Update)
       ----------------------------------------------------------- */
    public boolean deleteListing(int listingId) {
        String sql = "DELETE FROM listings WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, listingId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    public boolean updateListingPrice(int listingId, double newPrice) {
        String sql = "UPDATE listings SET price = ? WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setDouble(1, newPrice);
            stmt.setInt(2, listingId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /* -----------------------------------------------------------
       🔹 BOOKINGS MANAGEMENT (Cancel / Delete)
       ----------------------------------------------------------- */
    public List<Booking> getAllBookings() {
        List<Booking> bookings = new ArrayList<>();
        String sql = "SELECT * FROM bookings ORDER BY id DESC";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Booking b = new Booking();
                b.setId(rs.getInt("id"));
                b.setListingId(rs.getInt("listing_id"));
                b.setRenterId(rs.getInt("renter_id"));
                b.setOwnerId(rs.getInt("owner_id"));
                b.setStartDate(rs.getDate("start_date"));
                b.setEndDate(rs.getDate("end_date"));
                b.setTotalAmount(rs.getDouble("total_amount"));
                b.setStatus(rs.getString("status"));
                bookings.add(b);
            }
        } catch (SQLException e) {
            System.err.println("❌ [BookingDAO] getAllBookings failed: " + e.getMessage());
        }
        return bookings;
    }

    public boolean cancelBooking(int bookingId) {
        String sql = "UPDATE bookings SET status = 'CANCELLED' WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setInt(1, bookingId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return false;
    }

    /* -----------------------------------------------------------
       🔹 SUMMARY ANALYTICS (Counts)
       ----------------------------------------------------------- */
    public Map<String, Integer> getSummaryStats() {
        Map<String, Integer> stats = new HashMap<>();
        String[] queries = {
                "SELECT COUNT(*) FROM users",
                "SELECT COUNT(*) FROM listings",
                "SELECT COUNT(*) FROM bookings",
                "SELECT COUNT(*) FROM listings WHERE approval_status='PENDING'"
        };
        String[] keys = {"users", "listings", "bookings", "pending_listings"};

        try (Connection conn = DBUtil.getConnection()) {
            for (int i = 0; i < queries.length; i++) {
                try (Statement stmt = conn.createStatement();
                     ResultSet rs = stmt.executeQuery(queries[i])) {
                    if (rs.next()) stats.put(keys[i], rs.getInt(1));
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return stats;
    }
    public List<Listing> getAllListings() {
        List<Listing> allListings = new ArrayList<>();
        String sql = "SELECT * FROM listings ORDER BY id DESC";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                Listing listing = new Listing()
                        .setId(rs.getInt("id"))
                        .setTitle(rs.getString("name"))
                        .setLocation(rs.getString("location"))
                        .setPricePerMonth(rs.getDouble("price"))
                        .setOwnerId(rs.getInt("owner_id"))
                        .setStatus(rs.getString("approval_status"));
                allListings.add(listing);
            }
        } catch (SQLException e) {
            System.err.println("❌ [AdminDAO] getAllListings failed: " + e.getMessage());
        }
        return allListings;
    }

}
