# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build
./gradlew build
./gradlew :home-app-backend:build

# Run
./gradlew :home-app-backend:bootRun

# Test (uses Testcontainers — no external DB needed)
./gradlew :home-app-backend:test
./gradlew :home-app-backend:test --tests "UserProfileServiceSpec"
./gradlew :home-app-backend:test --tests "UserProfileServiceSpec.getUserProfile*"

# Coverage report
./gradlew :home-app-backend:jacocoTestReport
```

Docker Compose is optional for local development — `spring-boot-docker-compose` starts PostgreSQL automatically when running the app. Tests use Testcontainers independently.

## Architecture

Single-module Spring Boot 4 / Java 25 backend (`home-app-backend`). Packages are under `com.jorgemonteiro.home_app`.

### Layer responsibilities

| Layer | Package | Rule |
|-------|---------|------|
| Controller | `controller.<schema>` | HTTP only — delegate to service, return DTOs |
| Service | `service.<schema>` | Business logic, `@Transactional` boundaries |
| Repository | `repository.<schema>` | Data access only, extends `JpaRepository` |
| Model | `model.dtos`, `model.entities`, `model.adapter` | DTOs, JPA entities, DTO↔entity adapters |

Entities must never be exposed in API responses — always convert via an adapter to a DTO first.

### Exception handling

- All custom exceptions extend `HomeAppException` (→ HTTP 500)
- `ObjectNotFoundException` extends `HomeAppException` (→ HTTP 404)
- `GlobalExceptionHandler` (`@RestControllerAdvice`) centralizes all HTTP error mapping
- Never throw raw `RuntimeException`

### Database

- PostgreSQL with Liquibase migrations (XML master + SQL changesets)
- SQL files: `src/main/resources/db/changelog/sql/`, named `NN-description.sql`
- Always use `--liquibase formatted sql` header and include rollback statements
- `ddl-auto=validate` — schema managed exclusively by Liquibase
- Use `BIGSERIAL` for primary keys, snake_case columns, schema-qualified table names (`schema.table`)
- JPA entities: `@Table(name="...", schema="...")`, LAZY loading preferred

### Testing

- Spock 2.4 (Groovy) with BDD style (`given/when/then`)
- All tests extend `BaseIntegrationTest` which wires Testcontainers PostgreSQL 15
- Test data loaded via `@Sql("/scripts/sql/<file>.sql")` — tests are `@Transactional` (auto-rollback)
- Use Mockito for mocks (not Spock built-ins); prefer injected real dependencies over mocks when possible
- Controller tests use MockMvc; service tests call the service directly

### Dependencies

All versions live in `gradle/libs.versions.toml`. Use bundles for related dependencies. Add new dependencies there first, then reference via `libs.<alias>` in `build.gradle.kts`.

## Project specs

Feature specifications follow a three-file pattern in `.kiro/specs/<NN>-<feature-name>/`:
- `requirements.md` — business/user perspective (WHAT)
- `design.md` — technical implementation (HOW)
- `tasks.md` — actionable breakdown

Rules for Java conventions, testing, database, and Gradle are in `.kiro/rules/`.
