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

> Note: This repository does not include a SQL schema script. If you need the schema, inspect the DAO classes or recreate the tables based on the application data model.

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
