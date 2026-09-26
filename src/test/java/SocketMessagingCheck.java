import java.io.*;
import java.net.*;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.BooleanSupplier;

/** Real DB/socket tests on ephemeral chat ports and an explicitly guarded disposable catalog. */
public class SocketMessagingCheck {
    private static int sender,receiver,outsider;
    private static String senderToken,receiverToken,outsiderToken;
    public static void main(String[] args) throws Exception {
        try(var c=Database.getConnection()){check("rentnest_phase9_test".equals(c.getCatalog()),"Disposable phase9 schema required");}
        MessagingServer server=null;
        try {
            AuthenticationService auth=new AuthenticationService();
            sender=auth.register("Sender","p9-sender@example.invalid","fixture-password","fixture-password","RENTER");
            receiver=auth.register("Receiver","p9-receiver@example.invalid","fixture-password","fixture-password","OWNER");
            outsider=auth.register("Outsider","p9-other@example.invalid","fixture-password","fixture-password","RENTER");
            senderToken=SessionTokens.issue(sender);receiverToken=SessionTokens.issue(receiver);outsiderToken=SessionTokens.issue(outsider);
            server=new MessagingServer("127.0.0.1",0);server.start();int port=server.port();
            try(Peer denied=new Peer(port)){denied.send("AUTH "+sender);check(denied.read()==null,"Claimed ID cannot authenticate");}
            String request=UUID.randomUUID().toString();
            try(Peer s=modern(port,senderToken);Peer r=modern(port,receiverToken);Peer other=modern(port,outsiderToken)) {
                String unicode="Hello বাংলা\nsecond line";
                s.send(send(request,unicode));String ack=s.kind("ACK");String event=r.kind("EVENT");
                int id=ChatProtocol.message(ack.split("\t",-1)).getId();
                check(ChatProtocol.message(event.split("\t",-1)).getId()==id,"ACK and delivery share persisted ID");
                check(unicode.equals(ChatProtocol.message(event.split("\t",-1)).getMessageText()),"UTF-8/newline round trip");
                s.send(send(request,unicode));check(ChatProtocol.message(s.kind("ACK").split("\t",-1)).getId()==id,"Retry ACK returns original row");r.kind("EVENT");
                check(count(request)==1,"Duplicate request inserts once");other.silence();
                s.send(send(request,"changed payload"));check(s.kind("ERROR").endsWith("INVALID"),"Request ID cannot change payload");
                String invalid=UUID.randomUUID().toString();s.send("SEND\t"+invalid+"\t-1\t"+receiver+"\t%%%bad%%% ");s.kind("ERROR");
                s.send("SEND\t"+UUID.randomUUID()+"\t-1\t"+sender+"\t"+receiver+"\t"+ChatProtocol.encode("spoof"));s.kind("ERROR");
                String valid=UUID.randomUUID().toString();s.send(send(valid,"valid after malformed"));s.kind("ACK");r.kind("EVENT");
                check(count(valid)==1,"Malformed message does not crash healthy connection");
                String failed=UUID.randomUUID().toString();
                s.send("SEND\t"+failed+"\t999999\t"+receiver+"\t"+ChatProtocol.encode("bad listing FK"));
                check(s.kind("ERROR").endsWith("RETRY"),"Failed DB write never acknowledged as committed");check(count(failed)==0,"DB failure inserts nothing");
            }
            String simultaneous=UUID.randomUUID().toString();
            try(ExecutorService pool=Executors.newFixedThreadPool(2)) {
                CountDownLatch ready=new CountDownLatch(2),go=new CountDownLatch(1);
                Callable<Integer> same=()->{try(Peer peer=modern(port,senderToken)){ready.countDown();go.await();peer.send(send(simultaneous,"concurrent retry"));return ChatProtocol.message(peer.kind("ACK").split("\t",-1)).getId();}};
                Future<Integer> a=pool.submit(same),b=pool.submit(same);check(ready.await(5,TimeUnit.SECONDS),"Concurrent clients ready");go.countDown();
                check(a.get(10,TimeUnit.SECONDS).equals(b.get(10,TimeUnit.SECONDS))&&count(simultaneous)==1,"Concurrent duplicate insert converges on one row");
            }
            String ambiguous=UUID.randomUUID().toString();
            try(Peer peer=modern(port,senderToken)){peer.send(send(ambiguous,"ACK discarded"));await(()->count(ambiguous)==1,"Commit before disconnect");}
            try(Peer peer=modern(port,senderToken)){peer.send(send(ambiguous,"ACK discarded"));peer.kind("ACK");check(count(ambiguous)==1,"Reconnect after lost ACK does not duplicate");}
            try(Peer huge=modern(port,senderToken)){huge.send("X".repeat(ChatProtocol.MAX_FRAME+1));check(huge.read()==null,"Oversized frame closes connection");}
            String revoked=SessionTokens.issue(outsider);
            try(Peer peer=modern(port,revoked)){SessionTokens.revoke(revoked);peer.send("PING");String reply=peer.read();check(reply==null||reply.startsWith("ERROR"),"Revoked session cannot continue");}
            try(MessagingServer legacy=new MessagingServer("127.0.0.1",0,true)) {
                legacy.start();try(Peer s=legacy(legacy.port(),senderToken);Peer r=legacy(legacy.port(),receiverToken);Peer other=modern(legacy.port(),outsiderToken)) {
                    String frame="-1|"+sender+"|"+receiver+"|legacy adapter";s.send(frame);check(frame.equals(r.read()),"Legacy launcher routes through shared engine");other.silence();
                    s.send("-1|"+outsider+"|"+receiver+"|spoof");r.silence();
                }
            }
            try(Client client=new Client()) {
                AtomicInteger observed=new AtomicInteger();client.addMessageListener(m->{if(m.getMessageText().equals("offline replay"))observed.incrementAndGet();});
                client.connectAuthenticated("127.0.0.1",port,senderToken).get(10,TimeUnit.SECONDS);check(client.isConnected(),"Client authenticates before connected state");
                server.close();check(server.connectionCount()==0,"Graceful shutdown closes every peer");
                await(()->!client.isConnected(),"Client notices server disconnect");
                String offline=UUID.randomUUID().toString();
                Message stored=client.send(offline,new Message(null,sender,receiver,"offline replay")).get(15,TimeUnit.SECONDS);
                check(stored.getId()>0&&count(offline)==1,"Offline fallback commits through shared idempotent path");
                server=new MessagingServer("127.0.0.1",port);server.start();
                await(()->client.isConnected()&&client.pendingCount()==0,"Client reconnects and receives replay acknowledgement");
                check(count(offline)==1&&observed.get()==1,"Replay deduplicates database and client callback");
                client.disconnect();Thread.sleep(1200);check(!client.isConnected(),"Explicit disconnect stops reconnect");
            }
            checkFx(port);
            try(Peer handshake=new Peer(port)){server.close();check(handshake.read()==null,"Shutdown closes unfinished handshake");}
            check(Database.dataSource().getHikariPoolMXBean().getActiveConnections()==0,"No DB leases leaked");
            System.out.println("PASS: authenticated routing, malformed/oversized frames, Unicode, concurrent/lost-ACK deduplication, DB failure, legacy adapter, offline persistence, reconnect, revocation, FX delivery/disposal and graceful shutdown");
        }finally{
            if(server!=null)server.close();
            SessionManager.logout();Client.getInstance().close();AppExecutor.shutdown();Database.close();
        }
    }
    private static void checkFx(int port) throws Exception {
        System.setProperty("rentnest.chat.port",Integer.toString(port));
        SessionManager.login("p9-sender@example.invalid","fixture-password",false).orElseThrow();
        CountDownLatch ready=new CountDownLatch(1),rendered=new CountDownLatch(1),disposed=new CountDownLatch(1);
        AtomicReference<Throwable> failure=new AtomicReference<>();
        javafx.scene.layout.VBox[] roots=new javafx.scene.layout.VBox[1];
        javafx.application.Platform.startup(()->{
            try {
                javafx.scene.layout.VBox anchor=new javafx.scene.layout.VBox();roots[0]=new javafx.scene.layout.VBox(anchor);new javafx.scene.Scene(roots[0]);
                new ChatConversation(anchor,-1,sender,receiver,rows->{
                    try{check(javafx.application.Platform.isFxApplicationThread(),"History/events rendered on FX thread");check(rows.stream().map(Message::getId).distinct().count()==rows.size(),"UI history/live ID merge");rendered.countDown();}
                    catch(Throwable e){failure.set(e);}
                },text->failure.set(new AssertionError(text)));
            }catch(Throwable e){failure.set(e);}finally{ready.countDown();}
        });
        check(ready.await(5,TimeUnit.SECONDS)&&rendered.await(10,TimeUnit.SECONDS),"FX conversation loads asynchronously");
        javafx.application.Platform.runLater(()->{roots[0].getChildren().clear();disposed.countDown();});
        check(disposed.await(5,TimeUnit.SECONDS),"View detached");
        check(Client.getInstance().listenerCount()==0,"Closed view unsubscribes listener");
        javafx.application.Platform.exit();
        if(failure.get()!=null)throw new AssertionError("FX check failed",failure.get());
    }
    private static String send(String id,String text){return "SEND\t"+id+"\t-1\t"+receiver+"\t"+ChatProtocol.encode(text);}
    private static int count(String id){return JdbcDAO.one("SELECT COUNT(*) FROM messages WHERE sender_id=? AND client_message_id=?",r->r.getInt(1),sender,id).orElseThrow();}
    private static Peer modern(int port,String token)throws Exception{Peer p=new Peer(port);p.send("AUTH "+token);check(p.read().startsWith("READY\t"),"Authenticated handshake");return p;}
    private static Peer legacy(int port,String token)throws Exception{Peer p=new Peer(port);p.send("REGISTER "+token);p.send("PING");check("PONG".equals(p.read()),"Legacy authenticated handshake");return p;}
    private static void await(BooleanSupplier condition,String label)throws Exception{long until=System.nanoTime()+Duration.ofSeconds(15).toNanos();while(System.nanoTime()<until){if(condition.getAsBoolean())return;Thread.sleep(30);}throw new AssertionError(label);}
    private static void check(boolean condition,String label){if(!condition)throw new AssertionError(label);}
    private static final class Peer implements AutoCloseable {
        final Socket socket;final BufferedReader input;final BufferedWriter output;
        Peer(int port)throws IOException{socket=new Socket("127.0.0.1",port);socket.setSoTimeout(4000);input=ChatProtocol.reader(socket.getInputStream());output=new BufferedWriter(new OutputStreamWriter(socket.getOutputStream(),java.nio.charset.StandardCharsets.UTF_8));}
        void send(String frame)throws IOException{output.write(frame);output.newLine();output.flush();}
        String read()throws IOException{try{return ChatProtocol.read(input);}catch(SocketException reset){return null;}}
        String kind(String kind)throws IOException{for(int i=0;i<10;i++){String frame=read();if(frame==null)throw new AssertionError("Unexpected EOF waiting for "+kind);if(frame.startsWith(kind+"\t"))return frame;}throw new AssertionError("No "+kind);}
        void silence()throws IOException{socket.setSoTimeout(300);try{check(read()==null,"Unexpected private delivery");}catch(SocketTimeoutException expected){}finally{socket.setSoTimeout(4000);}}
        public void close()throws IOException{socket.close();}
    }
}
