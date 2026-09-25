import com.mysql.cj.jdbc.MysqlDataSource;
import java.io.IOException;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.SQLException;
import java.util.Properties;

/** Reads the one external connection configuration shared with Maven Flyway. */
public final class DBConfig {
    private DBConfig() {}

    static MysqlDataSource createDataSource() throws SQLException {
        String configured = System.getenv("RENTNEST_DB_CONFIG");
        Path path = configured == null || configured.isBlank()
                ? Path.of("config", "database.conf") : Path.of(configured);
        Properties properties = new Properties();
        try (Reader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
            properties.load(reader);
        } catch (IOException e) {
            throw new IllegalStateException("Cannot read database configuration. Create config/database.conf "
                    + "from the example, or set RENTNEST_DB_CONFIG to your external file.", e);
        }
        // Connector/J's login-timeout methods are no-ops (always report zero).
        // Expose the actual connect bound so Hikari can await its worker on shutdown.
        MysqlDataSource source = new MysqlDataSource() {
            @Override public int getLoginTimeout() { return 5; }
        };
        source.setURL(required(properties, "flyway.url", false));
        source.setUser(required(properties, "flyway.user", false));
        source.setPassword(required(properties, "flyway.password", true));
        source.setConnectTimeout(5000);
        source.setSocketTimeout(30000);
        source.setUseServerPrepStmts(true);
        source.setEmulateUnsupportedPstmts(false);
        source.setCachePrepStmts(true);
        source.setPrepStmtCacheSize(100);
        return source;
    }

    private static String required(Properties properties, String key, boolean allowEmpty) {
        String value = properties.getProperty(key);
        if (value == null || (!allowEmpty && value.isBlank()))
            throw new IllegalStateException("Missing required database property: " + key);
        return value; // Password whitespace is significant.
    }
}
