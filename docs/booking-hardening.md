# Phase 8: booking workflow hardening

## Workflow trace

Browse/search/featured use ListingService and expose only approved, available
listings. Details obey the same visibility rule (with owner/admin private access).
BookProperty now reads both start and departure dates; the new end-date picker uses
the existing form styling. The controller calls BookingService.request with both
dates. No one-month duration is inferred.

The service requires an active renter, prohibits renting their own property,
re-reads/locks the listing, validates approval/availability and dates, derives the
owner/renter/initial status/amount, then checks overlaps and inserts in one
transaction. Submitted identity, status and amount fields are not trusted.

Owner decision handlers use service authorization and persisted state. Admin
approve/reject handlers are now wired to the same transition rules with atomic
audit records. Admin deletion does not erase bookings; the handler explains that
cancellation retains history. BookingDAO no longer exposes a delete operation.

Payment processing remains a pre-existing placeholder. payments has amount/date
records, but there is no checkout, refund or payment-status workflow. Approval is
not evidence of payment. No fake payment state or processor was introduced.

## Dates, occupancy and locking

Periods are half-open: start is included, departure is excluded. Start must be
today or later, start < end, and dates must fit the SQL DATE range. The overlap
query is exactly:

```sql
existing.start_date < requested.end_date
AND existing.end_date > requested.start_date
```

PENDING and PENDING_OWNER_APPROVAL continue to reserve a provisional hold, preserving
the existing occupancy policy. APPROVED and CONFIRMED reserve occupancy too.
CANCELLED and REJECTED do not. The existing schema has no hold-expiry field; pending
holds remain until a decision/cancellation or their dates pass.

Booking transactions use READ_COMMITTED, lock the parent listing FOR UPDATE first,
and use current locking reads for conflicts. Decisions follow the same parent-first
lock order, then lock the booking row. Approval rechecks listing eligibility and
overlap, excluding itself. This serializes competing requests/decisions per listing.
Hikari resets connection transaction state when the lease closes. External SQL
writers must follow the same lock protocol to obtain the concurrency guarantee.

Prices use the stored monthly rate: full calendar months from the chosen start date,
then remaining days prorated to the next start-date-anchored monthly boundary,
rounded to two decimals. Month-end dates are handled without charging more than the
following full-month boundary. This retains monthly listing pricing while accepting
explicit durations; changing the pricing policy is a separate product decision.

## State transitions and history

| Current persisted status | Permitted next status | Who |
| --- | --- | --- |
| PENDING / PENDING_OWNER_APPROVAL | CONFIRMED / REJECTED | Current listing owner matching booking owner, or admin |
| PENDING / PENDING_OWNER_APPROVAL | CANCELLED | Booking renter, owner or admin |
| APPROVED / CONFIRMED | CANCELLED | Owner or admin |
| CANCELLED / REJECTED | None | Terminal |

Same-state requests do not write. Ended bookings cannot be modified, and approval
cannot happen after the start date. Confirmed/approved bookings display ACTIVE
during their dates and COMPLETED at/after departure, derived from dates without
rewriting historical persisted statuses or extending the database enum. Other
transitions fail in the backend, regardless of the controller that called it.

V4 strengthens the date constraint and replaces the three booking parent foreign
keys with ON DELETE RESTRICT / ON UPDATE CASCADE. Deleting an owner/renter/listing
can no longer cascade away bookings (and their payments). Existing bookings and
payment records are preserved. Direct privileged deletion outside the application
is not prevented by a database trigger; application/service and parent-delete paths
are protected. Use moderation/unavailability instead of deleting referenced users
or listings.

## Migration precautions

V4 is additive except for replacing FK behavior; it does not rewrite dates/statuses
or delete data. Check invalid legacy durations before migration:

```sql
SELECT id, start_date, end_date FROM bookings
WHERE start_date IS NULL OR end_date IS NULL OR start_date >= end_date;
```

If records require correction, review their real intended dates; do not silently add
a day or delete history. Back up and stop old app/server writers, then use the normal
Flyway migrate/validate commands. Fresh databases use V1 -> V2 -> V3 -> V4; legacy
databases first follow the baseline-1 guide. No applied V1/V2 migration was edited.

## Tests and bindings

BookingWorkflowCheck runs only against disposable rentnest_phase8_test and covers:

- Separated dates and exact boundaries before/after an existing booking.
- Both partial-overlap directions, contained/enclosing ranges and duplicates.
- Every canonical status's occupancy behavior.
- Two simultaneous attempts by different renters: one committed row.
- Unauthorized cancellation/approval, own-property rental, unavailable/unapproved
  listings, impossible transitions and revalidation at approval.
- Server-derived amount/identity/status, month-end proration and historical completion.
- History-preserving FK failures and database rejection of zero-length periods.
- Actual owner/renter/admin FXML controller loading and every booking table cell binding.

Booking table factories now reference typed model getters instead of string property
names. Admin dates use LocalDate properties and tolerate null values. There were no
remaining nonexistent booking property names after the Phase 5 renaming; this makes
future mistakes compile-time failures.

The local MySQL instance stopped completing connection handshakes during this phase.
It was left untouched. Migration and booking tests ran on a separate MariaDB 10.4.32
instance in the ignored target directory on port 33318. Fresh V1–V4 migration,
validation and a second no-op migrate passed. BookingWorkflowCheck passed there.
No migrations or booking writes were executed against the current RentNest database.
The final Maven package build passed. Final AuthenticationSecurityCheck,
SchemaAlignmentCheck (25 intercepted writes, zero executed writes),
DomainConsistencyCheck and ResponsiveLayoutCheck passed as well. Existing CSS
parser warnings remain. The isolated database server was shut down after testing;
its disposable data/logs remain under ignored target/ and its test configs were removed.

Run with a fresh disposable schema and separate RENTNEST_DB_CONFIG:

```powershell
.\mvnw.cmd test dependency:build-classpath '-Dmdep.outputFile=target/schema-classpath.txt'
$cp = 'target/classes;target/test-classes;' + (Get-Content target/schema-classpath.txt -Raw).Trim()
& "$env:JAVA_HOME\bin\java.exe" -cp $cp BookingWorkflowCheck
```

These main-based checks require explicit execution; Maven currently compiles them
without discovering them automatically. The existing booking name/contact/note
fields still have no schema columns/persistence; this phase does not invent storage
for unrelated form fields.
