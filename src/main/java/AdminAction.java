import java.time.LocalDateTime;

public class AdminAction {
    private int id;
    private int adminId;
    private String actionType;
    private int targetId;
    private String details;
    private LocalDateTime createdAt;

    public AdminAction() {}

    public AdminAction(int adminId, String actionType, int targetId, String details) {
        this.adminId = adminId;
        this.actionType = actionType;
        this.targetId = targetId;
        this.details = details;
    }

    // --- Getters ---
    public int getId() { return id; }
    public int getAdminId() { return adminId; }
    public String getActionType() { return actionType; }
    public int getTargetId() { return targetId; }
    public String getDetails() { return details; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // --- Setters ---
    public void setId(int id) { this.id = id; }
    public void setAdminId(int adminId) { this.adminId = adminId; }
    public void setActionType(String actionType) { this.actionType = actionType; }
    public void setTargetId(int targetId) { this.targetId = targetId; }
    public void setDetails(String details) { this.details = details; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    @Override
    public String toString() {
        return "[" + actionType + "] by Admin#" + adminId + " on Target#" + targetId + " (" + details + ")";
    }
}
