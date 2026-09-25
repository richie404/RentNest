/** A persistence failure, distinct from a missing row or a rejected business request. */
public final class DataAccessException extends RuntimeException {
    public DataAccessException(String operation, Throwable cause) { super(operation, cause); }
}
