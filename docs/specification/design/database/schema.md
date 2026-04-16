# Database Schema

## Overview

This document details the PostgreSQL 17 database schema, table relationships, and migration rules for the Home Application.

## Schemas

The database is organized into two distinct logical schemas:
- `profiles` - Identity, authentication, and family structure.
- `shopping` - Collaborative shopping lists, master catalog, and store-related data.

### System ER Overview

This diagram illustrates the high-level grouping and relationships between the `profiles` and `shopping` schemas.

```mermaid
flowchart TB
    subgraph profiles_schema [profiles Schema]
        direction TB
        USER
        USER_PROFILE
        USER_PREFERENCES
        FAMILY_ROLES
        AGE_GROUP_CONFIG

        USER --- USER_PROFILE
        USER --- USER_PREFERENCES
        FAMILY_ROLES --- USER_PROFILE
        AGE_GROUP_CONFIG --- USER_PROFILE
    end

    subgraph shopping_schema [shopping Schema]
        direction TB
        SHOPPING_LISTS
        SHOPPING_CATEGORIES
        SHOPPING_ITEMS
        SHOPPING_STORES
        LOYALTY_CARDS
        COUPONS
        SHOPPING_LIST_ITEMS
        SHOPPING_ITEM_PRICE_HISTORY

        SHOPPING_CATEGORIES --- SHOPPING_ITEMS
        SHOPPING_STORES --- LOYALTY_CARDS
        SHOPPING_STORES --- COUPONS
        SHOPPING_LISTS --- SHOPPING_LIST_ITEMS
        SHOPPING_ITEMS --- SHOPPING_LIST_ITEMS
        SHOPPING_STORES --- SHOPPING_LIST_ITEMS
        SHOPPING_ITEMS --- SHOPPING_ITEM_PRICE_HISTORY
        SHOPPING_STORES --- SHOPPING_ITEM_PRICE_HISTORY
    end

    %% Cross-schema relationship
    USER -- "creates" --- SHOPPING_LISTS

    style profiles_schema fill:#f5f5f5,stroke:#333,stroke-width:2px
    style shopping_schema fill:#fffde7,stroke:#333,stroke-width:2px
```

---

## profiles Schema

This schema manages user accounts, extended profiles, family roles, and age-based classification.

