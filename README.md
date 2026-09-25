# RentNest

A JavaFX desktop application for rental property management. RentNest uses MySQL for data storage and JavaFX for user interface, with support for property listings, bookings, chat, and role-based user management.

## Prerequisites

- Java 25 JDK installed
- Maven installed, or use the bundled wrapper:
  - Windows: `mvnw.cmd`
  - macOS/Linux: `./mvnw`
- MySQL server running

## Database Configuration

RentNest and Maven Flyway share one external file: config/database.conf.
Copy config/database.conf.example to that ignored filename and fill in your existing
database URL, account and password. Empty local passwords are supported explicitly;
there is no built-in account or database address. Credentials are not packaged.

Set RENTNEST_DB_CONFIG to use a different external file in the IDE, packaged app,
chat servers or Maven. Restart the process after changing configuration.
See [the connection architecture report](docs/database-connections.md) for setup,
pool settings and the complete DAO call-site inventory.

For schema setup/upgrades, follow the [Flyway migration guide](migrations/README.md).
New databases run flyway:migrate; existing databases explicitly baseline at version 1.
Ordinary builds and application startup do not run migrations.

The root `rentnest.sql` remains a legacy schema/demo-data snapshot. Do not import
it over an existing or Flyway-managed database.

## Database Schema

The included `rentnest.sql` file creates the full database structure for the application, including:

- `users` — app users with roles (`RENTER`, `OWNER`, `ADMIN`)
- `listings` — rental properties and approval status
- `bookings` — reservation records with status tracking
- `favorites` — saved listings for users
- `messages` — stored chat messages between users
- `listing_photos` — listing image URLs
- `inquiries` — renter inquiries about listings
- `payments` — payment transaction records

Use Flyway for new installations and upgrades; do not re-import sample data over an existing database.

### Consolidating existing chat data

`messages` stores all persistent chat history, including real-time messages. The
project uses Java TCP sockets (not Socket.IO): `Server` on port 5000 and the legacy
`ChatServer` on port 5050. Both save through `MessageDAO` before forwarding.
`MessageController` sends through the server when connected and saves directly
only when disconnected. `ChatWindowController` retains its direct database path.

For an existing installation, back up the database, stop every app instance and
both servers, deploy the updated code, then run
`migrations/consolidate_messages.sql` against the existing database using the
MySQL client without `--force`. Keep writers stopped throughout migration.
The script inspects the schemas and counts, copies legacy messages with newly
generated IDs, verifies the copy, and only then drops the legacy table. It leaves
existing `messages` rows, indexes and foreign keys unchanged. Invalid foreign-key
references abort the copy.

If identical records exist in both tables, the script stops for review rather
than guessing whether they are duplicates. Compare listing, sender, receiver,
the exact message text and timestamp. Only if these are copies of the same sends,
call `CALL rentnest_consolidate_messages(TRUE);` in the MySQL client, then
`DROP PROCEDURE rentnest_consolidate_messages;`. Matching preserves repeated
identical sends one-for-one. If they are distinct sends, resolve that ambiguity
before proceeding. On other failures the procedure remains available for a
retry with `FALSE`; do not rerun its CREATE statement while it still exists.
If interrupted after the copy commits but before the drop, verify the committed
copy and retry with `TRUE`. Never drop the legacy table manually to bypass errors.

Messaging integration checks are in `src/test/java/MessagingIntegrationCheck.java`.
They run separately from Maven's default test discovery. Use a disposable MySQL
or MariaDB instance selected by a separate external configuration file, with a database named
`rentnest_messaging_test` containing the messaging fixtures and an explicitly configured account.
Ports 5000 and 5050 must be free. Set `RENTNEST_DB_CONFIG` to that test configuration before running; the check refuses
DML unless the selected database is named `rentnest_messaging_test`.
After `mvnw.cmd test`, run on Windows with JDK 25:

```powershell
.\mvnw.cmd test dependency:build-classpath '-Dmdep.outputFile=target/schema-classpath.txt'
$chatTestClasspath = 'target/classes;target/test-classes;' + (Get-Content target/schema-classpath.txt -Raw).Trim()
java -cp $chatTestClasspath MessagingIntegrationCheck
java -cp $chatTestClasspath MessagingIntegrationCheck restart
```

The second invocation checks persistent history with a restarted server in a new
JVM. These checks exercise database and socket behavior; JavaFX screen rendering
and unrelated application workflows still require manual smoke testing.

## Non-destructive schema alignment check

`SchemaAlignmentCheck` runs separately from Maven's default test discovery. It
uses the database configured in the external `config/database.conf`; the database
must already contain at least one listing. It does not import SQL or change rows.
Reads execute in read-only transactions. Write statements are prepared by the
server to validate their columns, but their execution is intercepted and their
parameter order is checked. This does not test write-time constraints or commits.

Run from the project root with JDK 25 (PowerShell):

```powershell
.\mvnw.cmd test dependency:build-classpath '-Dmdep.outputFile=target/schema-classpath.txt'
$schemaCheckClasspath = 'target/classes;target/test-classes;' + (Get-Content target/schema-classpath.txt -Raw).Trim()
& "$env:JAVA_HOME\bin\java.exe" -cp $schemaCheckClasspath SchemaAlignmentCheck
```

The canonical listing columns are `title` and `price_month`. Java's
`pricePerMonth` property maps to `price_month`; `imageUrl` is the `image_url`
query alias derived from `listing_photos.url`, not a column on `listings`.
Inquiry statuses are `Pending`, `Replied`, and `Closed`; renter cancellation uses
the existing booking status `CANCELLED`. No schema migration is needed for these
Java alignment changes.

## Build and Run

See the [Phase 5 model and DAO report](docs/model-dao-refactor.md) for persistence
contracts, service boundaries, transaction behavior and verification commands.
The [Phase 6 service-layer report](docs/service-layer.md) documents authorization,
validation, booking pricing, admin auditing and integration checks.

From the project root directory, run:

### Windows

```powershell
mvnw.cmd clean javafx:run
```

### macOS/Linux

```bash
./mvnw clean javafx:run
```

This launches the JavaFX application using the Maven JavaFX plugin.

## Project Structure

- `pom.xml` — Maven configuration, dependencies, and JavaFX plugin settings
- `src/main/java/Main.java` — JavaFX application entry point
- `src/main/java/DBConfig.java` — loads database connection properties
- `src/main/java/Database.java` — owns the shared HikariCP connection pool
- `config/database.conf.example` — credential-free template for the ignored external configuration
- `rentnest.sql` — database schema and sample data dump
- `src/main/resources/*.fxml` — JavaFX screens
- `src/main/resources/*.css` — application styles

## Key Notes

- The app starts from `Main.java` and loads the home screen via `Router.goToIndex()`.
- The database connection is established through `DBConfig` and the `Database` pool.
- If you change database settings, restart the app after editing the external configuration file.

## Packaging

To build a packaged JAR, use:

```bash
./mvnw package
```

If you need to run the JAR directly, ensure JavaFX modules are available on the runtime path.

## Common Commands

- Clean and run: `mvnw.cmd clean javafx:run`
- Package application: `mvnw.cmd package`

## Troubleshooting

- If configuration is missing, create `config/database.conf` or set `RENTNEST_DB_CONFIG`.
- If the database connection fails, verify MySQL credentials and database availability.
- Ensure JavaFX 25 dependencies are available for your Java runtime.

## Database consistency (Phase 2)

See [the Phase 2 report and migration instructions](migrations/phase2-consistency.md).
Phase 3 incorporates those corrections into Flyway V2. Use the
[Flyway migration guide](migrations/README.md) for both existing and new databases.
