# Phase 2: database consistency

Phase 3 update: these corrections are now Flyway V2. Follow the
[Flyway adoption and migration guide](README.md) instead of sourcing the standalone
script once a database is managed by Flyway. The manual instructions below are
retained as the historical Phase 2 procedure.

The SQL schema remains authoritative. Java now uses the definitions below; existing
String getters remain available for JavaFX table bindings. No FXML or CSS changes.
The migration is provided separately and has **not** been applied to the live database.

## Canonical values and decisions

| Domain | Java definition | Database values |
|---|---|---|
| User role | Role | RENTER, OWNER, ADMIN |
| Account status | UserStatus | ACTIVE, BANNED |
| Listing type | ListingType | ROOM, FLAT, APARTMENT, OFFICE, PARKING; NULL means unknown |
| Listing approval | ApprovalStatus | PENDING, APPROVED, REJECTED |
| Booking status | BookingStatus | PENDING, PENDING_OWNER_APPROVAL, CONFIRMED, CANCELLED, APPROVED, REJECTED |
| Inquiry status | InquiryStatus | Pending, Replied, Closed |

Parsing trims input, ignores case, and rejects unknown values before opening a DAO
connection. Required values reject NULL/blank. Inquiry enum names are uppercase Java
identifiers, with explicit mappings to the existing title-case MySQL values.
Listing types alone allow NULL: all 21 current listings have no recorded type.
Choosing an arbitrary default would misclassify existing properties.

Both booking pending states remain supported, including existing PENDING rows and
the database default. New booking requests continue using PENDING_OWNER_APPROVAL.
Owner approval writes CONFIRMED; rejection now writes REJECTED; cancellation writes
CANCELLED. Historical APPROVED values remain valid and block availability, as do
both pending states and CONFIRMED. No existing statuses are rewritten.

Payments and messages have **no status column** and no established status workflow.
No payment/message enum or status column is invented. admin_actions.action_type
is an open VARCHAR field without an established vocabulary; target_id is polymorphic,
so adding a foreign key to one particular table would be incorrect.

## Problems found and Java changes

- DAO role/approval/booking writers previously accepted arbitrary strings. Domain
  enums now validate those inputs, and models store typed role/status/type values.
- Inquiry status values corrected in Phase 1 are now centralized in InquiryStatus;
  insertion, updates, reads and pending counts share the same definition.
- UserDAO.updateUserStatus previously changed only active. It now updates active and
  status in one statement, like AdminDAO. Login requires active=true and status=ACTIVE.
- Role checks previously used substring matching. Controllers, BaseController and
  Router now compare the exact Role value. Registration still offers only OWNER/RENTER.
- The listing type selector derives its existing options from ListingType.
- Owner booking actions now recognize both pending states. Rejection is distinguished
  from cancellation without rewriting historical records.
- BookingDAO rejects missing/reversed dates and negative/non-finite totals before insertion.

Modified Java groups: Role; Booking, Listing, User; BookingDAO, InquiryDAO, UserDAO,
AdminDAO; BaseController and Router; AddListingController, BookPropertyController,
OwnerBookingsController, RenterBookingsController, LoginController, RegisterController,
TopBarController, OwnerDashboardController, RenterDashboardController,
AdminBookingManagementController, AdminListingManagementController,
AdminUserManagementController. New definitions: DomainValues, UserStatus, ListingType,
ApprovalStatus, BookingStatus, InquiryStatus.

## Constraints and defaults

Apply phase2_consistency.sql to upgrade an existing database. rentnest.sql contains
the same target definitions for fresh installations.

- bookings.start_date and end_date become NOT NULL, without fabricated date defaults.
- bookings.total_amount becomes NOT NULL, preserving DEFAULT 0.00.
- bookings.status becomes NOT NULL, preserving DEFAULT PENDING and every existing enum value.
- inquiries.status becomes NOT NULL, preserving DEFAULT Pending and existing enum values.
- Nine CHECK constraints reject empty enum sentinels (roles, listing types, approvals,
  bookings, inquiries), inconsistent account flags, invalid booking date order/zero
  start dates, negative booking totals and negative payment amounts.