### Detailed Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--|| USER_PROFILE : "has"
    USER ||--|| USER_PREFERENCES : "has"
    FAMILY_ROLES ||--o{ USER_PROFILE : "assigned_to"
    AGE_GROUP_CONFIG ||--o{ USER_PROFILE : "classifies"

    USER {
        bigint id PK
        varchar email UK
        varchar first_name
        varchar last_name
        boolean enabled
        timestamp created_at
        timestamp updated_at
    }

    USER_PROFILE {
        bigint id PK
        bigint user_id FK
        text photo
        varchar facebook
        varchar mobile_phone
        varchar instagram
        varchar linkedin
        date birthdate
        bigint family_role_id FK
        varchar age_group_name
        integer version
        timestamp created_at
        timestamp updated_at
    }

    USER_PREFERENCES {
        bigint id PK
        bigint user_id FK
        boolean show_shopping_widget
        boolean show_coupons_widget
        bigint version
        timestamp created_at
        timestamp updated_at
    }

    FAMILY_ROLES {
        bigint id PK
        varchar name UK
        boolean immutable
        timestamp created_at
        timestamp updated_at
        integer version
    }

    AGE_GROUP_CONFIG {
        bigint id PK
        varchar name UK
        integer min_age
        integer max_age
        timestamp created_at
        timestamp updated_at
        integer version
    }
```

### Table Definitions

| Table | Description |
|-------|-------------|
| `user` | Core authentication records linked to Google identities. |
| `user_profile` | Extended user data including social links and birthdate. |
| `user_preferences` | UI-specific settings like dashboard widget visibility. |
| `family_roles` | Predefined (Mother, Father, etc.) and custom family roles. |
| `age_group_config` | Definable age ranges used for automated classification. |

---

## shopping Schema

This schema contains all data related to the shopping experience, including shared lists and store management.

### Detailed Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ SHOPPING_LISTS : "creates"
    SHOPPING_CATEGORIES ||--o{ SHOPPING_ITEMS : "categorizes"
    SHOPPING_STORES ||--o{ LOYALTY_CARDS : "has"
    SHOPPING_STORES ||--o{ COUPONS : "has"
    SHOPPING_LISTS ||--o{ SHOPPING_LIST_ITEMS : "contains"
    SHOPPING_ITEMS ||--o{ SHOPPING_LIST_ITEMS : "is_part_of"
    SHOPPING_STORES ||--o{ SHOPPING_LIST_ITEMS : "is_bought_at"
    SHOPPING_ITEMS ||--o{ SHOPPING_ITEM_PRICE_HISTORY : "tracks"
    SHOPPING_STORES ||--o{ SHOPPING_ITEM_PRICE_HISTORY : "recorded_at"

    SHOPPING_LISTS {
        bigint id PK
        varchar name
        text description
        varchar status
        bigint created_by FK
        bigint version
        timestamp created_at
        timestamp updated_at
        timestamp completed_at
    }

    SHOPPING_LIST_ITEMS {
        bigint id PK
        bigint list_id FK
        bigint item_id FK
        bigint store_id FK
        decimal quantity
        varchar unit
        decimal price
        boolean bought
        boolean unavailable
        bigint version
        timestamp created_at
        timestamp updated_at
    }

    SHOPPING_ITEMS {
        bigint id PK
        varchar name
        text photo
        bigint category_id FK
        bigint version
        timestamp created_at
        timestamp updated_at
    }

    SHOPPING_CATEGORIES {
        bigint id PK
        varchar name UK
        text description
        varchar icon
        bigint version
        timestamp created_at
        timestamp updated_at
    }

    SHOPPING_STORES {
        bigint id PK
        varchar name UK
        text description
        varchar icon
        text photo
        bigint version
        timestamp created_at
        timestamp updated_at
    }

    LOYALTY_CARDS {
        bigint id PK
        bigint store_id FK
        varchar name
        varchar number
        varchar barcode_type
        bigint version
        timestamp created_at
        timestamp updated_at
    }

    COUPONS {
        bigint id PK
        bigint store_id FK
        varchar name
        text description
        varchar value
        text photo
        timestamp due_date
        varchar code
        varchar barcode_type
        boolean used
        bigint version
        timestamp created_at
        timestamp updated_at
    }

    SHOPPING_ITEM_PRICE_HISTORY {
        bigint id PK
        bigint item_id FK
        bigint store_id FK
        decimal price
        timestamp recorded_at
    }
```

### Table Definitions

| Table | Description |
|-------|-------------|
| `shopping_lists` | Shared lists with status tracking (ACTIVE, COMPLETED). |
| `shopping_list_items` | Individual entries in a list, including prices and check-off status. |
| `shopping_items` | Master catalog of items shared across the household. |
| `shopping_categories` | Taxonomies for organizing shopping items. |
| `shopping_stores` | Favorite shopping locations. |
| `loyalty_cards` | Digital storage for store cards with Barcode/QR support. |
| `coupons` | Store-specific discounts with expiration tracking. |
| `shopping_item_price_history` | Historical price data used for intelligent suggestions. |

---

## Technical Standards

### Common Columns
Every table (excluding junction or history tables) MUST include the following audit columns:
- `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
- `version` BIGINT NOT NULL DEFAULT 0 (Used for Optimistic Locking)

### Optimistic Locking
The application uses the `version` column to implement optimistic locking. Any update that detects a version mismatch SHALL throw a `ValidationException`.

### Data Retention
!!! note "[:octicons-clock-24: FR-11: Automatic Data Retention](../../requirements/shopping-list.md#fr-11)"

    Completed shopping lists and their items older than 3 months are physically deleted by a daily scheduled task to maintain performance.

---

## Related Documentation

- [:material-server: Backend Architecture](../backend/overview.md)
- [:material-cog-sync: Automated Tasks](../backend/overview.md#scheduled-tasks)
- [:material-test-tube: Test Scenarios](../test-strategy/test-scenarios.md)
