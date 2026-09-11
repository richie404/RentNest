import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.geometry.Insets;
import javafx.scene.control.Button;
import javafx.scene.control.Hyperlink;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.TilePane;
import javafx.scene.layout.VBox;

import java.net.URL;
import java.util.List;
import java.util.ResourceBundle;

public class HomepageController extends BaseController implements Initializable {

    /* -----------------------------------------------------------
       🔹 UI Elements
       ----------------------------------------------------------- */
    @FXML private TilePane featuredGrid;
    @FXML private TextField searchField;

    // Top bar
    @FXML private Label welcomeLabel;
    @FXML private Hyperlink loginLink;
    @FXML private Hyperlink registerLink;
    @FXML private Hyperlink logoutLink;
    @FXML private Hyperlink chatLink;

    // CTA buttons (bottom “Ready to List” section)
    @FXML private Button getStartedButton;
    @FXML private Button learnMoreButton;

    /* -----------------------------------------------------------
       🔹 Dependencies
       ----------------------------------------------------------- */
    private final ListingDAO listingDAO = new ListingDAO();

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        // Update top bar depending on session state
        updateUserState();

        // Load featured listings
        try {
            List<Listing> featured = listingDAO.findFeatured(6);
            populateGrid(featured);
        } catch (Exception ex) {
            populateGrid(List.of());
        }

        // Optional: hook up CTA buttons manually if not already bound in FXML
        if (getStartedButton != null)
            getStartedButton.setOnAction(e -> handleRegister());
        if (learnMoreButton != null)
            learnMoreButton.setOnAction(e -> handleLearnMore());
    }

    /* -----------------------------------------------------------
       🔹 User Session + Header
       ----------------------------------------------------------- */
    private void updateUserState() {
        if (SessionManager.isLoggedIn()) {
            User user = SessionManager.getLoggedInUser();
            welcomeLabel.setText("Welcome, " + user.getName() + " 👋");

            loginLink.setVisible(false);
            registerLink.setVisible(false);
            logoutLink.setVisible(true);
        } else {
            welcomeLabel.setText("Welcome to RentNest 🏠");

            loginLink.setVisible(true);
            registerLink.setVisible(true);
            logoutLink.setVisible(false);
        }
    }

    /* -----------------------------------------------------------
       🔹 Navigation & Actions
       ----------------------------------------------------------- */
    @FXML private void handleSearch() {
        String q = (searchField == null) ? "" : searchField.getText().trim();
        SelectionState.setSearchQuery(q);
        Router.goToBrowse();
    }

    @FXML private void handleBrowse()   { Router.goToBrowse(); }
    @FXML private void handleLogin()    { Router.goToLogin(); }
    @FXML private void handleRegister() { Router.goToRegister(); }
    @FXML private void handleChat()     { Router.goToChatAssistant(); }

    @FXML
    private void handleLogout() {
        SessionManager.logout();
        Router.goToHomepage();
    }

    // 🔹 CTA Buttons (from the “Ready to list your property?” section)
    @FXML private void handleLearnMore()  {
        // You can route this to a help or about page
        Router.goToAbout();
    }

    /* -----------------------------------------------------------
       🔹 Featured Properties Section
       ----------------------------------------------------------- */
    private void populateGrid(List<Listing> items) {
        if (featuredGrid == null) return;
        featuredGrid.getChildren().clear();

        for (Listing l : items) {
            VBox card = buildCard(l);
            TilePane.setMargin(card, new Insets(10));
            featuredGrid.getChildren().add(card);
        }
    }

    private VBox buildCard(Listing l) {
        VBox card = new VBox(6);
        card.getStyleClass().add("property-card");
        card.setPrefWidth(300);
        card.setMaxWidth(300);

        ImageView img = new ImageView();
        img.setFitWidth(240);
        img.setFitHeight(140);
        img.setPreserveRatio(true);

        if (l.getImageUrl() != null && !l.getImageUrl().isBlank()) {
            try {
                img.setImage(new Image(l.getImageUrl(), true));
            } catch (Exception ignore) { }
        }

        Label title = new Label(l.getTitle());
        title.getStyleClass().add("card-title");
        title.setWrapText(true);

        Label meta = new Label(l.getLocation() + " • " + l.getListingType());
        meta.getStyleClass().add("card-meta");
        meta.setWrapText(true);

        Label price = new Label("৳" + l.getPricePerMonth() + "/mo");
        price.getStyleClass().add("price");

        card.getChildren().addAll(img, title, meta, price);
        card.setOnMouseClicked(e -> Router.goToDetails(l.getId()));

        return card;
    }
}
