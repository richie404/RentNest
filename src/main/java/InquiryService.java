import java.util.List;
import java.util.Objects;
public class InquiryService {
    private final ServiceAccess access;
    private final InquiryDAO inquiries = new InquiryDAO();
    public InquiryService() { this(new ServiceAccess()); }
    InquiryService(ServiceAccess access) { this.access = access; }
    public int submit(int listingId, String message) {
        User renter = access.require(Role.RENTER);
        Listing listing = new ListingDAO().findById(listingId).orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        if (!ListingService.isPublic(listing) || Objects.equals(listing.getOwnerId(),renter.getId()))
            throw new IllegalArgumentException("Cannot inquire about this listing");
        return inquiries.insert(listingId,renter.getId(),Validation.required(message,"Message",10000));
    }
    public List<InquiryView> findMine() {
        User user = access.current();
        if (user.getRole() == Role.OWNER) return inquiries.findByOwner(user.getId());
        if (user.getRole() == Role.RENTER) return inquiries.findByRenter(user.getId());
        throw new SecurityException("Inquiries require an owner or renter account");
    }
    public boolean updateStatus(int id, InquiryStatus next) {
        User owner = access.require(Role.OWNER);
        InquiryView view = inquiries.findById(id).orElseThrow(() -> new IllegalArgumentException("Inquiry not found"));
        if (!Objects.equals(view.ownerId(),owner.getId())) throw new SecurityException("This inquiry belongs to another owner");
        if (next == null || next == InquiryStatus.PENDING || view.inquiry().status() == InquiryStatus.CLOSED)
            throw new IllegalArgumentException("Invalid inquiry status transition");
        return inquiries.updateStatusIfCurrent(id,owner.getId(),view.inquiry().status(),next);
    }
}
