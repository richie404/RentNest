import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class Booking {
    private int id, listingId, renterId;
    private Integer ownerId;
    private LocalDate startDate, endDate;
    private BigDecimal totalAmount = BigDecimal.ZERO;
    private BookingStatus status = BookingStatus.PENDING;
    private LocalDateTime createdAt;
    public Booking() {}
    public Booking(int listingId, int renterId, Integer ownerId, LocalDate startDate,
                   LocalDate endDate, double totalAmount, String status) {
        this.listingId=listingId; this.renterId=renterId; this.ownerId=ownerId;
        this.startDate=startDate; this.endDate=endDate;
        setTotalAmount(totalAmount); setStatus(status);
    }
    public int getId() { return id; }
    public int getListingId() { return listingId; }
    public int getRenterId() { return renterId; }
    public Integer getOwnerId() { return ownerId; }
    public LocalDate getStartDate() { return startDate; }
    public LocalDate getEndDate() { return endDate; }
    public BigDecimal getTotalAmountValue() { return totalAmount; }
    public double getTotalAmount() { return totalAmount == null ? 0 : totalAmount.doubleValue(); }
    public String getStatus() { return status.name(); }
    public BookingStatus getBookingStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setId(int value) { id=value; }
    public void setListingId(int value) { listingId=value; }
    public void setRenterId(int value) { renterId=value; }
    public void setOwnerId(Integer value) { ownerId=value; }
    public void setStartDate(LocalDate value) { startDate=value; }
    public void setEndDate(LocalDate value) { endDate=value; }
    public void setTotalAmount(double value) { totalAmount=BigDecimal.valueOf(value); }
    public void setTotalAmountValue(BigDecimal value) { totalAmount=value; }
    public void setStatus(String value) { status=BookingStatus.fromDatabase(value); }
    public void setCreatedAt(LocalDateTime value) { createdAt=value; }
}
