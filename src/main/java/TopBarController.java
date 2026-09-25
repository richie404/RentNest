import javafx.fxml.FXML;
import javafx.scene.control.Button;
import javafx.scene.control.Hyperlink;
import javafx.scene.control.Label;

public class TopBarController {

    @FXML private Label userLabel;
    @FXML private Hyperlink dashboardLink;
    @FXML private Button btnLogout;

    @FXML
    private void initialize() {
        var user = SessionManager.getLoggedInUser();

        // Handle guest (not logged in)
        if (user == null) {
            userLabel.setText("Guest");
            dashboardLink.setVisible(false);
            btnLogout.setVisible(false);
            return;
        }

        // Show logged-in user info
        String role = user.getRoles() != null ? user.getRoles().toUpperCase() : "USER";
        userLabel.setText("Logged in as: " + user.getName() + " (" + role + ")");
        dashboardLink.setVisible(true);
        btnLogout.setVisible(true);
    }

    /* ---------------- NAVIGATION HANDLERS ---------------- */
    @FXML
    private void handleHome() {
        Router.goToHomepage();
    }

    @FXML
    private void handleDashboard() {
        var user = SessionManager.getLoggedInUser();
        if (user == null) {
            Router.goToLogin();
            return;
        }

        switch (user.getRole()) {
            case ADMIN -> Router.goToAdminDashboard();
            case OWNER -> Router.goToOwnerDashboard(user.getId());
            case RENTER -> Router.goToRenterDashboard(user.getId());
            default -> Router.goToHomepage();
        }
    }

    @FXML
    private void handleLogout() {
        SessionManager.logout();
        Router.goToHomepage();
    }
}
