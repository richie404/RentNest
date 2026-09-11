import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.stage.Stage;
import java.util.Optional;

public class PropertyDetailsController extends BaseController {

    @FXML private ImageView propertyImage;
    @FXML private Label titleLabel;
    @FXML private Label locationLabel;
    @FXML private Label priceLabel;
    @FXML private TextArea descriptionArea;

    private int listingId;
    private final ListingDAO listingDAO = new ListingDAO();

    /* -----------------------------------------------------------
       🔹 Load Listing by ID
       ----------------------------------------------------------- */
    public void setListingId(int id) {
        this.listingId = id;
        loadListing();
    }

    private void loadListing() {
        try {
            Optional<Listing> opt = listingDAO.findById(listingId);
            if (opt.isEmpty()) {
                error("Not Found", "This property no longer exists.");
                Router.goToBrowse();
                return;
            }

            Listing l = opt.get();

            titleLabel.setText(l.getTitle());
            locationLabel.setText(l.getLocation());
            priceLabel.setText("৳" + l.getPricePerMonth() + "/month");
            descriptionArea.setText(
                    (l.getDescription() == null || l.getDescription().isBlank())
                            ? "No description available."
                            : l.getDescription()
            );

            if (l.getImageUrl() != null && !l.getImageUrl().isBlank()) {
                propertyImage.setImage(new Image(l.getImageUrl(), true));
            }

        } catch (Exception e) {
            error("Load Failed", e.getMessage());
        }
    }

    /* -----------------------------------------------------------
       🔹 Book Property → navigate to BookProperty.fxml
       ----------------------------------------------------------- */
    @FXML
    private void handleBook() {
        try {
            if (!SessionManager.isLoggedIn()) {
                error("Login Required", "Please log in before booking a property.");
                Router.goToLogin();
                return;
            }

            FXMLLoader loader = new FXMLLoader(getClass().getResource("/BookProperty.fxml"));
            Parent root = loader.load();

            BookPropertyController controller = loader.getController();
            Optional<Listing> optListing = listingDAO.findById(listingId);
            optListing.ifPresent(controller::setListing);

            Stage stage = new Stage();
            stage.setTitle("Confirm Booking - " + optListing.map(Listing::getTitle).orElse("Property"));
            stage.setScene(new Scene(root));
            WindowManager.configureSecondary(stage, titleLabel.getScene().getWindow());
            stage.show();

        } catch (Exception e) {
            e.printStackTrace();
            error("Booking Error", "Unable to open booking page:\n" + e.getMessage());
        }
    }

    /* -----------------------------------------------------------
       🔹 Add to Favorites (placeholder)
       ----------------------------------------------------------- */
    @FXML
    private void handleFavorite() {
        info("Favorites", "Added to Favorites!");
    }

    /* -----------------------------------------------------------
       🔹 Back to Browse
       ----------------------------------------------------------- */
    @FXML
    private void handleBack() {
        Router.goToBrowse();
    }

    /* -----------------------------------------------------------
       💬 Chat (socket)
       ----------------------------------------------------------- */
    @FXML
    private void handleChat() {
        try {
            if (!SessionManager.isLoggedIn()) {
                error("Login Required", "Please log in to chat with owners.");
                Router.goToLogin();
                return;
            }

            int senderId = SessionManager.getLoggedInUser().getId();
            int receiverId = listingDAO.findOwnerIdByListing(listingId);
            String propertyTitle = titleLabel.getText();

            FXMLLoader loader = new FXMLLoader(getClass().getResource("/ChatWindow.fxml"));
            Parent root = loader.load();

            ChatWindowController controller = loader.getController();
            controller.initChat(listingId, senderId, receiverId, propertyTitle);

            Stage stage = new Stage();
            stage.setTitle("Chat - " + propertyTitle);
            stage.setScene(new Scene(root));
            WindowManager.configureSecondary(stage, titleLabel.getScene().getWindow());
            stage.show();

        } catch (Exception e) {
            e.printStackTrace();
            error("Chat Failed", "Unable to open chat window:\n" + e.getMessage());
        }
    }
}
