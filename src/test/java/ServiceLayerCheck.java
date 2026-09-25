import java.math.BigDecimal;
import java.sql.*;
import java.time.LocalDate;

/** Real writes, guarded to a disposable schema; run explicitly after Maven test compilation. */
public class ServiceLayerCheck {
    public static void main(String[] args) throws Exception {
        try (Connection c = Database.getConnection()) {
            check("rentnest_phase6_test".equals(c.getCatalog()), "Requires disposable rentnest_phase6_test");
        }
        try {
            AuthenticationService auth = new AuthenticationService();
            rejects(() -> auth.register("Intruder","intruder@example.invalid","fixture-password","fixture-password","ADMIN"));
            rejects(() -> auth.register("Invalid","invalid","fixture-password","fixture-password","RENTER"));
            rejects(() -> auth.register("Short","short@example.invalid","short","short","RENTER"));
            int owner = auth.register("Owner","p6-owner@example.invalid","fixture-password","fixture-password","OWNER");
            int other = auth.register("Other owner","p6-other@example.invalid","fixture-password","fixture-password","OWNER");
            int renter = auth.register("Renter","p6-renter@example.invalid","fixture-password","fixture-password","RENTER");
            int stranger = auth.register("Stranger","p6-stranger@example.invalid","fixture-password","fixture-password","RENTER");
            int admin = new UserDAO().insert("Administrator","p6-admin@example.invalid","0".repeat(64),Role.ADMIN);
            ServiceAccess ownerAccess = access(owner), renterAccess = access(renter), adminAccess = access(admin);
            ListingService ownerListings = new ListingService(ownerAccess);
            AdminService moderation = new AdminService(adminAccess);
            rejects(() -> new AdminService(renterAccess).getAllUsers());
            rejects(() -> new ListingService(renterAccess).insert(listing()));
            rejects(() -> ownerListings.insert(listing().setPriceAmount(BigDecimal.ZERO)));
            Listing draft = listing().setOwnerId(other).setStatus("APPROVED");
            int id = ownerListings.insert(draft);
            draft.setId(id);
            ListingDAO dao = new ListingDAO();
            check(dao.findById(id).orElseThrow().getOwnerId() == owner, "Owner comes from authenticated account");
            check(dao.findById(id).orElseThrow().getApprovalStatus() == ApprovalStatus.PENDING, "Cannot self-approve");
            check(new ListingService(renterAccess).findById(id).isEmpty(), "Private detail hidden");
            rejects(() -> new ListingService(access(other)).update(draft));
            check(moderation.approveListing(id), "Admin approves");
            check(new AdminActionDAO().findRecent(1).getFirst().getTargetId() == id, "Moderation audited");
            check(new ListingService(renterAccess).findById(id).isPresent(), "Approved available listing visible");
            FavoriteService favorites = new FavoriteService(renterAccess);
            check(favorites.add(id) && !favorites.add(id), "Unique favorites");
            rejects(() -> new FavoriteService(ownerAccess).add(id));
            check(favorites.remove(id), "Renter removes own favorite");
            int inquiry = new InquiryService(renterAccess).submit(id,"Is it available?");
            rejects(() -> new InquiryService(access(other)).updateStatus(inquiry,InquiryStatus.REPLIED));
            check(new InquiryService(ownerAccess).updateStatus(inquiry,InquiryStatus.CLOSED), "Owner closes inquiry");
            rejects(() -> new InquiryService(ownerAccess).updateStatus(inquiry,InquiryStatus.REPLIED));
            BookingService renterBookings = new BookingService(renterAccess);
            int ownProperty = dao.insert(listing().setOwnerId(renter).setStatus("APPROVED"));
            rejects(() -> renterBookings.requestMonth(ownProperty,LocalDate.now().plusDays(1)));
            int unavailable = dao.insert(listing().setOwnerId(owner).setStatus("APPROVED").setAvailable(false));
            rejects(() -> renterBookings.requestMonth(unavailable,LocalDate.now().plusDays(1)));
            rejects(() -> new BookingService(ownerAccess).requestMonth(id,LocalDate.now().plusDays(1)));
            rejects(() -> renterBookings.requestMonth(id,LocalDate.now().minusDays(1)));
            LocalDate start = LocalDate.of(2099,1,31);
            check(renterBookings.requestMonth(id,start), "Month booking succeeds");
            Booking booking = new BookingDAO().findByRenter(renter).getFirst();
            check(booking.getTotalAmountValue().compareTo(new BigDecimal("3100.00")) == 0, "End-of-month charge is one monthly rate");
            check(booking.getBookingStatus() == BookingStatus.PENDING_OWNER_APPROVAL, "Service sets initial status");
            rejects(() -> new BookingService(access(stranger)).cancelBooking(booking.getId()));
            check(new BookingService(ownerAccess).updateStatus(booking.getId(),BookingStatus.CONFIRMED), "Owner confirms");
            rejects(() -> renterBookings.cancelBooking(booking.getId()));
            check(moderation.cancelBooking(booking.getId()), "Admin cancellation");
            rejects(() -> new BookingService(ownerAccess).updateStatus(booking.getId(),BookingStatus.CONFIRMED));
            // An audit failure must undo the business write on the very same connection.
            try (Connection c = Database.getConnection(); Statement s = c.createStatement()) {
                s.execute("CREATE TRIGGER phase6_reject_audit BEFORE INSERT ON admin_actions FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='fixture audit failure'");
            }
            try { rejectsSql(() -> moderation.rejectListing(id)); }
            finally { try (Connection c = Database.getConnection(); Statement s = c.createStatement()) { s.execute("DROP TRIGGER phase6_reject_audit"); } }
            check(dao.findById(id).orElseThrow().getApprovalStatus() == ApprovalStatus.APPROVED, "Audit failure rolls back moderation");
            new UserDAO().updateStatus(renter,UserStatus.BANNED);
            rejects(() -> favorites.add(id));
            check(auth.authenticate("p6-renter@example.invalid","fixture-password").isEmpty(), "Banned login rejected");
            rejects(() -> moderation.banUser(admin));
            new UserDAO().updateStatus(renter,UserStatus.ACTIVE);
            rejects(() -> new MessageService(renterAccess).sendFromSession(new Message(null,stranger,owner,"Spoofed sender")));
            rejects(() -> new MessageService(renterAccess).validateFromSession(new Message(null,stranger,owner,"Spoofed socket sender")));
            rejects(() -> new MessageService(renterAccess).findConversation(null,stranger,owner));
            new MessageService(renterAccess).sendFromSession(new Message(null,renter,owner,"Valid sender"));
            ownerListings.update(dao.findById(id).orElseThrow().setTitle("Edited"));
            check(new ListingService(renterAccess).findById(id).isEmpty(), "Edits require approval again");
            rejects(() -> renterBookings.requestMonth(id,LocalDate.of(2099,4,1)));
            check(Database.dataSource().getHikariPoolMXBean().getActiveConnections() == 0,"No connection leaks");
            System.out.println("PASS: service authorization, validation, pricing, transitions, visibility, favorites, inquiries, messaging and atomic admin audit rollback");
        } finally { Database.close(); }
    }
    private static Listing listing() { return new Listing().setTitle("Service fixture").setLocation("Dhaka").setPriceAmount(new BigDecimal("3100.00")); }
    private static ServiceAccess access(int id) {
        User claimed = new UserDAO().findById(id).orElseThrow();
        return new ServiceAccess(() -> claimed);
    }
    private static void rejects(Runnable action) {
        try { action.run(); } catch (SecurityException | IllegalArgumentException expected) { return; }
        throw new AssertionError("Expected authorization/validation failure");
    }
    private static void rejectsSql(Runnable action) {
        try { action.run(); } catch (DataAccessException expected) { return; }
        throw new AssertionError("Expected SQL failure");
    }
    private static void check(boolean condition,String message) { if (!condition) throw new AssertionError(message); }
}
