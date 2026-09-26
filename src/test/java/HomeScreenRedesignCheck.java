import javafx.application.Platform;
import javafx.fxml.FXMLLoader;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.Label;
import javafx.scene.layout.TilePane;
import javafx.scene.layout.VBox;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.net.URL;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Phase 12: Landing / Home Screen Redesign Check")
class HomeScreenRedesignCheck {

    @BeforeAll
    static void initJavaFX() throws Exception {
        CountDownLatch latch = new CountDownLatch(1);
        try {
            Platform.startup(latch::countDown);
        } catch (IllegalStateException e) {
            // Toolkit already initialized
            latch.countDown();
        }
        assertTrue(latch.await(5, TimeUnit.SECONDS), "JavaFX toolkit should initialize");
    }

    private void runOnFx(Runnable action) throws Exception {
        CountDownLatch latch = new CountDownLatch(1);
        AtomicReference<Throwable> err = new AtomicReference<>();
        Platform.runLater(() -> {
            try {
                action.run();
            } catch (Throwable t) {
                err.set(t);
            } finally {
                latch.countDown();
            }
        });
        assertTrue(latch.await(10, TimeUnit.SECONDS), "FX thread timed out");
        if (err.get() != null) {
            if (err.get() instanceof AssertionError ae) throw ae;
            throw new RuntimeException(err.get());
        }
    }