- users.active is constrained to 0/1 and must agree with ACTIVE/BANNED.
- A generated nullable listing_photos.primary_listing_id plus a unique index permits
  at most one primary photo per listing. Secondary photos produce NULL and remain
  unrestricted. Existing photo IDs, URLs and order are preserved.

The existing unique email, favorites(user_id,listing_id), amenity code/name and
listing_amenities composite primary key already enforce their intended uniqueness.
No unique username is imposed: login uses email and display names may repeat.
No unique payment-per-booking or booking-per-listing constraint is added: these
would incorrectly exclude multiple payments or different rental periods.

Optional descriptions, contact details, listing attributes and nullable owner IDs
remain nullable. Existing role, approval, availability, timestamps and image defaults
already suffice. No data is guessed or silently backfilled.

NOT NULL prevents stored NULLs. In permissive MySQL/MariaDB sessions, invalid NULL
inputs can be coerced to defaults; use STRICT_TRANS_TABLES for administrative/import
sessions when invalid input must fail. CHECKs additionally reject ENUM's empty
sentinel even in permissive mode. The migration does not alter global SQL mode.

## Index review

Each new composite replaces the narrower existing index with the same left prefix,
retaining foreign-key support without redundant indexes.

| New index | Replaces | Query benefit |
|---|---|---|
| bookings(listing_id,status,start_date,end_date) | idx_bookings_listing | Availability checks filter listing/status and read both dates from the index. The current OR range predicate may still require residual filtering. |
| bookings(renter_id,created_at) | idx_bookings_renter | Renter bookings filtered by renter and ordered by creation time. |
| bookings(owner_id,created_at) | idx_bookings_owner | Owner bookings filtered by owner and ordered by creation time. |
| messages(sender_id,receiver_id,listing_id,timestamp) | idx_messages_sender_receiver | Conversation participant pairs, optional listing and chronological reads. Both directions can use the pair prefix; OR queries may still sort. |
| messages(receiver_id,timestamp) | idx_messages_receiver | Receiver inbox filtered by receiver and ordered by timestamp. |
| inquiries(listing_id,status) | idx_inquiries_listing | Listing joins and owner counts restricted to pending inquiries. |
| inquiries(renter_id,created_at) | idx_inquiries_renter | Renter inquiry list ordered by creation time. |

The photo uniqueness index is the eighth new index, added for integrity.
Existing listings(owner_id), listings(approval_status,is_available), listing type,
monthly price, favorites pair/listing, messages(listing_id), and junction-table
indexes are retained. No location B-tree is added: current search uses leading
wildcards (%text%), which cannot use it for an efficient range lookup. Separate
booking date/status indexes and a redundant messages sender-only index are skipped.
There is no conversation/thread ID; the conversation is represented by participants
and optional listing_id. Index benefits are based on actual DAO predicates, not a
claim of measured speedup on the small seed database.

## Foreign keys

All 16 foreign keys are present; read-only checks found no orphan references.
Every ON UPDATE remains RESTRICT (immutable surrogate IDs). ON DELETE remains:

| Child reference | ON DELETE |
|---|---|
| listings.owner_id -> users | SET NULL |
| listing_photos.listing_id -> listings | CASCADE |
| listing_amenities.listing_id -> listings | CASCADE |
| listing_amenities.amenity_id -> amenities | RESTRICT |
| bookings.listing_id -> listings; renter_id/owner_id -> users | CASCADE |
| favorites.user_id -> users; listing_id -> listings | CASCADE |
| inquiries.listing_id -> listings; renter_id -> users | CASCADE |
| messages.listing_id -> listings | SET NULL |
| messages.sender_id/receiver_id -> users | CASCADE |
| payments.booking_id -> bookings | CASCADE |
| admin_actions.admin_id -> users | CASCADE |

