public class User {
    private java.time.LocalDateTime createdAt;
    private UserStatus status = UserStatus.ACTIVE;
    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime value) { createdAt=value; }
    public String getUsername() { return name; }
    public void setUsername(String value) { name=value; }
    public void setStatus(UserStatus value) { status=java.util.Objects.requireNonNull(value); }

    private int id;
    private String name;
    private String email;
    private boolean active = true;  // new
    private Role roles = Role.RENTER;

    public User() {}

    // ✅ Original constructor
    public User(int id, String name, String email, String roles) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.roles = Role.fromDatabase(roles);
        this.active = true;
    }

    // ✅ New constructor (matches what UserDAO calls)
    public User(int id, String name, String email, boolean active, String roles) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.active = active; this.status = UserStatus.fromActive(active);
        this.roles = Role.fromDatabase(roles);
    }

    // --- Getters ---
    public int getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRoles() { return roles.name(); }
    public Role getRole() { return roles; }
    public UserStatus getStatus() { return status; }
    public boolean isActive() { return active; }

    // --- Setters ---
    public void setId(int id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setRoles(String roles) { this.roles = Role.fromDatabase(roles); }
    public void setActive(boolean active) { this.active = active; this.status = UserStatus.fromActive(active); }

    // --- Role helpers ---
    public boolean isAdmin() {
        return roles == Role.ADMIN;
    }

    public boolean isOwner() {
        return roles == Role.OWNER;
    }

    public boolean isRenter() {
        return roles == Role.RENTER;
    }

    @Override
    public String toString() {
        return "User{id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", active=" + active +
                ", roles='" + roles + '\'' +
                '}';
    }
}
