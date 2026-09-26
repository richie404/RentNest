import java.math.BigDecimal;
import java.time.LocalDate;

/** Shared domain input checks; no JavaFX dependencies. */
public final class Validation {
    private Validation() {}
    public static String required(String value, String field, int max) {
        if (value == null || value.isBlank() || value.trim().length() > max)
            throw new IllegalArgumentException(field + " is required (maximum " + max + " characters)");
        return value.trim();
    }
    public static String email(String value) {
        String email = required(value, "Email", 100);
        if (!email.matches("[^\\s@]+@[^\\s@]+\\.[^\\s@]+")) throw new IllegalArgumentException("Invalid email address");
        return email.toLowerCase(java.util.Locale.ROOT);
    }
    public static String password(String value) {
        if (value == null || value.isBlank() || value.length() < 8 || value.length() > 128)
            throw new IllegalArgumentException("Password must contain 8 to 128 characters");
        if (!PasswordHasher.fitsBcrypt(value)) throw new IllegalArgumentException("Password must not exceed 72 UTF-8 bytes or contain NUL");
        return value;
    }
    public static BigDecimal money(BigDecimal value, boolean allowZero) {
        if (value == null || (allowZero ? value.signum() < 0 : value.signum() <= 0)
                || value.compareTo(new BigDecimal("99999999.99")) > 0
                || value.stripTrailingZeros().scale() > 2)
            throw new IllegalArgumentException("Enter a valid " + (allowZero ? "non-negative" : "positive") + " amount with at most two decimal places");
        return value;
    }
    public static void dates(LocalDate start, LocalDate end) {
        if (start == null || end == null || start.isBefore(LocalDate.now()) || !end.isAfter(start)
                || start.getYear() > 9999 || end.getYear() > 9999)
            throw new IllegalArgumentException("Booking dates must start today or later and end after the start");
    }
}
