# Home Application

Welcome to the **Home Application**, a centralized platform designed to empower families with collaborative household management tools. Built with a focus on privacy, real-time synchronization, and professional engineering standards.

<div class="grid cards" markdown>

-   :material-shopping: **Collaborative Shopping**
    
    Shared lists, intelligent price suggestions, and digital loyalty asset management.

-   :material-account-group: **Family Hierarchy**
    
    Role-based permissions and automated age-group classification for household members.

-   :material-shield-lock: **Google-Powered Security**
    
    Secure authentication via Google OAuth2 with a strict Zero-Trust API architecture.

-   :material-responsive: **Modern SPA**
    
    A blazing-fast, mobile-first React experience optimized for in-store usage.

</div>

---

## Technical Ecosystem

The project is architected as a **Gradle-managed monorepo**, ensuring atomic changes and high maintainability.

=== ":material-server: Backend"

    | Component | Technology |
    | :--- | :--- |
    | **Framework** | :simple-spring: Spring Boot 4.0 |
    | **Language** | :fontawesome-brands-java: Java 25 |
    | **Database** | :simple-postgresql: PostgreSQL 17 |
    | **API Pattern** | :material-link-variant: REST + HATEOAS (HAL) |
    | **Migrations** | :material-database-sync: Liquibase |

=== ":material-responsive: Frontend"

    | Component | Technology |
    | :--- | :--- |
    | **Library** | :fontawesome-brands-react: React 19 |
    | **UI System** | :material-palette: Mantine 7 |
    | **State** | :material-sync: TanStack Query v5 |
    | **Build** | :simple-vite: Vite 6 |
    | **Types** | :simple-typescript: TypeScript 5 |

=== ":material-test-tube: Verification"

    | Layer | Framework |
    | :--- | :--- |
    | **Integration** | :material-test-tube: Spock (Groovy) |
    | **Containers** | :simple-docker: Testcontainers |
    | **E2E** | :material-play-circle: Playwright |
    | **Mocks** | :material-network-outline: MSW / WireMock |

---

## Project Documentation

Explore the comprehensive documentation to understand the "Why", "How", and "What" of the application.

<div class="grid cards" markdown>

-   :material-book-open-page-variant: **[User Guide](help/getting-started.md)**
    
    Environment setup, feature tutorials, and troubleshooting for users and developers.

-   :material-file-document-edit: **[Requirements](specification/requirements/requirements.md)**
    
    The definitive source of truth using **EARS** syntax and traceable User Journeys.

-   IconPencil **[Technical Design](specification/design/design.md)**
    
    Detailed architecture, ER diagrams, and frontend component patterns.

-   :material-api: **[API Reference](specification/design/backend/api/index.md)**
    
    Complete REST contract with interactive testing via **ReDoc** integration.

</div>

---

## Engineering Methodology

!!! abstract "Spec-Driven Development (SDD)"
    This project strictly follows the **SDD** philosophy. We formalize requirements and architectural design *before* implementation, ensuring every feature is transactional, verifiable, and directly linked to a business need.

    [:material-arrow-right: Learn more about our SDD Workflow](specification/index.md)
