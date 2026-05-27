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
- `socket_messages` — socket chat history support
- `listing_photos` — listing image URLs
- `inquiries` — renter inquiries about listings
- `payments` — payment transaction records

If you change the schema or seed data, re-import the file into your local `rentnest` database and restart the app.

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
