public class Listing {
    private int id;
    private String title;
    private String listingType;
    private String location;
    private String description;
    private double pricePerMonth;
    private double deposit;
    private Integer sizeSqft;
    private boolean furnished;
    private boolean bachelorAllowed;
    private boolean familyAllowed;
    private int ownerId;
    private String imageUrl;
    private String status;

    /* ---- Constructors ---- */
    public Listing() {} // no-args for FXML / builders

    // Common full-args ctor (covers typical controllers that pass many fields)
    public Listing(String title, String listingType, String location, String description,
                   double pricePerMonth, double deposit, Integer sizeSqft,
                   boolean furnished, boolean bachelorAllowed, boolean familyAllowed,
                   int ownerId, String imageUrl) {
        this.title = title;
        this.listingType = listingType;
        this.location = location;
        this.description = description;
        this.pricePerMonth = pricePerMonth;
        this.deposit = deposit;
        this.sizeSqft = sizeSqft;
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
    public String getListingType() { return listingType; }
    public String getLocation() { return location; }
    public String getDescription() { return description; }
    public double getPricePerMonth() { return pricePerMonth; }
    public double getDeposit() { return deposit; }
    public Integer getSizeSqft() { return sizeSqft; }
    public boolean isFurnished() { return furnished; }
    public boolean isBachelorAllowed() { return bachelorAllowed; }
    public boolean isFamilyAllowed() { return familyAllowed; }
    public int getOwnerId() { return ownerId; }
    public String getImageUrl() { return imageUrl; }

    /* ---- Fluent setters (builder style) ---- */
    public Listing setId(int id) { this.id=id; return this; }
    public Listing setTitle(String v) { this.title=v; return this; }
    public Listing setListingType(String v) { this.listingType=v; return this; }
    public Listing setLocation(String v) { this.location=v; return this; }
    public Listing setDescription(String v) { this.description=v; return this; }
    public Listing setPricePerMonth(double v) { this.pricePerMonth=v; return this; }
    public Listing setDeposit(double v) { this.deposit=v; return this; }
    public Listing setSizeSqft(Integer v) { this.sizeSqft=v; return this; }
    public Listing setFurnished(boolean v) { this.furnished=v; return this; }
    public Listing setBachelorAllowed(boolean v) { this.bachelorAllowed=v; return this; }
    public Listing setFamilyAllowed(boolean v) { this.familyAllowed=v; return this; }
    public Listing setOwnerId(int v) { this.ownerId=v; return this; }
    public Listing setImageUrl(String v) { this.imageUrl=v; return this; }

    // Convenience for existing UI bindings (can refine later)
    public int getBeds() { return 0; }
    public int getBaths() { return 0; }

    public Listing setStatus(String approvalStatus) {
        this.status = approvalStatus;
        return this;
    }

    public String getStatus() {
        return status;
    }

}
