# Database Schema

## Overview

This document details the PostgreSQL 17 database schema, table relationships, and migration rules for the Home Application.

## Schemas

The database is organized into five distinct logical schemas:
- `profiles` - Identity, authentication, and family structure.
- `shopping` - Collaborative shopping lists, master catalog, and store-related data.
- `recipes` - Family cookbook: recipes, photos, labels, ingredients, steps, comments, ratings, and nutrition.
- `meals` - Meal time configuration, weekly meal plans, and approval workflows.
- `notifications` - In-app notifications and direct messaging.

### System ER Overview

This diagram illustrates the high-level grouping and relationships between all schemas.

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

    subgraph recipes_schema [recipes Schema]
        direction TB
        RECIPES
        RECIPE_PHOTOS
        LABELS
        RECIPE_INGREDIENTS
        RECIPE_STEPS
        RECIPE_COMMENTS
        RECIPE_RATINGS
        NUTRITION_ENTRIES

        RECIPES --- RECIPE_PHOTOS
        RECIPES --- RECIPE_INGREDIENTS
        RECIPES --- RECIPE_STEPS
        RECIPES --- RECIPE_COMMENTS
        RECIPES --- RECIPE_RATINGS
        SHOPPING_ITEMS --- NUTRITION_ENTRIES
    end

    subgraph meals_schema [meals Schema]
        direction TB
        MEAL_TIMES
        MEAL_TIME_SCHEDULES
        MEAL_PLANS
        MEAL_PLAN_ENTRIES
        MEAL_PLAN_ENTRY_RECIPES
        MEAL_PLAN_ENTRY_MEMBERS

        MEAL_TIMES --- MEAL_TIME_SCHEDULES
        MEAL_PLANS --- MEAL_PLAN_ENTRIES
        MEAL_PLAN_ENTRIES --- MEAL_PLAN_ENTRY_RECIPES
        MEAL_PLAN_ENTRIES --- MEAL_PLAN_ENTRY_MEMBERS
    end

    subgraph notifications_schema [notifications Schema]
        direction TB
        NOTIFICATIONS
        MESSAGES
    end

    %% Cross-schema relationships
    USER -- "creates" --- SHOPPING_LISTS
    USER -- "creates" --- RECIPES
    USER -- "creates" --- MEAL_PLANS
    USER -- "receives" --- NOTIFICATIONS
    USER -- "sends" --- MESSAGES
    SHOPPING_ITEMS -- "ingredient_of" --- RECIPE_INGREDIENTS
    RECIPES -- "assigned_to" --- MEAL_PLAN_ENTRY_RECIPES

    style profiles_schema fill:#f5f5f5,stroke:#333,stroke-width:2px
    style shopping_schema fill:#fffde7,stroke:#333,stroke-width:2px
    style recipes_schema fill:#e8f5e9,stroke:#333,stroke-width:2px
    style meals_schema fill:#e3f2fd,stroke:#333,stroke-width:2px
    style notifications_schema fill:#fce4ec,stroke:#333,stroke-width:2px
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
        varchar unit
        decimal pc_quantity
        varchar pc_unit
        decimal nutrition_sample_size
        varchar nutrition_sample_unit
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
| `shopping_lists` | Shared lists with status tracking (PENDING, COMPLETED). |
| `shopping_list_items` | Individual entries in a list, including prices, bought status, and unavailable status. |
| `shopping_items` | Master catalog of items with `unit`, optional piece conversion (`pc_quantity`/`pc_unit`), and nutrition sample config (`nutrition_sample_size`/`nutrition_sample_unit`). Unique constraint on `(name, category_id)`. |
| `shopping_categories` | Taxonomies for organizing shopping items. |
| `shopping_stores` | Favorite shopping locations. |
| `loyalty_cards` | Digital storage for store cards with Barcode/QR support. |
| `coupons` | Store-specific discounts with expiration tracking and optional barcode (`code`/`barcode_type`). |
| `shopping_item_price_history` | Historical price data used for intelligent suggestions. |

