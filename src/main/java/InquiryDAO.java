import java.util.*;
public class InquiryDAO {
    private static final String SELECT="SELECT i.*,l.title AS listing_title,l.owner_id,COALESCE(u.username,u.email) AS renter_name FROM inquiries i JOIN listings l ON l.id=i.listing_id JOIN users u ON u.id=i.renter_id ";
    private static final JdbcDAO.Mapper<InquiryView> VIEW=r->new InquiryView(DaoMappers.inquiry(r),r.getString("listing_title"),r.getObject("owner_id",Integer.class),r.getString("renter_name"));
    public int insert(int listingId,int renterId,String message) {
        // Omit status so the canonical schema default applies.
        return JdbcDAO.insert("INSERT INTO inquiries (listing_id,renter_id,message) VALUES (?,?,?)",listingId,renterId,message);
    }
    public List<InquiryView> findByOwner(int id) { return JdbcDAO.query(SELECT+"WHERE l.owner_id=? ORDER BY i.created_at DESC",VIEW,id); }
    public List<InquiryView> findByRenter(int id) { return JdbcDAO.query(SELECT+"WHERE i.renter_id=? ORDER BY i.created_at DESC",VIEW,id); }
    public Optional<InquiryView> findById(int id) { return JdbcDAO.one(SELECT+"WHERE i.id=?",VIEW,id); }
    public boolean updateStatus(int id,InquiryStatus status) { return JdbcDAO.update("UPDATE inquiries SET status=? WHERE id=?",status.databaseValue(),id)>0; }
    public boolean updateStatusIfCurrent(int id, int ownerId, InquiryStatus expected, InquiryStatus next) {
        return JdbcDAO.update("UPDATE inquiries i JOIN listings l ON l.id=i.listing_id SET i.status=? WHERE i.id=? AND l.owner_id=? AND i.status=?",
                next.databaseValue(),id,ownerId,expected.databaseValue())>0;
    }
    public int countByOwnerAndStatus(int ownerId,InquiryStatus status) {
        return JdbcDAO.one("SELECT COUNT(*) FROM inquiries i JOIN listings l ON l.id=i.listing_id WHERE l.owner_id=? AND i.status=?",r->r.getInt(1),ownerId,status.databaseValue()).orElseThrow();
    }
}
