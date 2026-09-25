import javafx.collections.FXCollections;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import java.util.List;

public class AdminUserManagementController {

    @FXML private TableView<User> userTable;
    @FXML private TableColumn<User, Integer> colId;
    @FXML private TableColumn<User, String> colName;
    @FXML private TableColumn<User, String> colEmail;
    @FXML private TableColumn<User, String> colRoles;
    @FXML private TableColumn<User, String> colStatus;
    @FXML private Button btnBan, btnUnban, btnRefresh, btnDetails;
    @FXML private TableColumn<User, Boolean> colActive;

    private final AdminService adminService = new AdminService();

    @FXML
    private void initialize() {
        colId.setCellValueFactory(data -> new javafx.beans.property.SimpleIntegerProperty(data.getValue().getId()).asObject());
        colName.setCellValueFactory(data -> new javafx.beans.property.SimpleStringProperty(data.getValue().getName()));
        colEmail.setCellValueFactory(data -> new javafx.beans.property.SimpleStringProperty(data.getValue().getEmail()));
        colRoles.setCellValueFactory(data -> new javafx.beans.property.SimpleStringProperty(data.getValue().getRoles()));
        colStatus.setCellValueFactory(data -> new javafx.beans.property.SimpleStringProperty(data.getValue().getStatus().name()));
        loadUsers();
    }

    private void loadUsers() {
        try {
            List<User> users = adminService.getAllUsers(); // fetch all
            userTable.setItems(FXCollections.observableArrayList(users));
        } catch (Exception e) {
            e.printStackTrace();
            showAlert("Error", "Unable to load users: " + e.getMessage());
        }
    }

    @FXML
    private void handleBanUser() {
        try {
            User selected = userTable.getSelectionModel().getSelectedItem();
            if (selected == null) { showAlert("No Selection", "Select a user to ban."); return; }

            if (adminService.banUser(selected.getId())) {
                showAlert("✅ Success", "User banned successfully!");
                loadUsers();
            } else showAlert("Error", "Failed to ban user.");
        } catch (RuntimeException e) { showAlert("Action Failed", e.getMessage()); }
    }

    @FXML
    private void handleUnbanUser() {
        try {
            User selected = userTable.getSelectionModel().getSelectedItem();
            if (selected == null) { showAlert("No Selection", "Select a user to unban."); return; }

            if (adminService.unbanUser(selected.getId())) {
                showAlert("✅ Success", "User unbanned successfully!");
                loadUsers();
            } else showAlert("Error", "Failed to unban user.");
        } catch (RuntimeException e) { showAlert("Action Failed", e.getMessage()); }
    }
    @FXML
    private void handleViewDetails() {
        // TODO: implement user detail popup or view
        System.out.println("View details clicked (User Management)");
    }

    @FXML
    private void handleRefresh() {
        loadUsers();
    }

    private void showAlert(String title, String msg) {
        Alert alert = new Alert(Alert.AlertType.INFORMATION);
        alert.setTitle(title);
        alert.setHeaderText(null);
        alert.setContentText(msg);
        alert.showAndWait();
    }
}
