import java.time.LocalDateTime;
public record Inquiry(int id, int listingId, int renterId, String message,
                      String contact, InquiryStatus status, LocalDateTime createdAt) {}
