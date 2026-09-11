import javafx.geometry.Rectangle2D;
import javafx.stage.Screen;
import javafx.stage.Stage;
import javafx.stage.Window;
import javafx.stage.WindowEvent;

/** Screen-aware sizing of outer windows, independent of each page's preferred size. */
public final class WindowManager {
    private WindowManager() { }

    public static void configureMain(Stage stage) {
        configure(stage, null, 0.88, 900, 560, 2400, 1400);
    }

    public static void configureSecondary(Stage stage, Window owner) {
        if (owner != null) stage.initOwner(owner);
        configure(stage, owner, 0.72, 640, 460, 1400, 1000);
    }

    private static void configure(Stage stage, Window owner, double fraction,
                                  double minWidth, double minHeight,
                                  double initialWidthCap, double initialHeightCap) {
        Rectangle2D bounds = visualBounds(owner);
        double areaWidth = owner == null ? bounds.getWidth() : Math.min(owner.getWidth(), bounds.getWidth());
        double areaHeight = owner == null ? bounds.getHeight() : Math.min(owner.getHeight(), bounds.getHeight());
        stage.setResizable(true);
        stage.setMinWidth(Math.min(minWidth, bounds.getWidth()));
        stage.setMinHeight(Math.min(minHeight, bounds.getHeight()));
        stage.setWidth(initialSize(areaWidth, fraction, stage.getMinWidth(), initialWidthCap, bounds.getWidth()));
        stage.setHeight(initialSize(areaHeight, fraction, stage.getMinHeight(), initialHeightCap, bounds.getHeight()));
        center(stage, owner, bounds);
        // Native decorations are known after showing. Clamp the complete outer window.
        stage.addEventHandler(WindowEvent.WINDOW_SHOWN, event -> center(stage, owner, visualBounds(owner)));
        // Refresh limits when moved between monitors; don't cap maximization at the initial-size caps.
        stage.xProperty().addListener((obs, oldValue, newValue) -> updateLimits(stage, minWidth, minHeight));
        stage.yProperty().addListener((obs, oldValue, newValue) -> updateLimits(stage, minWidth, minHeight));
        updateLimits(stage, minWidth, minHeight);
    }

    static double initialSize(double area, double fraction, double minimum, double cap, double available) {
        return Math.min(available, Math.max(Math.min(minimum, available), Math.min(area * fraction, cap)));
    }

    private static void updateLimits(Stage stage, double minWidth, double minHeight) {
        Rectangle2D bounds = visualBounds(stage);
        stage.setMinWidth(Math.min(minWidth, bounds.getWidth()));
        stage.setMinHeight(Math.min(minHeight, bounds.getHeight()));
        stage.setMaxWidth(bounds.getWidth());
        stage.setMaxHeight(bounds.getHeight());
    }

    private static Rectangle2D visualBounds(Window owner) {
        if (owner != null && Double.isFinite(owner.getX()) && Double.isFinite(owner.getY())) {
            var screens = Screen.getScreensForRectangle(owner.getX(), owner.getY(),
                    Math.max(1, owner.getWidth()), Math.max(1, owner.getHeight()));
            return screens.stream().max(java.util.Comparator.comparingDouble(screen -> {
                Rectangle2D b = screen.getVisualBounds();
                double width = Math.max(0, Math.min(owner.getX() + owner.getWidth(), b.getMaxX()) - Math.max(owner.getX(), b.getMinX()));
                double height = Math.max(0, Math.min(owner.getY() + owner.getHeight(), b.getMaxY()) - Math.max(owner.getY(), b.getMinY()));
                return width * height;
            })).orElse(Screen.getPrimary()).getVisualBounds();
        }
        return Screen.getPrimary().getVisualBounds();
    }

    private static void center(Stage stage, Window owner, Rectangle2D bounds) {
        stage.setWidth(Math.min(stage.getWidth(), bounds.getWidth()));
        stage.setHeight(Math.min(stage.getHeight(), bounds.getHeight()));
        double x = owner == null ? bounds.getMinX() + (bounds.getWidth() - stage.getWidth()) / 2
                : owner.getX() + (owner.getWidth() - stage.getWidth()) / 2;
        double y = owner == null ? bounds.getMinY() + (bounds.getHeight() - stage.getHeight()) / 2
                : owner.getY() + (owner.getHeight() - stage.getHeight()) / 2;
        stage.setX(Math.max(bounds.getMinX(), Math.min(x, bounds.getMaxX() - stage.getWidth())));
        stage.setY(Math.max(bounds.getMinY(), Math.min(y, bounds.getMaxY() - stage.getHeight())));
    }
}
