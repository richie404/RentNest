import java.sql.*;
import java.time.LocalDate;
import java.util.*;
public class BookingDAO {
    private static final String INSERT="INSERT INTO bookings (listing_id,renter_id,owner_id,start_date,end_date,total_amount,status) VALUES (?,?,?,?,?,?,?)";
    public boolean insert(Booking b) { return JdbcDAO.connection(c->insert(c,b)); }
    boolean insert(Connection c, Booking b) throws SQLException {
        return JdbcDAO.update(c,INSERT,b.getListingId(),b.getRenterId(),b.getOwnerId(),b.getStartDate(),b.getEndDate(),b.getTotalAmountValue(),b.getBookingStatus())>0;
    }
    public List<Booking> findAll() { return JdbcDAO.query("SELECT * FROM bookings ORDER BY created_at DESC",DaoMappers::booking); }
    public Optional<Booking> findById(int id) { return JdbcDAO.one("SELECT * FROM bookings WHERE id=?",DaoMappers::booking,id); }
    public List<Booking> findByRenter(int id) { return JdbcDAO.query("SELECT * FROM bookings WHERE renter_id=? ORDER BY created_at DESC",DaoMappers::booking,id); }
    public List<Booking> findByOwner(int id) { return JdbcDAO.query("SELECT * FROM bookings WHERE owner_id=? ORDER BY created_at DESC",DaoMappers::booking,id); }
    public boolean updateStatus(int id, BookingStatus status) { return JdbcDAO.update("UPDATE bookings SET status=? WHERE id=?",status,id)>0; }
    Optional<Booking> findByIdForUpdate(Connection c, int id) throws SQLException {
        return JdbcDAO.query(c,"SELECT * FROM bookings WHERE id=? FOR UPDATE",DaoMappers::booking,id).stream().findFirst();
    }
    public boolean delete(int id) { return JdbcDAO.update("DELETE FROM bookings WHERE id=?",id)>0; }
    int countOverlaps(Connection c, int listingId, LocalDate start, LocalDate end, List<BookingStatus> statuses) throws SQLException {
        if(statuses.isEmpty()) return 0;
        String placeholders=String.join(",",Collections.nCopies(statuses.size(),"?"));
        List<Object> values=new ArrayList<>(); values.add(listingId); values.addAll(statuses); values.add(end); values.add(start);
        return JdbcDAO.query(c,"SELECT COUNT(*) FROM bookings WHERE listing_id=? AND status IN ("+placeholders+") AND start_date<=? AND end_date>=?",
            r->r.getInt(1),values.toArray()).getFirst();
    }
}
