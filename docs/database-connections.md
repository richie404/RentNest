# Phase 4: one database provider

Database owns one lazily initialized HikariCP pool per JVM. Every DAO calls
Database.getConnection(), borrows a logical connection and returns it with
try-with-resources. There is no connection stored in a DAO, controller or session.
Each separately launched chat-server process has its own bounded pool using the
same external configuration.

## Configuration and local compatibility

The sole connection configuration is config/database.conf, outside the classpath
and ignored by Git. Maven also excludes .conf files and the former db.properties
resource from packaging. Only the empty template is committed:

```powershell
Copy-Item config/database.conf.example config/database.conf
```

Fill in flyway.url, flyway.user and flyway.password with the existing database settings.
For example, the URL format is
jdbc:mysql://<host>:<port>/<database>?serverTimezone=<timezone>.
Use the options appropriate to the existing server; the configuration copied during
this refactor preserves the local database address, timezone, connection options,
account and empty password. No local server/account/database changes are required.
There is no built-in URL, account, password or fallback database in Java.
An empty password is allowed only when the property is explicitly present.

Both the app and the Maven Flyway plugin default to config/database.conf relative
to the project root. For a packaged app, IDE configuration or another working directory,
set RENTNEST_DB_CONFIG to the same external file for every process. Maven activates
its external-database-config profile from this variable. Treat the file as a private
UTF-8 Java properties file; escape backslashes and significant leading spaces using
properties-file syntax. Keep it out of Git and restrict its filesystem permissions.

Remove older Flyway credential/config overrides so Flyway and the application do
not select different databases. Ordinary build/startup does not run migrations.
Restart the app/chat processes after changing configuration; the pool is not hot-reloaded.
Missing files or required properties fail with a configuration message instead of
silently connecting to another database.

The previous classpath db.properties was removed after its local values were copied
to the ignored file. The old DBConnection, DatabaseConnection and DBUtil factories
were deleted after migrating every caller. DBConfig now only loads the shared file
and configures the driver's DataSource; it does not open connections.

## Pool configuration

Dependencies: com.zaxxer:HikariCP:7.0.2 and org.slf4j:slf4j-jdk14:2.0.17 (runtime logging).
The existing MySQL Connector/J version remains 9.0.0.

| Setting | Value | Reason |
|---|---|---|
| Maximum pool size | 5 per JVM | Small bounded pool for desktop and chat workloads |
| Minimum idle | 1 | Keep a ready connection without holding five idle sessions |
| Borrow timeout | 10 seconds | Bound waiting when the pool is exhausted |
| JDBC connection timeout | 5 seconds | Bound physical connection establishment |
| JDBC socket timeout | 30 seconds | Bound a stalled database operation |
| Validation timeout | 3 seconds | Shorter than borrow timeout; uses JDBC isValid |
| Idle timeout | 5 minutes | Release surplus idle connections |
| Maximum lifetime | 30 minutes | Periodically replace physical sessions |
| Keepalive | 2 minutes | Validate idle sessions between uses |
| Leak warning threshold | 60 seconds | Report a connection held unexpectedly long |
| Auto-commit | true | Preserve existing DAO transaction behavior |

Initialization occurs only on database use; failed connection attempts are bounded
by the configured timeouts. Pool sizing/timeouts are defined centrally in Database
and DBConfig. Revisit the lifetime if the deployment imposes a shorter server/network
idle cutoff. Leak detection reports a possible leak; it does not forcibly close a
legitimate long-running operation.

Prepared statements use server preparation and a bounded driver cache of 100
statements per physical connection. The driver DataSource reports the configured
five-second connect bound to Hikari because Connector/J's login-timeout getter
otherwise always returns zero, causing a spurious shutdown-worker timeout.

Main.stop closes the pool on JavaFX shutdown. A JVM shutdown hook covers both socket
servers and standalone tools. Closure is idempotent and never creates a pool;
borrowing after shutdown fails. Hikari resets tracked JDBC state on lease return.
Callers that introduce transactions must still explicitly commit/rollback and close;
raw SQL session-variable changes are not automatically reset by the pool.

