import javafx.collections.FXCollections;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.Stage;
import java.util.List;

public class RenterDashboardController extends BaseController {

    // Navigation buttons
    @FXML private Button btnDashboard;
    @FXML private Button btnFavorites;
    @FXML private Button btnBookings;
    @FXML private Button btnMessages;

    // View sections
    @FXML private VBox dashboardView;
    @FXML private VBox favoritesView;
    @FXML private VBox bookingsView;
    @FXML private VBox messagesView;

    // Dashboard Stats
    @FXML private Label savedPropertiesCount;
    @FXML private Label pendingBookingsCount;
    @FXML private Label activeBookingsCount;
    @FXML private Label unreadMessagesCount;

    // Favorites
    @FXML private TilePane favoritesGrid;
    @FXML private VBox favoritesEmptyState;
    @FXML private ScrollPane favoritesScroll;

    // Messages
    @FXML private ListView<Message> messageList;
    @FXML private Button viewChatButton;
    @FXML private VBox messagesEmptyState;

    @FXML private RenterBookingsController renterBookingsController;

    private final FavoriteService favoriteService = new FavoriteService();
    private final BookingService bookingService = new BookingService();
    private final MessageService messageService = new MessageService();
    private int renterId;

    @FXML
    public void initialize() {
        if (!requireRole(Role.RENTER)) return;

        User user = currentUser();
        if (user != null) {
            renterId = user.getId();
        }

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

        if (viewChatButton != null) {
            viewChatButton.disableProperty().bind(messageList.getSelectionModel().selectedItemProperty().isNull());
        }

        showDashboard();
    }

    public void setRenterId(int renterId) {
        this.renterId = renterId;
        log.debug("Renter ID set: {}", renterId);

        if (renterBookingsController != null) {
            renterBookingsController.setRenterId(renterId);
        }

        loadDashboardStats();
    }

    private void setActiveButton(Button activeBtn) {
        Button[] buttons = {btnDashboard, btnFavorites, btnBookings, btnMessages};
        for (Button btn : buttons) {
            if (btn != null) {
                btn.getStyleClass().remove("active");
            }
        }
        if (activeBtn != null) {
            activeBtn.getStyleClass().add("active");
        }
    }

    private void hideAllViews() {
        if (dashboardView != null) dashboardView.setVisible(false);
        if (favoritesView != null) favoritesView.setVisible(false);
        if (bookingsView != null) bookingsView.setVisible(false);
        if (messagesView != null) messagesView.setVisible(false);
    }

    @FXML
    private void showDashboard() {
        setActiveButton(btnDashboard);
        hideAllViews();
        if (dashboardView != null) dashboardView.setVisible(true);
        loadDashboardStats();
    }

    @FXML
    private void showFavorites() {
        setActiveButton(btnFavorites);
        hideAllViews();
        if (favoritesView != null) favoritesView.setVisible(true);
        loadFavorites();
    }

    @FXML
    private void showBookings() {
        setActiveButton(btnBookings);
        hideAllViews();
        if (bookingsView != null) bookingsView.setVisible(true);
    }

    @FXML
    private void showMessages() {
        setActiveButton(btnMessages);
        hideAllViews();
        if (messagesView != null) messagesView.setVisible(true);
        loadMessages();
    }

    private void loadDashboardStats() {
        try {
            List<Listing> favorites = favoriteService.findMine();
            if (savedPropertiesCount != null) savedPropertiesCount.setText(String.valueOf(favorites.size()));

            List<Booking> bookings = bookingService.findByRenter(renterId);
            long pending = bookings.stream().filter(b -> b.getBookingStatus().isPending()).count();
            long active = bookings.stream().filter(b -> b.getBookingStatus() == BookingStatus.APPROVED || b.getBookingStatus() == BookingStatus.CONFIRMED).count();
            
            if (pendingBookingsCount != null) pendingBookingsCount.setText(String.valueOf(pending));
            if (activeBookingsCount != null) activeBookingsCount.setText(String.valueOf(active));

            List<Message> msgs = messageService.findByUser(renterId);
            if (unreadMessagesCount != null) unreadMessagesCount.setText(String.valueOf(msgs.size()));
        } catch (Exception ex) {
            handleServiceError("load dashboard statistics", ex);
        }
    }

