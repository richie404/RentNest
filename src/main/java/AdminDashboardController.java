import javafx.collections.FXCollections;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.control.TableView;
import javafx.scene.layout.StackPane;
import java.io.IOException;
import java.util.List;

public class AdminDashboardController extends BaseController {

    @FXML private StackPane contentArea;

    private final AdminService adminService = new AdminService();

    @FXML private TableView<Listing> listingTable;

    @FXML
    public void initialize() {
        if (!requireRole(Role.ADMIN)) return;
    }

    @FXML
    private void showUserManagement() {
        loadContent("AdminUserManagement.fxml");
    }

    @FXML
    private void showListingManagement() {
        loadContent("AdminListingManagement.fxml");
    }

    @FXML
    private void showBookingManagement() {
        loadContent("AdminBookingManagement.fxml");
    }

    @FXML
    private void showPayments() {
        info("Coming Soon", "Payments & Reports feature is under development.");
    }

    @FXML
    private void showAnalytics() {
        info("Coming Soon", "Analytics feature is under development.");
    }

    @FXML
    private void showLogs() {
        info("Coming Soon", "Activity Logs feature is under development.");
    }

    @FXML
    private void showAllListings() {
        try {
            List<Listing> listings = adminService.getAllListings();
            if (listingTable != null) {
                listingTable.setItems(FXCollections.observableArrayList(listings));
            }
        } catch (Exception e) {
            handleServiceError("load admin listings", e);
        }
    }

    private void loadContent(String fxmlFile) {
        try {
            contentArea.getChildren().clear();
            contentArea.getChildren().add(
                    FXMLLoader.load(getClass().getResource("/" + fxmlFile))
            );
        } catch (IOException e) {
            log.error("Failed to load admin content view: {}", fxmlFile, e);
            error("Load Error", "Failed to load view. Please try again.");
        }
    }
}
