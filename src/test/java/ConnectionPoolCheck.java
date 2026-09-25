import com.zaxxer.hikari.HikariDataSource;
import java.sql.*;
import java.util.*;
import java.util.concurrent.*;

/** Read-only integration check against the externally configured database. */
public class ConnectionPoolCheck {
    public static void main(String[] args) throws Exception {
        HikariDataSource pool = Database.dataSource();
        try {
            Set<Long> physicalIds = new HashSet<>();
            List<Connection> leases = new ArrayList<>();
            try {
                for (int i = 0; i < pool.getMaximumPoolSize(); i++) {
                    Connection c = Database.getConnection();
                    leases.add(c);
                    physicalIds.add(connectionId(c));
                }
                check(pool.getHikariPoolMXBean().getActiveConnections() == 5, "Five bounded leases");
                long started = System.nanoTime();
                try (Connection unexpected = Database.getConnection()) {
                    throw new AssertionError("Pool exceeded its limit");
                } catch (SQLTransientConnectionException expected) {
                    long elapsed = TimeUnit.NANOSECONDS.toMillis(System.nanoTime() - started);
                    check(elapsed >= 9000 && elapsed < 15000, "Pool exhaustion has a bounded timeout");
                }
            } finally {
                for (Connection lease : leases) lease.close();
            }
            try (Connection c = Database.getConnection()) {
                check(physicalIds.contains(connectionId(c)), "Physical connection reused");
                c.setAutoCommit(false);
                c.setReadOnly(true);
            }
            try (Connection c = Database.getConnection()) {
                check(c.getAutoCommit() && !c.isReadOnly(), "Connection state reset between borrowers");
            }
            try (Connection c = Database.getConnection();
                 Statement statement = c.createStatement()) {
                try (ResultSet ignored = statement.executeQuery("SELECT rentnest_deliberately_missing_column")) {
                    throw new AssertionError("Expected SQL error");
                }
            } catch (SQLException expected) {
                check("42S22".equals(expected.getSQLState()), "Expected unknown-column error only");
            }
            try (ExecutorService executor = Executors.newFixedThreadPool(8)) {
                List<Future<?>> tasks = new ArrayList<>();
                for (int i = 0; i < 24; i++) tasks.add(executor.submit(() -> {
                    try (Connection c = Database.getConnection()) {
                        check(physicalIds.contains(connectionId(c)), "Concurrent callers share the pool");
                    } catch (SQLException e) { throw new RuntimeException(e); }
                }));
                for (Future<?> task : tasks) task.get(15, TimeUnit.SECONDS);
            }
            check(pool.getHikariPoolMXBean().getActiveConnections() == 0,
                    "No leases retained after normal/exception/concurrent paths");
            check(pool.getHikariPoolMXBean().getTotalConnections() <= 5, "Physical connection bound");
        } finally {
            Database.close();
        }
        check(pool.isClosed(), "Owned pool closed");
        try (Connection ignored = Database.getConnection()) {
            throw new AssertionError("Closed provider reopened");
        } catch (SQLException expected) { }
        Database.close(); // Shutdown hook and JavaFX stop may both close safely.
        System.out.println("PASS: pool reuse, size limit, exhaustion timeout, state reset, exception cleanup, concurrency and shutdown");
    }

    private static long connectionId(Connection c) throws SQLException {
        try (Statement statement = c.createStatement();
             ResultSet rs = statement.executeQuery("SELECT CONNECTION_ID()")) {
            rs.next();
            return rs.getLong(1);
        }
    }
    private static void check(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }
}
