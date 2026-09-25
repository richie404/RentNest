import java.util.*;

public class ListingService {
    private final ListingDAO listings = new ListingDAO();
    private final ServiceAccess access;
    public ListingService() { this(new ServiceAccess()); }
    ListingService(ServiceAccess access) { this.access = access; }
    static boolean isPublic(Listing l) { return l.getApprovalStatus() == ApprovalStatus.APPROVED && l.isAvailable(); }
    public List<Listing> findAll() { return listings.findAll().stream().filter(ListingService::isPublic).toList(); }
    public List<Listing> search(String query) { return listings.search(query).stream().filter(ListingService::isPublic).toList(); }
    public List<Listing> findFeatured(int limit) {
        if (limit < 1 || limit > 100) throw new IllegalArgumentException("Invalid featured limit");
        List<Listing> result = new ArrayList<>(findAll());
        Collections.shuffle(result);
        return result.stream().limit(limit).toList();
    }
    public Optional<Listing> findById(int id) {
        return listings.findById(id).filter(l -> {
            if (isPublic(l)) return true;
            try { User user = access.current(); return user.getRole() == Role.ADMIN || Objects.equals(l.getOwnerId(), user.getId()); }
            catch (SecurityException denied) { return false; }
        });
    }
    public List<Listing> findByOwner(int ownerId) { access.require(Role.OWNER); access.self(ownerId); return listings.findByOwner(ownerId); }
    public Optional<Integer> findOwnerIdByListing(int id) { return findById(id).map(Listing::getOwnerId); }
    public int insert(Listing listing) {
        User owner = access.require(Role.OWNER);
        validate(listing);
        listing.setOwnerId(owner.getId()).setStatus(ApprovalStatus.PENDING.name());
        return listings.insert(listing);
    }
    public void update(Listing listing) {
        User owner = access.require(Role.OWNER);
        validate(listing);
        JdbcDAO.transaction(c -> {
            Listing stored = listings.findByIdForUpdate(c, listing.getId()).orElseThrow();
            if (!Objects.equals(stored.getOwnerId(), owner.getId())) throw new SecurityException("You may edit only your own listings");
            listing.setOwnerId(owner.getId()).setStatus(ApprovalStatus.PENDING.name());
            listings.update(listing); return null;
        });
    }
    public boolean delete(int id, int ownerId) {
        access.require(Role.OWNER); access.self(ownerId);
        return listings.delete(id, ownerId);
    }
    static void validate(Listing listing) {
        listing.setTitle(Validation.required(listing.getTitle(), "Title", 120));
        listing.setLocation(Validation.required(listing.getLocation(), "Location", 200));
        Validation.money(listing.getPriceAmount(), false);
        if (listing.getDepositAmount() != null) Validation.money(listing.getDepositAmount(), true);
        if (listing.getSizeSqft() != null && (listing.getSizeSqft() <= 0 || listing.getSizeSqft() > 4294967295L))
            throw new IllegalArgumentException("Invalid property size");
        if ((listing.getBedrooms() != null && (listing.getBedrooms() < 0 || listing.getBedrooms() > 255))
                || (listing.getBathrooms() != null && (listing.getBathrooms() < 0 || listing.getBathrooms() > 255)))
            throw new IllegalArgumentException("Invalid room count");
    }
}
