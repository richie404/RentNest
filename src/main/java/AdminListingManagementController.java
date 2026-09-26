import javafx.collections.FXCollections;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import java.util.List;

public class AdminListingManagementController extends BaseController {

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
        try {
            List<Listing> listings = adminService.getAllListings();
            listingTable.setItems(FXCollections.observableArrayList(listings));
        } catch (Exception e) {
            handleServiceError("load admin listings", e);
        }
    }

    @FXML
    private void handleApprove() {
        Listing selected = listingTable.getSelectionModel().getSelectedItem();
        if (selected == null) {
            warn("No Selection", "Please select a listing first.");
            return;
        }

        try {
            if (adminService.updateListingStatus(selected.getId(), ApprovalStatus.APPROVED.name())) {
                info("Success", "Listing approved successfully.");
                loadListings();
            } else {
                warn("Failed", "Failed to approve listing.");
            }
        } catch (Exception e) {
            handleServiceError("approve listing", e);
        }
    }

    @FXML
    private void handleViewDetails() {
        info("Property Details", "Detailed property view popup is under development.");
    }

    @FXML
    private void handleReject() {
        Listing selected = listingTable.getSelectionModel().getSelectedItem();
        if (selected == null) {
            warn("No Selection", "Please select a listing first.");
            return;
        }

        try {
            if (adminService.updateListingStatus(selected.getId(), ApprovalStatus.REJECTED.name())) {
                info("Success", "Listing rejected.");
                loadListings();
            } else {
                warn("Failed", "Failed to reject listing.");
            }
        } catch (Exception e) {
            handleServiceError("reject listing", e);
        }
    }

    @FXML
    private void handleRefresh() {
        loadListings();
    }
}
