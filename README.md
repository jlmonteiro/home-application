# Home App

Backend services for managing my home.

This repository currently contains a Spring Boot backend module and Gradle multi-project configuration. It provides a REST API for managing user profiles, uses PostgreSQL for persistence, and applies database migrations via Liquibase. Authentication is handled via Google OAuth 2.0.

## Tech Stack
- Language: Java (toolchain set to Java 25)
- Build: Gradle (Kotlin DSL) with Gradle Wrapper
- Frameworks/Libraries:
  - Spring Boot 4.x (Web MVC, Data JPA, Security OAuth2 Client, Validation, Liquibase, Actuator, DevTools, Docker Compose support)
  - Lombok
  - Liquibase for DB migrations
  - Micrometer Prometheus registry (metrics)
- Database: PostgreSQL
- Tests: Spock (Groovy), Testcontainers (JUnit + Postgres)
- Code coverage: JaCoCo

## Modules
- `home-app-backend`: Spring Boot application containing API, services, entities, and persistence.

## Configuration

### Environment Variables
The following environment variables are required for Google OAuth 2.0:
- `GOOGLE_CLIENT_ID`: Your Google OAuth 2.0 Client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth 2.0 Client Secret

Standard Spring Boot datasource variables:
- `SPRING_DATASOURCE_URL` (default: `jdbc:postgresql://localhost:5432/homeapp`)
- `SPRING_DATASOURCE_USERNAME` (default: `homeapp`)
- `SPRING_DATASOURCE_PASSWORD` (default: `homeapp`)

### Google OAuth Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services > Credentials**.
4. Create **OAuth 2.0 Client IDs** for a Web application.
5. Add the following **Authorized redirect URIs**:
   - `http://localhost:8080/login/oauth2/code/google`
6. Copy the Client ID and Client Secret into your environment variables.

### Docker Compose
A `compose.yaml` is provided to start a PostgreSQL instance:
```bash
docker compose up -d postgres
```
The default credentials in `compose.yaml` match the application defaults (`homeapp/homeapp/homeapp`).

## How to Run
From the repository root using the Gradle Wrapper:

- Build: `./gradlew build`
- Run: `GOOGLE_CLIENT_ID=xxx GOOGLE_CLIENT_SECRET=yyy ./gradlew :home-app-backend:bootRun`

## API Endpoints
User Profile API (`/api/user`):
- `GET /api/user/{id}` → Returns `UserProfileDTO`. Requires authentication.
- `PUT /api/user/{id}` → Updates profile. Requires authentication.

## Testing
Run all tests with coverage:
```bash
./gradlew :home-app-backend:test
./gradlew :home-app-backend:jacocoTestReport
```
Tests use Testcontainers and do not require a local PostgreSQL instance.

## Migrations
Liquibase manages the schema. SQL changesets are located in `home-app-backend/src/main/resources/db/changelog/sql/`.
Primary keys use `BIGSERIAL` (Long), and users are identified by their database ID after an initial OAuth login.
