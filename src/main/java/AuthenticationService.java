import java.util.*;
public class AuthenticationService {
    private final UserDAO users = new UserDAO();
    public int register(String username, String email, String password, String confirmation, String role) {
        Role value = Role.fromDatabase(role);
        if (value == Role.ADMIN) throw new SecurityException("Administrator accounts cannot self-register");
        username = Validation.required(username,"Username",50);
        email = Validation.email(email);
        Validation.password(password);
        if (!password.equals(confirmation)) throw new IllegalArgumentException("Passwords do not match");
        if (users.existsByEmail(email)) throw new IllegalArgumentException("An account with this email already exists");
        try { return users.insert(username,email,PasswordHasher.hash(password),value); }
        catch (DataAccessException failure) {
            if (failure.getCause() instanceof java.sql.SQLException e && e.getErrorCode() == 1062)
                throw new IllegalArgumentException("An account with this email already exists");
            throw failure;
        }
    }
    public Optional<User> authenticate(String email, String password) {
        if (email == null || password == null || password.isBlank() || password.length() > 4096) return Optional.empty();
        Optional<UserCredentials> found = users.findCredentialsByEmail(email.trim().toLowerCase(Locale.ROOT));
        if (found.isEmpty()) return Optional.empty();
        UserCredentials credentials = found.get();
        User user = credentials.user();
        if (!user.isActive() || user.getStatus() != UserStatus.ACTIVE || !PasswordHasher.verify(password,credentials.passwordHash()))
            return Optional.empty();
        if (PasswordHasher.legacy(credentials.passwordHash()) && PasswordHasher.fitsBcrypt(password)) {
            String upgraded = PasswordHasher.hash(password);
            if (!users.replacePasswordHash(user.getId(),credentials.passwordHash(),upgraded)) {
                // Another login/reset changed the hash: never overwrite it or authenticate a stale password.
                Optional<UserCredentials> current = users.findCredentialsByEmail(email);
                if (current.isEmpty() || current.get().user().getId() != user.getId()
                        || !PasswordHasher.verify(password,current.get().passwordHash())) return Optional.empty();
            }
        }
        return users.findById(user.getId()).filter(u -> u.isActive() && u.getStatus() == UserStatus.ACTIVE);
    }
    public Optional<User> authenticateAdmin(String email, String password) {
        return authenticate(email,password).filter(user -> user.getRole() == Role.ADMIN);
    }
    public boolean checkCredentials(String email, String password) { return authenticate(email,password).isPresent(); }
}
