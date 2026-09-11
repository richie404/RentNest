import java.io.*;
import java.net.*;
import java.util.*;

public class ChatServer {

    private static final int PORT = 5050;
    private static final Set<ClientHandler> clients = Collections.synchronizedSet(new HashSet<>());

    public static void main(String[] args) {
        System.out.println("💬 Chat Server running on port " + PORT);
        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            while (true) {
                Socket socket = serverSocket.accept();
                ClientHandler handler = new ClientHandler(socket);
                clients.add(handler);
                new Thread(handler).start();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    static void broadcast(String message, ClientHandler sender) {
        for (ClientHandler client : clients) {
            if (client != sender) client.send(message);
        }
    }

    static class ClientHandler implements Runnable {
        private final Socket socket;
        private PrintWriter out;
        private BufferedReader in;

        ClientHandler(Socket socket) { this.socket = socket; }

        @Override
        public void run() {
            try {
                in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
                out = new PrintWriter(socket.getOutputStream(), true);

                String msg;
                while ((msg = in.readLine()) != null) {
                    System.out.println("📩 " + msg);
                    if (saveToDatabase(msg)) broadcast(msg, this);
                }
            } catch (IOException e) {
                System.out.println("❌ Client disconnected");
            } finally {
                try { socket.close(); } catch (IOException ignored) {}
                clients.remove(this);
            }
        }

        void send(String msg) { out.println(msg); }

        // Use the same persistent storage as conversation history.
        private boolean saveToDatabase(String msg) {
            try {
                // expected message format: listingId|senderId|receiverId|text
                String[] parts = msg.split("\\|", 4);
                if (parts.length == 4) {
                    int listingId = Integer.parseInt(parts[0]);
                    Message message = new Message(listingId == -1 ? null : listingId,
                            Integer.parseInt(parts[1]), Integer.parseInt(parts[2]), parts[3]);
                    new MessageDAO().addMessage(message);
                    return true;
                }
            } catch (Exception e) {
                System.out.println("⚠️ DB Save Failed: " + e.getMessage());
            }
            return false;
        }
    }
}
