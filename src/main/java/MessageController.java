import javafx.application.Platform;
import javafx.concurrent.Task;
import javafx.fxml.FXML;
import javafx.geometry.Insets;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.geometry.Pos;
import javafx.stage.Stage;

import java.util.List;

public class MessageController {

    @FXML private VBox messageContainer;
    @FXML private TextField messageField;
    @FXML private Button sendButton;
    @FXML private Label chatTitle;
    @FXML private ScrollPane scrollPane;

    private final MessageDAO messageDAO = new MessageDAO();
    private int listingId;
    private int senderId;
    private int receiverId;

    @FXML
    private void initialize() {
        // spacing & fit
        messageContainer.setSpacing(12);
        // 🔑 Make the VBox as wide as the ScrollPane’s viewport (prevents “one letter per line”)
        messageContainer.prefWidthProperty().bind(scrollPane.widthProperty().subtract(18));
        // a little padding safety
        messageContainer.setPadding(new Insets(12));

        // live updates from your Client
        Client.getInstance().addMessageListener(msg -> {
            boolean relevant =
                    (msg.getSenderId() == senderId && msg.getReceiverId() == receiverId) ||
                            (msg.getSenderId() == receiverId && msg.getReceiverId() == senderId);

            if (relevant && java.util.Objects.equals(msg.getListingId(), listingId)) {
                Platform.runLater(() -> {
                    appendMessage(msg);
                    autoScrollToBottom();
                });
            }
        });
    }

    public void loadChat(int listingId, int senderId, int receiverId, String title) {
        this.listingId = listingId;
        this.senderId = senderId;
        this.receiverId = receiverId;
        if (chatTitle != null) chatTitle.setText("Chat • " + title);

        if (!Client.getInstance().isConnected()) {
            Client.getInstance().connect("127.0.0.1", 5000, senderId);
        }
        loadMessagesAsync();
    }

    private void loadMessagesAsync() {
        Task<List<Message>> task = new Task<>() {
            @Override
            protected List<Message> call() throws Exception {
                return messageDAO.getConversation(listingId, senderId, receiverId);
            }
        };
        task.setOnSucceeded(e -> {
            messageContainer.getChildren().clear();
            task.getValue().forEach(this::appendMessage);
            autoScrollToBottom();
        });
        task.setOnFailed(e -> messageContainer.getChildren().add(
                new Label("⚠️ Failed to load messages: " + task.getException().getMessage())
        ));
        AppExecutor.getExecutor().submit(task);
    }

    /* -----------------------------------------------------------
       🗨️ Proper bubble rows with spacers (like real chat apps)
       ----------------------------------------------------------- */
    private void appendMessage(Message msg) {
        boolean isMine = (msg.getSenderId() == senderId);

        Label bubble = new Label(msg.getMessageText());
        bubble.setWrapText(true);
        bubble.getStyleClass().addAll("bubble", isMine ? "bubble-out" : "bubble-in");
        bubble.setMaxWidth(480);
        bubble.setMinWidth(Region.USE_PREF_SIZE);

        // Row = HBox(bubble + flexible spacer) to push to left/right
        HBox row = new HBox();
        row.getStyleClass().add("bubble-row");
        row.setFillHeight(true);
        row.setMaxWidth(Double.MAX_VALUE);

        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        if (isMine) {
            // right side
            row.setAlignment(Pos.CENTER_RIGHT);
            row.getChildren().addAll(spacer, bubble);
        } else {
            // left side
            row.setAlignment(Pos.CENTER_LEFT);
            row.getChildren().addAll(bubble, spacer);
        }

        messageContainer.getChildren().add(row);
    }

    @FXML
    private void handleSend() {
        String text = messageField.getText().trim();
        if (text.isEmpty()) return;

        Message newMsg = new Message();
        newMsg.setListingId(listingId);
        newMsg.setSenderId(senderId);
        newMsg.setReceiverId(receiverId);
        newMsg.setMessageText(text);

        if (Client.getInstance().isConnected()) {
            // The server persists once before forwarding to the receiver.
            Client.getInstance().sendMessage(listingId, senderId, receiverId, text);
        } else {
            // Preserve offline database sending, without also sending over the socket.
            Task<Void> saveTask = new Task<>() {
                @Override
                protected Void call() throws Exception {
                    messageDAO.addMessage(newMsg);
                    return null;
                }
            };
            saveTask.setOnFailed(e -> messageContainer.getChildren().add(
                    new Label("Failed to save message: " + saveTask.getException().getMessage())));
            AppExecutor.getExecutor().submit(saveTask);
        }

        // instant UI
        appendMessage(newMsg);
        messageField.clear();
        autoScrollToBottom();
    }

    @FXML private void handleRefresh() { loadMessagesAsync(); }

    private void autoScrollToBottom() {
        Platform.runLater(() -> {
            scrollPane.layout();          // ensure layout pass happened
            scrollPane.setVvalue(1.0);    // bottom
        });
    }

    // if you have a Back button in FXML
    @FXML private void handleBack() {
        ((Stage) chatTitle.getScene().getWindow()).close();
    }
}
