import javafx.animation.PauseTransition;
import javafx.application.Platform;
import javafx.fxml.FXMLLoader;
import javafx.geometry.Rectangle2D;
import javafx.scene.Parent;
import javafx.scene.Scene;
import javafx.stage.Screen;
import javafx.stage.Stage;
import javafx.util.Duration;

import java.nio.file.Path;
import java.util.ArrayDeque;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

/** Native maximize/restore regression checks; run after ResponsiveLayoutCheck creates isolated FXML fixtures. */
public class NativeWindowCheck {
    private static final Path FIXTURES = Path.of("target", "layout-check", "fixtures");
    private static final List<String> PAGES = List.of("homepage.fxml", "login.fxml", "register.fxml",
            "browse.fxml", "RenterDashboard.fxml", "OwnerDashboard.fxml", "AdminDashboard.fxml",
            "listings.fxml", "PropertyDetails.fxml", "BookProperty.fxml", "Message.fxml", "chat.fxml");
    private static final ArrayDeque<Step> STEPS = new ArrayDeque<>();
    private static final CountDownLatch DONE = new CountDownLatch(1);
    private static Throwable failure;
    private static Stage main;
    private static Stage secondary;
    private static Scene scene;
    private static Rectangle2D bounds;
    private static Rectangle2D normal;
    private static Rectangle2D maximized;

    public static void main(String[] args) throws Exception {
        Platform.startup(() -> Platform.runLater(() -> {
            Platform.setImplicitExit(false);
            prepareSteps();
            next();
        }));
        try {
            if (!DONE.await(60, TimeUnit.SECONDS)) throw new AssertionError("Native window checks timed out");
            if (failure != null) throw new AssertionError("Native window checks failed", failure);
            System.out.println("PASS: native initial sizing, normal/maximized navigation, restore, resizing and secondary windows");
        } finally {
            Platform.exit();
        }
    }

    private static void prepareSteps() {
        STEPS.add(() -> {
            bounds = Screen.getPrimary().getVisualBounds();
            main = new Stage();
            WindowManager.configureMain(main);
            Router.setStage(main);
            navigate("homepage.fxml");
            scene = main.getScene();
        });
        STEPS.add(() -> {
            check(main.isResizable() && !main.isMaximized() && !main.isFullScreen(), "Initial window state");
            withinBounds(main);
            check(main.getMinWidth() <= bounds.getWidth() && main.getMinHeight() <= bounds.getHeight(),
                    "Minimum dimensions exceed available screen");
            check(close(main.getWidth(), WindowManager.initialSize(bounds.getWidth(), .88, 900, 2400, bounds.getWidth()))
                    && close(main.getHeight(), WindowManager.initialSize(bounds.getHeight(), .88, 560, 1400, bounds.getHeight())),
                    "Initial dimensions do not follow the window policy");
            check(close(main.getX() + main.getWidth() / 2, bounds.getMinX() + bounds.getWidth() / 2)
                    && close(main.getY() + main.getHeight() / 2, bounds.getMinY() + bounds.getHeight() / 2),
                    "Initial window is not centered");
            System.out.println("PASS initial visual bounds: " + geometry(main));
            main.setWidth(Math.min(1000, bounds.getWidth()));
            main.setHeight(Math.min(650, bounds.getHeight()));
        });
        STEPS.add(() -> normal = geometry(main));
        for (String page : PAGES) {
            STEPS.add(() -> navigate(page));
            STEPS.add(() -> stable(false, normal, page));
        }
        STEPS.add(() -> main.setMaximized(true));
        STEPS.add(() -> {
            check(main.isMaximized(), "OS did not maximize the window");
            check(main.getScene().getWidth() >= bounds.getWidth() * .95
                    && main.getScene().getHeight() >= bounds.getHeight() * .90,
                    "Maximized content does not fill the usable display");
            maximized = geometry(main);
            System.out.println("PASS maximized geometry: " + maximized);
        });
        for (String page : PAGES) {
            STEPS.add(() -> navigate(page));
            STEPS.add(() -> stable(true, maximized, page));
        }
        addSecondaryChecks();
        STEPS.add(() -> main.setMaximized(false));
        STEPS.add(() -> {
            stable(false, normal, "restore after maximized navigation");
            System.out.println("PASS restored geometry: " + geometry(main));
        });
        addSecondaryChecks();
        STEPS.add(() -> {
            main.setWidth(Math.min(normal.getWidth() + 80, bounds.getWidth()));
            main.setHeight(Math.min(normal.getHeight() + 60, bounds.getHeight()));
        });
        STEPS.add(() -> {
            check(!main.isMaximized() && main.isResizable(), "Restored stage cannot be resized normally");
            check(close(main.getWidth(), Math.min(normal.getWidth() + 80, bounds.getWidth()))
                    && close(main.getHeight(), Math.min(normal.getHeight() + 60, bounds.getHeight())),
                    "Resizing after restore did not take effect");
        });
    }

