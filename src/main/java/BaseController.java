// ❌ Removed: import javafx.fxml.Initializable;
import javafx.scene.control.Alert;

/**
 * ✅ BaseController (Clean + No Abstract Initialize Error)
 *
 * This version removes the Initializable interface so subclasses
 * (like AddListingController, HomepageController, etc.)
 * can keep using @FXML private void initialize() without conflicts.
 */
public abstract class BaseController {

    /**
     * ✅ Ensures a user is logged in before using the page.
     * If not logged in → redirects to Login page.
     */
    protected boolean requireLogin() {
        if (!SessionManager.isLoggedIn()) {
            Router.goToLogin();
            return false;
        }
        return true;
    }

    /**
     * ✅ Ensures that a user is logged in AND has the specified role.
     * If not logged in → redirects to Login.
     * If wrong role → redirects to Homepage.
     */
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

    /**
     * ✅ Convenience getter for the current logged-in user.
     */
    protected User currentUser() {
        return SessionManager.getLoggedInUser();
    }

    /**
     * ✅ Quick info alert helper (optional QoL)
     */
    protected void info(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }

    protected void error(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.ERROR);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }

    protected void warn(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.WARNING);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
}
