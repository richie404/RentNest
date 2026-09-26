/**
 * Signals a persistence-layer failure that could not be translated into a more specific
 * domain exception. The cause is always a lower-level exception (usually SQLException).
 * <p>
 * Controllers must never display the cause message to ordinary users — only a generic
 * "please try again" message. The full cause goes to the application log.
 * <p>
 * This is the service-layer replacement/alias for the lower-level {@link DataAccessException}.
 * DAOs throw {@link DataAccessException}; services that can't give a meaningful reason
 * re-throw as {@link DatabaseOperationException}.
 */
public class DatabaseOperationException extends RuntimeException {
    public DatabaseOperationException(String message, Throwable cause) {
        super(message, cause);
    }
}
