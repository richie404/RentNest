import javafx.fxml.FXML;
import javafx.scene.control.*;
import java.sql.Date;
import java.time.LocalDate;

public class BookPropertyController {

    @FXML private Label propertyName;
    @FXML private TextField renterNameField;
    @FXML private TextField renterContactField;
    @FXML private DatePicker startDatePicker;
    @FXML private TextArea noteField;

    private Listing listing;
    private final BookingDAO bookingDAO = new BookingDAO();

    /* -----------------------------------------------------------
       🔹 Confirm Booking
       ----------------------------------------------------------- */
    @FXML
    private void handleConfirmBooking() {
        try {
            if (!SessionManager.isLoggedIn()) {
                showAlert("Login Required", "Please log in to confirm booking.");
                Router.goToLogin();
                return;
            }

            if (listing == null) {
                showAlert("Error", "No property selected for booking.");
                return;
            }

            LocalDate startDate = startDatePicker.getValue();
            if (startDate == null) {
                showAlert("Missing Date", "Please select a booking start date.");
                return;
            }

            int renterId = SessionManager.getLoggedInUser().getId();
            int ownerId = listing.getOwnerId();
            Date start = Date.valueOf(startDate);
            Date end = Date.valueOf(startDate.plusMonths(1));

            if (!bookingDAO.isPropertyAvailable(listing.getId(), start, end)) {
                showAlert("Unavailable", "This property is already booked for the selected period.");
                return;
            }

            Booking booking = new Booking();
            booking.setListingId(listing.getId());
            booking.setRenterId(renterId);
            booking.setOwnerId(ownerId);
            booking.setStartDate(start);
            booking.setEndDate(end);
            booking.setTotalAmount(listing.getPricePerMonth());
            booking.setStatus("PENDING_OWNER_APPROVAL");

            if (bookingDAO.createBooking(booking)) {
                showAlert("Booking Confirmed",
                        "Your booking request has been sent to the property owner for approval.");
                Router.goToDashboard();
            } else {
                showAlert("Error", "Failed to create booking. Please try again.");
            }
        } catch (Exception e) {
            e.printStackTrace();
            showAlert("Error", "Failed to create booking. Please try again.");
        }
    }


    /* -----------------------------------------------------------
       🔹 Set selected listing from PropertyDetailsController
       ----------------------------------------------------------- */
    public void setListing(Listing listing) {
        this.listing = listing;
        propertyName.setText(listing.getTitle());
    }

    /* -----------------------------------------------------------
       🔹 Back button
       ----------------------------------------------------------- */
    @FXML
    private void handleBackToProperty() {
        try {
            if (listing != null) {
                Router.goToDetails(listing.getId());
            } else {
                Router.goToBrowse();
            }
        } catch (Exception e) {
            e.printStackTrace();
            Router.goToBrowse();
        }
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
