import javafx.collections.FXCollections;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import java.util.List;

public class AdminUserManagementController extends BaseController {

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
            List<User> users = adminService.getAllUsers();
            userTable.setItems(FXCollections.observableArrayList(users));
        } catch (Exception e) {
            handleServiceError("load users", e);
        }
    }

    @FXML
    private void handleBanUser() {
        User selected = userTable.getSelectionModel().getSelectedItem();
        if (selected == null) {
            warn("No Selection", "Select a user to ban.");
            return;
        }

        try {
            if (adminService.banUser(selected.getId())) {
                info("Success", "User banned successfully.");
                loadUsers();
            } else {
                warn("Failed", "Failed to ban user.");
            }
        } catch (Exception e) {
            handleServiceError("ban user", e);
        }
    }

    @FXML
    private void handleUnbanUser() {
        User selected = userTable.getSelectionModel().getSelectedItem();
        if (selected == null) {
            warn("No Selection", "Select a user to unban.");
            return;
        }

        try {
            if (adminService.unbanUser(selected.getId())) {
                info("Success", "User unbanned successfully.");
                loadUsers();
            } else {
                warn("Failed", "Failed to unban user.");
            }
        } catch (Exception e) {
            handleServiceError("unban user", e);
        }
    }

    @FXML
    private void handleViewDetails() {
        info("User Details", "User detail view is under development.");
    }

    @FXML
    private void handleRefresh() {
        loadUsers();
    }
}
