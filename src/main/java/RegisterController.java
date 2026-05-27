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
    @FXML private ComboBox<String> roleBox;

    private final UserDAO userDAO = new UserDAO();

    @FXML
    private void initialize() {
        // Populate the role dropdown
        if (roleBox != null && roleBox.getItems().isEmpty()) {
            roleBox.getItems().addAll("OWNER", "RENTER");
            roleBox.getSelectionModel().select("RENTER"); // default role
        }
    }

    @FXML
    private void handleSubmitRegister() {
        String username = usernameField.getText().trim();
        String email = emailField.getText().trim();
        String password = passwordField.getText();
        String role = roleBox.getValue();

        // ✅ Input validation before DB operation
        if (username.isEmpty() || email.isEmpty() || password.isEmpty() || role == null) {
            error("Missing Information", "Please fill in all required fields.");
            return;
        }

        try {
            // Check if email already exists
            if (userDAO.emailExists(email)) {
                error("Already Registered", "An account with this email already exists.");
                return;
            }

            // Register user
            userDAO.register(username, email, password, role);

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
