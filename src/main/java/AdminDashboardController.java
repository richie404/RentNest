import javafx.collections.FXCollections;
import javafx.fxml.FXML;
import javafx.fxml.FXMLLoader;
import javafx.scene.control.Alert;
import javafx.scene.control.TableView;
import javafx.scene.layout.StackPane;
import java.io.IOException;
import java.util.List;

public class AdminDashboardController {

    @FXML private StackPane contentArea;

    // 🔹 Optional (only used by showAllListings)
    private final AdminService adminService = new AdminService();

    // 🔹 Temporary reference (only used if you display listings directly)
    @FXML private TableView<Listing> listingTable;

    /* -----------------------------------------------------------
       🔹 Navigation Buttons
       ----------------------------------------------------------- */
    @FXML
    private void showUserManagement() {
        loadContent("AdminUserManagement.fxml");
    }

    @FXML
    private void showListingManagement() {
        loadContent("AdminListingManagement.fxml");
    }

    // ✅ Booking Management tab for Admin
    @FXML
    private void showBookingManagement() {
        loadContent("AdminBookingManagement.fxml");
    }

    @FXML
    private void showPayments() {
        showAlert("Coming Soon", "Payments & Reports feature is under development.");
    }

    @FXML
    private void showAnalytics() {
        showAlert("Coming Soon", "Analytics feature is under development.");
    }

    @FXML
    private void showLogs() {
        showAlert("Coming Soon", "Activity Logs feature is under development.");
    }

    /* -----------------------------------------------------------
       🔹 Show All Listings (optional admin quick view)
       ----------------------------------------------------------- */
    @FXML
    private void showAllListings() {
        List<Listing> listings = adminService.getAllListings();
        listingTable.setItems(FXCollections.observableArrayList(listings));
    }

    /* -----------------------------------------------------------
       🔹 Loader Utility
       ----------------------------------------------------------- */
    private void loadContent(String fxmlFile) {
        try {
            contentArea.getChildren().clear();
            contentArea.getChildren().add(
                    FXMLLoader.load(getClass().getResource("/" + fxmlFile))
            );
        } catch (IOException e) {
            e.printStackTrace();
            showAlert("Load Error", "Failed to load: " + fxmlFile + "\n" + e.getMessage());
        }
    }

    /* -----------------------------------------------------------
       🔹 Alert Helper
       ----------------------------------------------------------- */
    private void showAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
}
