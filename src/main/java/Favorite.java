import java.time.LocalDateTime;
public record Favorite(int id, int userId, int listingId, LocalDateTime createdAt) {}
