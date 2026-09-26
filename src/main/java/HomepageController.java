import javafx.collections.FXCollections;
import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.*;

import java.net.URL;
import java.util.List;
import java.util.ResourceBundle;

public class HomepageController extends BaseController implements Initializable {

    public enum ViewState {
        LOADING,
        CONTENT,
        EMPTY,
        ERROR
    }

    // Top Navigation Controls
    @FXML private Button chatButton;
    @FXML private Button loginButton;
    @FXML private Button registerButton;
    @FXML private Label userGreetingLabel;
    @FXML private Button dashboardButton;
    @FXML private Button logoutButton;

    // Search Controls
    @FXML private TextField searchField;
    @FXML private ComboBox<String> propertyTypeCombo;
    @FXML private ComboBox<String> priceRangeCombo;

    // Featured Section States
    @FXML private StackPane contentStack;
    @FXML private VBox loadingState;
    @FXML private VBox emptyState;
    @FXML private VBox errorState;
    @FXML private Label errorMessageLabel;
    @FXML private TilePane featuredGrid;

    private final ListingService listingService = new ListingService();
    private final FavoriteService favoriteService = new FavoriteService();

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        initSearchControls();
        updateUserState();
        loadFeaturedProperties();
    }

    private void initSearchControls() {
        if (propertyTypeCombo != null) {
            propertyTypeCombo.setItems(FXCollections.observableArrayList(
                    "All Types", "Apartment", "Flat", "Room", "Office", "Parking"
            ));
            propertyTypeCombo.getSelectionModel().selectFirst();
        }
        if (priceRangeCombo != null) {
            priceRangeCombo.setItems(FXCollections.observableArrayList(
                    "Any Price", "Under ৳10,000", "৳10,000 - ৳25,000", "৳25,000 - ৳50,000", "Above ৳50,000"
            ));
            priceRangeCombo.getSelectionModel().selectFirst();
        }
    }

    private void updateUserState() {
        if (SessionManager.isLoggedIn()) {
            User user = SessionManager.getLoggedInUser();
            String name = (user != null && user.getName() != null) ? user.getName() : "User";
            if (userGreetingLabel != null) {
                userGreetingLabel.setText("👤 " + name);
                userGreetingLabel.setVisible(true);
            }
            if (dashboardButton != null) dashboardButton.setVisible(true);
            if (logoutButton != null) logoutButton.setVisible(true);
            if (loginButton != null) loginButton.setVisible(false);
            if (registerButton != null) registerButton.setVisible(false);
        } else {
            if (userGreetingLabel != null) userGreetingLabel.setVisible(false);
            if (dashboardButton != null) dashboardButton.setVisible(false);
            if (logoutButton != null) logoutButton.setVisible(false);
            if (loginButton != null) loginButton.setVisible(true);
            if (registerButton != null) registerButton.setVisible(true);
        }
    }

    public void setViewState(ViewState state) {
        if (loadingState != null) {
            loadingState.setVisible(state == ViewState.LOADING);
            loadingState.setManaged(state == ViewState.LOADING);
        }
        if (emptyState != null) {
            emptyState.setVisible(state == ViewState.EMPTY);
            emptyState.setManaged(state == ViewState.EMPTY);
        }
        if (errorState != null) {
            errorState.setVisible(state == ViewState.ERROR);
            errorState.setManaged(state == ViewState.ERROR);
        }
        if (featuredGrid != null) {
            featuredGrid.setVisible(state == ViewState.CONTENT);
            featuredGrid.setManaged(state == ViewState.CONTENT);
        }
    }

    public void loadFeaturedProperties() {
        setViewState(ViewState.LOADING);
        try {
            List<Listing> featured = listingService.findFeatured(6);
            if (featured == null || featured.isEmpty()) {
                setViewState(ViewState.EMPTY);
            } else {
                populateGrid(featured);
                setViewState(ViewState.CONTENT);
            }
        } catch (DatabaseOperationException | DataAccessException e) {
            log.error("Database error while loading featured properties", e);
            if (errorMessageLabel != null) {
                errorMessageLabel.setText("Unable to connect to the database. Please check your connection and retry.");
            }
            setViewState(ViewState.ERROR);
        } catch (Exception e) {
            log.warn("Unexpected error loading featured properties: {}", e.getMessage());
            if (errorMessageLabel != null) {
                errorMessageLabel.setText("Failed to load featured properties. Please try again.");
            }
            setViewState(ViewState.ERROR);
        }
    }

    @FXML
    private void handleRetry() {
        loadFeaturedProperties();
    }

    @FXML
    private void handleSearch() {
        StringBuilder query = new StringBuilder();
        if (searchField != null && !searchField.getText().trim().isBlank()) {
            query.append(searchField.getText().trim());
        }
        if (propertyTypeCombo != null && propertyTypeCombo.getValue() != null
                && !"All Types".equals(propertyTypeCombo.getValue())) {
            if (!query.isEmpty()) query.append(" ");
            query.append(propertyTypeCombo.getValue());
        }
        if (priceRangeCombo != null && priceRangeCombo.getValue() != null
                && !"Any Price".equals(priceRangeCombo.getValue())) {
            if (!query.isEmpty()) query.append(" ");
            query.append(priceRangeCombo.getValue());
        }

        SelectionState.setSearchQuery(query.toString());
        Router.goToBrowse();
    }

    @FXML private void handleBrowse()    { Router.goToBrowse(); }
    @FXML private void handleLogin()     { Router.goToLogin(); }
    @FXML private void handleRegister()  { Router.goToRegister(); }
    @FXML private void handleChat()      { Router.goToChatAssistant(); }
    @FXML private void handleLearnMore() { Router.goToAbout(); }
    @FXML private void handleDashboard() { Router.goToDashboard(); }

    @FXML
    private void handleLogout() {
        SessionManager.logout();
        updateUserState();
        loadFeaturedProperties();
    }

    public TilePane getFeaturedGrid() { return featuredGrid; }
    public VBox getLoadingState() { return loadingState; }
    public VBox getEmptyState() { return emptyState; }
    public VBox getErrorState() { return errorState; }
    public Label getErrorMessageLabel() { return errorMessageLabel; }
    public TextField getSearchField() { return searchField; }
    public ComboBox<String> getPropertyTypeCombo() { return propertyTypeCombo; }
    public ComboBox<String> getPriceRangeCombo() { return priceRangeCombo; }
    public Button getLoginButton() { return loginButton; }
    public Button getRegisterButton() { return registerButton; }
    public Button getDashboardButton() { return dashboardButton; }
    public Button getLogoutButton() { return logoutButton; }
    public Label getUserGreetingLabel() { return userGreetingLabel; }

    void populateGrid(List<Listing> items) {
        if (featuredGrid == null) return;
        featuredGrid.getChildren().clear();

        for (Listing l : items) {
            VBox card = buildCard(l);
            TilePane.setMargin(card, new Insets(8));
            featuredGrid.getChildren().add(card);
        }
    }

    private VBox buildCard(Listing l) {
        VBox card = new VBox();
        card.getStyleClass().addAll("card", "property-card");
        card.setPrefWidth(300);
        card.setMaxWidth(300);

        // 1. Image & Badge Stack
        StackPane imgStack = new StackPane();
        imgStack.getStyleClass().add("card-img-container");
        imgStack.setPrefHeight(170);
        imgStack.setMinHeight(170);
        imgStack.setMaxHeight(170);

        // Placeholder banner when image is missing or fails
        VBox placeholder = new VBox(6);
        placeholder.setAlignment(Pos.CENTER);
        placeholder.getStyleClass().add("card-img-placeholder");
        placeholder.setPrefHeight(170);
        Label placeholderIcon = new Label(getTypeIcon(l.getListingType()));
        placeholderIcon.setStyle("-fx-font-size: 36px;");
        Label placeholderText = new Label("RentNest Verified");
        placeholderText.getStyleClass().add("text-caption");
        placeholder.getChildren().addAll(placeholderIcon, placeholderText);

        ImageView img = new ImageView();
        img.setFitWidth(298);
        img.setFitHeight(170);
        img.setPreserveRatio(false);

        if (l.getImageUrl() != null && !l.getImageUrl().isBlank()) {
            try {
                Image image = new Image(l.getImageUrl(), 300, 170, true, true, true);
                image.errorProperty().addListener((obs, oldVal, isError) -> {
                    if (isError) {
                        img.setVisible(false);
                        placeholder.setVisible(true);
                    }
                });
                img.setImage(image);
                placeholder.setVisible(false);
            } catch (Exception e) {
                img.setVisible(false);
                placeholder.setVisible(true);
            }
        } else {
            img.setVisible(false);
            placeholder.setVisible(true);
        }

        // Floating Type Badge
        String typeName = l.getListingType() != null ? l.getListingType().toUpperCase() : "PROPERTY";
        Label typeBadge = new Label(typeName);
        typeBadge.getStyleClass().addAll("badge", "badge-neutral", "card-type-badge");
        StackPane.setAlignment(typeBadge, Pos.TOP_LEFT);
        StackPane.setMargin(typeBadge, new Insets(10));

        // Floating Favorite Icon
        Button favBtn = new Button("🤍");
        favBtn.getStyleClass().add("card-fav-btn");
        favBtn.setOnAction(e -> {
            e.consume();
            toggleFavorite(l.getId(), favBtn);
        });
        StackPane.setAlignment(favBtn, Pos.TOP_RIGHT);
        StackPane.setMargin(favBtn, new Insets(10));

        imgStack.getChildren().addAll(placeholder, img, typeBadge, favBtn);

        // 2. Card Content Body
        VBox body = new VBox(8);
        body.getStyleClass().add("card-body");

        // Price Row
        HBox priceRow = new HBox(4);
        priceRow.setAlignment(Pos.BASELINE_LEFT);
        Label priceLabel = new Label("৳" + String.format("%,.0f", l.getPricePerMonth()));
        priceLabel.getStyleClass().addAll("text-h2", "text-primary-color");
        Label periodLabel = new Label("/mo");
        periodLabel.getStyleClass().add("text-body-small");
        priceRow.getChildren().addAll(priceLabel, periodLabel);

        // Title
        Label titleLabel = new Label(l.getTitle());
        titleLabel.getStyleClass().addAll("text-h3", "card-title-text");
        titleLabel.setWrapText(true);
        titleLabel.setMaxHeight(44);

        // Location
        String locationStr = (l.getLocation() == null || l.getLocation().isBlank()) ? "Dhaka" : l.getLocation();
        Label locationLabel = new Label("📍 " + locationStr);
        locationLabel.getStyleClass().addAll("text-body-small", "card-location-text");

        // Specification Badges (from actual DB values)
        HBox specsRow = new HBox(8);
        specsRow.setAlignment(Pos.CENTER_LEFT);
        specsRow.getStyleClass().add("card-specs-row");

        if (l.getBedrooms() != null && l.getBedrooms() > 0) {
            Label bed = new Label("🛏️ " + l.getBedrooms() + " Beds");
            bed.getStyleClass().add("spec-badge");
            specsRow.getChildren().add(bed);
        }
        if (l.getBathrooms() != null && l.getBathrooms() > 0) {
            Label bath = new Label("🚿 " + l.getBathrooms() + " Baths");
            bath.getStyleClass().add("spec-badge");
            specsRow.getChildren().add(bath);
        }
        if (l.getSizeSqft() != null && l.getSizeSqft() > 0) {
            Label sqft = new Label("📐 " + l.getSizeSqft() + " sqft");
            sqft.getStyleClass().add("spec-badge");
            specsRow.getChildren().add(sqft);
        }
        if (specsRow.getChildren().isEmpty()) {
            Label avail = new Label(l.isAvailable() ? "✅ Available" : "⏳ Booked");
            avail.getStyleClass().add("spec-badge");
            specsRow.getChildren().add(avail);
        }

        // View Details CTA Button
        Button viewBtn = new Button("View Details");
        viewBtn.getStyleClass().addAll("btn", "btn-secondary", "card-cta-btn");
        viewBtn.setMaxWidth(Double.MAX_VALUE);
        viewBtn.setOnAction(e -> {
            e.consume();
            Router.goToDetails(l.getId());
        });

        body.getChildren().addAll(priceRow, titleLabel, locationLabel, specsRow, viewBtn);
        card.getChildren().addAll(imgStack, body);

        card.setOnMouseClicked(e -> Router.goToDetails(l.getId()));
        return card;
    }

    private void toggleFavorite(int listingId, Button favBtn) {
        if (!SessionManager.isLoggedIn()) {
            warn("Sign In Required", "Please log in to save properties to your favorites.");
            Router.goToLogin();
            return;
        }

        try {
            boolean added = favoriteService.add(listingId);
            if (added) {
                favBtn.setText("❤️");
                info("Favorites", "Property added to your favorites!");
            } else {
                favoriteService.remove(listingId);
                favBtn.setText("🤍");
                info("Favorites", "Property removed from your favorites.");
            }
        } catch (Exception e) {
            handleServiceError("update favorite", e);
        }
    }

    private String getTypeIcon(String type) {
        if (type == null) return "🏠";
        return switch (type.toUpperCase()) {
            case "APARTMENT" -> "🏢";
            case "ROOM" -> "🚪";
            case "OFFICE" -> "💼";
            case "PARKING" -> "🚗";
            default -> "🏠";
        };
    }
}
