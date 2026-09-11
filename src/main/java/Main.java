import javafx.application.Application;
import javafx.stage.Stage;

public class Main extends Application {

    @Override
    public void start(Stage stage) {
        Router.setStage(stage);
        stage.setTitle("RentNest");
        WindowManager.configureMain(stage);
        Router.goToIndex();  // ✅ Opens homepage.fxml on launch
    }

    public static void main(String[] args) {
        launch(args);
    }
}
