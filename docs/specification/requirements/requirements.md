# Requirements Index

## Overview

The Home Application is a centralized platform designed to help families collaborate on household activities. This index provides a complete map of all user journeys, functional requirements, non-functional requirements, and architectural decisions.

<div class="grid cards" markdown>

-   :material-bullseye-arrow: **The North Star**
    
    To provide a unified, secure entry point for household management, establishing a trusted environment for sharing resources.

-   :material-account-group: **Stakeholders**
    
    - **Home Users:** Collaborative family members.
    - **Developers:** Building with modular APIs.
    - **Admins:** Ensuring data integrity and health.

</div>

---

## Requirement Classifications

To ensure clarity and traceability, all specifications are categorized into four distinct types:

<div class="grid cards" markdown>

-   :material-map-marker-path: **User Journeys (UJ)**
    
    Narrative-driven scenarios that describe a specific end-to-end goal from the perspective of a user.

-   :material-cog: **Functional Requirements (FR)**
    
    Specific features, behaviors, or tasks the system MUST perform to satisfy user needs.

-   :material-speedometer: **Non-Functional Requirements (NFR)**
    
    Quality attributes such as performance, security, and reliability that define *how* the system operates.

-   :material-gavel: **Architectural Decisions (AD/ADR)**
    
    Fundamental design choices and constraints that shape the system's structure and technical direction.

</div>

---

## EARS Pattern

The Home Application project utilizes the **EARS (Easy Approach to Requirements Syntax)** pattern to ensure that all requirements are clear, concise, and verifiable.

!!! info "EARS Syntax Legend (Hover for trigger name)"
    - :material-check-all:{ title="Ubiquitous" } **Ubiquitous:** "The system shall..." (Always true)
    - :material-play-circle:{ title="Event-driven" } **Event-driven:** "When <trigger>, the system shall..."
    - :material-alert-circle:{ title="Unwanted Behavior" } **Unwanted Behavior:** "If <condition>, then the system shall..."
    - :material-clock-outline:{ title="State-driven" } **State-driven:** "While <state>, the system shall..."
    - :material-plus-circle-outline:{ title="Optional" } **Optional:** "Where <feature exists>, the system shall..."
    - :material-layers-outline:{ title="Complex" } **Complex:** Combinations of the above triggers.

[:material-link: EARS Documentation](https://alistairmavin.com/ears/)

---

## 1. User Journeys

| ID | Journey | Description |
| :--- | :--- | :--- |
| [**UJ-1**](auth-profile.md#uj-1) | :material-account-star: Onboarding | First-time Google login and profile setup. |
| [**UJ-2**](auth-profile.md#uj-2) | :material-login: Returning User | Seamless session restoration for existing users. |
| [**UJ-3**](shopping-list.md#uj-3) | :material-cart-arrow-right: Collaborative Shopping | Multiple users updating a shared list in real-time. |
| [**UJ-4**](shopping-list.md#uj-4) | :material-barcode-scan: Checkout Optimization | Using digital cards and coupons at the store. |
| [**UJ-5**](settings.md#uj-5) | :material-account-group-outline: Family Setup | Configuring age ranges and household roles. |

---

## 2. Authentication & Profiles

| ID | Requirement | Description |
| :--- | :--- | :--- |
| [**FR-1**](auth-profile.md#fr-1) | :material-lock: OAuth2 Auth | Secure login via Google Identity. |
| [**FR-2**](auth-profile.md#fr-2) | :material-account-plus: Auto Registration | Seamless onboarding for new users. |
| [**FR-4**](auth-profile.md#fr-4) | :material-account-edit: Profile Updates | Customizing identity and family roles. |
| [**FR-16**](auth-profile.md#fr-16) | :material-account-clock: Age Classification | Dynamic age group mapping. |
| [**NFR-1**](auth-profile.md#nfr-1) | :material-shield-check: Zero Trust | Mandatory session validation for all APIs. |

---

## 3. Shopping List Module

| ID | Requirement | Description |
| :--- | :--- | :--- |
| [**FR-7**](shopping-list.md#fr-7) | :material-account-multiple: Collaboration | Real-time shared lists for the household. |
| [**FR-9**](shopping-list.md#fr-9) | :material-lightbulb-on: Price Suggestions | Intelligent spending estimates based on history. |
| [**FR-11**](shopping-list.md#fr-11) | :material-delete-sweep: Data Retention | Automatic purging of old data (3 months). |
| [**FR-12**](shopping-list.md#fr-12) | :material-barcode-scan: Loyalty Cards | Digital storage with QR and Code 128 support. |
| [**FR-15**](shopping-list.md#fr-15) | :material-alert-decagram: Expiration Warnings | Proactive alerts for expiring coupons. |

---

## 4. Settings & Shared Patterns

| ID | Requirement | Description |
| :--- | :--- | :--- |
| [**FR-18**](settings.md#fr-18) | :material-account-cog: Age Configurations | Flexible age range definition (Adults only). |
| [**FR-14**](shared.md#fr-14) | :material-menu: Nested Navigation | Consistent, modular navigation pattern. |
| [**NFR-2**](shared.md#nfr-2) | :material-speedometer: Latency Target | 95% of requests processed in < 150ms. |

---

## 5. Documentation System

| ID | Requirement | Description |
| :--- | :--- | :--- |
| [**FR-20**](documentation.md#fr-20) | :material-book-open-page-variant: MkDocs | Integrated documentation-as-code build. |
| [**NFR-5**](documentation.md#nfr-5) | :material-file-export: Portability | Static site generation for easy hosting. |

---

## 6. Glossary

| Term | Definition |
| :--- | :--- |
| **HATEOAS** | Hypermedia as the Engine of Application State. |
| **RFC 7807** | Standard for Problem Details for HTTP APIs. |
| **Global Last Price** | The most recent price recorded for an item across all stores. |

---

## 7. Architectural Decision Records (ADRs)

!!! abstract "ADR-1: HATEOAS for REST API" {: #adr-1 }
    **Status:** Accepted. Uses Spring HATEOAS to ensure discoverability and decouple the client from hardcoded URI patterns.

!!! abstract "ADR-2: Monorepo with Gradle" {: #adr-2 }
    **Status:** Accepted. Uses a single repository to manage backend, frontend, and documentation for atomic releases and shared tooling.