---

## recipes Schema

This schema manages the family cookbook: recipes, photos, labels, ingredients, preparation steps, comments, ratings, and nutrition data.

### Detailed Entity Relationship Diagram

```mermaid
erDiagram
    RECIPES ||--o{ RECIPE_PHOTOS : "has"
    RECIPES ||--o{ RECIPE_LABELS : "tagged_with"
    LABELS ||--o{ RECIPE_LABELS : "applied_to"
    RECIPES ||--o{ RECIPE_INGREDIENTS : "contains"
    RECIPES ||--o{ RECIPE_STEPS : "has"
    RECIPES ||--o{ RECIPE_COMMENTS : "has"
    RECIPES ||--o{ RECIPE_RATINGS : "rated_by"
    SHOPPING_ITEMS ||--o{ RECIPE_INGREDIENTS : "used_in"
    SHOPPING_ITEMS ||--o{ NUTRITION_ENTRIES : "has"
    NUTRIENTS ||--o{ NUTRITION_ENTRIES : "defines"
    USER ||--o{ RECIPES : "creates"
    USER ||--o{ RECIPE_COMMENTS : "writes"
    USER ||--o{ RECIPE_RATINGS : "rates"

    RECIPES {
        bigint id PK
        varchar name
        text description
        integer servings
        text source_link
        text video_link
        integer prep_time_minutes
        bigint created_by FK
        bigint version
        timestamp created_at
        timestamp updated_at
    }

    RECIPE_PHOTOS {
        bigint id PK
        bigint recipe_id FK
        varchar photo_name
        boolean is_default
        bigint version
        timestamp created_at
        timestamp updated_at
    }

    LABELS {
        bigint id PK
        varchar name UK
        timestamp created_at
        timestamp updated_at
    }

    RECIPE_LABELS {
        bigint recipe_id PK_FK
        bigint label_id PK_FK
    }

    NUTRIENTS {
        bigint id PK
        varchar name UK
        text description
        varchar unit
        bigint version
        timestamp created_at
        timestamp updated_at
    }

    RECIPE_INGREDIENTS {
        bigint id PK
        bigint recipe_id FK
        bigint item_id FK
        decimal quantity
        varchar unit
        varchar group_name
        bigint version
        timestamp created_at
        timestamp updated_at
    }

    RECIPE_STEPS {
        bigint id PK
        bigint recipe_id FK
        text instruction
        integer time_minutes
        integer sort_order
        bigint version
        timestamp created_at
        timestamp updated_at
    }

    RECIPE_COMMENTS {
        bigint id PK
        bigint recipe_id FK
        bigint user_id FK
        text comment
        timestamp created_at
        timestamp updated_at
    }

    RECIPE_RATINGS {
        bigint id PK
        bigint recipe_id FK
        bigint user_id FK
        integer rating
        timestamp created_at
        timestamp updated_at
    }

    NUTRITION_ENTRIES {
        bigint id PK
        bigint item_id FK
        bigint nutrient_id FK
        decimal value
        bigint version
        timestamp created_at
        timestamp updated_at
    }
```

### Table Definitions

| Table | Description |
|-------|-------------|
| `recipes` | Core recipe records with metadata, markdown description, and creator reference. Unique constraint on `(name, created_by)`. |
| `recipe_photos` | Photos referencing the centralized media service by `photo_name`. One can be designated as default via `is_default` boolean. |
| `labels` | Dynamic label catalog. Created on demand, auto-deleted when no recipe references them. |
| `recipe_labels` | Junction table linking recipes to labels (many-to-many). |
| `nutrients` | Master catalog of predefined nutrients (Energy, Fat, Protein, etc.) with name, description, and unit. |
| `recipe_ingredients` | Links shopping items as recipe ingredients with quantity, unit (same enum as shopping: KG, G, L, ML, PACK, UNIT), and optional `group_name` for visual grouping. |
| `recipe_steps` | Ordered preparation steps with markdown instructions and optional time. `sort_order` determines display order. |
| `recipe_comments` | User comments on recipes with author and timestamp. Column: `comment`. |
| `recipe_ratings` | Individual 1-5 star ratings per user per recipe (unique constraint on recipe_id + user_id). Column: `rating`. Average computed on-the-fly. |
| `nutrition_entries` | Nutrition data per shopping item, referencing the `nutrients` master table via `nutrient_id` FK. Unique constraint on `(item_id, nutrient_id)`. |

