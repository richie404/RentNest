import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.function.Consumer;
import java.util.logging.Logger;

/** One asynchronous client. Retries use the same UUID, including database fallback. */
public class Client implements AutoCloseable {
    public interface MessageListener { void onMessage(Message message); }
    private static final Logger LOG=Logger.getLogger(Client.class.getName());
    private static final Client INSTANCE=new Client();
    public static Client getInstance(){return INSTANCE;}
    private final ScheduledExecutorService control=Executors.newSingleThreadScheduledExecutor(r->{Thread t=new Thread(r,"RentNest-chat-control");t.setDaemon(true);return t;});
    private final CopyOnWriteArrayList<MessageListener> listeners=new CopyOnWriteArrayList<>();
    private final CopyOnWriteArrayList<Consumer<Boolean>> connectionListeners=new CopyOnWriteArrayList<>();
    private final ConcurrentMap<String,Pending> pending=new ConcurrentHashMap<>();
    private final LinkedHashSet<Integer> seen=new LinkedHashSet<>();
    private final AtomicLong epoch=new AtomicLong();
    private volatile Socket socket;
    private BufferedWriter output;
    private volatile boolean connected,desired;
    private String host,token;private int port,userId,retrySeconds=1;private long nextConnect,lastPing;
    private static final class Pending {
        final Message message; final CompletableFuture<Message> future=new CompletableFuture<>();
        final long created=System.currentTimeMillis();long lastSend;Message persisted;
        Pending(Message message){this.message=message;}
    }
    public Client(){control.scheduleWithFixedDelay(this::tick,1,1,TimeUnit.SECONDS);}
    public boolean isConnected(){return connected;}
    public CompletableFuture<Void> connect(String host,int port,int userId) {
        return configure(host,port,userId,null);
    }
    // Tests/server-side clients can supply an already-authenticated opaque token, never a claimed user ID alone.
    CompletableFuture<Void> connectAuthenticated(String host,int port,String token) {return configure(host,port,0,token);}
    private CompletableFuture<Void> configure(String host,int port,int requestedUser,String suppliedToken) {
        CompletableFuture<Void> result=new CompletableFuture<>();long generation=epoch.get();
        control.execute(()->{
            try {
                if(generation!=epoch.get())throw new CancellationException("Session changed");
                String credential=suppliedToken==null?SessionManager.socketToken():suppliedToken;
                User user=SessionTokens.require(credential);
                if(requestedUser!=0&&user.getId()!=requestedUser)throw new SecurityException("Invalid chat identity");
                if(desired && this.userId==user.getId() && Objects.equals(this.token,credential)
                        && Objects.equals(this.host,host)&&this.port==port){result.complete(null);return;}
                if(desired)disconnect();
                this.host=host;this.port=port;this.userId=user.getId();this.token=credential;desired=true;nextConnect=0;retrySeconds=1;
                tryConnect();result.complete(null);
            }catch(RuntimeException failure){result.completeExceptionally(failure);}
        });return result;
    }
    public CompletableFuture<Message> sendMessage(Integer listing,int sender,int receiver,String text) {
        return send(UUID.randomUUID().toString(),new Message(listing,sender,receiver,text));
    }
    CompletableFuture<Message> send(String requestId,Message message) {
        CompletableFuture<Message> result=new CompletableFuture<>();long generation=epoch.get();
        control.execute(()->{
            try {
                if(generation!=epoch.get()||!desired||message.getSenderId()!=userId)throw new SecurityException("Chat is not authenticated");
                if(pending.size()>=128)throw new IllegalStateException("Too many pending messages");
                if(!UUID.fromString(requestId).toString().equals(requestId))throw new IllegalArgumentException("Invalid request ID");
                Pending p=new Pending(new Message(message.getListingId(),message.getSenderId(),message.getReceiverId(),message.getMessageText()));
                if(pending.putIfAbsent(requestId,p)!=null)throw new IllegalArgumentException("Request is already pending");
                p.future.whenComplete((m,e)->{if(e==null)result.complete(m);else result.completeExceptionally(e);});
                dispatch(requestId,p);
            }catch(RuntimeException failure){result.completeExceptionally(failure);}
        });return result;
    }
    private void tick() {
        try {
            if(!desired)return;
            if(!connected && System.currentTimeMillis()>=nextConnect)tryConnect();
            if(connected && System.currentTimeMillis()-lastPing>10000){write("PING");lastPing=System.currentTimeMillis();}
            for(var entry:pending.entrySet()) {
                Pending p=entry.getValue();long age=System.currentTimeMillis()-p.created;
                if(age>120000){pending.remove(entry.getKey(),p);if(p.persisted==null)p.future.completeExceptionally(new IOException("Delivery unconfirmed; refresh history before retrying"));continue;}
                if(System.currentTimeMillis()-p.lastSend>5000)dispatch(entry.getKey(),p);
            }
        }catch(SecurityException expired){disconnect();LOG.info("Chat session expired or revoked");}
        catch(Exception failure){lost();LOG.fine("Chat retry scheduled: "+failure.getClass().getSimpleName());}
    }
    private void tryConnect() {
        if(!desired)return;
        SessionTokens.require(token);
        long generation=epoch.get();Socket candidate=new Socket();
        try {
            candidate.connect(new InetSocketAddress(host,port),3000);candidate.setSoTimeout(5000);candidate.setTcpNoDelay(true);
            BufferedReader input=ChatProtocol.reader(candidate.getInputStream());
            BufferedWriter writer=new BufferedWriter(new OutputStreamWriter(candidate.getOutputStream(),StandardCharsets.UTF_8));
            writer.write("AUTH "+token);writer.newLine();writer.flush();
            String ready=ChatProtocol.read(input);
            if(ready==null)throw new IOException("Chat handshake interrupted");
            if(!("READY\t"+userId).equals(ready))throw new SecurityException("Chat authentication rejected");
            candidate.setSoTimeout(45000);
            synchronized(this){if(epoch.get()!=generation||!desired){candidate.close();return;}socket=candidate;output=writer;connected=true;}
            retrySeconds=1;lastPing=System.currentTimeMillis();notifyConnection(true);
            LOG.info("Chat connected user="+userId);
            Thread.ofPlatform().name("RentNest-chat-reader").daemon().start(()->read(candidate,input,generation));
            for(var entry:pending.entrySet())dispatch(entry.getKey(),entry.getValue());
        }catch(IOException failure){try{candidate.close();}catch(IOException ignored){}nextConnect=System.currentTimeMillis()+retrySeconds*1000L;retrySeconds=Math.min(30,retrySeconds*2);}
        catch(RuntimeException failure){try{candidate.close();}catch(IOException ignored){}throw failure;}
    }
    private void read(Socket source,BufferedReader input,long generation) {
        try(input){String line;while((line=ChatProtocol.read(input))!=null){String frame=line;control.execute(()->{if(epoch.get()==generation&&socket==source)receive(frame);});}}
        catch(IOException|RuntimeException failure){LOG.fine("Chat reader ended");}
        finally {try{source.close();}catch(IOException ignored){}try{control.execute(()->{if(epoch.get()==generation&&socket==source)lost();});}catch(RejectedExecutionException shutdown){}}
    }
    private void receive(String frame) {
        try {
            if(frame.equals("PONG"))return;
            String[] f=frame.split("\t",-1);
            if(f.length==3&&f[0].equals("ERROR")) {
                if(f[2].equals("AUTH")){disconnect();return;}
                Pending p=pending.get(f[1]);
                if(p!=null&&!f[2].equals("RETRY")){pending.remove(f[1],p);p.future.completeExceptionally(new IllegalArgumentException("Message rejected"));}
                return;
            }
            if(f.length!=8||!(f[0].equals("ACK")||f[0].equals("EVENT")))throw new IllegalArgumentException();
            Message message=ChatProtocol.message(f);
            if(message.getSenderId()!=userId&&message.getReceiverId()!=userId)throw new SecurityException();
            if(f[0].equals("ACK")){Pending p=pending.remove(f[1]);if(p!=null)p.future.complete(message);}
            notifyMessage(message);
        }catch(RuntimeException malformed){lost();LOG.warning("Malformed chat server frame; reconnecting");}
    }
    private void dispatch(String id,Pending p) {
        p.lastSend=System.currentTimeMillis();
        try {
            if(connected){write("SEND\t"+id+"\t"+(p.message.getListingId()==null?-1:p.message.getListingId())+"\t"+p.message.getReceiverId()+"\t"+ChatProtocol.encode(p.message.getMessageText()));return;}
        }catch(IOException failure){lost();}
        // Existing offline functionality retained, through the same idempotent persistence operation.
        if(p.persisted==null) {
            try {p.persisted=new MessageService().sendAuthenticated(token,id,p.message).message();p.future.complete(p.persisted);notifyMessage(p.persisted);}
            catch(DataAccessException unavailable){LOG.fine("Database fallback unavailable; request remains pending");}
            catch(RuntimeException rejected){pending.remove(id,p);p.future.completeExceptionally(rejected);}
        }
    }
    private void write(String frame) throws IOException {if(!connected||output==null)throw new IOException("Disconnected");output.write(frame);output.newLine();output.flush();}
    private synchronized void lost() {
        boolean wasConnected=connected;connected=false;
        if(socket!=null)try{socket.close();}catch(IOException ignored){}socket=null;output=null;
        nextConnect=System.currentTimeMillis()+1000;if(wasConnected)notifyConnection(false);
    }
    public synchronized void disconnect() {
        desired=false;epoch.incrementAndGet();lost();
        pending.values().forEach(p->p.future.completeExceptionally(new CancellationException("Chat session closed")));pending.clear();
    }
    private void notifyMessage(Message message) {
        if(!seen.add(message.getId()))return;
        if(seen.size()>4096)seen.remove(seen.iterator().next());
        for(MessageListener listener:listeners)try{listener.onMessage(message);}catch(RuntimeException e){LOG.warning("Chat listener failed");}
    }
    private void notifyConnection(boolean value){for(Consumer<Boolean> listener:connectionListeners)try{listener.accept(value);}catch(RuntimeException e){LOG.warning("Chat connection listener failed");}}
    public void addMessageListener(MessageListener listener){listeners.addIfAbsent(listener);}
    public void removeMessageListener(MessageListener listener){listeners.remove(listener);}
    public void addConnectionListener(Consumer<Boolean> listener){connectionListeners.addIfAbsent(listener);}
    public void removeConnectionListener(Consumer<Boolean> listener){connectionListeners.remove(listener);}
    public void clearListeners(){listeners.clear();connectionListeners.clear();try{control.execute(seen::clear);}catch(RejectedExecutionException ignored){}}
    public int pendingCount(){return pending.size();}
    int listenerCount(){return listeners.size();}
    @Override public void close(){disconnect();clearListeners();control.shutdownNow();}
}
