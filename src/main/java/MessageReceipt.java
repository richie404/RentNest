/** Canonical committed row plus whether this request inserted it. */
public record MessageReceipt(Message message, boolean inserted) {}
