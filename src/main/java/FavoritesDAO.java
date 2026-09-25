import java.util.*;
public class FavoritesDAO {
    public boolean insert(int userId,int listingId) {
        try { return JdbcDAO.update("INSERT INTO favorites (user_id,listing_id) VALUES (?,?)",userId,listingId)>0; }
        catch(DataAccessException failure) {
            // Expected unique-key conflict only; never suppress FK, connectivity or truncation errors.
            if(failure.getCause() instanceof java.sql.SQLException e && e.getErrorCode()==1062) return false;
            throw failure;
        }
    }
    public boolean delete(int userId,int listingId) { return JdbcDAO.update("DELETE FROM favorites WHERE user_id=? AND listing_id=?",userId,listingId)>0; }
    public boolean exists(int userId,int listingId) { return JdbcDAO.one("SELECT id FROM favorites WHERE user_id=? AND listing_id=?",r->r.getInt(1),userId,listingId).isPresent(); }
    public List<Listing> findListingsByUser(int userId) {
        return JdbcDAO.query(ListingDAO.SELECT+"JOIN favorites f ON f.listing_id=l.id WHERE f.user_id=? ORDER BY f.created_at DESC",DaoMappers::listing,userId);
    }
    public List<Favorite> findByUser(int userId) {
        return JdbcDAO.query("SELECT * FROM favorites WHERE user_id=? ORDER BY created_at DESC",
            r->new Favorite(r.getInt("id"),r.getInt("user_id"),r.getInt("listing_id"),DaoMappers.time(r,"created_at")),userId);
    }
    public int countByListing(int id) { return JdbcDAO.one("SELECT COUNT(*) FROM favorites WHERE listing_id=?",r->r.getInt(1),id).orElseThrow(); }
}
