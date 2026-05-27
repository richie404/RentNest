public class User {

    private int id;
    private String name;
    private String email;
    private boolean active;  // new
    private String roles;

    public User() {}

    // ✅ Original constructor
    public User(int id, String name, String email, String roles) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.roles = roles;
        this.active = true;
    }

    // ✅ New constructor (matches what UserDAO calls)
    public User(int id, String name, String email, boolean active, String roles) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.active = active;
        this.roles = roles;
    }

    // --- Getters ---
    public int getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRoles() { return roles; }
    public boolean isActive() { return active; }

    // --- Setters ---
    public void setId(int id) { this.id = id; }
    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setRoles(String roles) { this.roles = roles; }
    public void setActive(boolean active) { this.active = active; }

    // --- Role helpers ---
    public boolean isAdmin() {
        return roles != null && roles.contains("ADMIN");
    }

    public boolean isOwner() {
        return roles != null && roles.contains("OWNER");
    }

    public boolean isRenter() {
        return roles != null && roles.contains("RENTER");
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
