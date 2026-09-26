import java.math.BigDecimal;
import java.util.*;
import java.util.function.BooleanSupplier;

/** Authorization and atomic moderation/auditing, shared by all admin screens. */
public class AdminService {
    private final ServiceAccess access;
    private final ListingDAO listings = new ListingDAO();
    private final BookingDAO bookings = new BookingDAO();
    private final UserDAO users = new UserDAO();
    public AdminService() { this(new ServiceAccess()); }
    AdminService(ServiceAccess access) { this.access = access; }
    public List<Listing> getPendingListings() { access.require(Role.ADMIN); return listings.findByApprovalStatus(ApprovalStatus.PENDING); }
    public List<Listing> getAllListings() {
        access.require(Role.ADMIN);
        List<Listing> result = listings.findAll();
        result.sort(Comparator.comparingInt(Listing::getId).reversed()); return result;
    }
    public List<Booking> getAllBookings() {
        access.require(Role.ADMIN);
        List<Booking> result = bookings.findAll();
        result.sort(Comparator.comparingInt(Booking::getId).reversed()); return result;
    }
    public List<User> getAllUsers() { access.require(Role.ADMIN); return users.findAll(); }
    private boolean moderate(String action, int targetId, BooleanSupplier change) {
        User admin = access.require(Role.ADMIN);
        return JdbcDAO.transaction(c -> {
            boolean changed = change.getAsBoolean();
            if (changed && !new AdminActionDAO().insert(admin.getId(),action,targetId,"Administrative action: " + action))
                throw new IllegalStateException("Unable to record audit action");
            return changed;
        });
    }
    public boolean updateListingStatus(int id, String status) {
        ApprovalStatus next = ApprovalStatus.fromDatabase(status);
        if (next != ApprovalStatus.APPROVED && next != ApprovalStatus.REJECTED)
            throw new IllegalArgumentException("Choose approve or reject");
        return moderate("LISTING_" + next.name(), id, () -> listings.updateStatus(id,next));
    }
    public boolean approveListing(int id) { return updateListingStatus(id,ApprovalStatus.APPROVED.name()); }
    public boolean rejectListing(int id) { return updateListingStatus(id,ApprovalStatus.REJECTED.name()); }
    public boolean updateListingPrice(int id, double price) {
        BigDecimal amount = Validation.money(BigDecimal.valueOf(price),false);
        return moderate("LISTING_PRICE",id,() -> listings.updatePrice(id,amount));
    }
    public boolean deleteListing(int id) { return moderate("LISTING_DELETE",id,() -> listings.delete(id)); }
    public boolean banUser(int id) { return changeUserStatus(id,UserStatus.BANNED); }
    public boolean unbanUser(int id) { return changeUserStatus(id,UserStatus.ACTIVE); }
    private boolean changeUserStatus(int id, UserStatus status) {
        User admin = access.require(Role.ADMIN);
        if (id == admin.getId() && status != UserStatus.ACTIVE) throw new IllegalArgumentException("You cannot ban your own account");
        return moderate("USER_" + status.name(),id,() -> {
            boolean changed = users.updateStatus(id,status);
            if (status == UserStatus.BANNED) new AuthSessionDAO().deleteByUser(id);
            return changed;
        });
    }
    public boolean updateUserRole(int id,String role) {
        Role next = Role.fromDatabase(role);
        if (id == access.require(Role.ADMIN).getId() && next != Role.ADMIN) throw new IllegalArgumentException("You cannot demote your own account");
        return moderate("USER_ROLE_" + next.name(),id,() -> {
            boolean changed = users.updateRole(id,next);
            new AuthSessionDAO().deleteByUser(id);
            return changed;
        });
    }
    public boolean deleteUser(int id) {
        if (id == access.require(Role.ADMIN).getId()) throw new IllegalArgumentException("You cannot delete your own account");
        return moderate("USER_DELETE",id,() -> users.delete(id));
    }
    public boolean cancelBooking(int id) {
        return updateBookingStatus(id,BookingStatus.CANCELLED);
    }
    public boolean updateBookingStatus(int id, BookingStatus next) {
        User admin = access.require(Role.ADMIN);
        return JdbcDAO.transaction(java.sql.Connection.TRANSACTION_READ_COMMITTED,c -> {
            boolean changed = new BookingService(access).transition(c,admin,id,next);
            if (changed && !new AdminActionDAO().insert(admin.getId(),"BOOKING_"+next.name(),id,"Booking status set to "+next.name()))
                throw new IllegalStateException("Unable to record audit action");
            return changed;
        });
    }
    public Map<String,Integer> getSummaryStats() { access.require(Role.ADMIN); return new AdminDAO().findSummary(); }
}
