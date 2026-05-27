import javafx.application.Platform;
import javafx.fxml.FXML;
import javafx.scene.control.*;
import javafx.scene.layout.VBox;

/**
 * 💬 ChatController — RentNest Chat Assistant (AI-style chatbot)
 * --------------------------------------------------------------
 * - No DB or socket connection
 * - In-memory messages only
 * - Works with Router.goToChat()
 */
public class ChatController {

    @FXML private VBox chatContainer;
    @FXML private TextField messageField;
    @FXML private Button sendButton;

    /* -----------------------------------------------------------
       🧩 Initialize chat on load
       ----------------------------------------------------------- */
    @FXML
    private void initialize() {
        appendSystemMessage("👋 Hello! I’m your RentNest Assistant.\n" +
                "Ask me about renting, listings, or owners!");
    }

    /* -----------------------------------------------------------
       📤 Handle user message sending
       ----------------------------------------------------------- */
    @FXML
    private void handleSend() {
        String text = messageField.getText().trim();
        if (text.isEmpty()) return;

        appendMessage("You", text);
        messageField.clear();

        // Simulate a short delay for bot reply
        new Thread(() -> {
            try {
                Thread.sleep(600);
            } catch (InterruptedException ignored) {}

            Platform.runLater(() -> {
                String reply = getBotReply(text);
                appendMessage("Assistant", reply);
            });
        }).start();
    }

    /* -----------------------------------------------------------
       🧠 Simple Bot Logic (placeholder for AI)
       ----------------------------------------------------------- */
    private String getBotReply(String userText) {
        String lower = userText.toLowerCase();

        if (lower.contains("rent") || lower.contains("price")) {
            return "💰 You can browse current listings from the Browse page!";
        } else if (lower.contains("owner")) {
            return "👤 Owners can add new properties via the Owner Dashboard.";
        } else if (lower.contains("hello") || lower.contains("hi")) {
            return "👋 Hello there! How can I help you today?";
        } else if (lower.contains("thanks")) {
            return "😊 You're very welcome!";
        }
        return "🤔 I’m not sure, but you can explore the homepage for more info!";
    }

    /* -----------------------------------------------------------
       💬 Append messages to the chat UI
       ----------------------------------------------------------- */
    public void appendMessage(String sender, String text) {
        Label bubble = new Label(sender + ": " + text);
        bubble.setWrapText(true);
        bubble.setMaxWidth(550);
        bubble.setStyle("-fx-padding: 8 12; -fx-background-radius: 10; -fx-font-size: 14px; -fx-font-family: 'Segoe UI'; " +
                (sender.equals("You")
                        ? "-fx-background-color: #f0e1eb;"   // soft blush for user
                        : "-fx-background-color: #ffffff; -fx-border-color: rgba(102,0,51,0.1);"));
        chatContainer.getChildren().add(bubble);
    }

    /* -----------------------------------------------------------
       💬 System / Assistant message (used by Router)
       ----------------------------------------------------------- */
    public void appendSystemMessage(String text) {
        Label bubble = new Label(text);
        bubble.setWrapText(true);
        bubble.setMaxWidth(550);
        bubble.setStyle("-fx-padding: 10 14; -fx-background-radius: 10; -fx-font-size: 14px; " +
                "-fx-background-color: #fffafc; -fx-border-color: rgba(102,0,51,0.1); -fx-border-width: 1;");
        chatContainer.getChildren().add(bubble);
    }

    /* -----------------------------------------------------------
       🔙 Back Button Navigation
       ----------------------------------------------------------- */
    @FXML
    private void handleBack() {
        Router.goToHomepage();
    }
}
