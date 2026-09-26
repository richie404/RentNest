import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.layout.GridPane;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;
import javafx.util.Pair;

public class LoginController {

    private static final Logger LOG = LoggerFactory.getLogger(LoginController.class);

    @FXML private TextField emailField;
    @FXML private PasswordField passwordField;

    // ✅ Normal Login
    @FXML
    private void handleSubmitLogin() {
        String email = emailField.getText().trim();
        String pass = passwordField.getText();

        if (email.isEmpty() || pass.isEmpty()) {
            showAlert(Alert.AlertType.WARNING, "Login Failed", "Please fill in both fields.");
            return;
        }

        try {
            Optional<User> u = SessionManager.login(email, pass, false);
            if (u.isEmpty()) {
                // SessionManager already logs the failed attempt at WARN
                showAlert(Alert.AlertType.ERROR, "Login Failed", "Invalid email or password.");
                return;
            }

            User user = u.get();
            passwordField.clear();

            // Route based on role
            if (user.getRole() == Role.OWNER) {
                Router.goToOwnerDashboard();
            } else if (user.getRole() == Role.RENTER) {
                Router.goToRenterDashboard();
            } else if (user.getRole() == Role.ADMIN) {
                Router.goToAdminDashboard();
            } else {
                LOG.warn("Logged-in user has unknown role: userId={} role={}", user.getId(), user.getRole());
                showAlert(Alert.AlertType.WARNING, "Access Denied", "Unknown user role.");
            }

        } catch (DatabaseOperationException | DataAccessException e) {
            LOG.error("Database error during login", e);
            showAlert(Alert.AlertType.ERROR, "Service Unavailable",
                    "Login could not be completed. Please try again.");
        } catch (Exception e) {
            LOG.error("Unexpected error during login", e);
            showAlert(Alert.AlertType.ERROR, "Error", "An unexpected error occurred. Please try again.");
        }
    }

    // ✅ Register link
    @FXML
    private void handleGoRegister() {
        Router.goToRegister();
    }

    // ✅ Admin Login Popup
    @FXML
    private void handleAdminLogin() {
        Dialog<Pair<String, String>> dialog = new Dialog<>();
        dialog.setTitle("Admin Login");
        dialog.setHeaderText("Enter Admin Credentials");

        ButtonType loginButtonType = new ButtonType("Login", ButtonBar.ButtonData.OK_DONE);
        dialog.getDialogPane().getButtonTypes().addAll(loginButtonType, ButtonType.CANCEL);

        GridPane grid = new GridPane();
        grid.setHgap(10);
        grid.setVgap(10);
        grid.setPadding(new javafx.geometry.Insets(20, 150, 10, 10));

        TextField email = new TextField();
        email.setPromptText("Admin email");
        PasswordField password = new PasswordField();
        password.setPromptText("Password");

        grid.add(new Label("Email:"), 0, 0);
        grid.add(email, 1, 0);
        grid.add(new Label("Password:"), 0, 1);
        grid.add(password, 1, 1);

        dialog.getDialogPane().setContent(grid);

        dialog.setResultConverter(dialogButton -> {
            if (dialogButton == loginButtonType) {
                return new Pair<>(email.getText(), password.getText());
            }
            return null;
        });

        Optional<Pair<String, String>> result = dialog.showAndWait();

        result.ifPresent(credentials -> {
            String adminEmail = credentials.getKey().trim();
            String adminPassword = credentials.getValue();

            if (adminEmail.isEmpty() || adminPassword.isEmpty()) {
                showAlert(Alert.AlertType.WARNING, "Login Failed", "Please fill in both fields.");
                return;
            }

            try {
                Optional<User> userOpt = SessionManager.login(adminEmail, adminPassword, true);
                if (userOpt.isEmpty()) {
                    // SessionManager already logs the WARN
                    showAlert(Alert.AlertType.ERROR, "Access Denied", "Invalid email or password.");
                    return;
                }
                password.clear();
                Router.goToAdminDashboard();

            } catch (DatabaseOperationException | DataAccessException e) {
                LOG.error("Database error during admin login", e);
                showAlert(Alert.AlertType.ERROR, "Service Unavailable",
                        "Login could not be completed. Please try again.");
            } catch (Exception e) {
                LOG.error("Unexpected error during admin login", e);
                showAlert(Alert.AlertType.ERROR, "Error", "An unexpected error occurred. Please try again.");
            }
        });
    }

    private void showAlert(Alert.AlertType type, String title, String message) {
        Alert alert = new Alert(type);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }

    @FXML
    private void handleBackToHome() {
        Router.goToHomepage();
    }
}
