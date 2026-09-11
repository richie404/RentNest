import javafx.application.Platform;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Rectangle2D;
import javafx.scene.Node;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.scene.control.*;
import javafx.scene.image.WritableImage;
import javafx.scene.layout.*;
import javafx.stage.Screen;
import javafx.stage.Stage;
import ui.ResponsiveTableView;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.nio.file.*;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/** Standalone UI checks. Fixtures omit controllers to avoid authentication, DB and socket side effects. */
public class ResponsiveLayoutCheck {
    private static Throwable failure;
    private static final Path OUTPUT = Path.of("target", "layout-check");

    public static void main(String[] args) throws Exception {
        Files.createDirectories(OUTPUT);
        Path fixtures = OUTPUT.resolve("fixtures");
        Files.createDirectories(fixtures);
        try (var resources = Files.list(Path.of("src/main/resources"))) {
            for (Path resource : resources.toList()) {
                String name = resource.getFileName().toString();
                if (name.endsWith(".fxml")) {
                    String xml = Files.readString(resource)
                            .replaceAll("\\s+fx:controller=\"[^\"]*\"", "")
                            .replaceAll("\\s+on[A-Z][a-zA-Z]*=\"#[^\"]*\"", "");
                    Files.writeString(fixtures.resolve(name), xml);
                } else if (name.endsWith(".css")) {
                    Files.copy(resource, fixtures.resolve(name), StandardCopyOption.REPLACE_EXISTING);
                }
            }
        }
        CountDownLatch done = new CountDownLatch(1);
        Platform.startup(() -> Platform.runLater(() -> {
            Platform.setImplicitExit(false);
            try {
                checkLayouts(fixtures);
                checkActualControllers();
                checkPropertyCards();
                checkWindows(fixtures);
            } catch (Throwable error) {
                failure = error;
            } finally {
                done.countDown();
            }
        }));
        if (!done.await(90, TimeUnit.SECONDS)) throw new AssertionError("UI checks timed out");
        Platform.exit();
        if (failure != null) throw new AssertionError("UI check failed", failure);
        System.out.println("PASS: FXML, responsive layouts, card bounds, tables, window bounds and navigation geometry");
    }

