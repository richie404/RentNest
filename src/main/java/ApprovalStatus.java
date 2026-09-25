public enum ApprovalStatus {
    PENDING, APPROVED, REJECTED;
    public static ApprovalStatus fromDatabase(String value) { return DomainValues.parse(ApprovalStatus.class, value); }
}
