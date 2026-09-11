import java.io.*;
import java.net.Socket;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.*;
import java.util.Base64;
import java.util.Properties;
import java.util.logging.Logger;

/** Standalone integration check against an isolated, disposable database only. */
public class MessagingIntegrationCheck {
    private static final String URL = "jdbc:mysql://127.0.0.1:3307/rentnest_messaging_test?useSSL=false&serverTimezone=UTC";
    private static Connection db;

    public static void main(String[] args) throws Exception {
        // Redirect the application's hardcoded DBUtil URL in this test JVM only.
        Driver mysql = new com.mysql.cj.jdbc.Driver();
        var drivers = DriverManager.getDrivers();
        while (drivers.hasMoreElements()) DriverManager.deregisterDriver(drivers.nextElement());
        DriverManager.registerDriver(new Driver() {
            public Connection connect(String url, Properties info) throws SQLException {
                return acceptsURL(url) ? mysql.connect(URL, info) : null;
            }
            public boolean acceptsURL(String url) { return url.startsWith("jdbc:mysql:"); }
            public DriverPropertyInfo[] getPropertyInfo(String u, Properties p) { return new DriverPropertyInfo[0]; }
            public int getMajorVersion() { return 1; }
            public int getMinorVersion() { return 0; }
            public boolean jdbcCompliant() { return false; }
            public Logger getParentLogger() { return Logger.getGlobal(); }
        });
        try (Connection connection = DriverManager.getConnection(URL, "root", "")) {
            db = connection;
            if (args.length == 1 && args[0].equals("restart")) {
                start(() -> Server.main(new String[0]));
                try (Peer ignored = connect(5000)) {
                    check(new MessageDAO().getConversation(1, 3, 2).stream()
                            .anyMatch(m -> m.getMessageText().equals("integration send")), "History after server restart");
                    check(new MessageDAO().getConversation(null, 2, 3).stream()
                            .anyMatch(m -> m.getMessageText().equals("migration null") && m.getTimestamp() == null), "Migrated nullable timestamp loads");
                }
                System.out.println("PASS: persisted history after server restart in a new JVM");
                return;
            }
            check(count("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name='socket_messages'") == 0,
                    "Fresh schema must not contain the legacy table");
            long initial = count("SELECT COUNT(*) FROM messages");
            MessageDAO dao = new MessageDAO();
            var oldHistory = dao.getConversation(1, 3, 2);
            start(() -> Server.main(new String[0]));
            try (Peer sender = connect(5000); Peer receiver = connect(5000)) {
                sender.send("REGISTER 3");
                receiver.send("REGISTER 2");
                Thread.sleep(150);
                String send = line(1, 3, 2, "integration send");
                sender.send(send);
                check(send.equals(receiver.read()), "Receiver must receive one live message");
                check(count("SELECT COUNT(*) FROM messages") == initial + 1, "Single persistence operation");
                receiver.expectSilence();
                sender.expectSilence(); // UI already appends the outgoing message.
                check(dao.getConversation(1, 3, 2).size() == oldHistory.size() + 1, "Old and new history");
                check(dao.getConversation(2, 3, 2).stream().noneMatch(m -> m.getMessageText().equals("integration send")), "Listing isolation");
                String reply = line(1, 2, 3, "integration reply");
                receiver.send(reply);
                check(reply.equals(sender.read()), "Reply delivered");
                check(count("SELECT COUNT(*) FROM messages") == initial + 2, "Reply persisted once");
                sender.send(line(1, 2, 3, "forged sender"));
                sender.send(line(999999, 3, 2, "invalid listing"));
                receiver.expectSilence();
                check(count("SELECT COUNT(*) FROM messages") == initial + 2, "Invalid sends are not persisted or forwarded");
            }
            check(new MessageDAO().getConversation(1, 3, 2).size() == oldHistory.size() + 2, "History survives reconnect/new DAO");
            Message general = new Message(null, 3, 2, "general chat");
            dao.addMessage(general);
            check(general.getId() > 0 && dao.getConversation(null, 3, 2).stream().anyMatch(m -> m.getId() == general.getId()), "Generated ID and null listing history");
            start(() -> ChatServer.main(new String[0]));
            try (Peer sender = connect(5050); Peer receiver = connect(5050)) {
                Thread.sleep(150);
                sender.send("1|3|2|legacy transport");
                check(receiver.read().equals("1|3|2|legacy transport"), "Legacy transport still forwards");
                check(count("SELECT COUNT(*) FROM messages WHERE message_text='legacy transport'") == 1, "Legacy server uses messages only");
                receiver.expectSilence();
            }
            testMigration();
            System.out.println("PASS: socket sends/replies, single inserts, history, listing isolation, validation, legacy transport and migration scenarios");
        }
    }

