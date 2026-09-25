import javafx.fxml.FXML;
import javafx.scene.control.*;

/**
 * Controller for the Register page.
 * Handles user registration and form validation.
 */
public class RegisterController extends BaseController {

    @FXML private TextField usernameField;
    @FXML private TextField emailField;
    @FXML private PasswordField passwordField;
    @FXML private PasswordField confirmPasswordField;
    @FXML private ComboBox<String> roleBox;

    private final AuthenticationService authService = new AuthenticationService();

    @FXML
    private void initialize() {
        // Populate the role dropdown
        if (roleBox != null && roleBox.getItems().isEmpty()) {
            roleBox.getItems().addAll(Role.OWNER.name(), Role.RENTER.name());
            roleBox.getSelectionModel().select(Role.RENTER.name()); // default role
        }
    }

    @FXML
    private void handleSubmitRegister() {
        String username = usernameField.getText().trim();
        String email = emailField.getText().trim();
        String password = passwordField.getText();
        String role = roleBox.getValue();

        try {
            // Register user
            authService.register(username, email, password, confirmPasswordField.getText(), role);

            // Success feedback
            info("Welcome!", "Account created successfully. You can log in now.");

            // Redirect to login page
            Router.goToLogin();

        } catch (Exception ex) {
            ex.printStackTrace();
            error("Registration Failed", ex.getMessage());
        }
    }

    @FXML
    private void handleBackHome() {
        Router.goToIndex();
    }

    @FXML
    private void handleGoLogin() {
        Router.goToLogin();
    }
}
