# Phase 6: service layer

Controllers now call services; no controller instantiates a DAO or imports JDBC.
Services implement authorization, validation and workflow rules. DAOs retain SQL
and model mapping. No framework, schema migration, FXML or stylesheet was added.

## Services and decisions

| Service | Business rules |
| --- | --- |
| AuthenticationService | Validates registration, restricts self-registration to OWNER/RENTER, checks duplicate email, verifies credentials and active account state, provides authenticated admin lookup. Login returns the verified user without a second controller lookup. |
| ListingService | Public browse/search/featured results require APPROVED and available. Private details require the owner or admin. Owner reads/deletes are scoped to the session. Creation assigns the authenticated owner and PENDING approval. Updates lock the stored listing, verify ownership, and require approval again. Validates text lengths, amounts, size and room counts. |
| BookingService | Requires an active renter, rejects own-property bookings, unavailable/unapproved listings and invalid dates. Derives renter/owner/status/amount instead of trusting submitted model values. Preserves transactional overlap exclusion. Locks bookings for role/ownership checks and status transitions. |
| FavoriteService | Only renters can add/remove their favorites. Additions require a publicly available listing. The database unique key resolves duplicate/concurrent additions. The existing favorite button now persists through this service. |
| InquiryService | Renter submission requires a public listing belonging to someone else. Owners can update only their own inquiries; closed inquiries cannot reopen. Conditional SQL prevents overwriting a concurrent status change. |
| AdminService | Requires a persisted active ADMIN account for reads and moderation. Changes and audit inserts share one transaction; audit failure rolls back the change. Prevents self-ban, self-deletion and self-demotion. |
| MessageService | Restricts desktop history to the session participant and desktop sends to the authenticated sender. Validates participant IDs, text and active sender/receiver accounts. Both direct-save and socket-send controller paths validate through the service. |

PaymentService was deliberately not created: payments remain an unfinished UI
placeholder, with no implemented payment workflow whose rules could be extracted.
Existing service names were retained rather than adding duplicate AuthService or
MessagingService classes.

ServiceAccess re-reads the account's role and active state for each operation;
stale UI models cannot grant permissions after an account is banned or demoted.
Its injectable session supplier supports headless tests. This is desktop-layer
authorization, not a replacement for database account permissions or an API server.

## Validation and behavior

Validation centralizes required text, email, money and dates. New passwords require
8–128 characters; existing password hashes and existing-user login rules remain
compatible. Passwords are no longer trimmed by login controllers. Enum parsing
continues to use the canonical domain enums. No unused phone validator was added:
the current booking contact field is not persisted by the existing workflow.

The existing one-month booking form still charges exactly the stored monthly rate,
including month-end dates. Service callers supplying longer ranges are charged
whole calendar months plus remaining days prorated against the next calendar
month, rounded to two decimals. Dates must start today or later and end after the
start. Overlap intervals remain inclusive, as before.

Both PENDING states can become CONFIRMED or REJECTED by the owning property owner.
Owners/admins can cancel active bookings. Renters can cancel their pending bookings,
but confirmed/approved bookings require owner/admin cancellation. CANCELLED and
REJECTED are terminal. Admin cancellations always create an audit record.

JdbcDAO binds a connection to the current thread for the duration of a transaction,
so entity DAO calls and audit inserts use the same connection. It removes that
binding in finally and rolls back on failure. Nested transactions are rejected;
transaction work must remain synchronous on the same thread.

## Changed boundaries

Listing controllers: Homepage, Browse, Details, PropertyDetails, Listings,
AddListing and owner/renter dashboards. Booking controllers: BookProperty,
OwnerBookings and RenterBookings. Admin dashboard/listing/user/booking controllers
now use authorized admin commands. Login/Register use AuthenticationService.
ChatWindow/Message and dashboard message reads use MessageService. Renter booking
navigation now reads SessionManager, matching service identity checks.

Persistence changes are limited to shared transaction participation, booking row
locks and conditional inquiry status updates. No database data migration is needed.

## Verification

Compiled after core services, controller migration and final refinements.
Standalone checks are main classes and must be run explicitly; Maven compiles them
but does not discover them with its current Surefire configuration.

- ServiceLayerCheck: disposable database tests for cross-role/cross-user denial,
  stale-session rejection, registration validation, listing approval and edits,
  public visibility, favorites, inquiry transitions, booking prices/statuses,
  message access and rollback when audit insertion fails.
- DaoRefactorCheck: updated to supply authenticated test identities; concurrent
  overlapping bookings still permit only one insert. Mapping/error/rollback checks
  remain intact.
- SchemaAlignmentCheck: 26 intercepted writes, no live writes; now tests persistence
  directly instead of bypassing service authorization with fake IDs.
- DomainConsistencyCheck: canonical enums, validation and live FK integrity.
- ResponsiveLayoutCheck: existing FXML/layout checks; existing CSS warnings remain.

Run compilation and build the runtime classpath:

```powershell
.\mvnw.cmd test dependency:build-classpath '-Dmdep.outputFile=target/schema-classpath.txt'
$cp = 'target/classes;target/test-classes;' + (Get-Content target/schema-classpath.txt -Raw).Trim()
& "$env:JAVA_HOME\bin\java.exe" -cp $cp SchemaAlignmentCheck
& "$env:JAVA_HOME\bin\java.exe" -cp $cp DomainConsistencyCheck
& "$env:JAVA_HOME\bin\java.exe" -cp $cp ResponsiveLayoutCheck
```

For ServiceLayerCheck, select a fresh disposable `rentnest_phase6_test` database
through RENTNEST_DB_CONFIG, populated with the schema. It inserts fixtures and
temporarily creates a trigger to prove audit rollback, requiring trigger permission.
DaoRefactorCheck similarly requires a fresh `rentnest_phase5_test`. Both refuse
other catalogs. Never import fixtures into the current RentNest database.

## Remaining existing limitations

The socket protocol still identifies clients by supplied IDs rather than an
authenticated token. Its server persistence path validates users but cannot prove
the caller's identity; a protocol/authentication change remains necessary for that.
This phase does not claim to secure arbitrary socket clients.

Payment/report screens, admin booking approve/reject/delete placeholders, listing
edit navigation, search filter placeholders and image-upload persistence remain
outside this service refactor. No empty services were added for those placeholders.
Existing socket integration fixtures were not executed in this phase.
