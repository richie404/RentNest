import java.util.*;
/** Cross-domain reporting only; commands and domain CRUD live in their respective layers. */
public class AdminDAO {
    public Map<String,Integer> findSummary() {
        return JdbcDAO.one("""
            SELECT (SELECT COUNT(*) FROM users) AS users,
                   (SELECT COUNT(*) FROM listings) AS listings,
                   (SELECT COUNT(*) FROM bookings) AS bookings,
                   (SELECT COUNT(*) FROM listings WHERE approval_status=?) AS pending_listings
            """,r->Map.of("users",r.getInt("users"),"listings",r.getInt("listings"),
                "bookings",r.getInt("bookings"),"pending_listings",r.getInt("pending_listings")),ApprovalStatus.PENDING).orElseThrow();
    }
}
