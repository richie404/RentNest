import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.control.*;

public class OwnerBookingsController {

    @FXML private TableView<Booking> bookingTable;
    @FXML private TableColumn<Booking, Integer> colId;
    @FXML private TableColumn<Booking, Integer> colProperty; // ✅ renamed to match FXML
    @FXML private TableColumn<Booking, Integer> colRenter;
    @FXML private TableColumn<Booking, java.sql.Date> colStart;
    @FXML private TableColumn<Booking, java.sql.Date> colEnd;
    @FXML private TableColumn<Booking, Double> colAmount;
    @FXML private TableColumn<Booking, String> colStatus;

    @FXML private Button btnApprove;
    @FXML private Button btnReject;
    @FXML private Button btnCancel;

    private final BookingDAO bookingDAO = new BookingDAO();
    private int ownerId;

    public void setOwnerId(int ownerId) {
        this.ownerId = ownerId;
        loadBookings();
    }

    @FXML
    private void initialize() {
        colId.setCellValueFactory(new javafx.scene.control.cell.PropertyValueFactory<>("id"));
        colProperty.setCellValueFactory(new javafx.scene.control.cell.PropertyValueFactory<>("propertyId")); // ✅ updated
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
                    FXCollections.observableArrayList(bookingDAO.getBookingsByOwner(ownerId));
            bookingTable.setItems(bookings);
        } catch (Exception e) {
            e.printStackTrace();
            showAlert("Error", "Unable to load bookings: " + e.getMessage());
        }
    }

    @FXML
    private void handleApprove() {
        Booking selected = bookingTable.getSelectionModel().getSelectedItem();
        if (selected == null) {
            showAlert("No Selection", "Select a booking to approve.");
            return;
        }

        if (!"PENDING_OWNER_APPROVAL".equalsIgnoreCase(selected.getStatus())) {
            showAlert("Invalid", "This booking is not pending approval.");
            return;
        }

        if (bookingDAO.updateBookingStatus(selected.getId(), "CONFIRMED")) {
            showAlert("✅ Approved", "Booking confirmed successfully.");
            loadBookings();

        } else {
            showAlert("Error", "Failed to approve booking.");
        }
    }

    @FXML
    private void handleReject() {
        Booking selected = bookingTable.getSelectionModel().getSelectedItem();
        if (selected == null) {
            showAlert("No Selection", "Select a booking to reject.");
            return;
        }

        if (!"PENDING_OWNER_APPROVAL".equalsIgnoreCase(selected.getStatus())) {
            showAlert("Invalid", "This booking cannot be rejected.");
            return;
        }

        if (bookingDAO.updateBookingStatus(selected.getId(), "CANCELLED")) {
            showAlert("❌ Rejected", "Booking request rejected.");
            loadBookings();
        } else {
            showAlert("Error", "Failed to reject booking.");
        }
    }

    @FXML
    private void handleCancel() {
        Booking selected = bookingTable.getSelectionModel().getSelectedItem();
        if (selected == null) {
            showAlert("No Selection", "Select a booking to cancel.");
            return;
        }

        String status = selected.getStatus();
        if ("CANCELLED".equalsIgnoreCase(status)) {
            showAlert("Info", "This booking is already cancelled.");
            return;
        }

        if (bookingDAO.updateBookingStatus(selected.getId(), "CANCELLED")) {
            showAlert("Cancelled", "Booking cancelled successfully.");
            loadBookings();
        } else {
            showAlert("Error", "Failed to cancel booking.");
        }
    }

    private void showAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
}
