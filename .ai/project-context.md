# Project Context: Home App

## Overview
A household management platform with a Spring Boot backend and React frontend. Provides modular features (shopping lists, user profiles, settings) for household members to collaborate on shared resources.

## Modules
- `home-app-backend`: Spring Boot REST API (Java 25, Gradle Kotlin DSL)
- `home-app-frontend`: React SPA (TypeScript, Vite, Mantine UI)

## Tech Stack

### Backend
- Java 25, Spring Boot 4.x (Web MVC, Data JPA, Security OAuth2, Validation, Actuator)
- PostgreSQL + Liquibase migrations
- Google OAuth 2.0 authentication
- Lombok, Spring HATEOAS, Micrometer/Prometheus
- Tests: Spock (Groovy) + Testcontainers

### Frontend
- React 19, TypeScript, Vite
- Mantine 7 (UI components), TanStack Query v5 (server state)
- Tabler Icons, react-barcode, qrcode.react

## Architecture

### Backend Layers (package root: `com.jorgemonteiro.home_app`)
- `controller.<schema>` — HTTP only, delegates to service, returns DTOs
- `service.<schema>` — Business logic, `@Transactional`
- `repository.<schema>` — JPA repositories
- `model.dtos` / `model.entities` / `model.adapter` — DTOs, entities, adapters

**Rule:** Entities are never exposed in API responses — always convert via adapter to DTO.

### API Design
- REST with HATEOAS (`application/hal+json`)
- Error handling via RFC 7807 (ProblemDetail)
- Base paths: `/api/user`, `/api/shopping`, `/api/settings`

## Key Features
- Google OAuth2 login with automatic user registration
- User profile management (birthdate, family role, photo, social links)
- Shopping lists with collaborative real-time updates
- Store management with loyalty cards (barcode/QR) and coupons
- Settings: family roles and age group configuration (adults only)
- Automated age group classification and data retention (3-month purge)

## Database
- PostgreSQL 16+, schemas: `profiles`, `shopping`
- All tables include `created_at`, `updated_at`, `version` (optimistic locking)
- PKs use `BIGSERIAL` (Long)
- Liquibase changesets in `home-app-backend/src/main/resources/db/changelog/sql/`

## Development Conventions
- Detailed rules in `.kiro/rules/`: `java.md`, `database.md`, `tests.md`, `gradle-build.md`, `documentation.md`, `project-specs.md`
- Feature specs follow three-file pattern in `.kiro/specs/<NN>-<feature-name>/`: `requirements.md`, `design.md`, `tasks.md`
- Tests use Spock BDD style; Testcontainers for integration tests (no local DB needed)

## Software Design Document (SDD)
The SDD lives in `docs/specification/` and is the authoritative source for system design. Always consult it before implementing features.

### Structure
- `docs/specification/requirements.md` — Full requirement index (FRs, NFRs, UJs) with links to per-domain files
- `docs/specification/requirements/` — Per-domain requirement details: `auth-profile.md`, `shopping-list.md`, `settings.md`, `shared.md`, `documentation.md`
- `docs/specification/design.md` — Architecture, component design, API contracts, data model (ER diagram), DB migration rules, performance and error handling strategy
- `docs/specification/test-strategy.md` — Testing approach and coverage expectations
- `docs/specification/TBD.md` — Pending/undecided design items
- `docs/specification/<NN>-<feature-name>/tasks.md` — Implementation task breakdown per feature (e.g. `03-shopping-list/tasks.md`, `04-family-hierarchy/tasks.md`)
- `docs/specification/.current_transaction` — Tracks the feature currently in progress

### Key Design Decisions (from SDD)
- REST API uses HATEOAS (`application/hal+json`) and RFC 7807 error format
- API base paths: `/api/user`, `/api/shopping`, `/api/settings`
- DB schemas: `profiles`, `shopping` — all tables require `created_at`, `updated_at`, `version`
- Entities are never exposed directly — always converted via adapter to DTO
- Settings module (`/api/settings`) is restricted to adults only
- Automated tasks: age group recalculation (daily 00:01), data retention purge (daily 02:00, 3-month threshold)
- Frontend: React 19 + Mantine 7 + TanStack Query v5; optimistic updates for list item check-off

### Workflow
When implementing a feature:
1. Check `docs/specification/.current_transaction` for the active feature
2. Read the relevant requirement file under `docs/specification/requirements/`
3. Consult `docs/specification/design.md` for API contracts and data model
4. Follow the task breakdown in `docs/specification/<NN>-<feature-name>/tasks.md`

## Environment Variables
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (required)
- `SPRING_DATASOURCE_URL` (default: `jdbc:postgresql://localhost:5432/homeapp`)
- `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD` (default: `homeapp`)

## Common Commands
```bash
./gradlew build
./gradlew :home-app-backend:bootRun
./gradlew :home-app-frontend:run
./gradlew :home-app-backend:test
./gradlew :home-app-backend:jacocoTestReport
docker compose up -d postgres
```

## Project Agent

The project uses a Kiro agent defined in `.kiro/agents/home-app.json`.

- **Name:** `home-app`
- **Tools:** `fs_read`, `fs_write`, `execute_bash`, `grep`, `glob`, `code`, `use_aws`
- **Resources:**
  - `docs/project-context.md` — this file, loaded as project context
  - `.ai/skills/**/SKILL.md` — all skill definitions
- **MCP Servers:** none (GitHub interactions use the `gh` CLI via `execute_bash`)
