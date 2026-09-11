import javafx.collections.FXCollections;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.ListCell;
import javafx.stage.Stage;
import java.util.List;

public class RenterDashboardController extends BaseController {

    @FXML private ListView<Listing> favoritesList;
    @FXML private ListView<Message> messageList;
    @FXML private Button viewChatButton;
    @FXML private RenterBookingsController renterBookingsController;

    private final ListingDAO listingDAO = new ListingDAO();
    private final MessageDAO messageDAO = new MessageDAO();
    private int renterId;

    /* -----------------------------------------------------------
       🏠 Initialize dashboard
       ----------------------------------------------------------- */
    @FXML
    public void initialize() {
        if (!requireRole("RENTER")) return;

        User user = currentUser();
        if (user != null) {
            renterId = user.getId();
        }

        // Initialize lists, buttons, etc.
        favoritesList.setCellFactory(v -> new ListCell<>() {
            @Override
            protected void updateItem(Listing l, boolean empty) {
                super.updateItem(l, empty);
                setText((empty || l == null) ? null : l.getTitle() + " — ৳" + l.getPricePerMonth() + " | " + l.getLocation());
            }
        });

        messageList.setCellFactory(v -> new ListCell<>() {
            @Override
            protected void updateItem(Message m, boolean empty) {
                super.updateItem(m, empty);
                setText((empty || m == null) ? null :
                        "💬 From Owner ID: " + m.getSenderId() +
                                " | Listing ID: " + m.getListingId() +
                                "\n" + m.getMessageText());
            }
        });

        if (viewChatButton != null)
            viewChatButton.disableProperty().bind(messageList.getSelectionModel().selectedItemProperty().isNull());
    }


    public void setRenterId(int renterId) {
        this.renterId = renterId;
        System.out.println("✅ [RenterDashboardController] Renter ID set: " + renterId);

        // Forward to included bookings tab
        if (renterBookingsController != null) {
            renterBookingsController.setRenterId(renterId);
            System.out.println("📤 Forwarded renterId to RenterBookingsController");
        } else {
            System.err.println("⚠️ RenterBookingsController is null — check fx:include fx:id");
        }

        loadFeatured();
        loadMessages();
    }

    /* -----------------------------------------------------------
       🌟 Load featured listings
       ----------------------------------------------------------- */
    private void loadFeatured() {
        try {
            List<Listing> featured = listingDAO.findFeatured(6);
            favoritesList.setItems(FXCollections.observableArrayList(featured));
        } catch (Exception ex) {
            error("Failed to load listings", ex.getMessage());
        }
    }

    /* -----------------------------------------------------------
       💬 Load messages for renter (sent or received)
       ----------------------------------------------------------- */
    private void loadMessages() {
        try {
            List<Message> msgs = messageDAO.getMessagesForUser(renterId);
            messageList.setItems(FXCollections.observableArrayList(msgs));
        } catch (Exception e) {
            error("Failed to load messages", e.getMessage());
        }
    }

    /* -----------------------------------------------------------
       💬 Open chat window (bidirectional + safe)
       ----------------------------------------------------------- */
    @FXML
    private void handleViewChat() {
        Message selected = messageList.getSelectionModel().getSelectedItem();
        if (selected == null) {
            Alert alert = new Alert(Alert.AlertType.WARNING);
            alert.setTitle("No Message Selected");
            alert.setHeaderText(null);
            alert.setContentText("Please select a message to open chat.");
            alert.showAndWait();
            return;
        }

        try {
            int listingId = selected.getListingId();
            int ownerId;
            int renterId = this.renterId;

            // ✅ Determine who is owner based on message direction
            if (selected.getSenderId() == renterId) {
                // renter sent this → owner is receiver
                ownerId = selected.getReceiverId();
            } else {
                // renter received this → owner is sender
                ownerId = selected.getSenderId();
            }

            String title = "Listing #" + listingId;

            FXMLLoader loader = new FXMLLoader(getClass().getResource("/ChatWindow.fxml"));
            Parent root = loader.load();

            ChatWindowController controller = loader.getController();
            // ✅ renter is always sender (current user)
            controller.initChat(listingId, renterId, ownerId, title);

            Stage stage = new Stage();
            stage.setTitle("Chat - " + title);
            stage.setScene(new Scene(root));
            WindowManager.configureSecondary(stage, messageList.getScene().getWindow());
            stage.show();

        } catch (Exception e) {
            e.printStackTrace();
            error("Chat Error", "Unable to open chat:\n" + e.getMessage());
        }
    }

    /* -----------------------------------------------------------
       🔄 Refresh / Reload
       ----------------------------------------------------------- */
    @FXML
    private void handleRefresh() {
        loadFeatured();
        loadMessages();
    }
    @FXML
    private void handleMyBookings() {
        int renterId = UserStore.getCurrentUserId(); // ✅ use your UserStore
        if (renterId == -1) {
            System.out.println("⚠️ No renter logged in");
            return;
        }
        Router.goToRenterBookings(renterId);
    }

    /* -----------------------------------------------------------
       🔗 Navigation
       ----------------------------------------------------------- */
    @FXML
    private void handleBrowse() {
        Router.goToBrowse();
    }

    @FXML
    private void handleHome() {
        Router.goToHomepage();
    }

    @FXML
    private void handleLogout() {
        SessionManager.logout();
        Router.goToHomepage();
    }
}
