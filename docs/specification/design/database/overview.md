# Database Schema

## Overview

The Home Application uses **PostgreSQL 17** as its primary data store. The database is organized into five distinct logical schemas to separate domain concerns.

<div class="grid cards" markdown>

-   :material-database-lock: **Multi-Schema Design**
    
    Uses `profiles`, `shopping`, `recipes`, `meals`, and `notifications` schemas to enforce domain boundaries and simplify access control.

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
| **User Profiles** | Extended profile data (birthdate, social links, photo). |
| **Family Roles** | Defined roles (Mother, Father, etc.) with custom support. |
| **Age Groups** | Configurable age ranges for classification logic. |

### 2. Shopping Schema
Contains all data related to the collaborative shopping experience.

| Entity | Description |
|--------|-------------|
| **Shopping Lists** | Shared lists with status tracking. |
| **Items** | Master catalog items and individual list entries. |
| **Stores** | Favorite shopping locations with associated metadata. |
| **Loyalty & Coupons** | Digital representation of cards and expiration tracking. |

### 3. Recipes Schema
Manages the family cookbook and nutritional information.

| Entity | Description |
|--------|-------------|
| **Recipes** | Core recipe records with markdown descriptions and metadata. |
| **Photos** | Multiple Base64-encoded photos per recipe with default selection. |
| **Labels** | Dynamic tags created on demand, auto-deleted when orphaned. |
| **Ingredients** | Links to shopping items with quantity and unit. |
| **Steps** | Ordered preparation instructions with optional time. |
| **Comments & Ratings** | Collaborative feedback: comments and 1-5 star ratings. |
| **Nutrition Data** | Per-item nutrition (1:1 with shopping items). |

### 4. Meals Schema
Handles weekly meal planning and the approval workflow.

| Entity | Description |
|--------|-------------|
| **Meal Times** | Named meal occasions with per-day-of-week schedules. |
| **Meal Plans** | Weekly plans (Monday–Sunday) with DRAFT/PUBLISHED status. |
| **Entries** | Individual meal slots with done flag and reminder offset. |
| **Entry Recipes** | Recipe assignments per entry, optionally per member. |
| **Entry Members** | Member response tracking (PENDING/ACCEPTED/CHANGED) and thumbs up/down. |

### 5. Notifications Schema
Manages in-app notifications and direct messaging.

| Entity | Description |
|--------|-------------|
| **Notifications** | Typed events with polymorphic reference to source entities. |
| **Messages** | Direct messages between household members with read tracking. |

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
