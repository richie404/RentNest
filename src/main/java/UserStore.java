// No package declaration at the top

public class UserStore {

    private static User currentUser;  // holds the logged-in user

    // ✅ Save the logged-in user
    public static void setCurrentUser(User user) {
        currentUser = user;
    }

    // ✅ Get the full User object
    public static User getCurrentUser() {
        return currentUser;
    }

    // ✅ Get only the user ID
    public static int getCurrentUserId() {
        return currentUser != null ? currentUser.getId() : -1;
    }

    // ✅ Clear the saved user (e.g., on logout)
    public static void clear() {
        currentUser = null;
    }
}

