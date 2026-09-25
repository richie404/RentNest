import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.control.cell.PropertyValueFactory;

public class RenterBookingsController {

    @FXML private TableView<Booking> bookingTable;
    @FXML private TableColumn<Booking, Integer> colBookingId;
    @FXML private TableColumn<Booking, Integer> colProperty;
    @FXML private TableColumn<Booking, Integer> colOwner;
    @FXML private TableColumn<Booking, java.time.LocalDate> colStart;
    @FXML private TableColumn<Booking, java.time.LocalDate> colEnd;
    @FXML private TableColumn<Booking, Double> colAmount;
    @FXML private TableColumn<Booking, String> colStatus;

    @FXML private Button btnCancel;
    @FXML private Button btnRefresh;

    private final BookingService bookingService = new BookingService();
    private int renterId;

    /* -----------------------------------------------------------
       🔹 Initialization
       ----------------------------------------------------------- */
    @FXML
    private void initialize() {
        // Map table columns to Booking fields
        colBookingId.setCellValueFactory(new PropertyValueFactory<>("id"));
        colProperty.setCellValueFactory(new PropertyValueFactory<>("listingId"));
        colOwner.setCellValueFactory(new PropertyValueFactory<>("ownerId"));
        colStart.setCellValueFactory(new PropertyValueFactory<>("startDate"));
        colEnd.setCellValueFactory(new PropertyValueFactory<>("endDate"));
        colAmount.setCellValueFactory(new PropertyValueFactory<>("totalAmount"));
        colStatus.setCellValueFactory(new PropertyValueFactory<>("status"));

        // Load for logged-in renter if available
        int currentUser = (SessionManager.isLoggedIn() ? SessionManager.getLoggedInUser().getId() : -1);
        if (currentUser != -1) {
            setRenterId(currentUser); // ✅ automatically triggers load
        }
    }

    /* -----------------------------------------------------------
       🔹 Setter - Called from Router after login
       ----------------------------------------------------------- */
    public void setRenterId(int renterId) {
        this.renterId = renterId;
        loadBookings(); // ✅ refresh data immediately
    }

    /* -----------------------------------------------------------
       🔹 Load all bookings for this renter
       ----------------------------------------------------------- */
    private void loadBookings() {
        if (renterId <= 0) {
            showAlert("Error", "No renter logged in.");
            return;
        }

        try {
            ObservableList<Booking> bookings =
                    FXCollections.observableArrayList(bookingService.findByRenter(renterId));
            bookingTable.setItems(bookings);
        } catch (Exception e) {
            e.printStackTrace();
            showAlert("Error", "Unable to load bookings: " + e.getMessage());
        }
    }

    /* -----------------------------------------------------------
       🔹 Handle Booking Cancellation
       ----------------------------------------------------------- */
    @FXML
    private void handleCancel() {
        try {
            Booking selected = bookingTable.getSelectionModel().getSelectedItem();
            if (selected == null) {
                showAlert("No Selection", "Please select a booking to cancel.");
                return;
            }

            boolean success = bookingService.cancelBooking(selected.getId());
            if (success) {
                showAlert("Cancelled", "Your booking has been cancelled successfully.");
                loadBookings(); // ✅ refresh table
            } else {
                showAlert("Error", "Failed to cancel booking.");
            }
        } catch (RuntimeException e) { showAlert("Action Failed", e.getMessage()); }
    }

    /* -----------------------------------------------------------
       🔹 Manual Refresh Button
       ----------------------------------------------------------- */
    @FXML
    private void handleRefresh() {
        loadBookings();
    }

    /* -----------------------------------------------------------
       🔹 Alert helper
       ----------------------------------------------------------- */
    private void showAlert(String title, String message) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(message);
        alert.showAndWait();
    }
}
