import java.security.MessageDigest;
import java.sql.*;
import java.util.Optional;
import java.util.ArrayList;
import java.util.List;

/**
 * Handles all user-related database operations.
 */
public class UserDAO {

    // Check if an email already exists in the users table
    public boolean emailExists(String email) throws Exception {
        String sql = "SELECT id FROM users WHERE email = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email);
            try (ResultSet rs = stmt.executeQuery()) {
                return rs.next();
            }
        }
    }
    public List<User> getAllUsers() {
        List<User> list = new ArrayList<>();
        String sql = "SELECT id, username AS name, email, role AS roles, active FROM users ORDER BY id DESC";

        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {

            while (rs.next()) {
                User u = new User(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("email"),
                        rs.getBoolean("active"),
                        rs.getString("roles")
                );
                list.add(u);
            }
        } catch (SQLException e) {
            System.err.println("❌ [UserDAO] getAllUsers failed: " + e.getMessage());
        }
        return list;
    }

    public boolean updateUserStatus(int userId, boolean active) {
        String sql = "UPDATE users SET active = ? WHERE id = ?";
        try (Connection conn = DBUtil.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setBoolean(1, active);
            stmt.setInt(2, userId);
            return stmt.executeUpdate() > 0;
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }




    // Register a new user
    public int register(String username, String email, String password, String role) throws Exception {
        String hashed = hashPassword(password);

        String sql = "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql, PreparedStatement.RETURN_GENERATED_KEYS)) {

            stmt.setString(1, username);
            stmt.setString(2, email);
            stmt.setString(3, hashed);
            stmt.setString(4, role.toUpperCase());
            stmt.executeUpdate();

            try (ResultSet rs = stmt.getGeneratedKeys()) {
                if (rs.next()) return rs.getInt(1);
            }
        }
        throw new Exception("User registration failed.");
    }

    // Validate login credentials
    public boolean checkCredentials(String email, String password) throws Exception {
        String sql = "SELECT password_hash FROM users WHERE email = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    String storedHash = rs.getString("password_hash");
                    return storedHash.equals(hashPassword(password));
                }
            }
        }
        return false;
    }

    // Retrieve user by email
    public Optional<User> findByEmail(String email) throws Exception {
        String sql = "SELECT id, username, email, role FROM users WHERE email = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    User user = new User(
                            rs.getInt("id"),
                            rs.getString("username"),
                            rs.getString("email"),
                            true, // active = true (you can add a DB column later)
                            rs.getString("role")
                    );
                    return Optional.of(user);
                }
            }
        }
        return Optional.empty();
    }

    // Simple password hashing with SHA-256
    private String hashPassword(String password) throws Exception {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] hashed = md.digest(password.getBytes());
        StringBuilder sb = new StringBuilder();
        for (byte b : hashed) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