### Cross-Schema References

| Column | References | On Delete |
|--------|-----------|-----------|
| `recipes.created_by` | `profiles.user(id)` | RESTRICT |
| `recipe_comments.user_id` | `profiles.user(id)` | CASCADE |
| `recipe_ratings.user_id` | `profiles.user(id)` | CASCADE |
| `recipe_ingredients.item_id` | `shopping.shopping_items(id)` | CASCADE |
| `nutrition_entries.item_id` | `shopping.shopping_items(id)` | CASCADE |
| `nutrition_entries.nutrient_id` | `recipes.nutrients(id)` | RESTRICT |

---

## meals Schema

This schema manages meal time configuration, weekly meal plans, and the approval/feedback workflow.

### Detailed Entity Relationship Diagram

```mermaid
erDiagram
    MEAL_TIMES ||--o{ MEAL_TIME_SCHEDULES : "scheduled_at"
    MEAL_PLANS ||--o{ MEAL_PLAN_ENTRIES : "contains"
    MEAL_PLAN_ENTRIES }o--|| MEAL_TIMES : "for"
    MEAL_PLAN_ENTRIES ||--o{ MEAL_PLAN_ENTRY_RECIPES : "includes"
    MEAL_PLAN_ENTRIES ||--o{ MEAL_PLAN_ENTRY_ITEMS : "includes"
    MEAL_PLAN_ENTRIES ||--o{ MEAL_PLAN_VOTES : "rated_by"
    RECIPES ||--o{ MEAL_PLAN_ENTRY_RECIPES : "used_in"
    USER ||--o{ MEAL_PLAN_ENTRY_RECIPES : "assigned_to"
    USER ||--o{ MEAL_PLAN_VOTES : "votes"

    MEAL_TIMES {
        bigint id PK
        varchar name
        integer sort_order
        bigint version
        timestamp created_at
        timestamp updated_at
    }

    MEAL_TIME_SCHEDULES {
        bigint id PK
        bigint meal_time_id FK
        integer day_of_week
        time start_time
        bigint version
        timestamp created_at
        timestamp updated_at
    }

    MEAL_PLANS {
        bigint id PK
        date week_start_date UK
        varchar status
        bigint version
        timestamp created_at
        timestamp updated_at
    }

    MEAL_PLAN_ENTRIES {
        bigint id PK
        bigint meal_plan_id FK
        bigint meal_time_id FK
        integer day_of_week
        boolean is_done
        bigint version
        timestamp created_at
        timestamp updated_at
    }

    MEAL_PLAN_ENTRY_RECIPES {
        bigint id PK
        bigint entry_id FK
        bigint recipe_id FK
        bigint user_id FK
        decimal multiplier
        timestamp created_at
        timestamp updated_at
    }

    MEAL_PLAN_ENTRY_ITEMS {
        bigint id PK
        bigint entry_id FK
        bigint item_id FK
        bigint user_id FK
        decimal quantity
        varchar unit
        timestamp created_at
        timestamp updated_at
    }

    MEAL_PLAN_VOTES {
        bigint id PK
        bigint entry_id FK
        bigint user_id FK
        boolean vote
        timestamp created_at
        timestamp updated_at
    }
```

### Table Definitions

