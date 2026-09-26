/** Canonical server launcher. Both launchers share MessagingServer. */
public final class Server {
    public static void main(String[] args) { run(args,5000,false); }
    static void run(String[] args,int defaultPort,boolean legacyPipe) {
        int port=args.length==0?defaultPort:Integer.parseInt(args[0]);
        try(MessagingServer server=new MessagingServer(System.getProperty("rentnest.chat.bind","127.0.0.1"),port,legacyPipe)) {
            Thread hook=new Thread(server::close,"RentNest-chat-shutdown");
            Runtime.getRuntime().addShutdownHook(hook);
            try {server.start();server.await();}
            finally {try{Runtime.getRuntime().removeShutdownHook(hook);}catch(IllegalStateException shutdown){}}
        }catch(java.io.IOException e){throw new java.io.UncheckedIOException(e);}
        catch(InterruptedException e){Thread.currentThread().interrupt();}
    }
}
