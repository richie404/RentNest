import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Objects;

/** Owns one lazily initialized pool per process. Closing a borrowed connection returns it. */
public final class Database {
    private static HikariDataSource pool;
    private static DataSource testSource;
    private static boolean closed;

    static {
        Runtime.getRuntime().addShutdownHook(new Thread(Database::close, "rentnest-database-shutdown"));
    }

    private Database() {}

    public static Connection getConnection() throws SQLException {
        DataSource source;
        synchronized (Database.class) {
            source = testSource == null ? dataSource() : testSource;
        }
        return source.getConnection();
    }

    static synchronized HikariDataSource dataSource() throws SQLException {
        if (closed) throw new SQLException("Database pool has been shut down");
        if (pool == null) {
            HikariConfig config = new HikariConfig();
            config.setPoolName("RentNest");
            config.setDataSource(DBConfig.createDataSource());
            config.setMaximumPoolSize(5);
            config.setMinimumIdle(1);
            config.setConnectionTimeout(10000);
            config.setValidationTimeout(3000);
            config.setIdleTimeout(300000);
            config.setMaxLifetime(1800000);
            config.setKeepaliveTime(120000);
            config.setLeakDetectionThreshold(60000);
            config.setInitializationFailTimeout(-1);
            config.setAutoCommit(true);
            pool = new HikariDataSource(config);
        }
        return pool;
    }

    /** Used only by standalone checks to intercept writes without changing DAO code. */
    static synchronized AutoCloseable overrideForTest(DataSource replacement) {
        if (closed || testSource != null) throw new IllegalStateException("Database override unavailable");
        testSource = Objects.requireNonNull(replacement);
        return () -> { synchronized (Database.class) { testSource = null; } };
    }

    public static synchronized void close() {
        if (closed) return;
        closed = true;
        testSource = null;
        if (pool != null) pool.close();
    }
}
