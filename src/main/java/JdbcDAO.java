import java.sql.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/** Package-private persistence infrastructure; JDBC objects never reach controllers. */
final class JdbcDAO {
    private static final ThreadLocal<Connection> TRANSACTION = new ThreadLocal<>();
    @FunctionalInterface interface Mapper<T> { T map(ResultSet row) throws SQLException; }
    @FunctionalInterface interface Work<T> { T run(Connection connection) throws SQLException; }
    private JdbcDAO() {}

    static <T> T connection(Work<T> work) {
        Connection transaction = TRANSACTION.get();
        if (transaction != null) {
            try { return work.run(transaction); }
            catch (SQLException e) { throw new DataAccessException("Database operation failed", e); }
        }
        try (Connection c = Database.getConnection()) { return work.run(c); }
        catch (SQLException e) { throw new DataAccessException("Database operation failed", e); }
    }
    static <T> T transaction(Work<T> work) {
        return transaction(null, work);
    }
    static <T> T transaction(Integer isolation, Work<T> work) {
        if (TRANSACTION.get() != null) throw new IllegalStateException("Nested transactions are not supported");
        return connection(c -> {
            if (isolation != null) c.setTransactionIsolation(isolation);
            c.setAutoCommit(false);
            TRANSACTION.set(c);
            try {
                T value = work.run(c);
                c.commit();
                return value;
            } catch (SQLException | RuntimeException | Error failure) {
                try { c.rollback(); } catch (SQLException rollback) { failure.addSuppressed(rollback); }
                throw failure;
            } finally {
                TRANSACTION.remove();
            }
        });
    }
    static <T> List<T> query(String sql, Mapper<T> mapper, Object... values) {
        return connection(c -> query(c, sql, mapper, values));
    }
    static <T> List<T> query(Connection c, String sql, Mapper<T> mapper, Object... values) throws SQLException {
        try (PreparedStatement ps = c.prepareStatement(sql)) {
            bind(ps, values);
            try (ResultSet rows = ps.executeQuery()) {
                List<T> result = new ArrayList<>();
                while (rows.next()) result.add(mapper.map(rows));
                return result;
            }
        }
    }
    static <T> Optional<T> one(String sql, Mapper<T> mapper, Object... values) {
        return query(sql, mapper, values).stream().findFirst();
    }
    static int update(String sql, Object... values) {
        return connection(c -> update(c, sql, values));
    }
    static int update(Connection c, String sql, Object... values) throws SQLException {
        try (PreparedStatement ps = c.prepareStatement(sql)) {
            bind(ps, values);
            return ps.executeUpdate();
        }
    }
    static int insert(String sql, Object... values) {
        return connection(c -> {
            try (PreparedStatement ps = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
                bind(ps, values);
                ps.executeUpdate();
                try (ResultSet keys = ps.getGeneratedKeys()) {
                    if (!keys.next()) throw new SQLException("Insert returned no generated key");
                    return keys.getInt(1);
                }
            }
        });
    }
    private static void bind(PreparedStatement ps, Object[] values) throws SQLException {
        for (int i = 0; i < values.length; i++) {
            Object value = values[i];
            if (value instanceof LocalDate date) ps.setDate(i + 1, java.sql.Date.valueOf(date));
            else if (value instanceof LocalDateTime time) ps.setTimestamp(i + 1, Timestamp.valueOf(time));
            else if (value instanceof Enum<?> e) ps.setString(i + 1, e.name());
            else if (value == null) ps.setNull(i + 1, Types.NULL);
            else ps.setObject(i + 1, value);
        }
    }
}
