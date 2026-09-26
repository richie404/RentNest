/**
 * Signals that login credentials were invalid or the account is inactive.
 * The message is safe to show to users (it must NOT reveal which field was wrong).
 */
public class AuthenticationException extends RuntimeException {
    public AuthenticationException(String message) {
        super(message);
    }
    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}
