import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.control.*;

public class RenterBookingsController extends BaseController {

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

    @FXML
    private void initialize() {
        colBookingId.setCellValueFactory(data -> new javafx.beans.property.SimpleObjectProperty<>(data.getValue().getId()));
        colProperty.setCellValueFactory(data -> new javafx.beans.property.SimpleObjectProperty<>(data.getValue().getListingId()));
        colOwner.setCellValueFactory(data -> new javafx.beans.property.SimpleObjectProperty<>(data.getValue().getOwnerId()));
        colStart.setCellValueFactory(data -> new javafx.beans.property.SimpleObjectProperty<>(data.getValue().getStartDate()));
        colEnd.setCellValueFactory(data -> new javafx.beans.property.SimpleObjectProperty<>(data.getValue().getEndDate()));
        colAmount.setCellValueFactory(data -> new javafx.beans.property.SimpleObjectProperty<>(data.getValue().getTotalAmount()));
        colStatus.setCellValueFactory(data -> new javafx.beans.property.SimpleObjectProperty<>(data.getValue().getDisplayStatus()));

        int currentUser = (SessionManager.isLoggedIn() ? SessionManager.getLoggedInUser().getId() : -1);
        if (currentUser != -1) {
            setRenterId(currentUser);
        }
    }

    public void setRenterId(int renterId) {
        this.renterId = renterId;
        loadBookings();
    }

    private void loadBookings() {
        if (renterId <= 0) {
            warn("Not Logged In", "No renter logged in.");
            return;
        }

        try {
            ObservableList<Booking> bookings =
                    FXCollections.observableArrayList(bookingService.findByRenter(renterId));
            bookingTable.setItems(bookings);
        } catch (Exception e) {
            handleServiceError("load renter bookings", e);
        }
    }

    @FXML
    private void handleCancel() {
        Booking selected = bookingTable.getSelectionModel().getSelectedItem();
        if (selected == null) {
            warn("No Selection", "Please select a booking to cancel.");
            return;
        }

        Alert confirm = new Alert(Alert.AlertType.CONFIRMATION);
        confirm.setTitle("Confirm Cancellation");
        confirm.setHeaderText("Cancel Booking?");
        confirm.setContentText("Are you sure you want to cancel this booking? This action cannot be undone.");
        
        if (confirm.showAndWait().orElse(ButtonType.CANCEL) != ButtonType.OK) {
            return;
        }

        try {
            boolean success = bookingService.cancelBooking(selected.getId());
            if (success) {
                info("Cancelled", "Your booking has been cancelled successfully.");
                loadBookings();
            } else {
                warn("Error", "Failed to cancel booking.");
            }
        } catch (Exception e) {
            handleServiceError("cancel booking", e);
        }
    }

    @FXML
    private void handleRefresh() {
        loadBookings();
    }
}
