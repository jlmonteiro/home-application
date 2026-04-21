# Database Schema

## Overview

The Home Application uses **PostgreSQL 17** as its primary data store. The database is organized into five distinct logical schemas to separate domain concerns.

<div class="grid cards" markdown>

-   :material-database-lock: **Multi-Schema Design**
    
    Uses `profiles`, `shopping`, `recipes`, `meals`, `notifications`, and `media` schemas to enforce domain boundaries and simplify access control.

-   :material-history: **Audit Tracking**
    
    All tables include mandatory audit columns (`created_at`, `updated_at`, `version`) for tracking and optimistic locking.

-   :material-database-sync: **Liquibase Managed**
    
    Database migrations are versioned and managed via **Liquibase**, ensuring consistent schema state across environments.

</div>

---

## Logical Schemas

### 1. Profiles Schema
Manages identity, authentication, and the household organizational structure.

| Entity | Description |
|--------|-------------|
| **Users** | Core authentication record linked to Google email. |
| **User Profiles** | Extended profile data (birthdate, social links, photo URL). |
| **User Preferences** | UI-specific settings like dashboard widget visibility. |
| **Family Roles** | Defined roles (Mother, Father, etc.) with custom support. |
| **Age Groups** | Configurable age ranges for classification logic. |

### 2. Shopping Schema
Contains all data related to the collaborative shopping experience.

| Entity | Description |
|--------|-------------|
| **Shopping Lists** | Shared lists with status tracking (PENDING/COMPLETED). |
| **Shopping Items** | Master catalog items with unit, piece conversion, and nutrition sample config. |
| **Shopping List Items** | Individual list entries with bought/unavailable status. |
| **Stores** | Favorite shopping locations with associated metadata. |
| **Loyalty Cards** | Digital cards with QR/Code 128 barcode support. |
| **Coupons** | Store discounts with expiration tracking and optional barcode. |
| **Price History** | Historical price data for intelligent suggestions. |

### 3. Recipes Schema
Manages the family cookbook and nutritional information.

| Entity | Description |
|--------|-------------|
| **Recipes** | Core recipe records with markdown descriptions and metadata. |
| **Recipe Photos** | Photos referencing the centralized media service by `photo_name`. |
| **Labels** | Dynamic tags created on demand, auto-deleted when orphaned. |
| **Nutrients** | Master catalog of predefined nutrients (Energy, Fat, Protein, etc.). |
| **Ingredients** | Links to shopping items with quantity, unit, and optional `group_name`. |
| **Nutrition Entries** | Per-item nutrition values referencing the nutrients master catalog. |
| **Steps** | Ordered preparation instructions with optional time. |
| **Comments & Ratings** | Collaborative feedback: comments and 1-5 star ratings. |

### 4. Meals Schema
Handles weekly meal planning and feedback.

| Entity | Description |
|--------|-------------|
| **Meal Times** | Named meal occasions with per-day-of-week schedules and sort order. |
| **Meal Plans** | Weekly plans (Monday–Sunday) with PENDING/PUBLISHED status. |
| **Entries** | Individual meal slots with done flag. |
| **Entry Recipes** | Recipe assignments per entry with multiplier, optionally per member. |
| **Entry Items** | Standalone shopping item assignments per entry, optionally per member. |
| **Votes** | Thumbs up/down feedback per entry per user. |

### 5. Notifications Schema
Manages in-app notifications and direct messaging.

| Entity | Description |
|--------|-------------|
| **Notifications** | Typed events with `link` for navigation and sender info. |
| **Messages** | Direct messages between household members with read tracking. |

### 6. Media Schema
Centralized binary photo storage serving all modules.

| Entity | Description |
|--------|-------------|
| **Photos** | Binary image data (BYTEA) with name, type, extension, and content type. |

---

## Data Governance

### Retention Policy

!!! note "[:octicons-clock-24: FR-11: Automatic Data Retention](../../requirements/shopping-list.md#fr-11)"

    To maintain system performance and declutter the UI, the system automatically purges completed shopping lists and associated items older than 3 months.

!!! note "[:octicons-clock-24: FR-34: Meal Plan Data Retention](../../requirements/recipes-meals.md#fr-34)"

    Meal plans with a `week_start_date` older than 10 weeks are permanently deleted by a daily scheduled task at 03:00 AM, including all associated entries, recipes, and member records.

### Label Auto-Cleanup

!!! note "[:material-label: FR-23: Dynamic Labels](../../requirements/recipes-meals.md#fr-23)"

    Labels are managed at the application level, not by a scheduled task. When a label is removed from a recipe and no other recipe references it, the service layer deletes the orphaned label immediately.

### Integrity & Security

- **Optimistic Locking:** The `version` column prevents lost updates during concurrent edits.
- **Physical Deletion:** Data retention is handled by physical `DELETE` operations to keep the database lean.
- **Schema Validation:** The application performs strict schema validation on startup via `spring.jpa.hibernate.ddl-auto: validate`.

---

## Related Documentation

- [:material-file-tree: Detailed Schema](schema.md)
- [:material-server: Backend Architecture](../backend/overview.md)
- [:material-cog-sync: Automated Tasks](../backend/overview.md#scheduled-tasks)
