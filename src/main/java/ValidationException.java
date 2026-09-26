/**
 * Signals that user-supplied input failed domain validation.
 * Services throw this for missing fields, bad formats, range violations, etc.
 * Controllers translate it into a user-visible warning — the message is safe to display.
 */
public class ValidationException extends RuntimeException {
    public ValidationException(String message) {
        super(message);
    }
    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