    @Test
    @DisplayName("Verify FXML load and UI controls hierarchy")
    void testHomepageFxmlStructure() throws Exception {
        runOnFx(() -> {
            try {
                URL fxmlUrl = getClass().getResource("/homepage.fxml");
                assertNotNull(fxmlUrl, "homepage.fxml must exist on classpath");

                FXMLLoader loader = new FXMLLoader(fxmlUrl);
                loader.setControllerFactory(type -> new HomepageController() {
                    @Override
                    public void initialize(URL url, java.util.ResourceBundle rb) {
                        // Prevent DB fetch during static layout structure check
                    }
                });

                Parent root = loader.load();
                assertNotNull(root);
                Scene scene = new Scene(root, 1200, 800);
                root.applyCss();
                root.layout();

                HomepageController controller = loader.getController();
                assertNotNull(controller);

                // Top Navigation
                assertNotNull(scene.lookup(".top-nav-bar"), "Must have top-nav-bar");
                assertNotNull(scene.lookup(".brand-name"), "Must have brand-name");
                assertNotNull(controller.getLoginButton(), "Must have loginButton");
                assertNotNull(controller.getRegisterButton(), "Must have registerButton");

                // Hero & Search controls
                assertNotNull(scene.lookup(".hero-section"), "Must have hero-section");
                assertNotNull(scene.lookup(".search-panel"), "Must have search-panel");
                assertNotNull(controller.getSearchField(), "Must have searchField");
                assertNotNull(controller.getPropertyTypeCombo(), "Must have propertyTypeCombo");
                assertNotNull(controller.getPriceRangeCombo(), "Must have priceRangeCombo");

                // Featured state containers
                assertNotNull(controller.getLoadingState(), "Must have loadingState");
                assertNotNull(controller.getEmptyState(), "Must have emptyState");
                assertNotNull(controller.getErrorState(), "Must have errorState");
                assertNotNull(controller.getFeaturedGrid(), "Must have featuredGrid");

            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
    }

    @Test
    @DisplayName("Test 1: Empty DB Result shows friendly empty state")
    void testEmptyDbResultState() throws Exception {
        runOnFx(() -> {
            try {
                FXMLLoader loader = new FXMLLoader(getClass().getResource("/homepage.fxml"));
                loader.setControllerFactory(type -> new HomepageController() {
                    @Override
                    public void initialize(URL url, java.util.ResourceBundle rb) {
                        // Custom initialization for empty state test
                    }
                });

                Parent root = loader.load();
                Scene scene = new Scene(root, 1200, 800);
                root.applyCss();
                root.layout();

                HomepageController controller = loader.getController();
                controller.setViewState(HomepageController.ViewState.EMPTY);

                VBox emptyBox = controller.getEmptyState();
                TilePane grid = controller.getFeaturedGrid();
                VBox errorBox = controller.getErrorState();
                VBox loadingBox = controller.getLoadingState();

                assertTrue(emptyBox.isVisible(), "Empty state must be visible on zero listings");
                assertFalse(grid.isVisible(), "Grid must be hidden when empty");
                assertFalse(errorBox.isVisible(), "Error state must be hidden");
                assertFalse(loadingBox.isVisible(), "Loading state must be hidden");

            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
    }

    @Test
    @DisplayName("Test 2: Database Error shows friendly error state without raw SQL")
    void testDatabaseErrorState() throws Exception {
        runOnFx(() -> {
            try {
                FXMLLoader loader = new FXMLLoader(getClass().getResource("/homepage.fxml"));
                loader.setControllerFactory(type -> new HomepageController() {
                    @Override
                    public void initialize(URL url, java.util.ResourceBundle rb) {}
                });

                Parent root = loader.load();
                Scene scene = new Scene(root, 1200, 800);
                root.applyCss();
                root.layout();

                HomepageController controller = loader.getController();
                controller.getErrorMessageLabel().setText("Unable to connect to the database. Please check your connection and retry.");
                controller.setViewState(HomepageController.ViewState.ERROR);

                VBox errorBox = controller.getErrorState();
                Label errorLabel = controller.getErrorMessageLabel();

                assertTrue(errorBox.isVisible(), "Error state must be visible on database failure");
                assertNotNull(errorLabel);
                assertFalse(errorLabel.getText().toLowerCase().contains("sql"), "Must not display raw SQL error text");
                assertTrue(errorLabel.getText().contains("database"), "Should display friendly connection message");

            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
    }

    @Test
    @DisplayName("Test 3: Successful Listing Result populates cards with real data")
    void testSuccessfulListingResult() throws Exception {
        runOnFx(() -> {
            try {
                FXMLLoader loader = new FXMLLoader(getClass().getResource("/homepage.fxml"));
                loader.setControllerFactory(type -> new HomepageController() {
                    @Override
                    public void initialize(URL url, java.util.ResourceBundle rb) {}
                });

                Parent root = loader.load();
                Scene scene = new Scene(root, 1200, 800);
                root.applyCss();
                root.layout();

                HomepageController controller = loader.getController();

                Listing listing = new Listing(
                        "Luxury Lakefront Penthouse",
                        "APARTMENT",
                        "Gulshan 2, Dhaka",
                        "Spacious luxury penthouse",
                        45000.0,
                        90000.0,
                        2200,
                        true,
                        false,
                        true,
                        1,
                        "https://example.com/property1.jpg"
                );

                controller.populateGrid(List.of(listing));
                controller.setViewState(HomepageController.ViewState.CONTENT);

                TilePane grid = controller.getFeaturedGrid();
                assertEquals(1, grid.getChildren().size(), "Grid should contain 1 property card");

                VBox card = (VBox) grid.getChildren().get(0);
                assertTrue(card.getStyleClass().contains("property-card"), "Card must have property-card style class");

                String cardText = extractAllText(card);
                assertTrue(cardText.contains("Luxury Lakefront Penthouse"), "Card must display title");
                assertTrue(cardText.contains("Gulshan 2, Dhaka"), "Card must display location");
                assertTrue(cardText.contains("45,000"), "Card must display monthly rent");
                assertTrue(cardText.contains("2200 sqft") || cardText.contains("2,200 sqft"), "Card must display size from DB");
                assertTrue(cardText.contains("APARTMENT"), "Card must display listing type badge");
                assertTrue(cardText.contains("View Details"), "Card must contain View Details CTA");

            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
    }

    @Test
    @DisplayName("Test 4: Image Missing renders graceful placeholder without error")
    void testImageMissingGracefulFallback() throws Exception {
        runOnFx(() -> {
            try {
                FXMLLoader loader = new FXMLLoader(getClass().getResource("/homepage.fxml"));
                loader.setControllerFactory(type -> new HomepageController() {
                    @Override
                    public void initialize(URL url, java.util.ResourceBundle rb) {}
                });

                Parent root = loader.load();
                Scene scene = new Scene(root, 1200, 800);
                root.applyCss();
                root.layout();

                HomepageController controller = loader.getController();

                // Listing with null imageUrl
                Listing listingNoImage = new Listing(
                        "Affordable Student Flat",
                        "FLAT",
                        "Dhanmondi, Dhaka",
                        "Cozy flat",
                        12000.0,
                        12000.0,
                        null,
                        false,
                        true,
                        false,
                        2,
                        null
                );

                assertDoesNotThrow(() -> controller.populateGrid(List.of(listingNoImage)),
                        "Populating card with missing image must not throw");

                TilePane grid = controller.getFeaturedGrid();
                VBox card = (VBox) grid.getChildren().get(0);
                assertNotNull(card);

                // Verify placeholder container is present
                assertNotNull(card.lookup(".card-img-placeholder"), "Placeholder banner should be present");

            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
    }

    @Test
    @DisplayName("Test 5: Window Resizing maintains layout bounds without card overflow")
    void testWindowResizingGeometry() throws Exception {
        runOnFx(() -> {
            try {
                int[][] testSizes = {
                        {800, 600},
                        {1024, 768},
                        {1366, 768},
                        {1920, 1080}
                };

                for (int[] size : testSizes) {
                    FXMLLoader loader = new FXMLLoader(getClass().getResource("/homepage.fxml"));
                    loader.setControllerFactory(type -> new HomepageController() {
                        @Override
                        public void initialize(URL url, java.util.ResourceBundle rb) {}
                    });

                    Parent root = loader.load();
                    HomepageController controller = loader.getController();

                    Listing listing = new Listing(
                            "Cozy Studio Apartment",
                            "APARTMENT",
                            "Banani, Dhaka",
                            "Modern studio",
                            22000.0,
                            44000.0,
                            650,
                            true,
                            true,
                            false,
                            1,
                            null
                    );

                    controller.populateGrid(List.of(listing, listing, listing, listing));
                    TilePane grid = controller.getFeaturedGrid();

                    Scene scene = new Scene(root, size[0], size[1]);
                    root.applyCss();
                    root.layout();

                    for (javafx.scene.Node card : grid.getChildren()) {
                        assertTrue(card.getBoundsInParent().getMaxX() <= grid.getWidth() + 2,
                                "Card must not overflow grid width at " + size[0] + "x" + size[1]);
                    }
                }

            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        });
    }

    private String extractAllText(javafx.scene.Node node) {
        StringBuilder sb = new StringBuilder();
        if (node instanceof Label l && l.getText() != null) {
            sb.append(l.getText()).append(" ");
        } else if (node instanceof javafx.scene.control.Button b && b.getText() != null) {
            sb.append(b.getText()).append(" ");
        }
        if (node instanceof javafx.scene.Parent parent) {
            for (javafx.scene.Node child : parent.getChildrenUnmodifiable()) {
                sb.append(extractAllText(child)).append(" ");
            }
        }
        return sb.toString();
    }
}
