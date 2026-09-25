import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.Socket;
import java.util.Base64;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * RentNest LAN Chat Client (Singleton)
 * ------------------------------------
 * This connects to the Server.java over LAN, allowing renters and owners
 * to exchange real-time messages that are stored in the shared database.
 *
 * 💡 Usage (Option A — connect after login):
 *
 *     User current = SessionManager.getLoggedInUser();
 *     Client.getInstance().connect("192.168.1.100", 5000, current.getId());
 *
 * 💬 In MessageController:
 *
 *     Client.getInstance().sendMessage(listingId, senderId, receiverId, text);
 *
 *     Client.getInstance().addMessageListener(msg -> {
 *         Platform.runLater(() -> appendMessageToUI(msg));
 *     });
 *
 * Protocol:
 *   REGISTER <opaque session token>
 *   MSG\t<listingId or -1>\t<senderId>\t<receiverId>\t<base64(messageText)>
 */
public class Client {

    // ---------------------- Listener interface ----------------------
    public interface MessageListener {
        void onMessage(Message msg);
    }

    // ---------------------- Singleton setup -------------------------
    private static final Client INSTANCE = new Client();
    public static Client getInstance() { return INSTANCE; }

    private Socket socket;
    private PrintWriter out;
    private BufferedReader in;

    private int myUserId = -1;
    private final List<MessageListener> listeners = new CopyOnWriteArrayList<>();

    private Client() {}

    // ---------------------- Connection Handling ----------------------

    public synchronized boolean isConnected() {
        return socket != null && socket.isConnected() && !socket.isClosed();
    }

    /**
     * Connect to the chat server.
     *
     * @param serverIp The LAN IP of the host running Server.java
     * @param port The TCP port (default 5000)
     * @param userId Current user's ID (from users table)
     */
    public synchronized void connect(String serverIp, int port, int userId) {
        if (isConnected()) {
            System.out.println("⚠️ Already connected to chat server.");
            return;
        }

        try {
            String token = SessionManager.socketToken();
            if (SessionTokens.require(token).getId() != userId) throw new SecurityException("Invalid chat identity");
            socket = new Socket(serverIp, port);
            out = new PrintWriter(socket.getOutputStream(), true);
            in  = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            myUserId = userId;

            // Register this user with server
            out.println("REGISTER " + token);

            // Background listener for incoming messages
            Socket connectedSocket = socket;
            BufferedReader connectedInput = in;
            Thread reader = new Thread(() -> readLoop(connectedSocket,connectedInput), "RentNest-Chat-Reader");
            reader.setDaemon(true);
            reader.start();

            System.out.println("✅ Connected to RentNest chat server " + serverIp + ":" + port + " as user " + myUserId);
        } catch (IOException e) {
            System.err.println("❌ Could not connect to chat server: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /** Disconnect from the chat server. */
    public synchronized void disconnect() {
        try {
            if (socket != null) socket.close();
        } catch (IOException ignored) {}
        socket = null;
        out = null;
        in = null;
        myUserId = -1;
        System.out.println("🔌 Disconnected from chat server.");
    }

    // ---------------------- Sending ----------------------

    /**
     * Send a message to another user.
     * The server will store it in the DB and forward it to the receiver if online.
     */
    public void sendMessage(Integer listingId, int senderId, int receiverId, String messageText) {
        if (!isConnected()) {
            System.err.println("⚠️ Not connected; cannot send message.");
            return;
        }

        int lid = (listingId == null ? -1 : listingId);
        String payload = "MSG\t" + lid +
                "\t" + senderId +
                "\t" + receiverId +
                "\t" + Base64.getEncoder().encodeToString(messageText.getBytes());

        out.println(payload);
    }

    // ---------------------- Listeners ----------------------

    /** Add a listener to handle incoming messages (e.g. MessageController). */
    public void addMessageListener(MessageListener l) {
        if (l != null) listeners.add(l);
    }
    public void clearListeners() { listeners.clear(); }

    /** Remove a message listener. */
    public void removeMessageListener(MessageListener l) {
        listeners.remove(l);
    }

    // ---------------------- Reader Thread ----------------------

    /**
     * Continuously reads messages from the server and dispatches them to listeners.
     */
    private void readLoop(Socket connectedSocket, BufferedReader connectedInput) {
        try {
            String line;
            while ((line = connectedInput.readLine()) != null) {
                synchronized (this) { if (socket != connectedSocket) return; }
                if (!line.startsWith("MSG\t")) continue;

                String[] f = line.split("\t", 5);
                if (f.length < 5) continue;

                Integer listingId = null;
                try {
                    int l = Integer.parseInt(f[1]);
                    if (l >= 0) listingId = l;
                } catch (NumberFormatException ignored) {}

                int senderId = Integer.parseInt(f[2]);
                int receiverId = Integer.parseInt(f[3]);
                String messageText = new String(Base64.getDecoder().decode(f[4]));

                Message msg = new Message();
                msg.setListingId(listingId);
                msg.setSenderId(senderId);
                msg.setReceiverId(receiverId);
                msg.setMessageText(messageText);

                // Notify all listeners (MessageController can handle it)
                for (MessageListener l : listeners) {
                    try {
                        l.onMessage(msg);
                    } catch (Throwable t) {
                        t.printStackTrace();
                    }
                }
            }
        } catch (IOException e) {
            System.out.println("⚠️ Connection lost: " + e.getMessage());
        } finally {
            synchronized (this) { if (socket == connectedSocket) disconnect(); }
        }
    }
}
