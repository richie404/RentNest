import javafx.collections.FXCollections;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import java.util.List;

public class AdminListingManagementController {

    @FXML private TableView<Listing> listingTable;
    @FXML private TableColumn<Listing, String> colTitle;
    @FXML private TableColumn<Listing, String> colLocation;
    @FXML private TableColumn<Listing, Double> colPrice;
    @FXML private TableColumn<Listing, Integer> colOwner;
    @FXML private TableColumn<Listing, String> colStatus;
    @FXML private Button btnApprove, btnReject, btnRefresh;

    private final AdminService adminService = new AdminService();

    @FXML
    private void initialize() {
        colTitle.setCellValueFactory(data -> new javafx.beans.property.SimpleStringProperty(data.getValue().getTitle()));
        colLocation.setCellValueFactory(data -> new javafx.beans.property.SimpleStringProperty(data.getValue().getLocation()));
        colPrice.setCellValueFactory(data -> new javafx.beans.property.SimpleDoubleProperty(data.getValue().getPricePerMonth()).asObject());
        colOwner.setCellValueFactory(data -> new javafx.beans.property.SimpleObjectProperty<>(data.getValue().getOwnerId()));
        colStatus.setCellValueFactory(data -> new javafx.beans.property.SimpleStringProperty(data.getValue().getStatus()));
        loadListings();
    }

    private void loadListings() {
        List<Listing> listings = adminService.getAllListings();
        listingTable.setItems(FXCollections.observableArrayList(listings));
    }

    @FXML
    private void handleApprove() {
        try {
            Listing selected = listingTable.getSelectionModel().getSelectedItem();
            if (selected == null) { showAlert("Select a listing first"); return; }

            if (adminService.updateListingStatus(selected.getId(), ApprovalStatus.APPROVED.name())) {
                showAlert("✅ Listing Approved!");
                loadListings();
            }
        } catch (RuntimeException e) { showAlert(e.getMessage()); }
    }

    @FXML
    private void handleViewDetails() {
        // TODO: implement property details view popup
        System.out.println("View details clicked (Listing Management)");
    }

    @FXML
    private void handleReject() {
        try {
            Listing selected = listingTable.getSelectionModel().getSelectedItem();
            if (selected == null) { showAlert("Select a listing first"); return; }

            if (adminService.updateListingStatus(selected.getId(), ApprovalStatus.REJECTED.name())) {
                showAlert("❌ Listing Rejected!");
                loadListings();
            }
        } catch (RuntimeException e) { showAlert(e.getMessage()); }
    }

    @FXML
    private void handleRefresh() {
        loadListings();
    }

    private void showAlert(String msg) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setHeaderText(null);
        alert.setContentText(msg);
        alert.showAndWait();
    }
}
