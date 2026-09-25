import javafx.fxml.FXML;
import javafx.scene.control.Label;
import javafx.scene.image.Image;
import javafx.scene.image.ImageView;
import javafx.scene.web.WebView;

import java.util.Optional;

public class DetailsController extends BaseController {

    @FXML private Label titleLabel, priceLabel, locationLabel, metaLabel, descriptionLabel;
    @FXML private ImageView coverImage;
    @FXML private WebView mapView; // optional placeholder for Google Maps later

    private final ListingService listingService = new ListingService();
    private int listingId;

    public void setListingId(int id) {
        this.listingId = id;
        load();
    }

    private void load() {
        try {
            Listing l = findById(listingId).orElseThrow(() -> new IllegalArgumentException("Listing not found"));
            titleLabel.setText(l.getTitle());
            priceLabel.setText("৳" + l.getPricePerMonth() + "/mo");
            locationLabel.setText(l.getLocation());
            metaLabel.setText(l.getListingType() + (l.getSizeSqft()!=null ? " • " + l.getSizeSqft() + " sqft" : ""));
            descriptionLabel.setText(l.getDescription() == null ? "" : l.getDescription());
            if (l.getImageUrl()!=null && !l.getImageUrl().isBlank()) {
                try { coverImage.setImage(new Image(l.getImageUrl(), true)); } catch (Exception ignore) {}
            }
        } catch (Exception ex) {
            error("Load failed", ex.getMessage());
        }
    }

    private Optional<Listing> findById(int id) {
        return listingService.findById(id);
    }

    @FXML private void handleBack() { Router.goToBrowse(); }
}
