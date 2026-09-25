import java.io.*;
import java.net.*;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/** Legacy pipe-delimited transport with the same authenticated sessions as Server. */
public class ChatServer {
    private static final Set<ClientHandler> clients = ConcurrentHashMap.newKeySet();
    public static void main(String[] args) {
        try (ServerSocket server = new ServerSocket(5050)) {
            while (true) {
                ClientHandler handler = new ClientHandler(server.accept());
                new Thread(handler).start();
            }
        } catch (IOException e) { throw new java.io.UncheckedIOException(e); }
    }
    static class ClientHandler implements Runnable {
        private final Socket socket;
        private PrintWriter out;
        private String token;
        private int userId;
        ClientHandler(Socket socket) { this.socket = socket; }
        public void run() {
            try (socket; BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream(),java.nio.charset.StandardCharsets.UTF_8))) {
                out = new PrintWriter(socket.getOutputStream(),true,java.nio.charset.StandardCharsets.UTF_8);
                socket.setSoTimeout(10000);
                String handshake = in.readLine();
                if (handshake == null || !handshake.startsWith("REGISTER ")) return;
                token = handshake.substring(9);
                userId = SessionTokens.require(token).getId();
                socket.setSoTimeout(0);
                clients.add(this);
                String line;
                while ((line = in.readLine()) != null) {
                    String[] parts = line.split("\\|",4);
                    if (parts.length != 4) continue;
                    int listing = Integer.parseInt(parts[0]);
                    Message message = new Message(listing == -1 ? null : listing,Integer.parseInt(parts[1]),Integer.parseInt(parts[2]),parts[3]);
                    try { new MessageService().sendAuthenticated(token,message); }
                    catch (RuntimeException denied) { continue; }
                    for (ClientHandler peer : clients)
                        if (peer != this && peer.userId == message.getReceiverId()) peer.send(line);
                }
            } catch (IOException | RuntimeException failure) {
                // Fail closed without logging tokens or private message content.
            } finally { clients.remove(this); }
        }
        private void send(String line) {
            try { SessionTokens.require(token); out.println(line); }
            catch (RuntimeException denied) { clients.remove(this); try { socket.close(); } catch (IOException ignored) {} }
        }
    }
}
