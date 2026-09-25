import java.math.BigDecimal;
import java.sql.*;
import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.*;

/** Mutating integration fixtures; refuses every database except the named disposable schema. */
public class DaoRefactorCheck {
    public static void main(String[] args) throws Exception {
        try (Connection c = Database.getConnection()) {
            check("rentnest_phase5_test".equals(c.getCatalog()), "Select the disposable Phase 5 database");
        }
        try {
            AuthenticationService auth = new AuthenticationService();
            int owner = auth.register("Phase5 owner", "phase5-owner@example.invalid", "fixture-password", "fixture-password", "OWNER");
            int renter = auth.register("Phase5 renter", "phase5-renter@example.invalid", "fixture-password", "fixture-password", "RENTER");
            check(auth.checkCredentials("phase5-renter@example.invalid", "fixture-password"), "Existing hashing format preserved");
            check(!auth.checkCredentials("phase5-renter@example.invalid", "wrong"), "Wrong password rejected");
            new UserDAO().updateStatus(renter, UserStatus.BANNED);
            check(!auth.checkCredentials("phase5-renter@example.invalid", "fixture-password"), "Banned account rejected");
            new UserDAO().updateStatus(renter, UserStatus.ACTIVE);

            ListingDAO listings = new ListingDAO();
            Listing original = new Listing().setTitle("Phase5 fixture").setLocation("Fixture")
                    .setPriceAmount(new BigDecimal("12345.67")).setOwnerId(owner)
                    .setSizeSqft(3_000_000_000L).setStatus("APPROVED");
            int listingId = listings.insert(original);
            Listing restored = listings.findById(listingId).orElseThrow();
            check(restored.getPriceAmount().equals(new BigDecimal("12345.67")), "Exact DECIMAL mapping");
            check(restored.getDepositAmount() == null && restored.getFurnished() == null
                    && restored.getType() == null, "Nullable attributes preserved");
            check(restored.getSizeSqft() == 3_000_000_000L, "Unsigned size range");
            check(restored.getCreatedAt() != null && restored.getUpdatedAt() != null, "Listing timestamps");
            check(listings.findById(-1).isEmpty() && listings.findOwnerIdByListing(-1).isEmpty(), "Normal absence");
            Listing ownerless = new Listing().setTitle("No owner").setLocation("Fixture").setPricePerMonth(1);
            int ownerlessId = listings.insert(ownerless);
            check(listings.findById(ownerlessId).orElseThrow().getOwnerId() == null
                    && listings.findOwnerIdByListing(ownerlessId).isEmpty(), "Nullable owner isn't zero");
            listings.delete(ownerlessId);

            FavoritesDAO favorites = new FavoritesDAO();
            check(favorites.insert(renter, listingId), "Favorite inserted");
            check(!favorites.insert(renter, listingId), "Only expected duplicate is translated");
            expectFailure(() -> favorites.insert(renter, -1));
            check(favorites.findByUser(renter).size() == 1, "Favorite entity mapping");

            int inquiryId = new InquiryDAO().insert(listingId, renter, "Test inquiry");
            Inquiry inquiry = new InquiryDAO().findById(inquiryId).orElseThrow().inquiry();
            check(inquiry.status() == InquiryStatus.PENDING && inquiry.contact() == null, "Inquiry default/contact");
            Message message = new Message(null, renter, owner, "Test message");
            new MessageService(new ServiceAccess(() -> new UserDAO().findById(renter).orElseThrow())).send(message);
            check(new MessageDAO().findConversation(null, renter, owner).stream()
                    .anyMatch(m -> m.getId() == message.getId() && m.getListingId() == null), "Shared message mapper");

            ServiceAccess renterAccess = new ServiceAccess(() -> new UserDAO().findById(renter).orElseThrow());
            BookingService service = new BookingService(renterAccess);
            expectFailure(() -> new BookingDAO().insert(booking(listingId, -1, owner, 10, 20)));
            check(new BookingDAO().findAll().stream().noneMatch(b -> b.getListingId() == listingId),
                    "Failed booking insert rolled back");
            try (ExecutorService executor = Executors.newFixedThreadPool(2)) {
                CountDownLatch ready = new CountDownLatch(2), start = new CountDownLatch(1);
                Callable<Boolean> submit = () -> {
                    ready.countDown();
                    start.await();
                    return new BookingService(renterAccess).createBooking(booking(listingId, renter, owner, 10, 20));
                };
                Future<Boolean> first = executor.submit(submit), second = executor.submit(submit);
                check(ready.await(5, TimeUnit.SECONDS), "Concurrent callers ready");
                start.countDown();
                check(first.get(20, TimeUnit.SECONDS) ^ second.get(20, TimeUnit.SECONDS),
                        "Exactly one concurrent overlapping request commits");
            }
            check(!service.createBooking(booking(listingId, renter, owner, 1, 30)),
                    "Enclosing interval is detected");
            check(service.createBooking(booking(listingId, renter, owner, 21, 25)),
                    "Non-overlapping interval succeeds");
            try {
                JdbcDAO.transaction(c -> {
                    JdbcDAO.update(c, "UPDATE listings SET title=? WHERE id=?", "must rollback", listingId);
                    throw new IllegalStateException("fixture failure");
                });
                throw new AssertionError("Expected transaction failure");
            } catch (IllegalStateException expected) {
                check("fixture failure".equals(expected.getMessage()), "Original exception preserved");
            }
            check("Phase5 fixture".equals(listings.findById(listingId).orElseThrow().getTitle()), "Runtime failure rolls back");
            check(Database.dataSource().getHikariPoolMXBean().getActiveConnections() == 0, "No connection leases leaked");
            System.out.println("PASS: precise/null mappings, authentication, constraint-error propagation, duplicate favorites, "
                    + "inquiry/message models, concurrent booking exclusion and rollback");
        } finally { Database.close(); }
    }
    private static Booking booking(int listing, int renter, int owner, int start, int end) {
        return new Booking(listing, renter, owner, LocalDate.of(2099, 1, start),
                LocalDate.of(2099, 1, end), 12345.67, "PENDING_OWNER_APPROVAL");
    }
    private static void expectFailure(Runnable action) {
        try { action.run(); } catch (DataAccessException expected) {
            check(expected.getCause() instanceof SQLException, "Original SQL cause retained");
            return;
        }
        throw new AssertionError("SQL failure was silently swallowed");
    }
    private static void check(boolean value, String message) { if (!value) throw new AssertionError(message); }
}