These settings use the mechanisms described in the
[official HikariCP configuration documentation](https://github.com/brettwooldridge/HikariCP#configuration-knobs-baby).

## Every migrated DAO call site

All 54 direct connection acquisitions now call Database.getConnection():

| File | Count | Methods |
|---|---:|---|
| AdminActionDAO.java | 3 | logAction, getRecentActions, clearLogs |
| AdminDAO.java | 12 | getPendingListings, updateListingStatus, getAllUsers, updateUserStatus, deleteUser, updateUserRole, deleteListing, updateListingPrice, getAllBookings, cancelBooking, getSummaryStats, getAllListings |
| BookingDAO.java | 8 | createBooking, isPropertyAvailable, getAllBookings, updateBookingStatus, deleteBooking, getBookingsByRenter, getBookingsByOwner, cancelBooking |
| FavoritesDAO.java | 5 | add, remove, isFavorite, list, countForListing |
| InquiryDAO.java | 5 | create, get, updateStatus, countNewForOwner, queryList (shared by listForOwner/listForRenter) |
| ListingDAO.java | 10 | findAll, findFeatured, findById, findByOwner, search, add, update, delete, findPhotosByListingId, findOwnerIdByListing |
| MessageDAO.java | 5 | addMessage, getConversation, getMessagesForListing, getMessagesForOwner, getMessagesForUser |
| UserDAO.java | 6 | emailExists, getAllUsers, updateUserStatus, register, checkCredentials, findByEmail |

No DAO SQL, parameter binding, mapping or workflow was changed in this phase.
Ten formerly implicit ResultSet/generated-key closures are now explicit
try-with-resources scopes:

- AdminActionDAO.getRecentActions.
- BookingDAO.isPropertyAvailable, getBookingsByRenter, getBookingsByOwner.
- ListingDAO.findById, findByOwner, search, add (generated keys),
  findPhotosByListingId, findOwnerIdByListing.

Other statements/results already had explicit scopes. All 54 connection acquisitions
and all DAO statements now have try-with-resources ownership. Main gained shutdown
cleanup; Server's provider comment was updated.

Test call sites also use the pool: DomainConsistencyCheck and MessagingIntegrationCheck
no longer construct URLs or register replacement JDBC drivers. Their external config
must select the disposable database before write tests, and database-name guards remain.
SchemaAlignmentCheck decorates the pooled DataSource through a package-private test
override; mutation execution is intercepted while SQL preparation remains real.
It verifies all leases return. There is no production override configuration.

## Verification

```powershell
.\mvnw.cmd clean test dependency:build-classpath '-Dmdep.outputFile=target/schema-classpath.txt'
$cp = 'target/classes;target/test-classes;' + (Get-Content target/schema-classpath.txt -Raw).Trim()
& "$env:JAVA_HOME\bin\java.exe" -cp $cp ConnectionPoolCheck
& "$env:JAVA_HOME\bin\java.exe" -cp $cp SchemaAlignmentCheck
& "$env:JAVA_HOME\bin\java.exe" -cp $cp DomainConsistencyCheck
.\mvnw.cmd flyway:info
```

The main-based checks run explicitly; Maven's current Surefire does not discover them.
ConnectionPoolCheck uses SELECTs only to exercise physical reuse, the five-connection
limit, exhaustion timeout, JDBC state reset, exception cleanup, concurrent callers
and shutdown. SchemaAlignmentCheck executes DAO reads and intercepts all 26 writes.
DomainConsistencyCheck without arguments uses read-only SQL.

Optional DomainConsistencyCheck write tests require both a matching disposable-schema
argument and an external file selecting that schema. MessagingIntegrationCheck is a
separate destructive-fixture test and was not used for live-data verification; its
pre-existing nullable-timestamp fixtures still need alignment before full execution.

Repository searches cover DriverManager, jdbc: endpoints and removed utility usages.
Java production and test sources contain no DriverManager references or JDBC endpoints.
The only tracked jdbc: occurrence is the illustrative URL format in this document;
actual local values are confined to the ignored external file.

Completed verification: Maven clean compilation and package build passed; pool,
DAO and domain checks passed against the current local database without executing
application-data mutations. Shutdown completed without the earlier driver warning.
Flyway info passed using both the default file and RENTNEST_DB_CONFIG selection.
The packaged JAR contains neither connection credentials nor the removed utility
classes. The external config is confirmed ignored by Git. No UI or schema was changed.
