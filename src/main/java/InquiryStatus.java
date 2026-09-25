public enum InquiryStatus {
    PENDING("Pending"), REPLIED("Replied"), CLOSED("Closed");
    private final String databaseValue;
    InquiryStatus(String databaseValue) { this.databaseValue = databaseValue; }
    public String databaseValue() { return databaseValue; }
    public static InquiryStatus fromDatabase(String value) { return DomainValues.parse(InquiryStatus.class, value); }
}
