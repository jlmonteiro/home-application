# Development Guide

This guide outlines the core development practices and architecture for the Home App project. All contributors (including AI models) must adhere to these standards.

## Quick Start Commands

| Action | Command |
|--------|---------|
| **Build** | `./gradlew build` |
| **Run** | `./gradlew :home-app-backend:bootRun` |
| **Test** | `./gradlew :home-app-backend:test` |
| **Test specific** | `./gradlew :home-app-backend:test --tests "UserProfileServiceSpec"` |
| **Coverage report** | `./gradlew :home-app-backend:jacocoTestReport` |

## Project Architecture

Single-module Spring Boot 4 / Java 25 backend (`home-app-backend`). Packages are under `com.jorgemonteiro.home_app`.

### Layer Responsibilities

1.  **Controller:** `controller.<schema>` — HTTP only — delegate to service, return DTOs.
2.  **Service:** `service.<schema>` — Business logic, `@Transactional` boundaries.
3.  **Repository:** `repository.<schema>` — Data access only, extends `JpaRepository`.
4.  **Model:** `model.dtos`, `model.entities`, `model.adapter` — DTOs, JPA entities, DTO↔entity adapters.

**Rule:** Entities must never be exposed in API responses — always convert via an adapter to a DTO first.

## Detailed Rules & Guidelines

The project uses modular rule files located in `.kiro/rules/`. Refer to these for specific conventions:

- [**Java Conventions**](.kiro/rules/java.md): Package structures, exception handling, and layer scopes.
- [**Database & Liquibase**](.kiro/rules/database.md): Schema design, migration naming, and JPA/Hibernate mapping.
- [**Testing (Spock/Groovy)**](.kiro/rules/tests.md): BDD style, Testcontainers, and Mockito usage.
- [**Gradle Build**](.kiro/rules/gradle-build.md): Multi-module structure and dependency management.
- [**Documentation**](.kiro/rules/documentation.md): Javadoc requirements and commit message standards.
- [**Project Specifications**](.kiro/rules/project-specs.md): How to structure feature specifications and development workflows.

## Feature Implementation Process

Feature specifications follow a three-file pattern in `.kiro/specs/<NN>-<feature-name>/`:
1.  `requirements.md`: WHAT is being built.
2.  `design.md`: HOW it is built.
3.  `tasks.md`: ACTIONABLE breakdown.
