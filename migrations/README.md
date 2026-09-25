# RentNest database migrations

Flyway is the schema upgrade mechanism from Phase 3 onward. It is invoked explicitly
through Maven; building or starting the JavaFX application never migrates a database.
Phase 4: the app and Flyway now share the same ignored external config/database.conf,
selected optionally with RENTNEST_DB_CONFIG. There is no credential-bearing classpath
resource. See [connection configuration](../docs/database-connections.md).

## Dependencies and files

pom.xml pins org.flywaydb:flyway-maven-plugin:13.8.0. Its plugin dependencies are
org.flywaydb:flyway-mysql:13.8.0 and the existing MySQL Connector/J 9.0.0. Flyway core
is brought in transitively by the plugin. There is no new application-runtime
dependency or automatic startup migration. Maven packages the SQL resources in the JAR.

Migration location: src/main/resources/db/migration/

| Order | File | Purpose |
|---|---|---|
| Adoption callback only | beforeBaseline.sql | Checks all 11 canonical tables, 73 column names/types and six enum definitions; rejects an unresolved socket_messages table. Does not alter application tables or rows. |
| 1 | V1__initial_rentnest_schema.sql | Creates the canonical schema before Phase 2, including title and price_month. Structure only; no sample users, passwords or listings. |
| 2 | V2__domain_consistency_and_constraints.sql | Applies the Phase 2 required fields, checks, primary-photo uniqueness and index replacements while preserving rows. Accepts a schema already corrected manually. |

Phase 1 corrected Java queries; it did not require renaming database columns.
V1 therefore uses the already-canonical database names. V2 is derived from the
reviewed Phase 2 migration, with MariaDB version-suffix parsing fixed for strict
JDBC sessions. See [Phase 2 decisions](phase2-consistency.md) for constraint/index details.

Versioned migrations run once, in order, tracked in flyway_schema_history. A second
migrate is a no-op. Checksums detect edits to applied versioned files. V1 deliberately
does not use CREATE TABLE IF NOT EXISTS to hide unexpected existing tables. V2 has
guards to adopt the earlier manually applied correction, not to bypass history.
There is no DROP DATABASE, sample-data import or database-name switch in these files.

## Configure the connection

Run from the repository root with JDK 25. Copy config/database.conf.example to
config/database.conf, then fill in flyway.url, flyway.user and flyway.password using
your existing connection settings. The application and Maven both read this file.
An explicitly empty password is supported for local accounts. No credentials or
JDBC endpoint defaults are supplied by the code or template.

Use RENTNEST_DB_CONFIG to select a different external file; the Maven profile reads
the same variable as the application. The file is UTF-8 Java properties format.
Confirm the target database before baseline/migrate. The config file is ignored by
Git and excluded from the application JAR. Do not use Maven -X with credentials or
pass passwords on the command line.

Remove old FLYWAY_URL, FLYWAY_USER, FLYWAY_PASSWORD and FLYWAY_CONFIG_FILES overrides,
and review any user-level flyway.conf/settings.xml, so Flyway cannot target a database
different from the application's single external configuration.

The migration account needs SELECT and schema-history DML, CREATE/ALTER/INDEX,
CREATE ROUTINE, ALTER ROUTINE and EXECUTE permissions on the selected database.
Creating a new database is a separate administrative operation. Require MariaDB
10.2.1+ or MySQL 8.0.16+ so CHECK constraints are enforced. The locally verified
engine is MariaDB 10.4.32 with JDK 25 and Connector/J 9.0.0; MySQL 8 is not tested here.

## New database

Create an empty database once through the MySQL/MariaDB client:

```sql
CREATE DATABASE rentnest CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_520_ci;
```

If rentnest already exists, follow the existing-database instructions instead.
With the connection configured:

```powershell
.\mvnw.cmd flyway:info
.\mvnw.cmd flyway:migrate
.\mvnw.cmd flyway:validate
.\mvnw.cmd flyway:info
```

V1 creates the 11 application tables; V2 applies the consistency constraints. Flyway
adds its history table. Both versions should show Success. No baseline command is
used for a fresh database. No demo/admin account is created. Do not import rentnest.sql
after migrating: that legacy snapshot includes CREATE TABLE statements and demo data.

## Existing RentNest database

1. Back up the database and stop all app instances and both chat servers.
2. Confirm the selected host/database and compare the schema with V1. The adoption
   callback rejects missing canonical columns, tables and enum mismatches, but is
   not a complete schema-diff tool: also review custom defaults, indexes, constraints,
   foreign keys and any local changes. title/price_month must already exist.
