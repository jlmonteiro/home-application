# Requirements: Home Application

## 1. Overview
The Home Application is a centralized platform designed to help users manage household-related activities through modular, shared utility modules.

## 2. Business Context & Stakeholders
### Business Context (The "North Star")
The primary goal is to provide a unified, secure entry point for all household management features. By centralizing authentication and data sharing, we reduce friction and establish a trusted, collaborative environment for household members to manage shared resources.

### Stakeholders
- **Home Users:** Household members who need to collaborate on shared tasks and lists.
- **Developers:** Need a standardized, well-documented API and modular structure to build new features.
- **System Administrators:** Responsible for monitoring system health and ensuring data integrity.

## 3. Requirement Index

### 3.1. Authentication & Profiles
| ID | Title |
| --- | --- |
| **UJ-1** | [First-Time Login (Onboarding)](./requirements/auth-profile.md#uj-1-first-time-login-onboarding) |
| **UJ-2** | [Returning User Login](./requirements/auth-profile.md#uj-2-returning-user-login) |
| **FR-1** | [Google OAuth2 Authentication](./requirements/auth-profile.md#fr-1-google-oauth2-authentication) |
| **FR-2** | [Automatic User Registration](./requirements/auth-profile.md#fr-2-automatic-user-registration) |
| **FR-3** | [User Profile Quick View](./requirements/auth-profile.md#fr-3-user-profile-quick-view) |
| **FR-4** | [Update User Profile](./requirements/auth-profile.md#fr-4-update-user-profile) |
| **NFR-1** | [Security (Zero Trust)](./requirements/auth-profile.md#nfr-1-security-zero-trust) |

### 3.2. Shopping List
| ID | Title |
| --- | --- |
| **UJ-3** | [Collaborative Shopping](./requirements/shopping-list.md#uj-3-collaborative-shopping) |
| **UJ-4** | [Using Loyalty Cards & Coupons](./requirements/shopping-list.md#uj-4-using-loyalty-cards--coupons) |
| **FR-5** | [Category & Item Management](./requirements/shopping-list.md#fr-5-category--item-management) |
| **FR-6** | [Store Management](./requirements/shopping-list.md#fr-6-store-management) |
| **FR-7** | [Shopping List Creation & Collaboration](./requirements/shopping-list.md#fr-7-shopping-list-creation--collaboration) |
| **FR-8** | [List Items & Quantities](./requirements/shopping-list.md#fr-8-list-items--quantities) |
| **FR-9** | [Price History & Suggestions](./requirements/shopping-list.md#fr-9-price-history--suggestions) |
| **FR-10** | [In-Store Progress Tracking](./requirements/shopping-list.md#fr-10-in-store-progress-tracking) |
| **FR-11** | [Automatic Data Retention](./requirements/shopping-list.md#fr-11-automatic-data-retention) |
| **FR-12** | [Loyalty Cards](./requirements/shopping-list.md#fr-12-loyalty-cards) |
| **FR-13** | [Store Coupons](./requirements/shopping-list.md#fr-13-store-coupons) |
| **FR-15** | [Expiration Warning Panel (Dashboard)](./requirements/shopping-list.md#fr-15-expiration-warning-panel-dashboard) |
| **NFR-3** | [Reliability & Sync](./requirements/shopping-list.md#nfr-3-reliability--sync) |
| **NFR-4** | [Accessibility & UX](./requirements/shopping-list.md#nfr-4-accessibility--ux) |

### 3.3. Shared Requirements
| ID | Title |
| --- | --- |
| **FR-14** | [Module Navigation (Nested Menus)](./requirements/shared.md#fr-14-module-navigation-nested-menus) |
| **NFR-2** | [Performance (Latency)](./requirements/shared.md#nfr-2-performance-latency) |

## 4. Architectural Decisions
### ADR-1: HATEOAS for REST API
- **Status:** Accepted. Use Spring HATEOAS.

### ADR-2: Monorepo with Gradle
- **Status:** Accepted.

## 5. Glossary
| Term | Definition |
| ---- | ---------- |
| HATEOAS | Hypermedia as the Engine of Application State. |
| RFC 7807 | Standard for Problem Details for HTTP APIs. |
| Global Last Price | The most recent price recorded for an item across all stores. |
