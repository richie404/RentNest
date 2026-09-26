import javafx.collections.FXCollections;
import javafx.collections.ObservableList;
import javafx.fxml.FXML;
import javafx.scene.control.*;

public class OwnerBookingsController extends BaseController {

    @FXML private TableView<Booking> bookingTable;
    @FXML private TableColumn<Booking, Integer> colId;
    @FXML private TableColumn<Booking, Integer> colProperty;
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
        colId.setCellValueFactory(data -> new javafx.beans.property.SimpleObjectProperty<>(data.getValue().getId()));
        colProperty.setCellValueFactory(data -> new javafx.beans.property.SimpleObjectProperty<>(data.getValue().getListingId()));
        colRenter.setCellValueFactory(data -> new javafx.beans.property.SimpleObjectProperty<>(data.getValue().getRenterId()));
        colStart.setCellValueFactory(data -> new javafx.beans.property.SimpleObjectProperty<>(data.getValue().getStartDate()));
        colEnd.setCellValueFactory(data -> new javafx.beans.property.SimpleObjectProperty<>(data.getValue().getEndDate()));
        colAmount.setCellValueFactory(data -> new javafx.beans.property.SimpleObjectProperty<>(data.getValue().getTotalAmount()));
        colStatus.setCellValueFactory(data -> new javafx.beans.property.SimpleObjectProperty<>(data.getValue().getDisplayStatus()));
    }

    private void loadBookings() {
        if (ownerId == 0) return;
        try {
            ObservableList<Booking> bookings =
                    FXCollections.observableArrayList(bookingService.findByOwner(ownerId));
            bookingTable.setItems(bookings);
        } catch (Exception e) {
            handleServiceError("load owner bookings", e);
        }
    }

    @FXML
    private void handleApprove() {
        Booking selected = bookingTable.getSelectionModel().getSelectedItem();
        if (selected == null) {
            warn("No Selection", "Select a booking to approve.");
            return;
        }

        try {
            if (bookingService.updateStatus(selected.getId(), BookingStatus.CONFIRMED)) {
                info("Approved", "Booking confirmed successfully.");
                loadBookings();
            } else {
                warn("Error", "Failed to approve booking.");
            }
        } catch (Exception e) {
            handleServiceError("approve booking", e);
        }
    }

    @FXML
    private void handleReject() {
        Booking selected = bookingTable.getSelectionModel().getSelectedItem();
        if (selected == null) {
            warn("No Selection", "Select a booking to reject.");
            return;
        }

        try {
            if (bookingService.updateStatus(selected.getId(), BookingStatus.REJECTED)) {
                info("Rejected", "Booking request rejected.");
                loadBookings();
            } else {
                warn("Error", "Failed to reject booking.");
            }
        } catch (Exception e) {
            handleServiceError("reject booking", e);
        }
    }

    @FXML
    private void handleCancel() {
        Booking selected = bookingTable.getSelectionModel().getSelectedItem();
        if (selected == null) {
            warn("No Selection", "Select a booking to cancel.");
            return;
        }

        try {
            if (bookingService.updateStatus(selected.getId(), BookingStatus.CANCELLED)) {
                info("Cancelled", "Booking cancelled successfully.");
                loadBookings();
            } else {
                warn("Error", "Failed to cancel booking.");
            }
        } catch (Exception e) {
            handleServiceError("cancel booking", e);
        }
    }
}
