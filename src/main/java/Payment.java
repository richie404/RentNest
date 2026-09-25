import java.time.LocalDateTime;
/** amount is DOUBLE in the current schema; no payment status column exists. */
public record Payment(int id, int bookingId, double amount, LocalDateTime paymentDate) {}
