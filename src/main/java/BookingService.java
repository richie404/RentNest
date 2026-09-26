import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

public class BookingService {
    private static final Logger LOG = LoggerFactory.getLogger(BookingService.class);

    private final ServiceAccess access;
    public BookingService() { this(new ServiceAccess()); }
    BookingService(ServiceAccess access) { this.access = access; }

    private final BookingDAO bookings = new BookingDAO();
    private final ListingDAO listings = new ListingDAO();

    public boolean createBooking(Booking booking) {
        User renter = access.require(Role.RENTER);
        try {
            Validation.dates(booking.getStartDate(), booking.getEndDate());
        } catch (IllegalArgumentException e) {
            throw new ValidationException(e.getMessage(), e);
        }
        try {
            return JdbcDAO.transaction(java.sql.Connection.TRANSACTION_READ_COMMITTED, connection -> {
                Listing listing = listings.findByIdForUpdate(connection, booking.getListingId())
                        .orElseThrow(() -> new IllegalArgumentException("Listing no longer exists"));
                if (listing.getOwnerId() == null) throw new IllegalArgumentException("Listing has no owner");
                if (listing.getOwnerId() == renter.getId())
                    throw new AuthorizationException("You cannot book your own property");
                if (!ListingService.isPublic(listing))
                    throw new ValidationException("Listing is not available for booking");
                booking.setRenterId(renter.getId());
                booking.setStatus(BookingStatus.PENDING_OWNER_APPROVAL.name());
                booking.setTotalAmountValue(calculateAmount(listing.getPriceAmount(),
                        booking.getStartDate(), booking.getEndDate()));
                List<BookingStatus> occupying = Arrays.stream(BookingStatus.values())
                        .filter(BookingStatus::blocksAvailability).toList();
                if (bookings.countOverlaps(connection, booking.getListingId(),
                        booking.getStartDate(), booking.getEndDate(), occupying) > 0) {
                    return false;
                }
                booking.setOwnerId(listing.getOwnerId());
                boolean inserted = bookings.insert(connection, booking);
                if (inserted) {
                    LOG.info("Booking created: renterId={} listingId={} start={} end={}",
                            renter.getId(), booking.getListingId(),
                            booking.getStartDate(), booking.getEndDate());
                }
                return inserted;
            });
        } catch (DataAccessException e) {
            LOG.error("Database error creating booking: renterId={} listingId={}",
                    renter.getId(), booking.getListingId(), e);
            throw new DatabaseOperationException("Booking could not be saved. Please try again.", e);
        }
    }

    /** Calendar months cost one monthly rate; remaining days use the next calendar month's length. */
    static java.math.BigDecimal calculateAmount(java.math.BigDecimal monthly,
            java.time.LocalDate start, java.time.LocalDate end) {
        Validation.money(monthly, false);
        Validation.dates(start, end);
        long months = java.time.temporal.ChronoUnit.MONTHS.between(
                java.time.YearMonth.from(start), java.time.YearMonth.from(end));
        if (start.plusMonths(months).isAfter(end)) months--;
        java.time.LocalDate anchor = start.plusMonths(months);
        long days = java.time.temporal.ChronoUnit.DAYS.between(anchor, end);
        long monthDays = java.time.temporal.ChronoUnit.DAYS.between(anchor, start.plusMonths(months + 1));
        return Validation.money(monthly.multiply(java.math.BigDecimal.valueOf(months)).add(
                monthly.multiply(java.math.BigDecimal.valueOf(days)).divide(
                        java.math.BigDecimal.valueOf(monthDays), 2, java.math.RoundingMode.HALF_UP)), false);
    }

    public boolean request(int listingId, java.time.LocalDate start, java.time.LocalDate end) {
        try { Validation.dates(start, end); }
        catch (IllegalArgumentException e) { throw new ValidationException(e.getMessage(), e); }
        Booking booking = new Booking();
        booking.setListingId(listingId);
        booking.setStartDate(start);
        booking.setEndDate(end);
        return createBooking(booking);
    }

    public List<Booking> findByRenter(int id) {
        access.require(Role.RENTER);
        access.self(id);
        return bookings.findByRenter(id);
    }

    public List<Booking> findByOwner(int id) {
        access.require(Role.OWNER);
        access.self(id);
        return bookings.findByOwner(id);
    }

    public boolean cancelBooking(int id) { return updateStatus(id, BookingStatus.CANCELLED); }

    public boolean updateStatus(int id, BookingStatus next) {
        User actor = access.current();
        if (actor.getRole() == Role.ADMIN) {
            return new AdminService(access).updateBookingStatus(id, next);
        }
        try {
            return JdbcDAO.transaction(java.sql.Connection.TRANSACTION_READ_COMMITTED,
                    c -> transition(c, actor, id, next));
        } catch (DataAccessException e) {
            LOG.error("Database error updating booking status: bookingId={} next={}", id, next, e);
            throw new DatabaseOperationException("Booking status could not be updated. Please try again.", e);
        }
    }

    boolean transition(java.sql.Connection c, User actor, int id, BookingStatus next)
            throws java.sql.SQLException {
        Booking reference = bookings.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        Listing listing = listings.findByIdForUpdate(c, reference.getListingId())
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        Booking booking = bookings.findByIdForUpdate(c, id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
        boolean owner = actor.getRole() == Role.OWNER
                && Objects.equals(booking.getOwnerId(), actor.getId())
                && Objects.equals(listing.getOwnerId(), actor.getId());
        boolean renter = actor.getRole() == Role.RENTER && booking.getRenterId() == actor.getId();
        if (actor.getRole() != Role.ADMIN && !owner && !renter)
            throw new AuthorizationException("This booking belongs to another user");
        if (renter && next != BookingStatus.CANCELLED)
            throw new AuthorizationException("Renters may only cancel bookings");
        if (booking.getEndDate() == null || !booking.getEndDate().isAfter(java.time.LocalDate.now()))
            throw new ValidationException("Ended bookings are historical records and cannot be changed");
        BookingStatus current = booking.getBookingStatus();
        if (renter && (current == BookingStatus.CONFIRMED || current == BookingStatus.APPROVED))
            throw new ValidationException("Confirmed bookings cannot be cancelled directly");
        if (next == current) return false;
        if (current == BookingStatus.CANCELLED || current == BookingStatus.REJECTED
                || (next != BookingStatus.CANCELLED && (!current.isPending()
                    || (next != BookingStatus.CONFIRMED && next != BookingStatus.REJECTED))))
            throw new ValidationException("Invalid booking status transition");
        if (next == BookingStatus.CONFIRMED) {
            if (!ListingService.isPublic(listing) || booking.getStartDate().isBefore(java.time.LocalDate.now()))
                throw new ValidationException("This listing or booking period is no longer available for approval");
            List<BookingStatus> occupying = Arrays.stream(BookingStatus.values())
                    .filter(BookingStatus::blocksAvailability).toList();
            if (bookings.countOverlaps(c, booking.getListingId(),
                    booking.getStartDate(), booking.getEndDate(), occupying, id) > 0)
                throw new BookingConflictException("Another booking reserves this period");
        }
        boolean updated = bookings.updateStatus(id, next);
        if (updated) {
            LOG.info("Booking status updated: bookingId={} from={} to={} actorId={}",
                    id, current, next, actor.getId());
        }
        return updated;
    }
}
