/**
 * Signals that a booking request cannot be fulfilled because the requested dates
 * overlap with an existing confirmed/pending booking, or the listing is no longer available.
 * The message is safe to display to the user.
 */
public class BookingConflictException extends RuntimeException {
    public BookingConflictException(String message) {
        super(message);
    }
    public BookingConflictException(String message, Throwable cause) {
        super(message, cause);
    }
}