    private static void addSecondaryChecks() {
        for (String page : List.of("ChatWindow.fxml", "BookProperty.fxml")) {
            STEPS.add(() -> {
                secondary = new Stage();
                secondary.setScene(new Scene(load(page)));
                WindowManager.configureSecondary(secondary, main);
                secondary.show();
            });
            STEPS.add(() -> {
                check(secondary.getOwner() == main && secondary.isResizable(), "Secondary ownership/resizing");
                withinBounds(secondary);
                double expectedX = Math.max(bounds.getMinX(), Math.min(main.getX() + (main.getWidth() - secondary.getWidth()) / 2,
                        bounds.getMaxX() - secondary.getWidth()));
                double expectedY = Math.max(bounds.getMinY(), Math.min(main.getY() + (main.getHeight() - secondary.getHeight()) / 2,
                        bounds.getMaxY() - secondary.getHeight()));
                check(close(secondary.getX(), expectedX) && close(secondary.getY(), expectedY), "Secondary is not centered over its owner");
                System.out.println("PASS secondary " + page + " with maximized owner=" + main.isMaximized());
                secondary.close();
                secondary = null;
            });
        }
    }

    private static void navigate(String page) throws Exception {
        var showScene = Router.class.getDeclaredMethod("showScene", Parent.class, String.class);
        showScene.setAccessible(true);
        showScene.invoke(null, load(page), "RentNest Phase 1 window check");
    }

    private static Parent load(String page) throws Exception {
        return FXMLLoader.load(FIXTURES.resolve(page).toUri().toURL());
    }

    private static Rectangle2D geometry(Stage stage) {
        return new Rectangle2D(stage.getX(), stage.getY(), stage.getWidth(), stage.getHeight());
    }

    private static void stable(boolean isMaximized, Rectangle2D expected, String page) {
        check(main.getScene() == scene && main.isResizable() && main.isMaximized() == isMaximized,
                "Scene/window state changed at " + page);
        Rectangle2D actual = geometry(main);
        check(close(actual.getMinX(), expected.getMinX()) && close(actual.getMinY(), expected.getMinY())
                && close(actual.getWidth(), expected.getWidth()) && close(actual.getHeight(), expected.getHeight()),
                "Window geometry changed at " + page + ": expected " + expected + ", actual " + actual);
        System.out.println("PASS navigation " + page + ", maximized=" + isMaximized);
    }

    private static void withinBounds(Stage stage) {
        check(stage.getX() >= bounds.getMinX() - 2 && stage.getY() >= bounds.getMinY() - 2
                && stage.getX() + stage.getWidth() <= bounds.getMaxX() + 2
                && stage.getY() + stage.getHeight() <= bounds.getMaxY() + 2, "Window exceeds visual bounds");
    }

    private static boolean close(double actual, double expected) { return Math.abs(actual - expected) <= 2; }

    private static void check(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }

    private static void next() {
        try {
            if (STEPS.isEmpty()) { finish(); return; }
            STEPS.remove().run();
            // Let native window events and layout pulses settle before measuring geometry.
            PauseTransition pause = new PauseTransition(Duration.millis(350));
            pause.setOnFinished(event -> next());
            pause.play();
        } catch (Throwable error) {
            failure = error;
            finish();
        }
    }

    private static void finish() {
        if (secondary != null) secondary.close();
        if (main != null) main.close();
        DONE.countDown();
    }

    @FunctionalInterface
    private interface Step { void run() throws Exception; }
}
