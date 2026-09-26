import java.util.*;
public class MessageDAO {
    public MessageReceipt insertOnce(String requestId, Message message) {
        return JdbcDAO.transaction(c -> {
            boolean inserted = true;
            try {
                JdbcDAO.update(c,"INSERT INTO messages (listing_id,sender_id,receiver_id,message_text,timestamp,client_message_id) VALUES (?,?,?,?,NOW(),?)",
                        message.getListingId(),message.getSenderId(),message.getReceiverId(),message.getMessageText(),requestId);
            } catch (java.sql.SQLException failure) {
                if (failure.getErrorCode() != 1062) throw failure;
                inserted = false;
            }
            Message stored = JdbcDAO.query(c,"SELECT * FROM messages WHERE sender_id=? AND client_message_id=? FOR UPDATE",
                    DaoMappers::message,message.getSenderId(),requestId).getFirst();
            return new MessageReceipt(stored,inserted);
        });
    }
    public int insert(Message message) {
        return JdbcDAO.insert("INSERT INTO messages (listing_id,sender_id,receiver_id,message_text,timestamp) VALUES (?,?,?,?,NOW())",
            message.getListingId(),message.getSenderId(),message.getReceiverId(),message.getMessageText());
    }
    public List<Message> findConversation(Integer listingId,int userA,int userB) {
        return JdbcDAO.query("""
            SELECT * FROM messages WHERE ((sender_id=? AND receiver_id=?) OR (sender_id=? AND receiver_id=?))
            AND (listing_id=? OR (? IS NULL AND listing_id IS NULL)) ORDER BY timestamp ASC
            """,DaoMappers::message,userA,userB,userB,userA,listingId,listingId);
    }
    public List<Message> findByListing(int id) { return JdbcDAO.query("SELECT * FROM messages WHERE listing_id=? ORDER BY timestamp ASC",DaoMappers::message,id); }
    public List<Message> findByReceiver(int id) { return JdbcDAO.query("SELECT * FROM messages WHERE receiver_id=? ORDER BY timestamp DESC",DaoMappers::message,id); }
    public List<Message> findByUser(int id) { return JdbcDAO.query("SELECT * FROM messages WHERE sender_id=? OR receiver_id=? ORDER BY timestamp DESC",DaoMappers::message,id,id); }
}
