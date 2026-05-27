import java.sql.*;
import java.util.ArrayList;
import java.util.List;

/**
 * MessageDAO — Data Access for RentNest chat system.
 * Handles all DB interactions related to messaging between users.
 */
public class MessageDAO {

    /* -----------------------------------------------------------
       📤 Add a new message (handles null listing_id)
       ----------------------------------------------------------- */
    public void addMessage(Message m) throws Exception {
        final String sql =
                "INSERT INTO messages (listing_id, sender_id, receiver_id, message_text, timestamp) " +
                        "VALUES (?, ?, ?, ?, NOW())";

        try (Connection c = DBUtil.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {

            // ✅ listing_id can be NULL
            if (m.getListingId() == null)
                ps.setNull(1, Types.INTEGER);
            else
                ps.setInt(1, m.getListingId());

            ps.setInt(2, m.getSenderId());
            ps.setInt(3, m.getReceiverId());
            ps.setString(4, m.getMessageText());
            ps.executeUpdate();
        }
    }

    /* -----------------------------------------------------------
       🧵 Fetch a two-party conversation (for given listing)
       Works both directions (owner↔renter) and supports NULL listing_id
       ----------------------------------------------------------- */
    public List<Message> getConversation(Integer listingId, int userA, int userB) throws Exception {
        final String sql =
                "SELECT id, listing_id, sender_id, receiver_id, message_text, timestamp " +
                        "FROM messages " +
                        "WHERE ( (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ) " +
                        "AND (listing_id = ? OR (? IS NULL AND listing_id IS NULL)) " +
                        "ORDER BY timestamp ASC";

        try (Connection c = DBUtil.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {

            // Match both directions (A↔B)
            ps.setInt(1, userA);
            ps.setInt(2, userB);
            ps.setInt(3, userB);
            ps.setInt(4, userA);

            // Handle null-safe listing_id comparison
            if (listingId == null) {
                ps.setNull(5, Types.INTEGER);
                ps.setNull(6, Types.INTEGER);
            } else {
                ps.setInt(5, listingId);
                ps.setInt(6, listingId);
            }

            List<Message> messages = new ArrayList<>();
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    messages.add(new Message(
                            rs.getInt("id"),
                            rs.getObject("listing_id") == null ? null : rs.getInt("listing_id"),
                            rs.getInt("sender_id"),
                            rs.getInt("receiver_id"),
                            rs.getString("message_text"),
                            rs.getTimestamp("timestamp").toLocalDateTime()
                    ));
                }
            }
            return messages;
        }
    }

    /* -----------------------------------------------------------
       🏡 Fetch messages related to a specific listing
       ----------------------------------------------------------- */
    public List<Message> getMessagesForListing(int listingId) throws Exception {
        final String sql =
                "SELECT id, listing_id, sender_id, receiver_id, message_text, timestamp " +
                        "FROM messages WHERE listing_id=? ORDER BY timestamp ASC";

        try (Connection c = DBUtil.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {

            ps.setInt(1, listingId);

            List<Message> out = new ArrayList<>();
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    out.add(new Message(
                            rs.getInt("id"),
                            rs.getInt("listing_id"),
                            rs.getInt("sender_id"),
                            rs.getInt("receiver_id"),
                            rs.getString("message_text"),
                            rs.getTimestamp("timestamp").toLocalDateTime()
                    ));
                }
            }
            return out;
        }
    }

    /* -----------------------------------------------------------
       👑 Fetch all messages received by a property owner
       ----------------------------------------------------------- */
    public List<Message> getMessagesForOwner(int ownerId) throws Exception {
        final String sql =
                "SELECT id, listing_id, sender_id, receiver_id, message_text, timestamp " +
                        "FROM messages WHERE receiver_id=? ORDER BY timestamp DESC";

        try (Connection c = DBUtil.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {

            ps.setInt(1, ownerId);

            List<Message> out = new ArrayList<>();
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    out.add(new Message(
                            rs.getInt("id"),
                            rs.getObject("listing_id") == null ? null : rs.getInt("listing_id"),
                            rs.getInt("sender_id"),
                            rs.getInt("receiver_id"),
                            rs.getString("message_text"),
                            rs.getTimestamp("timestamp").toLocalDateTime()
                    ));
                }
            }
            return out;
        }
    }

    /* -----------------------------------------------------------
       🧍 Fetch all messages for a renter (sent OR received)
       ----------------------------------------------------------- */
    public List<Message> getMessagesForUser(int renterId) throws Exception {
        final String sql =
                "SELECT id, listing_id, sender_id, receiver_id, message_text, timestamp " +
                        "FROM messages " +
                        "WHERE sender_id=? OR receiver_id=? " +
                        "ORDER BY timestamp DESC";

        try (Connection c = DBUtil.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {

            ps.setInt(1, renterId);
            ps.setInt(2, renterId);

            List<Message> out = new ArrayList<>();
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) {
                    out.add(new Message(
                            rs.getInt("id"),
                            rs.getObject("listing_id") == null ? null : rs.getInt("listing_id"),
                            rs.getInt("sender_id"),
                            rs.getInt("receiver_id"),
                            rs.getString("message_text"),
                            rs.getTimestamp("timestamp").toLocalDateTime()
                    ));
                }
            }
            return out;
        }
    }
}
