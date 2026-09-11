# RentNest

A JavaFX desktop application for rental property management. RentNest uses MySQL for data storage and JavaFX for user interface, with support for property listings, bookings, chat, and role-based user management.

## Prerequisites

- Java 25 JDK installed
- Maven installed, or use the bundled wrapper:
  - Windows: `mvnw.cmd`
  - macOS/Linux: `./mvnw`
- MySQL server running

## Database Configuration

The application reads database settings from `src/main/resources/db.properties`.

Default connection values in this repository:

```properties
db.url=jdbc:mysql://localhost:3306/rentnest?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=Asia/Dhaka
db.user=root
db.password=
```

Steps:

1. Create a MySQL database named `rentnest`.
2. Update `db.user` and `db.password` in `src/main/resources/db.properties` as needed.
3. Make sure the configured user has access to the database.

4. Optionally import `rentnest.sql` to create the schema and seed sample data.

```bash
mysql -u root -p rentnest < rentnest.sql
```

> Note: `rentnest.sql` is now included in the repository and contains the database schema, constraints, and example seed data.

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

Use the dump for new installations only; do not re-import sample data over an existing database.

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
or MariaDB instance on `127.0.0.1:3307`, with a fresh database named
`rentnest_messaging_test` containing `rentnest.sql`, and root with an empty password.
Ports 5000 and 5050 must be free. The check redirects application JDBC connections
to that test database within its JVM; it never connects to the normal port 3306.
After `mvnw.cmd test`, run on Windows with JDK 25:

```powershell
$chatTestClasspath = "target/classes;target/test-classes;$env:USERPROFILE/.m2/repository/com/mysql/mysql-connector-j/9.0.0/mysql-connector-j-9.0.0.jar"
java -cp $chatTestClasspath MessagingIntegrationCheck
java -cp $chatTestClasspath MessagingIntegrationCheck restart
```

The second invocation checks persistent history with a restarted server in a new
JVM. These checks exercise database and socket behavior; JavaFX screen rendering
and unrelated application workflows still require manual smoke testing.

## Build and Run

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
- `src/main/java/DatabaseConnection.java` — provides shared JDBC connection handling
- `src/main/resources/db.properties` — database connection configuration
- `rentnest.sql` — database schema and sample data dump
- `src/main/resources/*.fxml` — JavaFX screens
- `src/main/resources/*.css` — application styles

## Key Notes

- The app starts from `Main.java` and loads the home screen via `Router.goToIndex()`.
- The database connection is established through `DBConfig` and `DatabaseConnection`.
- If you change database settings, restart the app after editing `db.properties`.

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

- If the app cannot find `db.properties`, confirm the file exists in `src/main/resources`.
- If the database connection fails, verify MySQL credentials and database availability.
- Ensure JavaFX 25 dependencies are available for your Java runtime.
