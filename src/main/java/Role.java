public enum Role {
    RENTER, OWNER, ADMIN;
    public static Role fromDatabase(String value) { return DomainValues.parse(Role.class, value); }
}
