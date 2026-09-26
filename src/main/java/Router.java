import javafx.animation.FadeTransition;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Stage;
import javafx.util.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.net.URL;

public class Router {

    private static final Logger LOG = LoggerFactory.getLogger(Router.class);
    private static Stage stage;

    public static void setStage(Stage primaryStage) {
        stage = primaryStage;
    }

    /* -----------------------------------------------------------
       Core FXML loader (base navigation)
       ----------------------------------------------------------- */
    private static void goTo(String fxml) {
        try {
            LOG.debug("Loading FXML: {}", fxml);
            URL resource = Router.class.getResource("/" + fxml);

            if (resource == null) throw new IOException("FXML resource not found: " + fxml);

            FXMLLoader loader = new FXMLLoader(resource);
            Parent root = loader.load();
            showScene(root, "RentNest");
            LOG.debug("FXML loaded successfully: {}", fxml);

        } catch (IOException e) {
            LOG.error("Failed to load FXML: {}", fxml, e);
        }
    }

    /* -----------------------------------------------------------
       Generic Navigation
       ----------------------------------------------------------- */
    public static void goToHomepage() { goTo("homepage.fxml"); }
    public static void goToAbout()    { goTo("about.fxml"); }
    public static void goToIndex()    { goToHomepage(); }
    public static void goToLogin()    { goTo("login.fxml"); }
    public static void goToRegister() { goTo("register.fxml"); }
    public static void goToBrowse()   { goTo("browse.fxml"); }

    /* -----------------------------------------------------------
       Dashboard Router (Role-based logic)
       ----------------------------------------------------------- */
    public static void goToDashboard() {
        if (!SessionManager.isLoggedIn()) { goToLogin(); return; }

        User user = SessionManager.getLoggedInUser();
        Role role = user.getRole();

        if (role == Role.ADMIN) {
            goToAdminDashboard();
        } else if (role == Role.OWNER) {
            goToOwnerDashboard(user.getId());
        } else {
            goToRenterDashboard(user.getId());
        }
    }

    /* -----------------------------------------------------------
       Admin Pages
       ----------------------------------------------------------- */
    public static void goToAdminDashboard() {
        if (!checkAccess(Role.ADMIN)) return;
        goTo("AdminDashboard.fxml");
    }

    public static void goToAdminUserManagement() {
        if (!checkAccess(Role.ADMIN)) return;
        goTo("AdminUserManagement.fxml");
    }

    public static void goToAdminListingManagement() {
        if (!checkAccess(Role.ADMIN)) return;
        goTo("AdminListingManagement.fxml");
    }

    /* -----------------------------------------------------------
       Renter Dashboard
       ----------------------------------------------------------- */
    public static void goToRenterDashboard() {
        if (!checkAccess(Role.RENTER)) return;
        goTo("RenterDashboard.fxml");
    }

    public static void goToRenterDashboard(int renterId) {
        if (!checkAccess(Role.RENTER)) return;
        try {
            FXMLLoader loader = new FXMLLoader(Router.class.getResource("/RenterDashboard.fxml"));
            Parent root = loader.load();

            Object controller = loader.getController();
            if (controller instanceof RenterDashboardController rdc) {
                rdc.setRenterId(renterId);
            }

            showScene(root, "Renter Dashboard");
        } catch (IOException e) {
            LOG.error("Failed to load RenterDashboard.fxml", e);
        }
    }

    /* -----------------------------------------------------------
       Renter Subpages
       ----------------------------------------------------------- */
    public static void goToRenterBookings(int renterId) {
        if (!checkAccess(Role.RENTER)) return;
        try {
            FXMLLoader loader = new FXMLLoader(Router.class.getResource("/RenterBookings.fxml"));
            Parent root = loader.load();

            Object controller = loader.getController();
            if (controller instanceof RenterBookingsController rbc) {
                rbc.setRenterId(renterId);
            }

            showScene(root, "My Bookings");
        } catch (IOException e) {
            LOG.error("Failed to load RenterBookings.fxml", e);
        }
    }

    /* -----------------------------------------------------------
       Owner Dashboard + Pages
       ----------------------------------------------------------- */
    public static void goToOwnerDashboard() {
        if (!checkAccess(Role.OWNER)) return;
        goTo("OwnerDashboard.fxml");
    }

    public static void goToOwnerDashboard(int ownerId) {
        if (!checkAccess(Role.OWNER)) return;
        try {
            FXMLLoader loader = new FXMLLoader(Router.class.getResource("/OwnerDashboard.fxml"));
            Parent root = loader.load();

            Object controller = loader.getController();
            if (controller instanceof OwnerDashboardController odc) {
                odc.setOwnerId(ownerId);
            }

            showScene(root, "Owner Dashboard");
        } catch (IOException e) {
            LOG.error("Failed to load OwnerDashboard.fxml", e);
        }
    }

