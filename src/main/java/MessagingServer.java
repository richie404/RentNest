import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.logging.*;

/** One server engine; legacy launchers/protocols use this same authenticated path. */
public final class MessagingServer implements AutoCloseable {
    private static final Logger LOG=Logger.getLogger(MessagingServer.class.getName());
    private final ServerSocket listener;
    private final ExecutorService workers=Executors.newVirtualThreadPerTaskExecutor();
    private final Set<Peer> peers=ConcurrentHashMap.newKeySet();
    private final ConcurrentMap<Integer,Set<Peer>> users=new ConcurrentHashMap<>();
    private final Semaphore slots=new Semaphore(128);
    private final AtomicBoolean closed=new AtomicBoolean();
    private final CountDownLatch stopped=new CountDownLatch(1);
    private Thread acceptor;
    private final boolean legacyPipe;
    public MessagingServer(String host,int port) throws IOException {
        this(host,port,false);
    }
    public MessagingServer(String host,int port,boolean legacyPipe) throws IOException {
        this.legacyPipe=legacyPipe;
        listener=new ServerSocket();listener.setReuseAddress(true);listener.bind(new InetSocketAddress(host,port));
    }
    public int port(){return listener.getLocalPort();}
    public synchronized void start() {
        if(acceptor!=null)throw new IllegalStateException("Already started");
        acceptor=Thread.ofPlatform().name("RentNest-chat-accept").daemon().start(this::accept);
        LOG.info("Messaging server listening on port "+port());
    }
    public void await() throws InterruptedException {stopped.await();}
    private void accept() {
        try {
            while(!closed.get()) {
                Socket socket=listener.accept();
                if(!slots.tryAcquire()){socket.close();LOG.warning("Connection limit reached");continue;}
                Peer peer=new Peer(socket);peers.add(peer);
                try {workers.execute(peer::read);}catch(RejectedExecutionException shutdown){peer.close();}
            }
        }catch(IOException failure){if(!closed.get())LOG.log(Level.WARNING,"Accept failed",failure);}
        finally {close();stopped.countDown();}
    }
    public int connectionCount(){return peers.size();}
    @Override public void close() {
        if(!closed.compareAndSet(false,true))return;
        try{listener.close();}catch(IOException ignored){}
        peers.forEach(Peer::close);
        workers.shutdown();
        try {if(!workers.awaitTermination(5,TimeUnit.SECONDS))workers.shutdownNow();}
        catch(InterruptedException e){workers.shutdownNow();Thread.currentThread().interrupt();}
        stopped.countDown();LOG.info("Messaging server stopped");
    }
    private final class Peer {
        final Socket socket; final BlockingQueue<String> output=new ArrayBlockingQueue<>(128);
        final AtomicBoolean ended=new AtomicBoolean();
        volatile int userId; volatile String token; boolean modern; String legacyFormat=legacyPipe?"pipe":"tab";
        Peer(Socket socket){this.socket=socket;}
        void read() {
            try(socket;BufferedReader input=ChatProtocol.reader(socket.getInputStream())) {
                socket.setSoTimeout(5000);socket.setTcpNoDelay(true);
                String hello=ChatProtocol.read(input);
                if(hello==null || !(hello.startsWith("AUTH ") || hello.startsWith("REGISTER ")))throw new SecurityException();
                modern=hello.startsWith("AUTH ");token=hello.substring(modern?5:9);
                userId=SessionTokens.require(token).getId();
                socket.setSoTimeout(modern?45000:120000);
                users.compute(userId,(id,set)->{if(set==null)set=ConcurrentHashMap.newKeySet();set.add(this);return set;});
                workers.execute(this::write);
                if(modern)offer("READY\t"+userId);
                LOG.info("Chat authenticated user="+userId);
                String line;int malformed=0;
                while((line=ChatProtocol.read(input))!=null) {
                    String request="-";
                    try {
                        SessionTokens.require(token);
                        if(line.equals("PING")){offer("PONG");continue;}
                        Message message;
                        if(modern) {
                            String[] f=line.split("\t",-1);
                            if(f.length!=5 || !f[0].equals("SEND"))throw new IllegalArgumentException();
                            request=UUID.fromString(f[1]).toString();
                            message=new Message(ChatProtocol.listing(f[2]),userId,Integer.parseInt(f[3]),ChatProtocol.decode(f[4]));
                        }else {
                            request=UUID.randomUUID().toString();
                            if(line.startsWith("MSG\t")) {
                                String[] f=line.split("\t",5);if(f.length!=5)throw new IllegalArgumentException();
                                if(Integer.parseInt(f[2])!=userId)throw new SecurityException();
                                message=new Message(ChatProtocol.listing(f[1]),userId,Integer.parseInt(f[3]),ChatProtocol.decode(f[4]));
                            }else {
                                legacyFormat="pipe";String[] f=line.split("\\|",4);if(f.length!=4)throw new IllegalArgumentException();
                                if(Integer.parseInt(f[1])!=userId)throw new SecurityException();
                                message=new Message(ChatProtocol.listing(f[0]),userId,Integer.parseInt(f[2]),f[3]);
                            }
                        }
                        MessageReceipt receipt=new MessageService().sendAuthenticated(token,request,message);
                        Message stored=receipt.message();
                        if(modern)offer(ChatProtocol.event("ACK",request,stored)); // Commit completed before ACK or delivery.
                        route(request,stored);
                        LOG.fine("Message persisted id="+stored.getId()+" sender="+userId+" duplicate="+!receipt.inserted());
                        malformed=0;
                    }catch(SecurityException denied){offer("ERROR\t"+request+"\tAUTH");throw denied;}
                    catch(IllegalArgumentException invalid){LOG.fine("Rejected malformed message user="+userId);if(modern)offer("ERROR\t"+request+"\tINVALID");if(++malformed>=5)break;}
                    catch(DataAccessException database){LOG.warning("Message persistence failed user="+userId);if(modern)offer("ERROR\t"+request+"\tRETRY");}
                }
            }catch(SecurityException denied){LOG.warning("Chat authentication/identity rejected user="+userId);}
            catch(IOException|RuntimeException failure){LOG.fine("Chat connection ended user="+userId+" reason="+failure.getClass().getSimpleName());}
            finally{close();}
        }
        void route(String request,Message message) {
            for(int id:new HashSet<>(List.of(message.getReceiverId(),message.getSenderId())))
                for(Peer peer:users.getOrDefault(id,Set.of()))if(peer!=this)peer.deliver(request,message);
        }
        void deliver(String request,Message m) {
            if(modern)offer(ChatProtocol.event("EVENT",request,m));
            else if(legacyFormat.equals("pipe"))offer((m.getListingId()==null?-1:m.getListingId())+"|"+m.getSenderId()+"|"+m.getReceiverId()+"|"+m.getMessageText().replace('\n',' ').replace('\r',' '));
            else offer("MSG\t"+(m.getListingId()==null?-1:m.getListingId())+"\t"+m.getSenderId()+"\t"+m.getReceiverId()+"\t"+ChatProtocol.encode(m.getMessageText()));
        }
        void offer(String frame){if(!ended.get()&&!output.offer(frame)){LOG.warning("Disconnecting slow chat consumer user="+userId);close();}}
        void write() {
            try(BufferedWriter writer=new BufferedWriter(new OutputStreamWriter(socket.getOutputStream(),StandardCharsets.UTF_8))) {
                while(!ended.get()) {
                    String frame=output.poll(1,TimeUnit.SECONDS);if(frame==null)continue;
                    SessionTokens.require(token);
                    writer.write(frame);writer.newLine();writer.flush();
                }
            }catch(IOException|RuntimeException failure){LOG.fine("Chat writer ended user="+userId);}
            catch(InterruptedException interrupted){Thread.currentThread().interrupt();}
            finally{close();}
        }
        void close(){
            if(ended.compareAndSet(false,true)) {
                try{socket.close();}catch(IOException ignored){}
                peers.remove(this);slots.release();output.clear();
            }
            if(userId>0)users.computeIfPresent(userId,(id,set)->{set.remove(this);return set.isEmpty()?null:set;});
            LOG.fine("Chat disconnected user="+userId);
        }
    }
}
