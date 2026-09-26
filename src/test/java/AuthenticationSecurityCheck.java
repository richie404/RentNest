import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.sql.*;
import java.util.*;

/** Explicit integration test. Never runs writes against the live database. */
public class AuthenticationSecurityCheck {
    public static void main(String[] args) throws Exception {
        try (Connection c = Database.getConnection()) {
            check("rentnest_phase7_test".equals(c.getCatalog()),"Requires disposable rentnest_phase7_test");
        }
        try {
            AuthenticationService auth = new AuthenticationService();
            rejects(() -> auth.register("Mismatch","mismatch@example.invalid","password-one","password-two","RENTER"));
            rejects(() -> auth.register("Long","long@example.invalid","x".repeat(73),"x".repeat(73),"RENTER"));
            rejects(() -> auth.register("Unicode","unicode@example.invalid","é".repeat(37),"é".repeat(37),"RENTER"));
            int renter = auth.register("Renter","  P7-Renter@Example.Invalid  ","fixture-password","fixture-password","RENTER");
            int owner = auth.register("Owner","p7-owner@example.invalid","fixture-password","fixture-password","OWNER");
            int other = auth.register("Other","p7-other@example.invalid","fixture-password","fixture-password","RENTER");
            UserDAO users = new UserDAO();
            UserCredentials credentials = users.findCredentialsByEmail("p7-renter@example.invalid").orElseThrow();
            check(credentials.passwordHash().startsWith("$2a$12$") && credentials.passwordHash().length() == 60,"BCrypt cost/length");
            check(!credentials.passwordHash().equals(users.findCredentialsByEmail("p7-owner@example.invalid").orElseThrow().passwordHash()),"Random salts");
            check(auth.authenticate(" P7-RENTER@EXAMPLE.INVALID ","fixture-password").isPresent(),"Normalized login");
            rejects(() -> auth.register("Duplicate","P7-RENTER@example.invalid","fixture-password","fixture-password","RENTER"));
            check(auth.authenticate("' OR 1=1 --","fixture-password").isEmpty(),"SQL injection is data");
            check(auth.authenticate("p7-renter@example.invalid","wrong-password").isEmpty(),"Wrong password");
            String legacyHash = HexFormat.of().formatHex(PasswordHasher.sha256("old-secret"));
            int legacy = users.insert("Legacy"," Legacy@Example.Invalid ",legacyHash,Role.RENTER);
            check(auth.authenticate("legacy@example.invalid","wrong").isEmpty(),"Wrong legacy login denied");
            check(users.findCredentialsByEmail("legacy@example.invalid").orElseThrow().passwordHash().equals(legacyHash),"Failed login does not upgrade");
            check(auth.authenticate("LEGACY@example.invalid","old-secret").isPresent(),"Legacy login accepted");
            String migrated = users.findCredentialsByEmail("legacy@example.invalid").orElseThrow().passwordHash();
            check(migrated.startsWith("$2a$") && PasswordHasher.verify("old-secret",migrated),"Legacy hash upgraded");
            check(!users.replacePasswordHash(legacy,legacyHash,PasswordHasher.hash("stale-password")),"Compare-and-set prevents stale overwrite");
            String longPassword = "x".repeat(80);
            users.insert("Long legacy","p7-long@example.invalid",HexFormat.of().formatHex(PasswordHasher.sha256(longPassword)),Role.RENTER);
            check(auth.authenticate("p7-long@example.invalid",longPassword).isPresent(),"Long legacy password not truncated or locked out");
            check(auth.authenticate("p7-long@example.invalid","x".repeat(79)+"y").isEmpty(),"Legacy suffix remains significant");
            int admin = users.insert("Admin","p7-admin@example.invalid",PasswordHasher.hash("fixture-password"),Role.ADMIN);
            User claimed = SessionManager.login("p7-renter@example.invalid","fixture-password",false).orElseThrow();
            String renterToken = SessionManager.socketToken();
            claimed.setId(admin); claimed.setRoles("ADMIN");
            User view = SessionManager.getLoggedInUser(); view.setId(admin);
            rejects(() -> new AdminService().approveListing(1));
            check(SessionManager.getLoggedInUser().getId() == renter,"Mutable UI models cannot replace identity");
            SessionManager.logout();
            rejects(() -> SessionTokens.require(renterToken));
            check(SessionManager.getLoggedInUser() == null,"Logout clears session");
            check(SessionManager.login("p7-renter@example.invalid","fixture-password",true).isEmpty(),"Admin login rejects renter");
            String sendToken = SessionTokens.issue(renter), receiveToken = SessionTokens.issue(owner), otherToken = SessionTokens.issue(other);
            testSockets(sendToken,receiveToken,otherToken,renter,owner,other);
            ServiceAccess adminAccess = new ServiceAccess(() -> users.findById(admin).orElseThrow());
            AdminService moderation = new AdminService(adminAccess);
            moderation.banUser(renter);
            rejects(() -> SessionTokens.require(sendToken));
            moderation.unbanUser(renter);
            rejects(() -> SessionTokens.require(sendToken));
            String expired = SessionTokens.issue(other);
            JdbcDAO.update("UPDATE auth_sessions SET expires_at=DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 SECOND) WHERE user_id=?",other);
            rejects(() -> SessionTokens.require(expired));
            check(Database.dataSource().getHikariPoolMXBean().getActiveConnections() == 0,"No connection leaks");
            System.out.println("PASS: BCrypt, legacy upgrade, confirmation, normalization, injection, session isolation/revocation, admin authorization and authenticated private sockets");
        } finally { SessionManager.logout(); Database.close(); }
    }
    private static void testSockets(String senderToken,String receiverToken,String otherToken,int sender,int receiver,int other) throws Exception {
        // Dedicated test ports: never send fixtures to an existing production chat server.
        try (ServerSocket firstPort = new ServerSocket(35170); ServerSocket secondPort = new ServerSocket(35171)) { }
        Thread first = new Thread(() -> Server.main(new String[]{"35170"})); first.setDaemon(true); first.start();
        Thread second = new Thread(() -> ChatServer.main(new String[]{"35171"})); second.setDaemon(true); second.start();
        for (int port : new int[]{35170,35171}) {
            try (Peer denied = peer(port)) {
                denied.send("REGISTER " + sender);
                check(denied.read() == null,"Claimed IDs are rejected");
            }
            try (Peer s = peer(port); Peer r = peer(port); Peer outsider = peer(port)) {
                s.send("REGISTER " + senderToken); r.send("REGISTER " + receiverToken); outsider.send("REGISTER " + otherToken);
                Thread.sleep(250);
                String text = "private security fixture " + port;
                String line = port == 35170 ? "MSG\t-1\t"+sender+"\t"+receiver+"\t"+Base64.getEncoder().encodeToString(text.getBytes(StandardCharsets.UTF_8))
                    : "-1|"+sender+"|"+receiver+"|"+text;
                s.send(line); check(line.equals(r.read()),"Authenticated private delivery"); outsider.silence();
                String forged = port == 35170 ? "MSG\t-1\t"+other+"\t"+receiver+"\t"+Base64.getEncoder().encodeToString("forged".getBytes(StandardCharsets.UTF_8))
                    : "-1|"+other+"|"+receiver+"|forged";
                s.send(forged); r.silence();
                check(new MessageDAO().findByUser(other).isEmpty(),"Forged sender never persisted");
            }
        }
    }
    private static Peer peer(int port) throws Exception {
        for(int i=0;i<40;i++) { try { return new Peer(port); } catch(ConnectException wait) { Thread.sleep(50); } }
        throw new AssertionError("Server did not start");
    }
    private static class Peer implements AutoCloseable {
        final Socket socket; final BufferedReader input; final PrintWriter output;
        Peer(int port) throws IOException {
            socket = new Socket("127.0.0.1",port); socket.setSoTimeout(2000);
            input = new BufferedReader(new InputStreamReader(socket.getInputStream(),StandardCharsets.UTF_8));
            output = new PrintWriter(socket.getOutputStream(),true,StandardCharsets.UTF_8);
        }
        void send(String line) { output.println(line); }
        String read() throws IOException { return input.readLine(); }
        void silence() throws IOException {
            socket.setSoTimeout(350);
            try { throw new AssertionError("Unexpected delivery: " + input.readLine()); }
            catch(SocketTimeoutException expected) {} finally { socket.setSoTimeout(2000); }
        }
        public void close() throws IOException { socket.close(); }
    }
    private static void rejects(Runnable work) {
        try { work.run(); } catch(IllegalArgumentException | SecurityException expected) { return; }
        throw new AssertionError("Expected rejection");
    }
    private static void check(boolean value,String message) { if(!value) throw new AssertionError(message); }
}
