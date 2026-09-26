import javafx.scene.control.Alert;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Base class for all JavaFX controllers.
 *
 * <p>Provides:
 * <ul>
 *   <li>Session / role guards ({@link #requireLogin()}, {@link #requireRole(Role)})</li>
 *   <li>Typed Alert helpers ({@link #info}, {@link #warn}, {@link #error})</li>
 *   <li>{@link #handleServiceError} — the single correct way to handle service exceptions:
 *       logs the full detail, shows the user a safe message</li>
 * </ul>
 *
 * <p>Controllers must <em>never</em> pass {@code e.getMessage()} of a
 * {@link DatabaseOperationException} or {@link DataAccessException} to an alert — those
 * may contain raw SQL. Use {@link #handleServiceError} instead.
 */
public abstract class BaseController {

    /** Each subclass gets its own logger; use the concrete class name for fine-grained filtering. */
    protected final Logger log = LoggerFactory.getLogger(getClass());

    // ─── Session guards ──────────────────────────────────────────────────────

    protected boolean requireLogin() {
        if (!SessionManager.isLoggedIn()) {
            Router.goToLogin();
            return false;
        }
        return true;
    }

    protected boolean requireRole(Role role) {
        if (!SessionManager.isLoggedIn()) {
            Router.goToLogin();
            return false;
        }

        User user = SessionManager.getLoggedInUser();
        if (user == null || user.getRole() != role) {
            Router.goToHomepage();
            return false;
        }

        return true;
    }

    protected User currentUser() {
        return SessionManager.getLoggedInUser();
    }

    // ─── Alert helpers ────────────────────────────────────────────────────────

    protected void info(String title, String message) {
        showAlert(Alert.AlertType.INFORMATION, title, message);
    }

    protected void error(String title, String message) {
        showAlert(Alert.AlertType.ERROR, title, message);
    }

    protected void warn(String title, String message) {
        showAlert(Alert.AlertType.WARNING, title, message);
    }

    private void showAlert(Alert.AlertType type, String title, String message) {
        Alert alert = new Alert(type);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }

    // ─── Centralised exception → UI translation ───────────────────────────────

    /**
     * Translates a service-layer exception into the correct log entry + user-visible Alert.
     *
     * <ul>
     *   <li>{@link ValidationException} / {@link IllegalArgumentException} → WARN log + warning alert
     *       (message is user-safe)</li>
     *   <li>{@link AuthenticationException} → WARN log + error alert (generic message)</li>
     *   <li>{@link AuthorizationException} / {@link SecurityException} → WARN log + error alert</li>
     *   <li>{@link BookingConflictException} → WARN log + warning alert (message is user-safe)</li>
     *   <li>{@link DatabaseOperationException} / {@link DataAccessException} → ERROR log + generic
     *       error alert (raw detail is <em>never</em> shown to the user)</li>
     *   <li>Everything else → ERROR log + generic error alert</li>
     * </ul>
     *
     * @param context short description of what was attempted, e.g. "load properties"
     * @param ex      the exception caught
     */
    protected void handleServiceError(String context, Throwable ex) {
        if (ex instanceof ValidationException || ex instanceof IllegalArgumentException) {
            log.warn("{} — validation: {}", context, ex.getMessage());
            warn("Validation Error", ex.getMessage());

        } else if (ex instanceof AuthenticationException) {
            log.warn("{} — authentication failed", context);
            error("Login Failed", ex.getMessage());

        } else if (ex instanceof AuthorizationException || ex instanceof SecurityException) {
            log.warn("{} — authorization denied: {}", context, ex.getMessage());
            error("Access Denied", ex.getMessage());

        } else if (ex instanceof BookingConflictException) {
            log.warn("{} — booking conflict: {}", context, ex.getMessage());
            warn("Booking Unavailable", ex.getMessage());

        } else if (ex instanceof DatabaseOperationException || ex instanceof DataAccessException) {
            log.error("{} — database error", context, ex);
            error("Operation Failed",
                  capitalize(context) + " could not be completed. Please try again.");

        } else {
            log.error("{} — unexpected error", context, ex);
            error("Unexpected Error",
                  "An unexpected error occurred. Please try again or contact support.");
        }
    }

    private static String capitalize(String s) {
        if (s == null || s.isBlank()) return "The operation";
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }
}
