import java.math.BigDecimal;
import java.time.LocalDateTime;
public class Listing {
    private int id;
    private String title;
    private ListingType listingType;
    private String location;
    private String description;
    private BigDecimal pricePerMonth = BigDecimal.ZERO;
    private BigDecimal deposit;
    private Long sizeSqft;
    private Integer bedrooms;
    private Integer bathrooms;
    private boolean available = true;
    private Boolean furnished;
    private Boolean bachelorAllowed;
    private Boolean familyAllowed;
    private Integer ownerId;
    private String imageUrl;
    private ApprovalStatus status = ApprovalStatus.PENDING;

    /* ---- Constructors ---- */
    public Listing() {} // no-args for FXML / builders

    // Common full-args ctor (covers typical controllers that pass many fields)
    public Listing(String title, String listingType, String location, String description,
                   double pricePerMonth, double deposit, Integer sizeSqft,
                   boolean furnished, boolean bachelorAllowed, boolean familyAllowed,
                   int ownerId, String imageUrl) {
        this.title = title;
        this.listingType = ListingType.fromDatabase(listingType);
        this.location = location;
        this.description = description;
        this.pricePerMonth = BigDecimal.valueOf(pricePerMonth);
        this.deposit = BigDecimal.valueOf(deposit);
        this.sizeSqft = sizeSqft == null ? null : sizeSqft.longValue();
        this.furnished = furnished;
        this.bachelorAllowed = bachelorAllowed;
        this.familyAllowed = familyAllowed;
        this.ownerId = ownerId;
        this.imageUrl = imageUrl;
    }

    // Lightweight ctor (if an older controller passes fewer args)
    public Listing(String title, String listingType, String location, double pricePerMonth, int ownerId) {
        this(title, listingType, location, null, pricePerMonth, 0.0, null, false, true, true, ownerId, null);
    }

    /* ---- Getters ---- */
    public int getId() { return id; }
    public String getTitle() { return title; }
    public String getListingType() { return listingType == null ? null : listingType.name(); }
    public ListingType getType() { return listingType; }
    public String getLocation() { return location; }
    public String getDescription() { return description; }
    public double getPricePerMonth() { return pricePerMonth.doubleValue(); }
    public double getDeposit() { return deposit == null ? 0 : deposit.doubleValue(); }
    public Long getSizeSqft() { return sizeSqft; }
    public Integer getBedrooms() { return bedrooms; }
    public Integer getBathrooms() { return bathrooms; }
    public boolean isAvailable() { return available; }
    public boolean isFurnished() { return Boolean.TRUE.equals(furnished); }
    public boolean isBachelorAllowed() { return Boolean.TRUE.equals(bachelorAllowed); }
    public boolean isFamilyAllowed() { return Boolean.TRUE.equals(familyAllowed); }
    public Integer getOwnerId() { return ownerId; }
    public String getImageUrl() { return imageUrl; }

    /* ---- Fluent setters (builder style) ---- */
    public Listing setId(int id) { this.id=id; return this; }
    public Listing setTitle(String v) { this.title=v; return this; }
    public Listing setListingType(String v) { this.listingType=ListingType.fromDatabase(v); return this; }
    public Listing setLocation(String v) { this.location=v; return this; }
    public Listing setDescription(String v) { this.description=v; return this; }
    public Listing setPricePerMonth(double v) { this.pricePerMonth=BigDecimal.valueOf(v); return this; }
    public Listing setDeposit(double v) { this.deposit=BigDecimal.valueOf(v); return this; }
    public Listing setSizeSqft(Number v) { this.sizeSqft=v == null ? null : v.longValue(); return this; }
    public Listing setBedrooms(Integer v) { this.bedrooms=v; return this; }
    public Listing setBathrooms(Integer v) { this.bathrooms=v; return this; }
    public Listing setAvailable(boolean v) { this.available=v; return this; }
    public Listing setFurnished(boolean v) { this.furnished=v; return this; }
    public Listing setBachelorAllowed(boolean v) { this.bachelorAllowed=v; return this; }
    public Listing setFamilyAllowed(boolean v) { this.familyAllowed=v; return this; }
    public Listing setOwnerId(Integer v) { this.ownerId=v; return this; }
    public Listing setImageUrl(String v) { this.imageUrl=v; return this; }

    // Compatibility getters for existing UI bindings; nullable values remain available above.
    public int getBeds() { return bedrooms == null ? 0 : bedrooms; }
    public int getBaths() { return bathrooms == null ? 0 : bathrooms; }

    public Listing setStatus(String approvalStatus) {
        this.status = ApprovalStatus.fromDatabase(approvalStatus);
        return this;
    }

    public ApprovalStatus getApprovalStatus() { return status; }

    public String getStatus() {
        return status.name();
    }

    private LocalDateTime createdAt, updatedAt;
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public Listing setCreatedAt(LocalDateTime value) { createdAt=value; return this; }
    public Listing setUpdatedAt(LocalDateTime value) { updatedAt=value; return this; }
    public BigDecimal getPriceAmount() { return pricePerMonth; }
    public BigDecimal getDepositAmount() { return deposit; }
    public Listing setPriceAmount(BigDecimal value) { pricePerMonth=value; return this; }
    public Listing setDepositAmount(BigDecimal value) { deposit=value; return this; }
    public Boolean getFurnished() { return furnished; }
    public Boolean getBachelorAllowed() { return bachelorAllowed; }
    public Boolean getFamilyAllowed() { return familyAllowed; }
    public Listing setFurnishedValue(Boolean value) { furnished=value; return this; }
    public Listing setBachelorAllowedValue(Boolean value) { bachelorAllowed=value; return this; }
    public Listing setFamilyAllowedValue(Boolean value) { familyAllowed=value; return this; }
}