| Table | Description |
|-------|-------------|
| `meal_times` | Named meal occasions (e.g., Breakfast, Lunch, Dinner) with `sort_order` for display ordering. |
| `meal_time_schedules` | Per-day-of-week time configuration for each meal time. `day_of_week` uses 0-6 (0=Monday, 6=Sunday). Column: `start_time`. |
| `meal_plans` | Weekly plans with a unique `week_start_date` (Monday). Status: `PENDING`, `PUBLISHED`, `ACCEPTED`, `CHANGED`. |
| `meal_plan_entries` | Individual meal slots: a specific meal time on a specific day. Supports `is_done` flag. |
| `meal_plan_entry_recipes` | Recipes assigned to an entry with `multiplier` (default 1.0). `user_id` is nullable — null means "for everyone". Supports multi-recipe meals. |
| `meal_plan_entry_items` | Standalone shopping items assigned to an entry with `quantity` and `unit`. `user_id` is nullable — null means "for everyone". |
| `meal_plan_votes` | Thumbs up/down feedback per entry per user. Unique constraint on `(entry_id, user_id)`. `vote` boolean: true = thumbs-up, false = thumbs-down. |

### Cross-Schema References

| Column | References | On Delete |
|--------|-----------|-----------|
| `meal_plan_entry_recipes.recipe_id` | `recipes.recipes(id)` | CASCADE |
| `meal_plan_entry_recipes.user_id` | `profiles.user(id)` | SET NULL |
| `meal_plan_entry_items.item_id` | `shopping.shopping_items(id)` | CASCADE |
| `meal_plan_entry_items.user_id` | `profiles.user(id)` | SET NULL |
| `meal_plan_votes.user_id` | `profiles.user(id)` | CASCADE |

---

## notifications Schema

This schema manages in-app notifications and direct messaging between household members.

### Detailed Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ NOTIFICATIONS : "receives"
    USER ||--o{ MESSAGES : "sends"
    USER ||--o{ MESSAGES : "receives"

    NOTIFICATIONS {
        bigint id PK
        bigint recipient_id FK
        bigint sender_id FK
        varchar type
        varchar title
        text message
        varchar link
        boolean is_read
        timestamp created_at
    }

    MESSAGES {
        bigint id PK
        bigint sender_id FK
        bigint recipient_id FK
        text content
        boolean is_read
        timestamp created_at
    }
```

### Table Definitions

| Table | Description |
|-------|-------------|
| `notifications` | Typed notifications with `link` (URL path) for navigation and `sender_id`/`sender_name` for attribution. Types: `MEAL_PLAN_PUBLISHED`, `MEAL_REMINDER`, `NEW_RECIPE_COMMENT`, `NEW_MESSAGE`. |
| `messages` | Direct messages between household members with read status tracking. |

### Cross-Schema References

| Column | References | On Delete |
|--------|-----------|-----------|
| `notifications.recipient_id` | `profiles.user(id)` | CASCADE |
| `notifications.sender_id` | `profiles.user(id)` | SET NULL |
| `messages.sender_id` | `profiles.user(id)` | CASCADE |
| `messages.recipient_id` | `profiles.user(id)` | CASCADE |

---

## media Schema

This schema provides centralized binary photo storage for all modules.

### Table Definition

| Table | Description |
|-------|-------------|
| `photos` | Binary image storage with unique `name`, `type` (profile, recipe, item, store), `extension`, `content_type`, and `data` (BYTEA). Served via `/api/images/{name}`. |

### Columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | BIGINT PK | Auto-generated identifier. |
| `name` | VARCHAR(255) UK | Unique filename used as the URL path segment. |
| `type` | VARCHAR(50) | Category: profile, recipe, item, store. |
| `extension` | VARCHAR(10) | File extension: png, jpg, svg, etc. |
| `content_type` | VARCHAR(100) | MIME type for HTTP response headers. |
| `data` | BYTEA | Binary image content. |

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
