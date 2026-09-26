import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;

public class ListingService {
    private static final Logger LOG = LoggerFactory.getLogger(ListingService.class);

    private final ListingDAO listings = new ListingDAO();
    private final ServiceAccess access;

    public ListingService() { this(new ServiceAccess()); }
    ListingService(ServiceAccess access) { this.access = access; }

    static boolean isPublic(Listing l) {
        return l.getApprovalStatus() == ApprovalStatus.APPROVED && l.isAvailable();
    }

    public List<Listing> findAll() {
        return listings.findAll().stream().filter(ListingService::isPublic).toList();
    }

    public List<Listing> search(String query) {
        return listings.search(query).stream().filter(ListingService::isPublic).toList();
    }

    public List<Listing> findFeatured(int limit) {
        if (limit < 1 || limit > 100) throw new ValidationException("Invalid featured limit");
        List<Listing> result = new ArrayList<>(findAll());
        Collections.shuffle(result);
        return result.stream().limit(limit).toList();
    }

    public Optional<Listing> findById(int id) {
        return listings.findById(id).filter(l -> {
            if (isPublic(l)) return true;
            try {
                User user = access.current();
                return user.getRole() == Role.ADMIN || Objects.equals(l.getOwnerId(), user.getId());
            } catch (SecurityException denied) { return false; }
        });
    }

    public List<Listing> findByOwner(int ownerId) {
        access.require(Role.OWNER);
        access.self(ownerId);
        return listings.findByOwner(ownerId);
    }

    public Optional<Integer> findOwnerIdByListing(int id) {
        return findById(id).map(Listing::getOwnerId);
    }

    public int insert(Listing listing) {
        User owner = access.require(Role.OWNER);
        try { validate(listing); }
        catch (IllegalArgumentException e) { throw new ValidationException(e.getMessage(), e); }
        listing.setOwnerId(owner.getId()).setStatus(ApprovalStatus.PENDING.name());
        try {
            int id = listings.insert(listing);
            LOG.info("Listing created: id={} ownerId={} title={}",
                    id, owner.getId(), listing.getTitle());
            return id;
        } catch (DataAccessException e) {
            LOG.error("Database error creating listing: ownerId={}", owner.getId(), e);
            throw new DatabaseOperationException("Listing could not be saved. Please try again.", e);
        }
    }

    public void update(Listing listing) {
        User owner = access.require(Role.OWNER);
        try { validate(listing); }
        catch (IllegalArgumentException e) { throw new ValidationException(e.getMessage(), e); }
        try {
            JdbcDAO.transaction(c -> {
                Listing stored = listings.findByIdForUpdate(c, listing.getId()).orElseThrow();
                if (!Objects.equals(stored.getOwnerId(), owner.getId()))
                    throw new AuthorizationException("You may edit only your own listings");
                listing.setOwnerId(owner.getId()).setStatus(ApprovalStatus.PENDING.name());
                listings.update(listing);
                LOG.info("Listing updated: id={} ownerId={}", listing.getId(), owner.getId());
                return null;
            });
        } catch (DataAccessException e) {
            LOG.error("Database error updating listing: listingId={} ownerId={}", listing.getId(), owner.getId(), e);
            throw new DatabaseOperationException("Listing could not be updated. Please try again.", e);
        }
    }

    public boolean delete(int id, int ownerId) {
        access.require(Role.OWNER);
        access.self(ownerId);
        try {
            boolean deleted = listings.delete(id, ownerId);
            if (deleted) LOG.info("Listing deleted: id={} ownerId={}", id, ownerId);
            return deleted;
        } catch (DataAccessException e) {
            LOG.error("Database error deleting listing: listingId={} ownerId={}", id, ownerId, e);
            throw new DatabaseOperationException("Listing could not be deleted. Please try again.", e);
        }
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
