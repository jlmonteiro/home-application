# Test Architecture

## Overview

The Home Application follows a robust testing strategy designed to ensure reliability, security, and performance across both frontend and backend modules.

## Test Pyramid

The project adheres to the standard test pyramid, prioritizing fast, isolated unit tests while maintaining high-confidence integration and E2E suites.

```mermaid
graph TD
    subgraph Pyramid
        E2E["<b>E2E Tests</b><br/>Playwright + MSW<br/>(Confidence)"]
        INT["<b>Integration Tests</b><br/>Spock + Testcontainers<br/>(Reliability)"]
        UNIT["<b>Unit Tests</b><br/>Vitest / Spock<br/>(Speed & Logic)"]
    end

    E2E --- INT
    INT --- UNIT

    style E2E fill:#f9f,stroke:#333,stroke-width:2px
    style INT fill:#bbf,stroke:#333,stroke-width:2px
    style UNIT fill:#bfb,stroke:#333,stroke-width:2px
```

## Test Frameworks and Tools

=== "Backend"

    | Name | Description / Purpose |
    |------|-----------------------|
    | [:material-test-tube: **Spock**](https://spockframework.org/) | Behavior-driven development (BDD) testing framework for Java and Groovy applications. |
    | [:simple-docker: **Testcontainers**](https://java.testcontainers.org/) | Provides lightweight, throwaway instances of PostgreSQL 17 for integration tests. |
    | [:material-api: **WireMock**](https://wiremock.org/) | Mocks external HTTP-based services like the Google People API. |
    | [:material-chart-bar: **JaCoCo**](https://www.jacoco.org/jacoco/) | Generates comprehensive code coverage reports for Java and Groovy code. |
    | [:material-shield-check: **Spring Security Test**](https://docs.spring.io/spring-security/reference/servlet/test/index.html) | Utilities for testing Spring Security configurations and role-based access control. |

=== "Frontend"

    | Name | Description / Purpose |
    |------|-----------------------|
    | [:simple-vitest: **Vitest**](https://vitest.dev/) | A blazing fast unit test runner for Vite-based projects. |
    | [:material-play-circle: **Playwright**](https://playwright.dev/) | Framework for reliable end-to-end testing across modern web browsers. |
    | [:material-network-outline: **MSW**](https://mswjs.io/) | Mock Service Worker for API mocking in both unit and E2E tests. |
    | [:material-react: **Testing Library**](https://testing-library.com/docs/react-testing-library/intro/) | Provides React DOM testing utilities that encourage accessible and resilient testing. |
    | [:material-xml: **Mantine Tests**](https://mantine.dev/guides/vitest/) | Specific utilities for testing Mantine 7 components and hooks. |

## Testing Layers

### 1. Unit Tests (Base)
- **Scope:** Individual components, services, and utility functions.
- **Frontend:** **Vitest** with Mantine / React Testing Library.
- **Backend:** **Spock** for business logic and adapter transformations.
- **Goal:** Exhaustive coverage of edge cases and business rules.

### 2. Integration Tests (Middle)
- **Scope:** API endpoints, database interactions, and external service contracts.
- **Tools:** **Spock** + **Testcontainers** (PostgreSQL 17).
- **External APIs:** **WireMock** for Google People API simulation.
- **Goal:** Verify data persistence, security constraints (RBAC), and transactional integrity.

### 3. E2E Tests (Top)
- **Scope:** Complete user journeys across the UI.
- **Tools:** **Playwright** with **MSW** (Mock Service Worker) for controlled state.
- **Goal:** Validate critical paths like onboarding, collaborative shopping, and role-based access.

## Coverage & Quality Targets

!!! note "[:octicons-rocket-24: NFR-2: Performance (Latency)](../../requirements/shared.md#nfr-2)"

    Performance tests MUST ensure that 95% of API requests complete in < 150ms.

| Metric | Target | Tool |
| :--- | :--- | :--- |
| **Code Coverage** | > 80% (Lines) | JaCoCo / Vitest |
| **Build Stability** | 100% Success | GitHub Actions |
| **API Latency** | < 150ms (p95) | Custom Metrics |
| **Security** | 0 Critical Vulnerabilities | Dependency Check |

## CI/CD Pipeline

Tests are executed automatically on every Pull Request via GitHub Actions. A change is only considered "Ready for Review" once all suites pass and coverage targets are met.
