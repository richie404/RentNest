import javafx.application.Application;
import javafx.stage.Stage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.bridge.SLF4JBridgeHandler;

public class Main extends Application {

    private static final Logger LOG = LoggerFactory.getLogger(Main.class);

    static {
        // Route java.util.logging (used by HikariCP, JavaFX internals) into SLF4J/Logback.
        SLF4JBridgeHandler.removeHandlersForRootLogger();
        SLF4JBridgeHandler.install();
    }

    @Override
    public void start(Stage stage) {
        LOG.info("RentNest starting up");
        Router.setStage(stage);
        stage.setTitle("RentNest");
        WindowManager.configureMain(stage);
        Router.goToIndex();
        LOG.info("RentNest UI initialised");
    }

    public static void main(String[] args) {
        launch(args);
    }

    @Override
    public void stop() {
        LOG.info("RentNest shutting down");
        try { SessionManager.logout(); }
        catch (RuntimeException failure) {
            LOG.warn("Unable to revoke session during shutdown", failure);
        }
        Client.getInstance().close();
        AppExecutor.shutdown();
        Database.close();
        LOG.info("RentNest shutdown complete");
    }
}
