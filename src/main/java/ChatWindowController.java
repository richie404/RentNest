import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.geometry.Insets;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.ScrollPane;
import javafx.scene.control.TextField;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.Region;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

public class ChatWindowController {

    @FXML private Label chatTitle;
    @FXML private VBox messages;
    @FXML private ScrollPane scroll;
    @FXML private TextField input;
    @FXML private Button sendButton;

    private static final DateTimeFormatter TIME_FMT = DateTimeFormatter.ofPattern("h:mm a");

    private int listingId;
    private int senderId;    // current user
    private int receiverId;

    private ChatConversation conversation;

    // called by PropertyDetails / Dashboards
    public void initChat(int listingId, int senderId, int receiverId, String propertyTitle) {
        this.listingId = listingId;
        this.senderId  = senderId;
        this.receiverId= receiverId;

        if (chatTitle != null) chatTitle.setText("Chat • " + propertyTitle);

        // critical for proper wrapping width
        messages.prefWidthProperty().bind(scroll.widthProperty().subtract(18));
        messages.setFillWidth(true);

        if (conversation != null) conversation.close();
        conversation = new ChatConversation(messages, listingId, senderId, receiverId, rows -> {
            messages.getChildren().clear();
            for (Message message : rows) appendBubble(message.getMessageText(), message.getSenderId() == senderId,
                    message.getTimestamp() == null ? LocalDateTime.now() : message.getTimestamp());
            autoScroll();
        }, this::appendSystem);
    }

    @FXML
    private void handleSend() {
        String text = input.getText().trim();
        if (text.isEmpty() || conversation == null) return;
        sendButton.setDisable(true);
        ChatConversation active = conversation;
        active.send(text).whenComplete((message, failure) -> active.ui(() -> {
            sendButton.setDisable(false);
            if (failure == null) { if (input.getText().trim().equals(text)) input.clear(); }
            else appendSystem("Send not confirmed; refresh history before retrying.");
        }));
    }
    /* ===== UI helpers ===== */

    private void appendSystem(String text) {
        Label l = new Label(text);
        l.setStyle("-fx-text-fill:#666666;");
        messages.getChildren().add(l);
    }

    private void appendBubble(String text, boolean isMine, LocalDateTime time) {
        // message label
        Label bubble = new Label(text);
        bubble.setWrapText(true);
        bubble.getStyleClass().addAll("bubble", isMine ? "bubble-user" : "bubble-other");

        // timestamp under the bubble, aligned with it
        Label ts = new Label(TIME_FMT.format(time));
        ts.getStyleClass().add("time");

        VBox bubbleWithTime = new VBox(bubble, ts);
        bubbleWithTime.setSpacing(2);

        // row with spacer to push left/right
        Region spacer = new Region();
        HBox.setHgrow(spacer, Priority.ALWAYS);

        HBox row = new HBox();
        row.getStyleClass().addAll("row", isMine ? "row-right" : "row-left");
        row.setFillHeight(true);
        row.setMaxWidth(Double.MAX_VALUE);
        row.setPadding(new Insets(0, 6, 0, 6));

        if (isMine) {
            row.getChildren().addAll(spacer, bubbleWithTime);
        } else {
            row.getChildren().addAll(bubbleWithTime, spacer);
        }

        messages.getChildren().add(row);
    }

    private void autoScroll() {
        Platform.runLater(() -> {
            scroll.layout();
            scroll.setVvalue(1.0);
        });
    }

    @FXML
    private void handleBack() {
        if (conversation != null) conversation.close();
        Stage st = (Stage) chatTitle.getScene().getWindow();
        st.close();
    }
}
