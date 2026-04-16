# Database Schema

## Overview

The Home Application uses **PostgreSQL 17** as its primary data store. The database is organized into two distinct logical schemas to separate authentication and user concerns from application-specific shopping data.

<div class="grid cards" markdown>

-   :material-database-lock: **Multi-Schema Design**
    
    Uses `profiles` and `shopping` schemas to enforce domain boundaries and simplify access control.

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

---

## Data Governance

### Retention Policy

!!! note "[:octicons-clock-24: FR-11: Automatic Data Retention](../../requirements/shopping-list.md#fr-11)"

    To maintain system performance and declutter the UI, the system automatically purges completed shopping lists and associated items older than 3 months.

### Integrity & Security

- **Optimistic Locking:** The `version` column prevents lost updates during concurrent edits.
- **Physical Deletion:** Data retention is handled by physical `DELETE` operations to keep the database lean.
- **Schema Validation:** The application performs strict schema validation on startup via `spring.jpa.hibernate.ddl-auto: validate`.

---

## Related Documentation

- [:material-file-tree: Detailed Schema](schema.md)
- [:material-server: Backend Architecture](../backend/overview.md)
- [:material-cog-sync: Automated Tasks](../backend/overview.md#scheduled-tasks)
