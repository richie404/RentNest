import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.layout.TilePane;
import javafx.scene.layout.VBox;
import java.net.URL;
import java.util.List;
import java.util.ResourceBundle;

public class BrowseController extends BaseController implements Initializable {

    @FXML private TilePane grid;
    @FXML private TextField searchField;

    // 🔹 Filter controls (from sidebar)
    @FXML private RadioButton priceAny, price1, price2, price3, price4;
    @FXML private CheckBox typeRoom, typeFlat, typeApartment, typeOffice, typeParking;
    @FXML private RadioButton bedAny, bed1, bed2, bed3;
    @FXML private CheckBox amenWifi, amenParking, amenPets, amenLift, amenSecurity;

    private final ListingDAO listingDAO = new ListingDAO();

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        // ✅ Sync UI/session state right away (keeps user logged in properly)
        updateUserState();

        // ✅ Optional: Show who’s browsing (debugging/logging)
        if (SessionManager.isLoggedIn()) {
            User user = SessionManager.getLoggedInUser();
            System.out.println("✅ Active session: " + user.getName() + " (" + user.getRoles() + ")");
        } else {
            System.out.println("⚠️ No user session found on Browse page");
        }

        // ✅ Handle pre-filled search or default load
        String preset = SelectionState.consumeSearchQuery();
        if (preset != null && !preset.isBlank()) {
            if (searchField != null) searchField.setText(preset);
            doSearch(preset);
        } else {
            refreshAll();
        }
    }

    /* -------------------------------------------------------
       🔹 SEARCH LOGIC
       ------------------------------------------------------- */
    @FXML
    private void handleSearch() {
        String q = (searchField != null) ? searchField.getText().trim() : "";
        doSearch(q);
    }

    private void doSearch(String q) {
        try {
            List<Listing> list = (q == null || q.isBlank())
                    ? listingDAO.findAll()
                    : listingDAO.search(q);
            populate(list);
        } catch (Exception ex) {
            error("Search failed", ex.getMessage());
        }
    }

    /* -------------------------------------------------------
       🔹 FILTER HANDLING
       ------------------------------------------------------- */
    @FXML
    private void handleApplyFilters() {
        try {
            // TODO: Replace with a real filtered query in ListingDAO
            List<Listing> list = listingDAO.findAll();
            populate(list);
        } catch (Exception ex) {
            error("Filter failed", ex.getMessage());
        }
    }

    @FXML
    private void handleResetFilters() {
        try {
            if (priceAny != null) priceAny.setSelected(true);
            if (bedAny != null) bedAny.setSelected(true);

            for (CheckBox cb : List.of(typeRoom, typeFlat, typeApartment, typeOffice, typeParking,
                    amenWifi, amenParking, amenPets, amenLift, amenSecurity)) {
                if (cb != null) cb.setSelected(false);
            }

            refreshAll();
        } catch (Exception ex) {
            error("Reset failed", ex.getMessage());
        }
    }

    /* -------------------------------------------------------
       🔹 DATA POPULATION
       ------------------------------------------------------- */
    private void refreshAll() {
        try {
            populate(listingDAO.findAll());
        } catch (Exception ex) {
            error("Load failed", ex.getMessage());
        }
    }

    private void populate(List<Listing> listings) {
        grid.getChildren().clear();
        for (Listing l : listings) {
            VBox card = buildCard(l);
            TilePane.setMargin(card, new Insets(10));
            grid.getChildren().add(card);
        }
    }

    private VBox buildCard(Listing l) {
        VBox card = new VBox(6);
        card.getStyleClass().add("property-card");
        card.setPrefWidth(300);
        card.setMaxWidth(300);

        ImageView img = new ImageView();
        img.setFitWidth(220);
        img.setFitHeight(130);
        img.setPreserveRatio(true);

        if (l.getImageUrl() != null && !l.getImageUrl().isBlank()) {
            try {
                img.setImage(new Image(l.getImageUrl(), true));
            } catch (Exception ignore) {}
        }

        Label title = new Label(l.getTitle());
        title.getStyleClass().add("card-title");
        title.setWrapText(true);

        Label meta = new Label(l.getLocation() + " • " +
                (l.getListingType() != null ? l.getListingType() : "Property"));
        meta.getStyleClass().add("card-meta");
        meta.setWrapText(true);

        Label price = new Label("৳" + l.getPricePerMonth() + "/mo");
        price.getStyleClass().add("price");

        card.getChildren().addAll(img, title, meta, price);

        card.setOnMouseClicked(e -> {
            if (l.getId() > 0) {
                Router.goToDetails(l.getId());
            } else {
                error("Navigation Failed", "Invalid property ID.");
            }
        });

        card.setOnMouseEntered(e -> card.setStyle("-fx-cursor: hand; -fx-opacity: 0.9;"));
        card.setOnMouseExited(e -> card.setStyle("-fx-opacity: 1;"));

        return card;
    }

    /* -------------------------------------------------------
       🔹 NAVIGATION BUTTONS
       ------------------------------------------------------- */
    @FXML private void handleHome()     { Router.goToIndex(); }
    @FXML private void handleBrowse()   { Router.goToBrowse(); }
    @FXML private void handleLogin()    { Router.goToLogin(); }
    @FXML private void handleRegister() { Router.goToRegister(); }
    @FXML private void handleChat()     { Router.goToChatAssistant(); }
    protected void updateUserState() {
        // If you have top bar or label controls that reflect login state, update them here
        if (SessionManager.isLoggedIn()) {
            User user = SessionManager.getLoggedInUser();
            System.out.println("🔐 Logged in as: " + user.getName() + " (" + user.getRoles() + ")");
        } else {
            System.out.println("🚪 No active user session");
        }
    }

    @FXML
    private void handleLogout() {
        SessionManager.logout();
        Router.goToHomepage();
    }
}
