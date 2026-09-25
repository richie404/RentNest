public enum UserStatus {
    ACTIVE, BANNED;
    public static UserStatus fromDatabase(String value) { return DomainValues.parse(UserStatus.class, value); }
    public static UserStatus fromActive(boolean active) { return active ? ACTIVE : BANNED; }
}