    private static void checkLayouts(Path fixtures) throws Exception {
        int[][] displays = {{1366, 768}, {1600, 900}, {1920, 1080}, {2560, 1440}, {800, 600}};
        try (var resources = Files.list(fixtures)) {
            for (Path file : resources.filter(p -> p.toString().endsWith(".fxml")).sorted().toList()) {
                for (int[] display : displays) {
                    Parent root = FXMLLoader.load(file.toUri().toURL());
                    double width = WindowManager.initialSize(display[0], .88, 900, 2400, display[0]) - 16;
                    double height = WindowManager.initialSize(display[1] - 48, .88, 560, 1400, display[1] - 48) - 38;
                    new Scene(root, width, height);
                    layout(root, width, height);
                    String name = file.getFileName().toString();
                    if (name.equals("login.fxml") || name.equals("register.fxml")) {
                        Region card = (Region) root.lookup(name.equals("login.fxml") ? ".login-card" : ".register-card");
                        double limit = name.equals("login.fxml") ? 420 : 460;
                        check(card.getWidth() <= limit + 1, name + " card stretched");
                        check(card.getWidth() >= 350, name + " card too narrow");
                        ScrollPane scroll = (ScrollPane) root.lookup(".auth-scroll");
                        check(card.getWidth() <= scroll.getViewportBounds().getWidth(), name + " card clipped horizontally");
                        check(Math.abs(card.localToScene(card.getBoundsInLocal()).getCenterX() - width / 2) < 15,
                                name + " card is not centered");
                        for (Node child : ((Pane) card).getChildren()) {
                            if (child.isManaged()) check(child.getBoundsInParent().getMaxY() <= card.getHeight() + 1,
                                    name + " control exceeds card height");
                        }
                        if (display[0] == 1366 || display[0] == 1920) snapshot(root, name + "-" + display[0]);
                    }
                    TabPane tabs = (TabPane) root.lookup(".tab-pane");
                    if (tabs != null) {
                        tabs.getSelectionModel().selectLast();
                        layout(root, width, height);
                    }
                    for (Node node : root.lookupAll(".table-view")) {
                        if (node instanceof ResponsiveTableView<?> table) {
                            Region tableParent = (Region) table.getParent();
                            check(table.getHeight() > tableParent.getHeight() - 180,
                                    name + " table did not fill its container: " + table.getHeight() + "/" + tableParent.getHeight());
                            check(table.getWidth() <= width, name + " table exceeds page width");
                        }
                    }
                    if (name.equals("browse.fxml") || name.equals("homepage.fxml")) {
                        TilePane grid = (TilePane) root.lookup(name.equals("browse.fxml") ? "#grid" : "#featuredGrid");
                        for (int i = 0; i < 6; i++) {
                            VBox card = new VBox(new Label("Property " + i));
                            card.setPrefSize(300, 180);
                            card.setMaxWidth(300);
                            TilePane.setMargin(card, new javafx.geometry.Insets(10));
                            grid.getChildren().add(card);
                        }
                        layout(root, width, height);
                        for (Node card : grid.getChildren()) check(card.getBoundsInParent().getMaxX() <= grid.getWidth() + 1,
                                name + " property card exceeds viewport");
                    }
                }
                System.out.println("PASS layout: " + file.getFileName() + " at all five display sizes");
            }
        }
        // An admin page can also be embedded in the dashboard's narrower content area.
        BorderPane admin = FXMLLoader.load(fixtures.resolve("AdminDashboard.fxml").toUri().toURL());
        new Scene(admin, 900, 560);
        StackPane content = (StackPane) admin.lookup("#contentArea");
        for (String name : List.of("AdminBookingManagement.fxml", "AdminListingManagement.fxml", "AdminUserManagement.fxml")) {
            content.getChildren().setAll((Parent) FXMLLoader.load(fixtures.resolve(name).toUri().toURL()));
            layout(admin, 900, 560);
            ResponsiveTableView<?> table = (ResponsiveTableView<?>) content.lookup(".table-view");
            check(table.getWidth() <= content.getWidth(), name + " exceeds embedded admin area");
            check(table.getColumnResizePolicy() == TableView.UNCONSTRAINED_RESIZE_POLICY,
                    name + " must scroll rather than shrink readable columns");
        }
    }

    private static void checkActualControllers() throws Exception {
        for (String name : List.of("login.fxml", "register.fxml", "about.fxml", "AddListing.fxml",
                "BookProperty.fxml", "PropertyDetails.fxml", "ChatWindow.fxml", "chat.fxml")) {
            Parent root = FXMLLoader.load(ResponsiveLayoutCheck.class.getResource("/" + name));
            new Scene(root, 1000, 620);
            layout(root, 1000, 620);
            System.out.println("PASS actual FXMLLoader/controller: " + name);
        }
    }

    private static void checkWindows(Path fixtures) throws Exception {
        Stage main = new Stage();
        WindowManager.configureMain(main);
        Router.setStage(main);
        var navigate = Router.class.getDeclaredMethod("showScene", Parent.class, String.class);
        navigate.setAccessible(true);
        navigate.invoke(null, FXMLLoader.load(fixtures.resolve("homepage.fxml").toUri().toURL()), "Layout check");
        Rectangle2D bounds = Screen.getPrimary().getVisualBounds();
        check(main.isResizable(), "Main window must be resizable");
        withinScreen(main, bounds);
        main.setWidth(Math.min(1000, bounds.getWidth()));
        main.setHeight(Math.min(650, bounds.getHeight()));
        double width = main.getWidth(), height = main.getHeight(), x = main.getX(), y = main.getY();
        Scene scene = main.getScene();
        for (String name : List.of("login.fxml", "register.fxml", "browse.fxml", "OwnerDashboard.fxml", "PropertyDetails.fxml")) {
            navigate.invoke(null, FXMLLoader.load(fixtures.resolve(name).toUri().toURL()), "Layout check");
            check(main.getScene() == scene, "Router replaced the Scene");
            check(main.getWidth() == width && main.getHeight() == height && main.getX() == x && main.getY() == y,
                    "Navigation changed window geometry at " + name);
        }
        Stage secondary = new Stage();
        secondary.setScene(new Scene(FXMLLoader.load(fixtures.resolve("ChatWindow.fxml").toUri().toURL())));
        WindowManager.configureSecondary(secondary, main);
        secondary.show();
        check(secondary.getOwner() == main && secondary.isResizable(), "Secondary ownership/resizing");
        withinScreen(secondary, bounds);
        secondary.close();
        main.close();
    }

