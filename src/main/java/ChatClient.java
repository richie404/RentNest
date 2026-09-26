import java.util.function.Consumer;
import javafx.application.Platform;
/** Compatibility facade; all networking is delegated to the canonical Client. */
public class ChatClient implements AutoCloseable {
    private final Client client=new Client();
    private Consumer<String> callback;
    private Client.MessageListener listener;
    private volatile boolean closed;
    public void connect(String host,int port,Consumer<String> onMessage) {
        callback=onMessage;
        if(listener!=null)client.removeMessageListener(listener);
        listener=m->Platform.runLater(()->{if(!closed)callback.accept((m.getListingId()==null?-1:m.getListingId())+"|"+m.getSenderId()+"|"+m.getReceiverId()+"|"+m.getMessageText());});
        client.addMessageListener(listener);
        client.connect(host,port,0).whenComplete((unused,failure)->{if(failure!=null)Platform.runLater(()->callback.accept("Chat authentication failed"));});
    }
    public void send(String line) {
        String[] fields=line.split("\\|",4);
        if(fields.length!=4)throw new IllegalArgumentException("Expected listing|sender|receiver|message");
        client.sendMessage(ChatProtocol.listing(fields[0]),Integer.parseInt(fields[1]),Integer.parseInt(fields[2]),fields[3])
            .whenComplete((message,failure)->{if(failure!=null&&callback!=null)Platform.runLater(()->callback.accept("Send not confirmed"));});
    }
    @Override public void close(){closed=true;client.close();}
}
