import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.control.*;

public class OwnerBookingsController {

    @FXML private TableView<Booking> bookingTable;
    @FXML private TableColumn<Booking, Integer> colId;
    @FXML private TableColumn<Booking, Integer> colProperty; // ✅ renamed to match FXML
    @FXML private TableColumn<Booking, Integer> colRenter;
    @FXML private TableColumn<Booking, java.time.LocalDate> colStart;
    @FXML private TableColumn<Booking, java.time.LocalDate> colEnd;
    @FXML private TableColumn<Booking, Double> colAmount;
    @FXML private TableColumn<Booking, String> colStatus;

    @FXML private Button btnApprove;
    @FXML private Button btnReject;
    @FXML private Button btnCancel;

    private final BookingService bookingService = new BookingService();
    private int ownerId;

    public void setOwnerId(int ownerId) {
        this.ownerId = ownerId;
        loadBookings();
    }

    @FXML
    private void initialize() {
        colId.setCellValueFactory(new javafx.scene.control.cell.PropertyValueFactory<>("id"));
        colProperty.setCellValueFactory(new javafx.scene.control.cell.PropertyValueFactory<>("listingId"));
        colRenter.setCellValueFactory(new javafx.scene.control.cell.PropertyValueFactory<>("renterId"));
        colStart.setCellValueFactory(new javafx.scene.control.cell.PropertyValueFactory<>("startDate"));
        colEnd.setCellValueFactory(new javafx.scene.control.cell.PropertyValueFactory<>("endDate"));
        colAmount.setCellValueFactory(new javafx.scene.control.cell.PropertyValueFactory<>("totalAmount"));
        colStatus.setCellValueFactory(new javafx.scene.control.cell.PropertyValueFactory<>("status"));
    }

    private void loadBookings() {
        if (ownerId == 0) return;
        try {
            ObservableList<Booking> bookings =
                    FXCollections.observableArrayList(bookingService.findByOwner(ownerId));
            bookingTable.setItems(bookings);
        } catch (Exception e) {
            e.printStackTrace();
            showAlert("Error", "Unable to load bookings: " + e.getMessage());
        }
    }

    @FXML
    private void handleApprove() {
        try {
            Booking selected = bookingTable.getSelectionModel().getSelectedItem();
            if (selected == null) {
                showAlert("No Selection", "Select a booking to approve.");
                return;
            }

            if (bookingService.updateStatus(selected.getId(), BookingStatus.CONFIRMED)) {
                showAlert("✅ Approved", "Booking confirmed successfully.");
                loadBookings();

            } else {
                showAlert("Error", "Failed to approve booking.");
            }
        } catch (RuntimeException e) { showAlert("Action Failed", e.getMessage()); }
    }

    @FXML
    private void handleReject() {
        try {
            Booking selected = bookingTable.getSelectionModel().getSelectedItem();
            if (selected == null) {
                showAlert("No Selection", "Select a booking to reject.");
                return;
            }

            if (bookingService.updateStatus(selected.getId(), BookingStatus.REJECTED)) {
                showAlert("❌ Rejected", "Booking request rejected.");
                loadBookings();
            } else {
                showAlert("Error", "Failed to reject booking.");
            }
        } catch (RuntimeException e) { showAlert("Action Failed", e.getMessage()); }
    }

    @FXML
    private void handleCancel() {
        try {
            Booking selected = bookingTable.getSelectionModel().getSelectedItem();
            if (selected == null) {
                showAlert("No Selection", "Select a booking to cancel.");
                return;
            }

            if (bookingService.updateStatus(selected.getId(), BookingStatus.CANCELLED)) {
                showAlert("Cancelled", "Booking cancelled successfully.");
                loadBookings();
            } else {
                showAlert("Error", "Failed to cancel booking.");
            }
        } catch (RuntimeException e) { showAlert("Action Failed", e.getMessage()); }
    }

    private void showAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
}
