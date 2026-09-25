public enum BookingStatus {
    PENDING, PENDING_OWNER_APPROVAL, CONFIRMED, CANCELLED, APPROVED, REJECTED;
    public static BookingStatus fromDatabase(String value) { return DomainValues.parse(BookingStatus.class, value); }
    public boolean isPending() { return this == PENDING || this == PENDING_OWNER_APPROVAL; }
    public boolean blocksAvailability() { return isPending() || this == APPROVED || this == CONFIRMED; }
}