3. If socket_messages exists, review and finish the separately documented
   [chat consolidation](../README.md#consolidating-existing-chat-data) first.
   It is deliberately not auto-run by Flyway because message identity can need review.
4. Run:

```powershell
.\mvnw.cmd flyway:info
# Only once, for the verified existing schema without Flyway history:
.\mvnw.cmd flyway:baseline
.\mvnw.cmd flyway:migrate
.\mvnw.cmd flyway:validate
.\mvnw.cmd flyway:info
```

The configured baselineVersion is **1**, even if Phase 2 was already applied manually.
Baseline records adoption without executing V1 or recreating application tables.
V2 then applies missing corrections or recognizes those already present and records
its checksum. Expect V1 to be Ignored (Baseline), a version-1 BASELINE row, and V2 Success.
Do not baseline at 2, which would skip V2's checks.

If the database already has Flyway history, skip baseline and use info, validate and
migrate. Never delete the history table to force execution. Flyway's validate checks
history/checksums; it does not prove that every physical table still matches the SQL.

V2 checks existing data before its table alterations. A NULL booking date/status,
negative amount, account-state disagreement or duplicate primary photo causes an
explicit failure, not a guessed correction. Use the diagnostics in the Phase 2 report
to resolve the affected records before retrying.

## Status and future changes

```powershell
.\mvnw.cmd flyway:info       # Applied, baselined, pending or failed migrations
.\mvnw.cmd flyway:validate   # Check applied versioned files against stored checksums
.\mvnw.cmd flyway:migrate    # Apply only pending versions
```

Add future changes as V3__description.sql, V4__description.sql, etc. Never modify,
rename or delete a versioned migration after it has been applied to a shared database.
Use a new corrective migration. Migration files have no passwords, CREATE DATABASE,
USE rentnest or seed-account inserts.

baselineOnMigrate=false prevents accidental adoption of an unrecognized nonempty
database. cleanDisabled=true disables Flyway's destructive clean command;
createSchemas=false requires choosing an already-created database. There are no
lifecycle-bound executions. Normal mvnw.cmd clean package remains database-independent:
Maven clean only removes build output and does not invoke Flyway clean.

## Interrupted or failed migrations

MySQL/MariaDB DDL implicitly commits. Flyway history/checksums do not make DDL
transactional and repair does not roll back schema changes.

Keep writers stopped. Inspect flyway:info and the database, determine which statements
committed, and restore from backup or complete a reviewed recovery. Only after this
review should flyway:repair remove a failed history entry, followed by migrate.
Never use repair to hide an unexplained checksum mismatch. V2's guards allow a reviewed
retry after partial completion. A failed adoption callback may leave its helper
procedure; rerunning baseline after resolving the cause recreates and removes it.

The old phase2_consistency.sql is retained for historical/manual-install compatibility.
After adopting Flyway, do not source it or edit it to deliver future changes: use
new versioned files. The root rentnest.sql is a legacy demo snapshot, not an upgrade path.

## Verification performed

- Empty database: V1 and V2 applied, validate passed, repeat migrate did nothing.
- Existing seeded schema: explicit baseline 1 then V2 succeeded.
- Already-corrected seeded schema: explicit baseline 1 then V2 succeeded.
- Nonempty database without a baseline was rejected by migrate.
- Unrelated schema was rejected by beforeBaseline.
- A modified copy of V2 failed checksum validation; original files were preserved.
- Flyway clean was rejected by cleanDisabled.
- Before/after fingerprints confirmed every original column value was preserved
  in both seeded adoption fixtures. The live rentnest database was unchanged and
  still has no Flyway history table; adoption has not been run there.
- Clean Maven package build passed. All three SQL resources are included in the JAR.
  Standalone domain/constraint checks passed on both migrated seeded fixtures;
  the DAO schema check passed with 26 intercepted writes and zero executed writes.
  These main-based checks are run explicitly, not discovered by the current Surefire.
- All five disposable Flyway test databases were removed after verification.

The Maven configuration follows the official [Flyway Maven documentation](https://documentation.red-gate.com/fd/maven-goal-277579365.html)
and uses its separate [MySQL support module](https://documentation.red-gate.com/fd/mysql-277579322.html).
The adoption workflow follows the [baseline command documentation](https://documentation.red-gate.com/flyway/reference/commands/baseline).
