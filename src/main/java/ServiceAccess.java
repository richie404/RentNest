import java.util.function.Supplier;

/** Re-read persisted role/status so stale desktop sessions cannot authorize writes. */
final class ServiceAccess {
    private final Supplier<User> session;
    ServiceAccess() { this(SessionManager::getLoggedInUser); }
    ServiceAccess(Supplier<User> session) { this.session = session; }
    User current() {
        User claimed = session.get();
        if (claimed == null) throw new SecurityException("Please log in first");
        User user = new UserDAO().findById(claimed.getId()).orElseThrow(() -> new SecurityException("Account no longer exists"));
        if (!user.isActive() || user.getStatus() != UserStatus.ACTIVE) throw new SecurityException("Account is inactive");
        return user;
    }
    User require(Role role) {
        User user = current();
        if (user.getRole() != role) throw new SecurityException("This action requires " + role);
        return user;
    }
    void self(int id) {
        if (current().getId() != id) throw new SecurityException("Cannot access another user's records");
    }
}
