import java.sql.*;
import java.util.*;
public class ListingDAO {
    // Correlated aggregate gives one listing row without duplicating mapping or GROUP BY projections.
    static final String SELECT = "SELECT l.*, (SELECT MIN(p.url) FROM listing_photos p WHERE p.listing_id=l.id) AS image_url FROM listings l ";
    public List<Listing> findAll() { return JdbcDAO.query(SELECT+"ORDER BY l.created_at DESC",DaoMappers::listing); }
    public List<Listing> findFeatured(int limit) { return JdbcDAO.query(SELECT+"ORDER BY RAND() LIMIT ?",DaoMappers::listing,limit); }
    public Optional<Listing> findById(int id) { return JdbcDAO.one(SELECT+"WHERE l.id=?",DaoMappers::listing,id); }
    Optional<Listing> findByIdForUpdate(Connection c, int id) throws SQLException {
        // Lock the parent before any consistent reads establish the transaction snapshot.
        return JdbcDAO.query(c,"SELECT l.*,NULL AS image_url FROM listings l WHERE l.id=? FOR UPDATE",DaoMappers::listing,id).stream().findFirst();
    }
    public List<Listing> findByOwner(int ownerId) { return JdbcDAO.query(SELECT+"WHERE l.owner_id=? ORDER BY l.created_at DESC",DaoMappers::listing,ownerId); }
    public List<Listing> findByApprovalStatus(ApprovalStatus status) { return JdbcDAO.query(SELECT+"WHERE l.approval_status=?",DaoMappers::listing,status); }
    public List<Listing> search(String query) { return JdbcDAO.query(SELECT+"WHERE l.title LIKE ? OR l.location LIKE ? ORDER BY l.created_at DESC",DaoMappers::listing,"%"+query+"%","%"+query+"%"); }
    public int insert(Listing l) {
        return JdbcDAO.insert("""
            INSERT INTO listings (title,location,price_month,owner_id,listing_type,description,deposit,size_sqft,
            bedrooms,bathrooms,furnished,bachelor_allowed,family_allowed,approval_status,is_available)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            """, values(l));
    }
    private static Object[] values(Listing l) {
        return new Object[]{l.getTitle(),l.getLocation(),l.getPriceAmount(),l.getOwnerId(),l.getType(),l.getDescription(),
            l.getDepositAmount(),l.getSizeSqft(),l.getBedrooms(),l.getBathrooms(),l.getFurnished(),
            l.getBachelorAllowed(),l.getFamilyAllowed(),l.getApprovalStatus(),l.isAvailable()};
    }
    public void update(Listing l) {
        Object[] values=Arrays.copyOf(values(l),16); values[15]=l.getId();
        JdbcDAO.update("""
            UPDATE listings SET title=?,location=?,price_month=?,owner_id=?,listing_type=?,description=?,deposit=?,
            size_sqft=?,bedrooms=?,bathrooms=?,furnished=?,bachelor_allowed=?,family_allowed=?,approval_status=?,is_available=?
            WHERE id=?
            """,values);
    }
    public boolean updateStatus(int id, ApprovalStatus status) { return JdbcDAO.update("UPDATE listings SET approval_status=? WHERE id=?",status,id)>0; }
    public boolean updatePrice(int id, java.math.BigDecimal price) { return JdbcDAO.update("UPDATE listings SET price_month=? WHERE id=?",price,id)>0; }
    public boolean delete(int id, int ownerId) { return JdbcDAO.update("DELETE FROM listings WHERE id=? AND owner_id=?",id,ownerId)>0; }
    public boolean delete(int id) { return JdbcDAO.update("DELETE FROM listings WHERE id=?",id)>0; }
    public String[] findPhotosByListingId(int id) {
        return JdbcDAO.query("SELECT url FROM listing_photos WHERE listing_id=?",r->r.getString("url"),id).toArray(String[]::new);
    }
    public Optional<Integer> findOwnerIdByListing(int id) {
        // Both a missing listing and an unassigned owner mean no owner is available.
        return JdbcDAO.one("SELECT owner_id FROM listings WHERE id=? AND owner_id IS NOT NULL",r->r.getInt(1),id);
    }
}
