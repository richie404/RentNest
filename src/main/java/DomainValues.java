import java.util.Locale;

/** Strict parsing shared by database-backed enums; never accepts unknown or null values. */
final class DomainValues {
    private DomainValues() {}
    static <E extends Enum<E>> E parse(Class<E> type, String value) {
        if (value == null || value.isBlank())
            throw new IllegalArgumentException(type.getSimpleName() + " is required");
        return Enum.valueOf(type, value.trim().toUpperCase(Locale.ROOT));
    }
}