    private void loadFavorites() {
        try {
            List<Listing> favorites = favoriteService.findMine();
            if (favorites.isEmpty()) {
                if (favoritesEmptyState != null) {
                    favoritesEmptyState.setVisible(true);
                    favoritesEmptyState.setManaged(true);
                }
                if (favoritesScroll != null) {
                    favoritesScroll.setVisible(false);
                    favoritesScroll.setManaged(false);
                }
            } else {
                if (favoritesEmptyState != null) {
                    favoritesEmptyState.setVisible(false);
                    favoritesEmptyState.setManaged(false);
                }
                if (favoritesScroll != null) {
                    favoritesScroll.setVisible(true);
                    favoritesScroll.setManaged(true);
                }
                populateFavoritesGrid(favorites);
            }
        } catch (Exception ex) {
            handleServiceError("load favorites", ex);
        }
    }

    private void populateFavoritesGrid(List<Listing> listings) {
        if (favoritesGrid == null) return;
        favoritesGrid.getChildren().clear();
        for (Listing l : listings) {
            VBox card = new VBox(10);
            card.getStyleClass().add("property-card");
            card.setPrefWidth(280);
            card.setMaxWidth(280);

            Label title = new Label(l.getTitle());
            title.getStyleClass().add("text-h3");
            
            Label location = new Label("📍 " + l.getLocation());
            location.getStyleClass().add("text-body-small");
            
            Label price = new Label("৳" + l.getPricePerMonth() + "/mo");
            price.getStyleClass().add("text-h2");
            
            Button viewBtn = new Button("View Details");
            viewBtn.getStyleClass().add("button-primary");
            viewBtn.setOnAction(e -> Router.goToDetails(l.getId()));
            
            card.getChildren().addAll(title, location, price, viewBtn);
            favoritesGrid.getChildren().add(card);
        }
    }

    private void loadMessages() {
        try {
            List<Message> msgs = messageService.findByUser(renterId);
            if (msgs.isEmpty()) {
                if (messagesEmptyState != null) {
                    messagesEmptyState.setVisible(true);
                    messagesEmptyState.setManaged(true);
                }
                if (messageList != null) {
                    messageList.setVisible(false);
                    messageList.setManaged(false);
                }
            } else {
                if (messagesEmptyState != null) {
                    messagesEmptyState.setVisible(false);
                    messagesEmptyState.setManaged(false);
                }
                if (messageList != null) {
                    messageList.setVisible(true);
                    messageList.setManaged(true);
                    messageList.setItems(FXCollections.observableArrayList(msgs));
                }
            }
        } catch (Exception e) {
            handleServiceError("load messages", e);
        }
    }

    @FXML
    private void handleViewChat() {
        Message selected = messageList.getSelectionModel().getSelectedItem();
        if (selected == null) {
            warn("No Message Selected", "Please select a message to open chat.");
            return;
        }

        try {
            int listingId = selected.getListingId();
            int ownerId;
            int renterId = this.renterId;

            if (selected.getSenderId() == renterId) {
                ownerId = selected.getReceiverId();
            } else {
                ownerId = selected.getSenderId();
            }

            String title = "Listing #" + listingId;

            FXMLLoader loader = new FXMLLoader(getClass().getResource("/ChatWindow.fxml"));
            Parent root = loader.load();

            ChatWindowController controller = loader.getController();
            controller.initChat(listingId, renterId, ownerId, title);

            Stage stage = new Stage();
            stage.setTitle("Chat - " + title);
            stage.setScene(new Scene(root));
            WindowManager.configureSecondary(stage, messageList.getScene().getWindow());
            stage.show();

        } catch (Exception e) {
            log.error("Unable to open chat for renterId={}", renterId, e);
            error("Chat Error", "Unable to open chat. Please try again.");
        }
    }

    @FXML
    private void handleBrowse() {
        Router.goToBrowse();
    }
}
