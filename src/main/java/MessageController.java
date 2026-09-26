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

    private ChatConversation conversation;
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

    }

    public void loadChat(int listingId, int senderId, int receiverId, String title) {
        this.listingId = listingId;
        this.senderId = senderId;
        this.receiverId = receiverId;
        if (chatTitle != null) chatTitle.setText("Chat • " + title);

        if (conversation != null) conversation.close();
        conversation = new ChatConversation(messageContainer, listingId, senderId, receiverId, rows -> {
            messageContainer.getChildren().clear();
            rows.forEach(this::appendMessage);
            autoScrollToBottom();
        }, error -> messageContainer.getChildren().add(new Label(error)));
    }

    private void loadMessagesAsync() { if (conversation != null) conversation.refresh(); }
    /* -----------------------------------------------------------
       🗨️ Proper bubble rows with spacers (like real chat apps)
       ----------------------------------------------------------- */
    private void appendMessage(Message msg) {
        boolean isMine = (msg.getSenderId() == senderId);

        Label bubble = new Label(msg.getMessageText());
        bubble.setWrapText(true);
        bubble.getStyleClass().addAll("bubble", isMine ? "bubble-out" : "bubble-in");
        bubble.setMaxWidth(480);
        bubble.setMinWidth(0);

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

        if (conversation == null) return;
        sendButton.setDisable(true);
        ChatConversation active = conversation;
        active.send(text).whenComplete((message, failure) -> active.ui(() -> {
            sendButton.setDisable(false);
            if (failure == null) { if (messageField.getText().trim().equals(text)) messageField.clear(); }
            else messageContainer.getChildren().add(new Label("Send not confirmed; refresh history before retrying."));
        }));
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
        if (conversation != null) conversation.close();
        ((Stage) chatTitle.getScene().getWindow()).close();
    }
}
