import javafx.fxml.FXML;
import javafx.fxml.Initializable;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import java.net.URL;
import java.util.List;
import java.util.ResourceBundle;

public class BrowseController extends BaseController implements Initializable {

    @FXML private TilePane grid;
    @FXML private TextField searchField;
    @FXML private Label resultCountLabel;

    @FXML private VBox loadingState;
    @FXML private VBox emptyState;
    @FXML private VBox errorState;
    @FXML private ScrollPane contentScroll;

    // Filter controls
    @FXML private RadioButton priceAny, price1, price2, price3, price4;
    @FXML private CheckBox typeRoom, typeFlat, typeApartment, typeOffice, typeParking;
    @FXML private RadioButton bedAny, bed1, bed2, bed3;
    @FXML private CheckBox amenWifi, amenParking, amenPets, amenLift, amenSecurity;

    private final ListingService listingService = new ListingService();

    private enum ViewState { LOADING, EMPTY, ERROR, CONTENT }

    @Override
    public void initialize(URL url, ResourceBundle rb) {
        if (SessionManager.isLoggedIn()) {
            User user = SessionManager.getLoggedInUser();
            log.debug("Active browse session: {} ({})", user.getName(), user.getRoles());
        }

        if (searchField != null) {
            searchField.textProperty().addListener((obs, oldText, newText) -> {
                handleSearch();
            });
        }

        String preset = SelectionState.consumeSearchQuery();
        if (preset != null && !preset.isBlank()) {
            if (searchField != null) searchField.setText(preset);
            // listener will trigger handleSearch
        } else {
            refreshAll();
        }
    }

    private void setViewState(ViewState state) {
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
        if (contentScroll != null) {
            contentScroll.setVisible(state == ViewState.CONTENT);
            contentScroll.setManaged(state == ViewState.CONTENT);
        }
    }

    @FXML
    private void handleSearch() {
        String q = (searchField != null) ? searchField.getText().trim() : "";
        doSearch(q);
    }

    private void doSearch(String q) {
        setViewState(ViewState.LOADING);
        try {
            List<Listing> list = (q == null || q.isBlank())
                    ? listingService.findAll()
                    : listingService.search(q);
            populate(list);
        } catch (Exception ex) {
            log.error("Error searching listings", ex);
            setViewState(ViewState.ERROR);
        }
    }

    @FXML
    private void handleApplyFilters() {
        // Here we just reload all or search, advanced filters would be applied in the service layer
        handleSearch();
    }

    @FXML
    private void handleResetFilters() {
        try {
            if (searchField != null) searchField.setText("");
            
            if (priceAny != null) priceAny.setSelected(true);
            if (bedAny != null) bedAny.setSelected(true);

            for (CheckBox cb : List.of(typeRoom, typeFlat, typeApartment, typeOffice, typeParking,
                    amenWifi, amenParking, amenPets, amenLift, amenSecurity)) {
                if (cb != null) cb.setSelected(false);
            }

            refreshAll();
        } catch (Exception ex) {
            log.error("Error resetting filters", ex);
            setViewState(ViewState.ERROR);
        }
    }

    private void refreshAll() {
        setViewState(ViewState.LOADING);
        try {
            populate(listingService.findAll());
        } catch (Exception ex) {
            log.error("Error loading listings", ex);
            setViewState(ViewState.ERROR);
        }
    }

    private void populate(List<Listing> listings) {
        if (grid == null) return;
        grid.getChildren().clear();
        
        if (listings == null || listings.isEmpty()) {
            if (resultCountLabel != null) resultCountLabel.setText("0 results");
            setViewState(ViewState.EMPTY);
            return;
        }

        for (Listing l : listings) {
            VBox card = createPropertyCard(l);
            grid.getChildren().add(card);
        }
        
        if (resultCountLabel != null) resultCountLabel.setText(listings.size() + " results");
        setViewState(ViewState.CONTENT);
    }

    private VBox createPropertyCard(Listing l) {
        VBox card = new VBox(10);
        card.getStyleClass().add("property-card");
        card.setPrefWidth(280);
        card.setMaxWidth(280);

        Label title = new Label(l.getTitle());
        title.getStyleClass().add("text-h3");
        title.setWrapText(true);
        title.setMaxHeight(44);
        
        Label location = new Label("📍 " + l.getLocation());
        location.getStyleClass().add("text-body-small");
        
        Label price = new Label("৳" + l.getPricePerMonth() + "/mo");
        price.getStyleClass().add("text-h2");
        
        Button viewBtn = new Button("View Details");
        viewBtn.getStyleClass().addAll("btn", "btn-secondary", "w-full");
        viewBtn.setOnAction(e -> Router.goToDetails(l.getId()));
        
        card.getChildren().addAll(title, location, price, viewBtn);
        card.setOnMouseClicked(e -> Router.goToDetails(l.getId()));
        
        return card;
    }
}
