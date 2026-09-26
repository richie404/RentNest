import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** One process-local session, created only by credential verification. No password is retained. */
public final class SessionManager {
    private static final Logger LOG = LoggerFactory.getLogger(SessionManager.class);

    private static volatile String token;
    private static Runnable postLoginAction;
    private static String lastVisitedPage;

    private SessionManager() {}

    public static synchronized java.util.Optional<User> login(String email, String password, boolean adminOnly) {
        logout();
        AuthenticationService auth = new AuthenticationService();
        java.util.Optional<User> user = adminOnly
                ? auth.authenticateAdmin(email, password)
                : auth.authenticate(email, password);
        if (user.isPresent()) {
            token = SessionTokens.issue(user.get().getId());
            LOG.info("User logged in: id={} role={}", user.get().getId(), user.get().getRole());
        } else {
            LOG.warn("Failed login attempt (admin={})", adminOnly);
        }
        return user;
    }

    public static User getLoggedInUser() {
        String current = token;
        if (current == null) return null;
        try { return SessionTokens.require(current); }
        catch (SecurityException expired) {
            if (current.equals(token)) {
                token = null;
                Client.getInstance().disconnect();
                Client.getInstance().clearListeners();
            }
            return null;
        }
    }

    static String socketToken() {
        String current = token;
        SessionTokens.require(current);
        return current;
    }

    public static boolean isLoggedIn() { return getLoggedInUser() != null; }

    public static synchronized void logout() {
        String previous = token; token = null;
        Client.getInstance().disconnect();
        Client.getInstance().clearListeners();
        postLoginAction = null; lastVisitedPage = null;
        SessionTokens.revoke(previous);
        if (previous != null) {
            LOG.info("User logged out");
        }
    }

    public static void setPostLoginAction(Runnable action) { postLoginAction = action; }
    public static void setLastVisitedPage(String page) { lastVisitedPage = page; }
    public static String getLastVisitedPage() { return lastVisitedPage; }
}
