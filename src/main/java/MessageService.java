public class MessageService {
    private final ServiceAccess access;
    public MessageService() { this(new ServiceAccess()); }
    MessageService(ServiceAccess access) { this.access = access; }
    private final MessageDAO messages=new MessageDAO();
    public MessageReceipt sendAuthenticated(String token, String requestId, Message message) {
        User actor = SessionTokens.require(token);
        if (actor.getId() != message.getSenderId()) throw new SecurityException("Invalid sender");
        String canonical = java.util.UUID.fromString(requestId).toString();
        if (!canonical.equals(requestId)) throw new IllegalArgumentException("Invalid request ID");
        validate(message);
        MessageReceipt result = messages.insertOnce(canonical,message);
        Message stored = result.message();
        if (!java.util.Objects.equals(stored.getListingId(),message.getListingId())
                || stored.getReceiverId()!=message.getReceiverId() || !stored.getMessageText().equals(message.getMessageText()))
            throw new IllegalArgumentException("Request ID was already used for a different message");
        return result;
    }
    public void sendFromSession(Message message) {
        access.self(message.getSenderId());
        send(message);
    }
    public void sendAuthenticated(String token, Message message) {
        User actor = SessionTokens.require(token);
        if (actor.getId() != message.getSenderId()) throw new SecurityException("Invalid sender");
        persist(message);
    }
    public void validateFromSession(Message message) {
        access.self(message.getSenderId());
        validate(message);
    }
    public java.util.List<Message> findConversation(Integer listingId, int senderId, int receiverId) {
        access.self(senderId);
        return messages.findConversation(listingId,senderId,receiverId);
    }
    public java.util.List<Message> findByUser(int id) { access.self(id); return messages.findByUser(id); }
    public java.util.List<Message> findByReceiver(int id) { access.self(id); return messages.findByReceiver(id); }
    /** Socket transport entry point; the existing protocol supplies participant IDs. */
    public void send(Message message) {
        access.self(message.getSenderId());
        persist(message);
    }
    private void persist(Message message) {
        validate(message);
        message.setId(messages.insert(message));
    }
    private void validate(Message message) {
        if(message.getSenderId()<=0 || message.getReceiverId()<=0
            || (message.getListingId()!=null && message.getListingId()<=0)
            || message.getMessageText()==null || message.getMessageText().isBlank()
            || message.getMessageText().getBytes(java.nio.charset.StandardCharsets.UTF_8).length>8192)
            throw new IllegalArgumentException("Invalid message participants, listing or text");
        UserDAO users = new UserDAO();
        User sender = users.findById(message.getSenderId()).orElseThrow(() -> new IllegalArgumentException("Sender not found"));
        User receiver = users.findById(message.getReceiverId()).orElseThrow(() -> new IllegalArgumentException("Receiver not found"));
        if (!sender.isActive() || sender.getStatus() != UserStatus.ACTIVE || !receiver.isActive() || receiver.getStatus() != UserStatus.ACTIVE)
            throw new SecurityException("Cannot message using an inactive account");
    }
}