    private static void testMigration() throws Exception {
        String script = Files.readString(Path.of("migrations/consolidate_messages.sql"));
        String procedure = script.substring(script.indexOf("CREATE PROCEDURE"), script.indexOf("END//") + 3);
        execute(procedure);
        execute("CREATE TABLE socket_messages LIKE messages");
        execute("INSERT INTO socket_messages (id,listing_id,sender_id,receiver_id,message_text,timestamp) VALUES (1,1,3,2,'migration unique','2026-01-01'),(2,NULL,2,3,'migration null',NULL)");
        long before = count("SELECT COUNT(*) FROM messages");
        execute("CALL rentnest_consolidate_messages(FALSE)");
        check(count("SELECT COUNT(*) FROM messages") == before + 2, "Migrate colliding IDs without losing rows");
        check(count("SELECT COUNT(*) FROM messages WHERE message_text='migration null' AND timestamp IS NULL AND listing_id IS NULL") == 1, "Preserve nulls");
        execute("CALL rentnest_consolidate_messages(FALSE)"); // Already absent.
        execute("CREATE TABLE socket_messages LIKE messages");
        execute("CALL rentnest_consolidate_messages(FALSE)"); // Empty table.
        execute("CREATE TABLE socket_messages LIKE messages");
        execute("INSERT INTO socket_messages (listing_id,sender_id,receiver_id,message_text,timestamp) SELECT listing_id,sender_id,receiver_id,message_text,timestamp FROM messages WHERE message_text='migration unique'");
        execute("INSERT INTO socket_messages (listing_id,sender_id,receiver_id,message_text,timestamp) SELECT listing_id,sender_id,receiver_id,message_text,timestamp FROM messages WHERE message_text='migration unique'");
        expectFailure("CALL rentnest_consolidate_messages(FALSE)");
        check(count("SELECT COUNT(*) FROM socket_messages") == 2, "Ambiguous overlaps retain source");
        execute("CALL rentnest_consolidate_messages(TRUE)");
        check(count("SELECT COUNT(*) FROM messages WHERE message_text='migration unique'") == 2, "Match copies one-for-one, preserve repeated sends");
        execute("CREATE TABLE socket_messages LIKE messages");
        execute("INSERT INTO socket_messages (listing_id,sender_id,receiver_id,message_text) VALUES (1,999999,2,'orphan')");
        before = count("SELECT COUNT(*) FROM messages");
        expectFailure("CALL rentnest_consolidate_messages(FALSE)");
        check(count("SELECT COUNT(*) FROM messages") == before && count("SELECT COUNT(*) FROM socket_messages") == 1, "FK failure rolls back and retains source");
        execute("DROP TABLE socket_messages"); // Disposable test fixture only.
        execute("DROP PROCEDURE rentnest_consolidate_messages");
    }

    private static String line(int listing, int sender, int receiver, String text) {
        return "MSG\t" + listing + "\t" + sender + "\t" + receiver + "\t" + Base64.getEncoder().encodeToString(text.getBytes());
    }
    private static void execute(String sql) throws SQLException {
        try (Statement statement = db.createStatement()) { statement.execute(sql); }
    }
    private static long count(String sql) throws SQLException {
        try (Statement statement = db.createStatement(); ResultSet rows = statement.executeQuery(sql)) { rows.next(); return rows.getLong(1); }
    }
    private static void expectFailure(String sql) throws SQLException {
        try { execute(sql); } catch (SQLException expected) { return; }
        throw new AssertionError("Expected migration to stop");
    }
    private static void check(boolean value, String message) { if (!value) throw new AssertionError(message); }
    private static void start(Runnable work) { Thread thread = new Thread(work); thread.setDaemon(true); thread.start(); }
    private static Peer connect(int port) throws Exception {
        for (int attempt = 0; attempt < 40; attempt++) {
            try { return new Peer(port); } catch (IOException e) { Thread.sleep(50); }
        }
        throw new IOException("Test server did not start");
    }
    private static class Peer implements AutoCloseable {
        final Socket socket;
        final BufferedReader input;
        final PrintWriter output;
        Peer(int port) throws IOException {
            socket = new Socket("127.0.0.1", port);
            socket.setSoTimeout(3000);
            input = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            output = new PrintWriter(socket.getOutputStream(), true);
        }
        void send(String text) { output.println(text); }
        String read() throws IOException { return input.readLine(); }
        void expectSilence() throws IOException {
            socket.setSoTimeout(300);
            try { throw new AssertionError("Unexpected event: " + input.readLine()); }
            catch (java.net.SocketTimeoutException expected) { }
            finally { socket.setSoTimeout(3000); }
        }
        public void close() throws IOException { socket.close(); }
    }
}
