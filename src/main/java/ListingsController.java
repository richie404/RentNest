import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import java.util.List;

public class ListingsController extends BaseController {

    @FXML private TableView<Listing> table;
    @FXML private TableColumn<Listing, String> colTitle;
    @FXML private TableColumn<Listing, String> colType;
    @FXML private TableColumn<Listing, String> colLocation;
    @FXML private TableColumn<Listing, Number> colPrice;
    @FXML private TableColumn<Listing, Number> colSize;

    private final ListingService listingService = new ListingService();
    private int ownerId;

    public void setOwnerId(int ownerId) {
        this.ownerId = ownerId;
        refresh();
    }

    @FXML
    private void initialize() {
        colTitle.setCellValueFactory(data -> new javafx.beans.property.SimpleStringProperty(data.getValue().getTitle()));
        colType.setCellValueFactory(data -> new javafx.beans.property.SimpleStringProperty(data.getValue().getListingType()));
        colLocation.setCellValueFactory(data -> new javafx.beans.property.SimpleStringProperty(data.getValue().getLocation()));
        colPrice.setCellValueFactory(data -> new javafx.beans.property.SimpleObjectProperty<>(data.getValue().getPricePerMonth()));
        colSize.setCellValueFactory(data -> new javafx.beans.property.SimpleObjectProperty<>(data.getValue().getSizeSqft()));
    }

    @FXML
    private void refresh() {
        try {
            List<Listing> listings = (ownerId > 0)
                    ? listingService.findByOwner(ownerId)
                    : listingService.findAll();

            ObservableList<Listing> data = FXCollections.observableArrayList(listings);
            table.setItems(data);
        } catch (Exception e) {
            error("Load failed", e.getMessage());
        }
    }

    @FXML
    private void handleEdit() {
        Listing selected = table.getSelectionModel().getSelectedItem();
        if (selected == null) {
            error("No Selection", "Select a property to edit.");
            return;
        }
        Router.goToAddListing(ownerId);
    }

    @FXML
    private void handleDelete() {
        Listing selected = table.getSelectionModel().getSelectedItem();
        if (selected == null) {
            error("No Selection", "Select a property to delete.");
            return;
        }

        Alert confirm = new Alert(Alert.AlertType.CONFIRMATION);
        confirm.setTitle("Confirm Delete");
        confirm.setHeaderText("Delete this listing?");
        confirm.setContentText(selected.getTitle());

        if (confirm.showAndWait().orElse(ButtonType.CANCEL) == ButtonType.OK) {
            boolean ok = listingService.delete(selected.getId(), ownerId);
            if (ok) {
                info("Deleted", "Property deleted successfully.");
                refresh();
            } else {
                error("Delete Failed", "Could not delete listing.");
            }
        }
    }

    @FXML
    private void handleBack() {
        Router.goToOwnerDashboard(ownerId);
    }
}
