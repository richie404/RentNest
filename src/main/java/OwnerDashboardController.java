import javafx.collections.FXCollections;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.control.ListCell;
import javafx.stage.Stage;
import java.util.List;

public class OwnerDashboardController extends BaseController {

    @FXML private ListView<Listing> propertyList;
    @FXML private ListView<Message> messageList;
    @FXML private Button viewChatButton;

    // 🆕 Added: link to Bookings tab controller (from FXML include)
    @FXML private OwnerBookingsController bookingsTabController;

    private final ListingDAO listingDAO = new ListingDAO();
    private final MessageDAO messageDAO = new MessageDAO();
    private int ownerId = 0;

    /* -----------------------------------------------------------
       ✅ Initialization (Session-aware)
       ----------------------------------------------------------- */
    @FXML
    private void initialize() {
        if (!requireRole("OWNER")) return;

        User current = currentUser();
        ownerId = current.getId();

        // Property list formatting
        propertyList.setCellFactory(v -> new ListCell<>() {
            @Override
            protected void updateItem(Listing l, boolean empty) {
                super.updateItem(l, empty);
                if (empty || l == null) setText(null);
                else setText(l.getTitle() + " • " + l.getLocation() + " — ৳" + l.getPricePerMonth() + "/mo");
            }
        });

        // Message list formatting
        messageList.setCellFactory(v -> new ListCell<>() {
            @Override
            protected void updateItem(Message m, boolean empty) {
                super.updateItem(m, empty);
                if (empty || m == null) setText(null);
                else setText("📨 From Renter ID: " + m.getSenderId() +
                        " | Listing ID: " + m.getListingId() +
                        "\n" + m.getMessageText());
            }
        });

        // Disable "View Chat" when no message selected
        if (viewChatButton != null)
            viewChatButton.disableProperty().bind(messageList.getSelectionModel().selectedItemProperty().isNull());

        refresh();
        loadMessages();

        // 🆕 Initialize Bookings tab (if included in FXML)
        if (bookingsTabController != null)
            bookingsTabController.setOwnerId(ownerId);
    }

    /* -----------------------------------------------------------
       🔹 Setter (used when loaded from Router)
       ----------------------------------------------------------- */
    public void setOwnerId(int ownerId) {
        this.ownerId = ownerId;
        refresh();
        loadMessages();

        // 🆕 Pass ID to bookings tab
        if (bookingsTabController != null)
            bookingsTabController.setOwnerId(ownerId);
    }

    /* -----------------------------------------------------------
       🔹 Refresh data
       ----------------------------------------------------------- */
    @FXML
    private void handleRefresh() {
        refresh();
        loadMessages();

        // 🆕 Refresh bookings if tab active
        if (bookingsTabController != null)
            bookingsTabController.setOwnerId(ownerId);
    }

    private void refresh() {
        try {
            List<Listing> listings = (ownerId == 0)
                    ? listingDAO.findAll()
                    : listingDAO.findByOwner(ownerId);
            propertyList.setItems(FXCollections.observableArrayList(listings));
        } catch (Exception ex) {
            error("Load failed", ex.getMessage());
        }
    }

    private void loadMessages() {
        try {
            if (ownerId == 0) return;
            List<Message> messages = messageDAO.getMessagesForOwner(ownerId);
            messageList.setItems(FXCollections.observableArrayList(messages));
        } catch (Exception e) {
            error("Message Load Failed", e.getMessage());
        }
    }

    /* -----------------------------------------------------------
       💬 View Chat (opens ChatWindow.fxml)
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
            int renterId = selected.getSenderId();
            int ownerId = this.ownerId;
            String title = "Listing #" + listingId;

            FXMLLoader loader = new FXMLLoader(getClass().getResource("/ChatWindow.fxml"));
            Parent root = loader.load();

            ChatWindowController controller = loader.getController();
            controller.initChat(listingId, ownerId, renterId, title);

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
       🔹 Navigation
       ----------------------------------------------------------- */
    @FXML
    private void handleAddListing() {
        if (ownerId == 0) {
            error("Missing user", "Owner ID not set yet.");
            return;
        }
        Router.goToAddListing(ownerId);
    }

    @FXML
    private void handleManageListings() {
        Router.goToListings(ownerId);
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
