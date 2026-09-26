import javafx.fxml.FXML;
import javafx.scene.control.*;
import java.time.LocalDate;

public class BookPropertyController extends BaseController {

    @FXML private Label propertyName;
    @FXML private TextField renterNameField;
    @FXML private TextField renterContactField;
    @FXML private DatePicker startDatePicker;
    @FXML private DatePicker endDatePicker;
    @FXML private TextArea noteField;

    @FXML private Label contactErrorLabel;
    @FXML private Label startDateErrorLabel;
    @FXML private Label endDateErrorLabel;

    private Listing listing;
    private final BookingService bookingService = new BookingService();

    private void clearErrors() {
        if (contactErrorLabel != null) contactErrorLabel.setVisible(false);
        if (startDateErrorLabel != null) startDateErrorLabel.setVisible(false);
        if (endDateErrorLabel != null) endDateErrorLabel.setVisible(false);
    }

    private void showError(Label label, String message) {
        if (label != null) {
            label.setText(message);
            label.setVisible(true);
            label.setManaged(true);
        } else {
            warn("Validation Error", message);
        }
    }

    @FXML
    private void handleConfirmBooking() {
        clearErrors();
        if (!requireLogin()) return;

        if (listing == null) {
            warn("Missing Property", "No property selected for booking.");
            return;
        }
        
        boolean hasError = false;

        String contact = renterContactField.getText();
        if (contact == null || contact.trim().isEmpty()) {
            showError(contactErrorLabel, "Contact number is required.");
            hasError = true;
        }

        LocalDate startDate = startDatePicker.getValue();
        if (startDate == null) {
            showError(startDateErrorLabel, "Start date is required.");
            hasError = true;
        } else if (startDate.isBefore(LocalDate.now())) {
            showError(startDateErrorLabel, "Start date cannot be in the past.");
            hasError = true;
        }

        LocalDate endDate = endDatePicker.getValue();
        if (endDate == null) {
            showError(endDateErrorLabel, "End date is required.");
            hasError = true;
        } else if (startDate != null && !endDate.isAfter(startDate)) {
            showError(endDateErrorLabel, "End date must be after start date.");
            hasError = true;
        }

        if (hasError) return;

        try {
            if (bookingService.request(listing.getId(), startDate, endDate)) {
                info("Booking Confirmed", "Your booking request has been sent to the property owner for approval.");
                Router.goToDashboard();
            } else {
                showError(startDateErrorLabel, "This property is already booked for the selected period.");
            }
        } catch (ValidationException e) {
            showError(startDateErrorLabel, e.getMessage());
        } catch (Exception e) {
            handleServiceError("create booking", e);
        }
    }

    public void setListing(Listing listing) {
        this.listing = listing;
        propertyName.setText(listing.getTitle());
    }

    @FXML
    private void handleBackToProperty() {
        try {
            if (listing != null) {
                Router.goToDetails(listing.getId());
            } else {
                Router.goToBrowse();
            }
        } catch (Exception e) {
            log.error("Failed to navigate back from booking screen", e);
            Router.goToBrowse();
        }
    }
}
