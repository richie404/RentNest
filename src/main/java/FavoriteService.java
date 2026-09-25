import java.util.List;
public class FavoriteService {
    private final ServiceAccess access;
    private final FavoritesDAO favorites = new FavoritesDAO();
    public FavoriteService() { this(new ServiceAccess()); }
    FavoriteService(ServiceAccess access) { this.access = access; }
    public boolean add(int listingId) {
        User renter = access.require(Role.RENTER);
        Listing listing = new ListingDAO().findById(listingId).orElseThrow(() -> new IllegalArgumentException("Listing not found"));
        if (!ListingService.isPublic(listing)) throw new IllegalArgumentException("Listing is not publicly available");
        return favorites.insert(renter.getId(), listingId); // Unique key resolves concurrent duplicate additions.
    }
    public boolean remove(int listingId) { return favorites.delete(access.require(Role.RENTER).getId(), listingId); }
    public List<Listing> findMine() {
        return favorites.findListingsByUser(access.require(Role.RENTER).getId()).stream().filter(ListingService::isPublic).toList();
    }
}