    private static void checkPropertyCards() throws Exception {
        for (String name : List.of("homepage.fxml", "browse.fxml")) {
            FXMLLoader loader = new FXMLLoader(ResponsiveLayoutCheck.class.getResource("/" + name));
            // Retain field injection, handlers and card builders; skip only initial database reads.
            loader.setControllerFactory(type -> {
                if (type == HomepageController.class) return new HomepageController() {
                    @Override public void initialize(java.net.URL url, java.util.ResourceBundle bundle) { }
                };
                if (type == BrowseController.class) return new BrowseController() {
                    @Override public void initialize(java.net.URL url, java.util.ResourceBundle bundle) { }
                };
                try { return type.getDeclaredConstructor().newInstance(); }
                catch (Exception error) { throw new RuntimeException(error); }
            });
            Parent root = loader.load();
            new Scene(root, 1186, 596);
            Class<?> type = name.equals("homepage.fxml") ? HomepageController.class : BrowseController.class;
            var populate = type.getDeclaredMethod(name.equals("homepage.fxml") ? "populateGrid" : "populate", List.class);
            populate.setAccessible(true);
            var listing = new Listing("A bright apartment with a long descriptive title", "FLAT", "Dhaka", 18000, 1);
            populate.invoke(loader.getController(), List.of(listing, listing, listing, listing, listing, listing));
            TilePane grid = (TilePane) loader.getNamespace().get(name.equals("homepage.fxml") ? "featuredGrid" : "grid");
            for (int width : new int[]{784, 1186, 1674, 2236}) {
                layout(root, width, 596);
                for (Node card : grid.getChildren()) check(card.getBoundsInParent().getMaxX() <= grid.getWidth() + 1,
                        name + " real card exceeds viewport at " + width);
            }
            layout(root, 1186, 596);
            snapshot(root, name + "-1366");
            System.out.println("PASS actual card rendering: " + name);
        }
    }

    private static void withinScreen(Stage stage, Rectangle2D bounds) {
        check(stage.getX() >= bounds.getMinX() - 1 && stage.getY() >= bounds.getMinY() - 1
                && stage.getX() + stage.getWidth() <= bounds.getMaxX() + 1
                && stage.getY() + stage.getHeight() <= bounds.getMaxY() + 1, "Window exceeds visual screen bounds");
    }

    private static void layout(Parent root, double width, double height) {
        root.resize(width, height);
        for (int i = 0; i < 4; i++) { root.applyCss(); root.layout(); }
    }

    private static void snapshot(Parent root, String name) throws Exception {
        WritableImage image = root.snapshot(null, null);
        BufferedImage png = new BufferedImage((int) image.getWidth(), (int) image.getHeight(), BufferedImage.TYPE_INT_ARGB);
        for (int y = 0; y < png.getHeight(); y++) for (int x = 0; x < png.getWidth(); x++)
            png.setRGB(x, y, image.getPixelReader().getArgb(x, y));
        ImageIO.write(png, "png", OUTPUT.resolve(name + ".png").toFile());
    }

    private static void check(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }
}
