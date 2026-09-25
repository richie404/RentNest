# Phase 5: models and persistence

No schema migration, ORM, FXML or CSS change is required for this phase.
The existing database remains usable. Existing password hashes retain their format.

## DAO review and changes

| DAO | Findings and resolution |
| --- | --- |
| ListingDAO | Repeated projections/mapping and partial model writes: share the listing projection and mapper, persist schema-backed attributes, return Optional for single-row lookups. Keep photo URLs as a query projection. Add an internal locking lookup for booking transactions. |
| BookingDAO | Availability policy and a separate check/insert allowed races; interval checks missed enclosing bookings. Move policy to BookingService; keep parameterized overlap queries and inserts in the DAO using the same transaction connection. Share mapping and use find/insert/updateStatus/delete names. |
| UserDAO | Password hashing and credential acceptance were mixed with SQL. Move these decisions to AuthenticationService; return a separate credential projection only for authentication. Share normal user mapping and update active/status together in one statement. |
| FavoritesDAO | Repeated listing mapping and overly broad ignored insert failures: reuse ListingDAO projection/mapper. Only duplicate-key conflicts return false; other SQL errors propagate. Expose Favorite records as well as joined listings. |
| InquiryDAO | DAO-owned view model and status-specific policy: move Inquiry/InquiryView to model files and expose a parameterized countByOwnerAndStatus query. Reuse one joined projection and mapper; let the schema supply the insertion default. |
| MessageDAO | Validation mixed with persistence and repeated row mapping: move validation to MessageService, share mapping and consistently name query methods. Preserve nullable listing IDs for general conversations. |
| AdminDAO | Duplicated user/listing/booking CRUD and administrative commands: AdminService delegates to the existing entity DAOs. AdminDAO now contains only the aggregate summary query. Preserve admin list ordering in the service. |
| AdminActionDAO | Repeated connection/error handling: use shared persistence infrastructure and consistent insert/findRecent/deleteAll names. Map audit timestamps to java.time. |

Single-statement operations are atomic without an additional transaction wrapper.
BookingService owns the multi-statement booking transaction: lock the parent listing,
read overlapping bookings, derive the owner and insert, then commit. Failures roll
back; rollback failures are attached to the original exception. Competing booking
requests using this service serialize per listing. External SQL writers must follow
the same protocol to obtain that guarantee. Date intervals remain inclusive.

JdbcDAO centralizes prepared statements, parameter binding, generated keys and
try-with-resources. DaoMappers contains internal ResultSet-to-model mapping.
Neither exposes ResultSets to controllers. DataAccessException preserves the SQL
cause; empty lists/Optional mean successful queries with no matching rows, not a
database failure. Controllers contain no SQL or JDBC references.

## Models

- Listing preserves nullable owner, type, attributes and timestamps. SQL DECIMAL
  price/deposit use BigDecimal; unsigned size_sqft uses Long.
- Booking uses LocalDate dates, LocalDateTime creation time, nullable owner and
  BigDecimal total. Existing display-facing numeric accessors remain compatible.
- User maps the actual status, active flag, role, username and creation time.
  UserCredentials separates the password hash from ordinary user queries and
  redacts it in toString.
- Message retains nullable listing IDs and LocalDateTime timestamps; AdminAction
  now uses LocalDateTime too.
- Favorite, Inquiry, InquiryView, Payment, Amenity, ListingAmenity and ListingPhoto
  represent previously missing schema entities/projections. Payment amount remains
  double because the existing SQL column is DOUBLE; no payment/message status was
  invented. The generated photo uniqueness column is derived database state.

No new payment, amenity or image workflow was introduced. Adding their models does
not imply adding unused CRUD services. Existing form image persistence limitations
and password-format upgrades remain outside this phase.

## Callers changed

Authentication: LoginController and RegisterController use AuthenticationService.
Booking creation/cancellation: BookPropertyController, RenterBookingsController
and AdminService use BookingService. OwnerBookingsController and booking tables
use the renamed queries and java.time model types.

AdminDashboardController, AdminListingManagementController and
AdminBookingManagementController delegate administrative commands to AdminService;
AdminUserManagementController uses typed UserDAO operations. AddListingController,
OwnerDashboardController, RenterDashboardController and PropertyDetailsController
use the updated listing/favorite/inquiry contracts and Optional lookups.

MessageController, ChatWindowController, Server and ChatServer send through
MessageService and use renamed MessageDAO queries for reads. Standalone checks
were updated to the same contracts.

## Verification

- Maven clean package: successful (Java 25).
- SchemaAlignmentCheck: live database reads and 26 intercepted, non-executed writes
  validate SQL preparation, mappings and parameter order.
- DomainConsistencyCheck: read-only enum/default/input and foreign-key checks pass.
- DaoRefactorCheck: isolated database writes verify precise/null mappings,
  authentication, duplicate favorites, FK error propagation, inquiry/message
  persistence, concurrent booking exclusion and transaction rollback. Pool leases
  return to zero.
- ResponsiveLayoutCheck: passes FXML/layout/table/window checks. Existing CSS
  parser warnings remain; styling was not changed.
- Searches: no JDBC/SQL in controllers, DriverManager/hardcoded JDBC URLs in
  production Java, raw ResultSet public DAO APIs or swallowed SQL exceptions.

The main-based checks must be run explicitly; Maven's default Surefire does not
discover them. After compiling and generating target/schema-classpath.txt:

```powershell
.\mvnw.cmd test dependency:build-classpath '-Dmdep.outputFile=target/schema-classpath.txt'
$cp = 'target/classes;target/test-classes;' + (Get-Content target/schema-classpath.txt -Raw).Trim()
& "$env:JAVA_HOME\bin\java.exe" -cp $cp SchemaAlignmentCheck
& "$env:JAVA_HOME\bin\java.exe" -cp $cp DomainConsistencyCheck
& "$env:JAVA_HOME\bin\java.exe" -cp $cp ResponsiveLayoutCheck
```

For DaoRefactorCheck, create a fresh disposable schema named exactly
rentnest_phase5_test, apply the schema there, and select it through a separate
external config using RENTNEST_DB_CONFIG. Run the check with the same classpath.
It refuses any other catalog and inserts fixtures, so never point it at a database
you want to preserve. The verification database used for this phase was removed
after testing; the current RentNest database was not modified.

The legacy socket integration fixture was not executed in this phase; its NULL
timestamp fixture needs correction before it can verify the current schema.
