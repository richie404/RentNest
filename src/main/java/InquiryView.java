/** Joined inquiry projection kept separate from the persisted entity and DAO. */
public record InquiryView(Inquiry inquiry, String listingTitle, Integer ownerId, String renterName) {}
