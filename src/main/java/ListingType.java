public enum ListingType {
    ROOM, FLAT, APARTMENT, OFFICE, PARKING;
    // NULL means the type has not been supplied; it is not another listing type.
    public static ListingType fromDatabase(String value) {
        return value == null ? null : DomainValues.parse(ListingType.class, value);
    }
}
