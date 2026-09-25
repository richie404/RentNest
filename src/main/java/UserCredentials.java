/** Password hashes are fetched only for authentication, never included in User/UI lists. */
public record UserCredentials(User user, String passwordHash) {
    @Override public String toString() { return "UserCredentials[userId=" + user.getId() + "]"; }
}