    public static void goToAddListing(int ownerId) {
        if (!checkAccess(Role.OWNER)) return;
        try {
            FXMLLoader loader = new FXMLLoader(Router.class.getResource("/AddListing.fxml"));
            Parent root = loader.load();

            Object controller = loader.getController();
            if (controller instanceof AddListingController ac) {
                ac.setOwnerId(ownerId);
            }

            showScene(root, "Add Listing");
        } catch (IOException e) {
            LOG.error("Failed to load AddListing.fxml", e);
        }
    }

    public static void goToListings(int ownerId) {
        if (!checkAccess(Role.OWNER)) return;
        try {
            FXMLLoader loader = new FXMLLoader(Router.class.getResource("/listings.fxml"));
            Parent root = loader.load();
            Object c = loader.getController();
            if (c instanceof ListingsController lc) lc.setOwnerId(ownerId);
            showScene(root, "Manage Listings");
        } catch (IOException e) {
            throw new RuntimeException("Failed to open Manage Listings page", e);
        }
    }

    public static void goToOwnerBookings(int ownerId) {
        if (!checkAccess(Role.OWNER)) return;
        try {
            FXMLLoader loader = new FXMLLoader(Router.class.getResource("/OwnerBookings.fxml"));
            Parent root = loader.load();

            Object controller = loader.getController();
            if (controller instanceof OwnerBookingsController obc) {
                obc.setOwnerId(ownerId);
            }

            showScene(root, "My Bookings");
        } catch (IOException e) {
            LOG.error("Failed to load OwnerBookings.fxml", e);
        }
    }

    /* -----------------------------------------------------------
       Property Details (Public)
       ----------------------------------------------------------- */
    public static void goToDetails(int listingId) {
        try {
            FXMLLoader loader = new FXMLLoader(Router.class.getResource("/PropertyDetails.fxml"));
            Parent root = loader.load();

            Object controller = loader.getController();
            if (controller instanceof PropertyDetailsController pdc) {
                pdc.setListingId(listingId);
            }

            showScene(root, "Property Details");
        } catch (IOException e) {
            LOG.error("Failed to load PropertyDetails.fxml for listing {}", listingId, e);
        }
    }

    /* -----------------------------------------------------------
       Chat / Messaging
       ----------------------------------------------------------- */
    public static void goToChatAssistant() {
        try {
            FXMLLoader loader = new FXMLLoader(Router.class.getResource("/chat.fxml"));
            Parent root = loader.load();

            Object controller = loader.getController();
            if (controller instanceof ChatController c) {
                c.appendSystemMessage("👋 Welcome to RentNest Chat Assistant!");
            }

            showScene(root, "RentNest Chat Assistant");
        } catch (IOException e) {
            LOG.error("Failed to load chat.fxml", e);
        }
    }

    public static void goToChat(int listingId, int senderId, int receiverId, String title) {
        if (!SessionManager.isLoggedIn()) { goToLogin(); return; }
        try {
            FXMLLoader loader = new FXMLLoader(Router.class.getResource("/Message.fxml"));
            Parent root = loader.load();

            MessageController controller = loader.getController();
            controller.loadChat(listingId, senderId, receiverId, title);

            showScene(root, "Messages - " + title);
        } catch (IOException e) {
            LOG.error("Failed to load Message.fxml", e);
        }
    }

    /* -----------------------------------------------------------
       Utilities
       ----------------------------------------------------------- */
    private static void showScene(Parent root, String title) {
        if (stage == null) {
            stage = new Stage();
            WindowManager.configureMain(stage);
        }

        Scene scene = stage.getScene();
        if (scene == null) {
            scene = new Scene(root);
            stage.setScene(scene);
        } else {
            scene.setRoot(root);
        }
        applyTheme(scene);

        stage.setTitle(title);
        stage.show();

        // Smooth fade-in animation
        root.setOpacity(0);
        FadeTransition ft = new FadeTransition(Duration.millis(600), root);
        ft.setFromValue(0);
        ft.setToValue(1);
        ft.play();
    }

    private static void applyTheme(Scene scene) {
        if (scene == null) return;
        URL themeUrl = Router.class.getResource("/styles/rentnest-theme.css");
        if (themeUrl != null) {
            String themeStr = themeUrl.toExternalForm();
            if (!scene.getStylesheets().contains(themeStr)) {
                scene.getStylesheets().add(0, themeStr);
            }
        }
    }

    private static boolean checkAccess(Role requiredRole) {
        if (!SessionManager.isLoggedIn()) {
            LOG.warn("Navigation denied — user not logged in; redirecting to login");
            goToLogin();
            return false;
        }

        User user = SessionManager.getLoggedInUser();
        Role roles = user.getRole();
        if (roles != requiredRole) {
            LOG.warn("Navigation denied — role mismatch (user={}, required={})", roles, requiredRole);
            goToHomepage();
            return false;
        }

        return true;
    }
}
