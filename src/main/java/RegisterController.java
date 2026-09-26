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
        if (roleBox != null && roleBox.getItems().isEmpty()) {
            roleBox.getItems().addAll(Role.OWNER.name(), Role.RENTER.name());
            roleBox.getSelectionModel().select(Role.RENTER.name());
        }
    }

    @FXML
    private void handleSubmitRegister() {
        String username = usernameField.getText().trim();
        String email    = emailField.getText().trim();
        String password = passwordField.getText();
        String role     = roleBox.getValue();

        try {
            authService.register(username, email, password, confirmPasswordField.getText(), role);
            info("Welcome!", "Account created successfully. You can log in now.");
            Router.goToLogin();

        } catch (ValidationException e) {
            // ValidationException message is user-safe; already logged at WARN in the service
            warn("Registration Failed", e.getMessage());
        } catch (AuthorizationException e) {
            warn("Registration Not Allowed", e.getMessage());
        } catch (DatabaseOperationException | DataAccessException e) {
            handleServiceError("register user", e);
        } catch (Exception e) {
            handleServiceError("register user", e);
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
