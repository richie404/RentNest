/** Compatibility launcher on port 5050; no independent server implementation. */
public final class ChatServer {
    public static void main(String[] args) { Server.run(args,5050,true); }
}
