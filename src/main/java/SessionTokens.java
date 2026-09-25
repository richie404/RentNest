import java.security.SecureRandom;
import java.util.*;

/** Opaque bearer tokens; only their digests are persisted. */
final class SessionTokens {
    private static final SecureRandom RANDOM = new SecureRandom();
    private SessionTokens() {}
    static String issue(int id) {
        byte[] bytes = new byte[32]; RANDOM.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        new AuthSessionDAO().insert(digest(token),id);
        return token;
    }
    static User require(String token) {
        if (token == null || !token.matches("[A-Za-z0-9_-]{43}")) throw new SecurityException("Authentication required");
        return new AuthSessionDAO().findUser(digest(token)).orElseThrow(() -> new SecurityException("Session expired or revoked"));
    }
    static void revoke(String token) { if (token != null) new AuthSessionDAO().delete(digest(token)); }
    private static String digest(String token) { return HexFormat.of().formatHex(PasswordHasher.sha256(token)); }
}
