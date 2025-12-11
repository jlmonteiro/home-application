# Home App

Backend services for managing my home.

This repository currently contains a Spring Boot backend module and Gradle multi-project configuration. It provides a small REST API for managing user profiles, uses PostgreSQL for persistence, and applies database migrations via Liquibase. Tests are written with Spock (Groovy) and JUnit Platform. JaCoCo is configured for test coverage.

## Tech Stack
- Language: Java (toolchain set to Java 25)
- Build: Gradle (Kotlin DSL) with Gradle Wrapper
- Frameworks/Libraries:
  - Spring Boot 4.x (Web MVC, Data JPA, Validation, Liquibase, Actuator, DevTools, Docker Compose support)
  - Lombok
  - Liquibase for DB migrations
  - Micrometer Prometheus registry (metrics)
- Database: PostgreSQL
- Tests: Spock (Groovy), Testcontainers dependencies are present (JUnit + Postgres), Spring Boot test starters
- Code coverage: JaCoCo

## Modules
- `home-app-backend`: Spring Boot application containing API, services, entities, and persistence.

## Project Structure (key paths)
```
home-app
├── build.gradle.kts                    # Root Gradle config
├── settings.gradle.kts                 # Declares modules (includes home-app-backend)
├── compose.yaml                        # Docker Compose (PostgreSQL service)
├── gradle/                             # Gradle wrapper and versions catalog
├── home-app-backend/
│   ├── build.gradle.kts                # Backend module build config
│   ├── src/main/java/com/jorgemonteiro/home_app/
│   │   ├── HomeApplication.java        # Spring Boot entry point
│   │   ├── config/                     # Global exception handling
│   │   ├── controller/                 # REST controllers
│   │   ├── model/                      # DTOs, entities, adapters
│   │   ├── repository/                 # Spring Data repositories
│   │   └── service/                    # Business services
│   ├── src/main/resources/
│   │   ├── application.yaml            # App configuration
│   │   └── db/changelog/               # Liquibase changelogs (XML + SQL)
│   └── src/test/                       # Spock tests, integration helpers, test resources
├── HELP.md                             # Spring Boot auto-generated references
└── README.md                           # This file
```

## Requirements
- Java 25 (managed via Gradle toolchains; auto-download enabled)
- Docker and Docker Compose (optional, for local PostgreSQL)
- Access to a PostgreSQL instance if not using Docker

## Configuration
Configuration defaults are defined in `home-app-backend/src/main/resources/application.yaml`:
- `spring.datasource.url`: `jdbc:postgresql://localhost:5432/homeapp`
- `spring.datasource.username`: `homeapp`
- `spring.datasource.password`: `homeapp`
- Liquibase changelog: `classpath:db/changelog/db.changelog-master.xml`
- JPA: `ddl-auto=validate`, PostgreSQL dialect

Test configuration (`home-app-backend/src/test/resources/application-test.yaml`) uses:
- `jdbc:postgresql://localhost:5432/mydatabase`
- username: `myuser`
- password: `secret`

Environment variables commonly used by Spring Boot (override as needed):
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `SPRING_PROFILES_ACTIVE`

### Docker Compose
`compose.yaml` defines a `postgres` service:
```
services:
  postgres:
    image: postgres:latest
    environment:
      - POSTGRES_DB=mydatabase
      - POSTGRES_PASSWORD=secret
      - POSTGRES_USER=myuser
    ports:
      - "5432"
```

TODO:
- The port mapping is listed as `"5432"`. Consider changing to an explicit host mapping like `"5432:5432"` if you want to expose Postgres on the host.
- Compose uses `mydatabase/myuser/secret` while `application.yaml` defaults use `homeapp/homeapp/homeapp`. Align either the application config or compose env variables for consistency.

## How to Run
From the repository root using the Gradle Wrapper:

- Build all modules:
```
./gradlew build
```

- Run the backend application:
```
./gradlew :home-app-backend:bootRun
```
The main class is `com.jorgemonteiro.home_app.HomeApplication`.

- Start PostgreSQL via Docker Compose (optional):
```
docker compose up -d postgres
```
Then configure `SPRING_DATASOURCE_*` to match the compose credentials (see TODO above) or update `application.yaml` accordingly.

## API Endpoints (current)
User Profile API (`/api/user`):
- `GET /api/user/{email}` → 200 with `UserProfileDTO` if found, otherwise 404
- `PUT /api/user/{email}` → Updates profile (validates request). 200 with updated `UserProfileDTO` or 404 if not found; 400 for invalid input

Example request:
```
curl -s http://localhost:8080/api/user/jane.doe@example.com
```
```
curl -s -X PUT \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Jane","lastName":"Doe","enabled":true}' \
  http://localhost:8080/api/user/jane.doe@example.com
```

## Development
- Dev tools: Spring Boot DevTools is included for hot reload (in development scope)
- Metrics: Micrometer Prometheus registry is on the classpath. Exposing and scraping endpoints depends on your Spring Boot actuator configuration (not explicitly set here).

## Testing
Run all tests with coverage:
```
./gradlew :home-app-backend:test
./gradlew :home-app-backend:jacocoTestReport
```
Spock tests (Groovy) are under `home-app-backend/src/test/groovy`. Integration tests use Spring Boot testing support; SQL test data is under `src/test/resources/scripts/sql/`.

## Useful Gradle Tasks
- `./gradlew tasks` — list tasks
- `./gradlew :home-app-backend:bootRun` — run app
- `./gradlew :home-app-backend:test` — run tests
- `./gradlew :home-app-backend:jacocoTestReport` — coverage report (HTML + XML)

## Migrations
Liquibase is enabled with the master changelog at `src/main/resources/db/changelog/db.changelog-master.xml`, which includes SQL changesets in `db/changelog/sql/`.

## Scripts
There are no custom shell scripts in the repository. Use the Gradle Wrapper and Docker Compose commands shown above.

## Environment Variables Summary
- `SPRING_DATASOURCE_URL` (e.g., `jdbc:postgresql://localhost:5432/homeapp`)
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `SPRING_PROFILES_ACTIVE` (e.g., `dev`, `test`, `prod`)

## License
No license file is present in the repository.

TODO: Add a `LICENSE` file and update this section accordingly.
