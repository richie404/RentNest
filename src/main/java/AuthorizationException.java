/**
 * Signals that an authenticated user attempted an action they are not permitted to perform.
 * Distinct from {@link AuthenticationException} (identity unknown) — here the user
 * is known but lacks the required role or ownership.
 * The message is safe to display to the user.
 */
public class AuthorizationException extends RuntimeException {
    public AuthorizationException(String message) {
        super(message);
    }
    public AuthorizationException(String message, Throwable cause) {
        super(message, cause);
    }
}
