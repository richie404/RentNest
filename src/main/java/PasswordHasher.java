import java.nio.charset.StandardCharsets;
import java.security.*;
import java.util.HexFormat;
import org.mindrot.jbcrypt.BCrypt;

final class PasswordHasher {
    private static final int COST = 12;
    private PasswordHasher() {}
    static String hash(String password) {
        if (!fitsBcrypt(password)) throw new IllegalArgumentException("Password must not exceed 72 UTF-8 bytes");
        return BCrypt.hashpw(password, BCrypt.gensalt(COST));
    }
    static boolean fitsBcrypt(String password) {
        return password != null && password.getBytes(StandardCharsets.UTF_8).length <= 72 && password.indexOf('\0') < 0;
    }
    static boolean legacy(String hash) { return hash != null && hash.matches("[0-9a-fA-F]{64}"); }
    static boolean verify(String password, String hash) {
        if (password == null || hash == null) return false;
        if (legacy(hash)) return MessageDigest.isEqual(HexFormat.of().parseHex(hash), sha256(password));
        if (!fitsBcrypt(password) || !hash.matches("\\$2a\\$\\d{2}\\$[./A-Za-z0-9]{53}")) return false;
        int cost = Integer.parseInt(hash.substring(4,6));
        if (cost < 4 || cost > 16) return false;
        try { return BCrypt.checkpw(password, hash); }
        catch (IllegalArgumentException invalidHash) { return false; }
    }
    // Only legacy verification and opaque session-token digests use SHA-256.
    static byte[] sha256(String value) {
        try { return MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)); }
        catch (NoSuchAlgorithmException impossible) { throw new IllegalStateException(impossible); }
    }
}
