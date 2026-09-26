import javafx.application.Platform;
import javafx.beans.value.ChangeListener;
import javafx.event.EventHandler;
import javafx.scene.Node;
import javafx.scene.Scene;
import javafx.stage.Window;
import javafx.stage.WindowEvent;
import java.util.*;
import java.util.concurrent.*;
import java.util.function.Consumer;

/** Shared JavaFX adapter: background history, reconnect catch-up, ID deduplication and lifecycle cleanup. */
final class ChatConversation implements AutoCloseable {
    private final Node anchor;
    private final Integer listing;
    private final int sender,receiver;
    private final Consumer<List<Message>> render;
    private final Consumer<String> error;
    private final Map<Integer,Message> history=new HashMap<>();
    private final Client client=Client.getInstance();
    private final Client.MessageListener messageListener=this::incoming;
    private final Consumer<Boolean> connectionListener=connected->{if(connected)refresh();};
    private final ChangeListener<Scene> sceneListener=(observable,oldScene,newScene)->{if(oldScene!=null&&newScene==null)close();else watchScene(newScene);};
    private final ChangeListener<Window> windowListener=(observable,oldWindow,newWindow)->watchWindow(newWindow);
    private final EventHandler<WindowEvent> hidden=event->close();
    private Scene watchedScene;private Window watchedWindow;private volatile boolean closed;
    ChatConversation(Node anchor,int listing,int sender,int receiver,Consumer<List<Message>> render,Consumer<String> error) {
        this.anchor=anchor;this.listing=listing<=0?null:listing;this.sender=sender;this.receiver=receiver;this.render=render;this.error=error;
        client.addMessageListener(messageListener);client.addConnectionListener(connectionListener);
        anchor.sceneProperty().addListener(sceneListener);watchScene(anchor.getScene());
        client.connect(System.getProperty("rentnest.chat.host","127.0.0.1"),Integer.getInteger("rentnest.chat.port",5000),sender)
            .whenComplete((ignored,failure)->{if(failure!=null)ui(()->error.accept("Unable to authenticate chat"));});
        refresh();
    }
    void refresh() {
        if(closed)return;
        CompletableFuture.supplyAsync(()->new MessageService().findConversation(listing,sender,receiver),AppExecutor.getExecutor())
            .whenComplete((rows,failure)->ui(()->{if(failure!=null){error.accept("Unable to load conversation history");return;}rows.forEach(m->history.put(m.getId(),m));render();}));
    }
    CompletableFuture<Message> send(String text) {
        if(closed)return CompletableFuture.failedFuture(new IllegalStateException("Conversation closed"));
        return client.sendMessage(listing,sender,receiver,text);
    }
    private void incoming(Message message) {
        if(!Objects.equals(message.getListingId(),listing))return;
        if(!((message.getSenderId()==sender&&message.getReceiverId()==receiver)||(message.getSenderId()==receiver&&message.getReceiverId()==sender)))return;
        ui(()->{history.put(message.getId(),message);render();});
    }
    private void render(){render.accept(history.values().stream().sorted(Comparator.comparing(Message::getTimestamp,Comparator.nullsFirst(Comparator.naturalOrder())).thenComparingInt(Message::getId)).toList());}
    void ui(Runnable work){Platform.runLater(()->{if(!closed)work.run();});}
    private void watchScene(Scene scene) {
        if(watchedScene!=null)watchedScene.windowProperty().removeListener(windowListener);
        watchedScene=scene;if(scene!=null){scene.windowProperty().addListener(windowListener);watchWindow(scene.getWindow());}
    }
    private void watchWindow(Window window) {
        if(watchedWindow!=null)watchedWindow.removeEventHandler(WindowEvent.WINDOW_HIDDEN,hidden);
        watchedWindow=window;if(window!=null)window.addEventHandler(WindowEvent.WINDOW_HIDDEN,hidden);
    }
    @Override public void close(){
        if(closed)return;closed=true;client.removeMessageListener(messageListener);client.removeConnectionListener(connectionListener);
        anchor.sceneProperty().removeListener(sceneListener);watchScene(null);watchWindow(null);history.clear();
    }
}