SET NULL references remain nullable. Existing cascades can erase booking/payment,
message and audit history when their parents are deleted. This is an existing
retention-policy concern, not a dangling-reference defect. Changing it to RESTRICT
or introducing soft deletion would change deletion workflows; it is deferred.

## Apply the migration

Stop application and chat writers, back up the selected database, then open the
MySQL/MariaDB client with your own account and the rentnest database selected:

```sql
USE rentnest;
SOURCE C:/GitHub/RentNest/migrations/phase2_consistency.sql;
```

Do not use --force. MariaDB batch users can use --abort-source-on-error.
Required: MariaDB 10.2.1+ or MySQL 8.0.16+ with enforced CHECK constraints.
The installed server is MariaDB 10.4.32; MySQL 8 execution has not been tested here.
The migration checks engine/version and existing data before altering tables. It
refuses unexpected booking/inquiry enums instead of silently removing their values.
Invalid existing records abort the migration for explicit review, without rewriting
them. DDL implicitly commits; it is not transactionally rolled back. Successful
steps can be rerun after resolving a failure. Keep writers stopped until completion.

Diagnostics if preflight rejects existing data:

```sql
SELECT id, start_date, end_date, total_amount, status FROM bookings
WHERE start_date IS NULL OR end_date IS NULL OR start_date < '1000-01-01'
   OR end_date < start_date OR total_amount IS NULL OR total_amount < 0
   OR status IS NULL OR status='';
SELECT id, active, status, role FROM users
WHERE role='' OR active NOT IN (0,1)
   OR NOT ((active=1 AND status='ACTIVE') OR (active=0 AND status='BANNED'));
SELECT id, status FROM inquiries WHERE status IS NULL OR status='';
SELECT id, listing_type, approval_status FROM listings
WHERE listing_type='' OR approval_status='';
SELECT id, amount FROM payments WHERE amount < 0;
SELECT listing_id, COUNT(*) FROM listing_photos WHERE is_primary=1
GROUP BY listing_id HAVING COUNT(*) > 1;
```

## Verification

Build and run the standalone checks explicitly (the current Surefire configuration
does not discover these main-based checks):

```powershell
.\mvnw.cmd clean test dependency:build-classpath '-Dmdep.outputFile=target/schema-classpath.txt'
$cp = 'target/classes;target/test-classes;' + (Get-Content target/schema-classpath.txt -Raw).Trim()
& "$env:JAVA_HOME\bin\java.exe" -cp $cp SchemaAlignmentCheck
& "$env:JAVA_HOME\bin\java.exe" -cp $cp DomainConsistencyCheck
```

SchemaAlignmentCheck runs DAO SELECTs and server-prepares/intercepts 26 mutations,
executing no writes. DomainConsistencyCheck compares every enum with live column
metadata, rejects invalid Java inputs, checks defaults and all foreign keys.
Its optional rentnest_phase2_test_* schema argument enables rollback-only constraint
tests exclusively against disposable schemas. Do not pass the production schema.

The isolated checks cover migration, rerun, fresh install, valid enum round trips,
invalid enums, account disagreement, missing dates/amounts/statuses, date order,
negative amounts, duplicate favorites and duplicate primary photos. A separate
invalid-data fixture verifies preflight rejection happens before schema changes.

Verified locally: clean Maven build, both standalone checks against the live database
without mutations, constraint checks on upgraded and fresh disposable schemas,
migration rerun, and rejection before DDL. A before/after comparison of every original
column across all 11 seed tables confirmed that migration preserved their values.
ResponsiveLayoutCheck also passed; it reports existing CSS parser warnings. The four
disposable test databases were removed after verification. The live rentnest schema
and rows remain unchanged.

Remaining out of scope: booking overlap/concurrency workflow, nullable primitive
mapping beyond these enums, full listing form persistence, deletion retention policy,
and the absent payment/message-status workflows. Phase 2 does not implement them.
