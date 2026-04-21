# Development Guidelines

## Knowledge Base Overview

The **Development Guidelines** section serves as the centralized knowledge base for the Home Application ecosystem. It defines the technical standards, architectural patterns, and coding conventions that ensure consistency across the entire project. This repository of knowledge is designed to guide human developers and provide high-signal context for AI agents, establishing a clear "Source of Truth" for how logic should be reasoned, produced, and maintained.

By formalizing these patterns, we enable a highly autonomous development workflow where AI agents can learn the specific idiomatic styles of this codebase. These guidelines cover everything from backend service structures and database interactions to frontend component design and BDD-style testing. Adhering to these standards is mandatory for ensuring that every contribution remains scalable, secure, and perfectly aligned with the project's long-term architectural goals.

---

## Core Guidelines

<div class="grid cards" markdown>

-   :fontawesome-brands-java: **[Java Guidelines](java-guidelines.md)**
    
    Standards for Spring Boot 4.0, JPA entities, HATEOAS controllers, and service-layer patterns.

-   :material-test-tube: **[Spock Tests](spock-tests-guidelines.md)**
    
    Guidelines for writing expressive BDD tests using Groovy, Testcontainers, and Mocking strategies.

-   :simple-playwright: **[Frontend E2E Tests](frontend-e2e-tests-guidelines.md)**
    
    Playwright E2E with Page Object Model and API mocking.

-   :material-book-open-page-variant: **[Documentation Guidelines](documentation/documentation-guidelines.md)**
    
    Standards for MkDocs, visual patterns, and cross-linking rules.

-   :material-file-document-edit: **[SDD Methodology](documentation/sdd.md)**
    
    The Spec-Driven Development way of working, EARS syntax, and persistent anchors.

-   :fontawesome-brands-react: **[Frontend Guidelines](frontend-guidelines.md)**
    
    React 19 conventions, Mantine UI usage, TanStack Query, and component architecture.

-   :material-database-sync: **[Database Guidelines](database-guidelines.md)**
    
    PostgreSQL schemas, Liquibase migrations, naming conventions, and data integrity patterns.

</div>

---

## AI Alignment

!!! info "For AI Agents"
    When operating within this workspace, AI agents MUST prioritize the instructions found in these guidelines over general default behaviors. These documents contain project-specific "Rules of Engagement" that are foundational to the technical integrity of the Home Application.

### Agent Context & Tooling

To ensure efficient operation and minimize context window saturation, the following resources are provided:

-   **Project Context (`.ai/project-context.md`):** Provides a high-level, summarized overview of the system architecture and module locations. It serves as a directory for the agent to find detailed information without overloading the initial session context.
-   **Specialized Skills (`.ai/skills/`):** Contains structured workflows for common operations such as committing code, generating Spock tests, and updating documentation. Agents should activate these skills when performing relevant tasks.
-   **Kiro-CLI Integration (`.kiro/`):** Defines a pre-configured agent that leverages these development guidelines as a RAG (Retrieval-Augmented Generation) knowledge base. This allows for highly efficient retrieval of project directives and patterns.
-   **Agent Mandates (`GEMINI.md`, `CLAUDE.md`):** Platform-specific foundational instructions that assume a similar role to the Kiro agent configuration, ensuring that all AI assistants adhere to the core engineering standards of the project.
