import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;
import javafx.stage.Stage;

import java.util.Optional;

public class PropertyDetailsController extends BaseController {

    @FXML private ImageView propertyImage;
    @FXML private VBox imagePlaceholder;
    @FXML private Label typeBadge;
    
    @FXML private Label titleLabel;
    @FXML private Label locationLabel;
    @FXML private Label priceLabel;
    @FXML private Label descriptionLabel;
    
    @FXML private Label bedroomsLabel;
    @FXML private Label bathroomsLabel;
    @FXML private Label sizeLabel;
    @FXML private Label furnishedLabel;
    @FXML private Label depositLabel;
    @FXML private Label availabilityLabel;
    
    @FXML private FlowPane amenitiesFlow;
    
    @FXML private Button bookButton;
    @FXML private Button chatButton;
    @FXML private Button favoriteButton;
    @FXML private Label notAvailableLabel;

    @FXML private VBox loadingState;
    @FXML private VBox errorState;
    @FXML private Label errorMessageLabel;
    @FXML private VBox contentView;

    private int listingId;
    private final ListingService listingService = new ListingService();
    private final FavoriteService favoriteService = new FavoriteService();

    private enum ViewState { LOADING, ERROR, CONTENT }

    public void setListingId(int id) {
        this.listingId = id;
        loadListing();
    }

    private void setViewState(ViewState state) {
        if (loadingState != null) {
            loadingState.setVisible(state == ViewState.LOADING);
            loadingState.setManaged(state == ViewState.LOADING);
        }
        if (errorState != null) {
            errorState.setVisible(state == ViewState.ERROR);
            errorState.setManaged(state == ViewState.ERROR);
        }
        if (contentView != null) {
            contentView.setVisible(state == ViewState.CONTENT);
            contentView.setManaged(state == ViewState.CONTENT);
        }
    }

    @FXML
    private void handleRetry() {
        loadListing();
    }

    private void loadListing() {
        setViewState(ViewState.LOADING);
        try {
            Optional<Listing> opt = listingService.findById(listingId);
            if (opt.isEmpty()) {
                if (errorMessageLabel != null) errorMessageLabel.setText("This property no longer exists.");
                setViewState(ViewState.ERROR);
                return;
            }

            Listing l = opt.get();
            populateDetails(l);
            setViewState(ViewState.CONTENT);
        } catch (Exception e) {
            log.error("Failed to load listing details", e);
            if (errorMessageLabel != null) errorMessageLabel.setText("Unable to load property details. Please try again.");
            setViewState(ViewState.ERROR);
        }
    }

    private void populateDetails(Listing l) {
        titleLabel.setText(l.getTitle());
        locationLabel.setText("📍 " + l.getLocation());
        priceLabel.setText("৳" + String.format("%,.0f", l.getPricePerMonth()));
        
        descriptionLabel.setText((l.getDescription() == null || l.getDescription().isBlank()) ? "No description available." : l.getDescription());
        
        bedroomsLabel.setText(String.valueOf(l.getBedrooms() != null ? l.getBedrooms() : 0));
        bathroomsLabel.setText(String.valueOf(l.getBathrooms() != null ? l.getBathrooms() : 0));
        sizeLabel.setText((l.getSizeSqft() != null ? l.getSizeSqft() : 0) + " sqft");
        
        furnishedLabel.setText(l.isFurnished() ? "Yes" : "No");
        depositLabel.setText("৳" + String.format("%,.0f", l.getDeposit()));
        availabilityLabel.setText(l.isAvailable() ? "Available" : "Booked");

        if (typeBadge != null) {
            typeBadge.setText(l.getListingType() != null ? l.getListingType().toUpperCase() : "PROPERTY");
        }

        // Amenities
        if (amenitiesFlow != null) {
            amenitiesFlow.getChildren().clear();
            if (l.isFurnished()) amenitiesFlow.getChildren().add(createAmenityBadge("Furnished"));
            if (amenitiesFlow.getChildren().isEmpty()) {
                amenitiesFlow.getChildren().add(createAmenityBadge("None Specified"));
            }
        }

        // Action states
        if (!l.isAvailable()) {
            if (bookButton != null) bookButton.setDisable(true);
            if (notAvailableLabel != null) {
                notAvailableLabel.setVisible(true);
                notAvailableLabel.setManaged(true);
            }
        }

        // Image
        if (l.getImageUrl() != null && !l.getImageUrl().isBlank()) {
            try {
                Image image = new Image(l.getImageUrl(), true);
                image.errorProperty().addListener((obs, old, isError) -> {
                    if (isError) showImagePlaceholder();
                });
                propertyImage.setImage(image);
                propertyImage.setVisible(true);
                if (imagePlaceholder != null) imagePlaceholder.setVisible(false);
            } catch (Exception e) {
                showImagePlaceholder();
            }
        } else {
            showImagePlaceholder();
        }
    }

    private void showImagePlaceholder() {
        if (propertyImage != null) propertyImage.setVisible(false);
        if (imagePlaceholder != null) imagePlaceholder.setVisible(true);
    }

    private Label createAmenityBadge(String text) {
        Label badge = new Label(text);
        badge.getStyleClass().addAll("badge", "badge-neutral");
        return badge;
    }

    @FXML
    private void handleBook() {
        try {
            if (!requireLogin()) return;

            FXMLLoader loader = new FXMLLoader(getClass().getResource("/BookProperty.fxml"));
            Parent root = loader.load();

            BookPropertyController controller = loader.getController();
            Optional<Listing> optListing = listingService.findById(listingId);
            optListing.ifPresent(controller::setListing);

            Stage stage = new Stage();
            stage.setTitle("Confirm Booking - " + optListing.map(Listing::getTitle).orElse("Property"));
            stage.setScene(new Scene(root));
            WindowManager.configureSecondary(stage, titleLabel.getScene().getWindow());
            stage.show();

        } catch (Exception e) {
            log.error("Unable to open booking page for listingId={}", listingId, e);
            error("Booking Error", "Unable to open booking page. Please try again.");
        }
    }

    @FXML
    private void handleFavorite() {
        if (!requireLogin()) return;
        try {
            boolean added = favoriteService.add(listingId);
            if (added) {
                if (favoriteButton != null) favoriteButton.setText("❤️ Saved");
                info("Favorites", "Added to Favorites!");
            } else {
                favoriteService.remove(listingId);
                if (favoriteButton != null) favoriteButton.setText("🤍 Save to Favorites");
                info("Favorites", "Removed from Favorites.");
            }
        } catch (Exception e) {
            handleServiceError("update favorites", e);
        }
    }

    @FXML
    private void handleBack() {
        Router.goToBrowse();
    }

    @FXML
    private void handleChat() {
        try {
            if (!requireLogin()) return;

            int senderId = SessionManager.getLoggedInUser().getId();
            int receiverId = listingService.findOwnerIdByListing(listingId)
                    .orElseThrow(() -> new IllegalStateException("Listing has no owner"));
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
            log.error("Unable to open chat window for listingId={}", listingId, e);
            error("Chat Failed", "Unable to open chat window. Please try again.");
        }
    }
}
