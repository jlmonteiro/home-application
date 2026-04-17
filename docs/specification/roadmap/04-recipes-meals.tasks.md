# Tasks: Recipes & Meals Module

## 1. Overview
Implement a comprehensive recipes and meal planning module that allows household members to manage a shared cookbook, plan weekly meals with per-member assignments, and export meal ingredients to shopping lists. Includes an in-app notification and messaging system.

!!! info "Status Legend"
    - :material-check-circle: **Completed**
    - :material-play-circle: **In Progress**
    - :material-clock-outline: **Planned**

---

## 2. User Stories

### US-1: Recipe CRUD :material-play-circle: {: #us-1 }

!!! abstract "Story Definition"
    **As a** household member, **I want** to create, view, edit, and delete recipes, **so that** our family can build a shared cookbook.
    
    - **Persona:** Full-stack Engineer
    - **Estimate:** 8 hours
    - **Dependencies:** None

!!! note "Validates Requirements"
    - [:material-chef-hat: **FR-23: Recipe Management**](../requirements/recipes-meals.md#fr-23)

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } CRUD operations for Recipes (name, description in markdown, servings, source link, video link, prep time).
    2. :material-check-all:{ title="Ubiquitous" } The system shall display the recipe creator's name.
    3. :material-alert-circle:{ title="Unwanted Behavior" } If a recipe is referenced by a meal plan, then the system shall prevent deletion.

!!! example "Implementation Tasks"
    - [x] :material-database-sync: Create Liquibase migration for `recipes` schema and `recipes` table.
    - [x] :material-file-code: Implement JPA Entity, Repository, Service, and DTO for Recipe.
    - [x] :material-api: Implement REST Controller with HATEOAS support.
    - [x] :material-layers: Build React RecipesListPage, RecipeDetailPage, and RecipeFormPage.

---

### US-2: Recipe Photos & Dynamic Labels :material-clock-outline: {: #us-2 }

!!! abstract "Story Definition"
    **As a** household member, **I want** to add photos and labels to my recipes, **so that** they are visually appealing and easy to find.
    
    - **Persona:** Full-stack Engineer
    - **Estimate:** 6 hours
    - **Dependencies:** [US-1](#us-1)

!!! note "Validates Requirements"
    - [:material-image-multiple: **FR-24: Recipe Photos**](../requirements/recipes-meals.md#fr-24)
    - [:material-chef-hat: **FR-23: Recipe Management**](../requirements/recipes-meals.md#fr-23) (labels)

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } Upload one or more Base64-encoded photos per recipe.
    2. :material-check-all:{ title="Ubiquitous" } Designate a default photo for list views.
    3. :material-play-circle:{ title="Event-driven" } When a user types a new label, the system shall create it automatically.
    4. :material-play-circle:{ title="Event-driven" } When a label is orphaned, the system shall delete it.

!!! example "Implementation Tasks"
    - [ ] :material-database-sync: Create Liquibase migration for `recipe_photos`, `labels`, and `recipe_labels` tables.
    - [ ] :material-file-code: Implement entities, repositories, and services for photos and labels.
    - [ ] :material-api: Implement photo upload/delete and default selection endpoints.
    - [ ] :material-api: Implement label autocomplete endpoint (`GET /labels?q=`).
    - [ ] :material-layers: Build photo gallery and label tag input components.

---

### US-3: Ingredients & Nutrition Data :material-clock-outline: {: #us-3 }

!!! abstract "Story Definition"
    **As a** household member, **I want** to add ingredients from the shopping catalog and see nutrition totals, **so that** I know what I need and can track dietary intake.
    
    - **Persona:** Full-stack Engineer
    - **Estimate:** 6 hours
    - **Dependencies:** [US-1](#us-1)

!!! note "Validates Requirements"
    - [:material-food-apple: **FR-25: Recipe Ingredients**](../requirements/recipes-meals.md#fr-25)
    - [:material-nutrition: **FR-26: Nutrition Data**](../requirements/recipes-meals.md#fr-26)

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } Add ingredients by selecting items from `shopping.shopping_items` with quantity and unit (KG, G, L, ML, PACK, UNIT).
    2. :material-play-circle:{ title="Event-driven" } When the recipe detail is requested, the system shall calculate nutrition totals on-the-fly from flexible key-value-unit nutrition entries.
    3. :material-alert-circle:{ title="Unwanted Behavior" } If an ingredient has no nutrition entries, the system shall exclude it from totals and indicate the gap.

!!! example "Implementation Tasks"
    - [ ] :material-database-sync: Create Liquibase migration for `recipe_ingredients` and `nutrition_entries` tables.
    - [ ] :material-file-code: Implement entities, repositories, and services.
    - [ ] :material-cog: Implement on-the-fly nutrition calculation in RecipeService (sum entries grouped by nutrient key × ingredient quantity).
    - [ ] :material-api: Implement ingredient CRUD and nutrition GET/PUT endpoints.
    - [ ] :material-layers: Build ingredient selector and nutrition summary UI.

---

### US-4: Preparation Steps with Drag-and-Drop :material-clock-outline: {: #us-4 }

!!! abstract "Story Definition"
    **As a** household member, **I want** to add ordered preparation steps and reorder them via drag-and-drop, **so that** anyone can follow the recipe.
    
    - **Persona:** Full-stack Engineer
    - **Estimate:** 5 hours
    - **Dependencies:** [US-1](#us-1)

!!! note "Validates Requirements"
    - [:material-format-list-numbered: **FR-27: Preparation Steps**](../requirements/recipes-meals.md#fr-27)

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } Add steps with markdown instruction and optional time_minutes.
    2. :material-check-all:{ title="Ubiquitous" } Steps are persisted and displayed in sort_order.
    3. :material-play-circle:{ title="Event-driven" } When steps are reordered, the system shall update all sort_order values in a single transaction.

!!! example "Implementation Tasks"
    - [ ] :material-database-sync: Create Liquibase migration for `recipe_steps` table.
    - [ ] :material-file-code: Implement entity, repository, and service with reorder logic.
    - [ ] :material-api: Implement step CRUD and `PUT /recipes/{id}/steps/reorder` endpoint.
    - [ ] :material-layers: Build step list with `@dnd-kit/core` drag-and-drop.

---

### US-5: Comments & Ratings :material-clock-outline: {: #us-5 }

!!! abstract "Story Definition"
    **As a** household member, **I want** to comment on and rate recipes, **so that** we can share feedback and identify favorites.
    
    - **Persona:** Full-stack Engineer
    - **Estimate:** 5 hours
    - **Dependencies:** [US-1](#us-1)

!!! note "Validates Requirements"
    - [:material-comment-text: **FR-28: Recipe Comments**](../requirements/recipes-meals.md#fr-28)
    - [:material-star: **FR-29: Recipe Ratings**](../requirements/recipes-meals.md#fr-29)

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } Any household member can add comments.
    2. :material-check-all:{ title="Ubiquitous" } 1-5 star rating per user (unique constraint).
    3. :material-check-all:{ title="Ubiquitous" } Display average rating with expandable individual votes (who, score, when).
    4. :material-play-circle:{ title="Event-driven" } When a comment is added, create a `NEW_RECIPE_COMMENT` notification.

!!! example "Implementation Tasks"
    - [ ] :material-database-sync: Create Liquibase migration for `recipe_comments` and `recipe_ratings` tables.
    - [ ] :material-file-code: Implement entities, repositories, and services.
    - [ ] :material-api: Implement comment and rating endpoints.
    - [ ] :material-layers: Build comments section and star rating component with expandable votes.

---

### US-6: Meal Time Configuration :material-clock-outline: {: #us-6 }

!!! abstract "Story Definition"
    **As a** household member, **I want** to configure meal times with different schedules per day, **so that** the planner reflects our actual routine.
    
    - **Persona:** Full-stack Engineer
    - **Estimate:** 4 hours
    - **Dependencies:** None

!!! note "Validates Requirements"
    - [:material-clock-edit: **FR-30: Meal Time Configuration**](../requirements/recipes-meals.md#fr-30)

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } CRUD for meal times (Breakfast, Lunch, Dinner, etc.).
    2. :material-check-all:{ title="Ubiquitous" } Configure different times per day of the week (ISO 8601: 1=Monday, 7=Sunday).

!!! example "Implementation Tasks"
    - [ ] :material-database-sync: Create Liquibase migration for `meals` schema, `meal_times` and `meal_time_schedules` tables.
    - [ ] :material-file-code: Implement entities, repositories, and services.
    - [ ] :material-api: Implement CRUD endpoints for meal times with schedules.
    - [ ] :material-layers: Build MealTimesConfigPage with per-day time inputs.

---

### US-7: Weekly Meal Planner :material-clock-outline: {: #us-7 }

!!! abstract "Story Definition"
    **As a** household member, **I want** to plan weekly meals by assigning recipes to meal times and members, **so that** our family knows what to eat each day.
    
    - **Persona:** Full-stack Engineer
    - **Estimate:** 10 hours
    - **Dependencies:** [US-1](#us-1), [US-6](#us-6)

!!! note "Validates Requirements"
    - [:material-calendar-week: **FR-31: Weekly Meal Plan**](../requirements/recipes-meals.md#fr-31)

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } Create weekly plans (Monday–Sunday, unique `week_start_date`).
    2. :material-check-all:{ title="Ubiquitous" } Assign one or more recipes per meal entry (multi-recipe meals).
    3. :material-plus-circle-outline:{ title="Optional" } Where a recipe is assigned to specific members, record the `user_id`. Null means for everyone.
    4. :material-play-circle:{ title="Event-driven" } When a user marks an entry as "done", update the `is_done` flag.

!!! example "Implementation Tasks"
    - [ ] :material-database-sync: Create Liquibase migration for `meal_plans`, `meal_plan_entries`, and `meal_plan_entry_recipes` tables.
    - [ ] :material-file-code: Implement entities, repositories, and services.
    - [ ] :material-api: Implement CRUD endpoints for plans, entries, and recipe assignments.
    - [ ] :material-layers: Build MealPlannerPage with weekly grid (7 columns × N meal times).

---

### US-8: Meal Plan Approval, Thumbs Up/Down & Reminders :material-clock-outline: {: #us-8 }

!!! abstract "Story Definition"
    **As a** household member, **I want** to review meal plans, give feedback, and receive reminders, **so that** everyone has a say and nobody forgets to cook.
    
    - **Persona:** Full-stack Engineer
    - **Estimate:** 8 hours
    - **Dependencies:** [US-7](#us-7), [US-10](#us-10)

!!! note "Validates Requirements"
    - [:material-check-decagram: **FR-32: Meal Plan Approval Workflow**](../requirements/recipes-meals.md#fr-32)
    - [:material-bell-ring: **FR-33: Meal Preparation Reminders**](../requirements/recipes-meals.md#fr-33)
    - [:material-thumb-up: **FR-37: Meal Thumbs Up/Down**](../requirements/recipes-meals.md#fr-37)

!!! success "Acceptance Criteria"
    1. :material-play-circle:{ title="Event-driven" } When "Notify Household" is clicked, set status to PUBLISHED and create notifications.
    2. :material-play-circle:{ title="Event-driven" } When a member accepts, set status to ACCEPTED.
    3. :material-play-circle:{ title="Event-driven" } When a member suggests a change, auto-replace their assignment and set status to CHANGED.
    4. :material-plus-circle-outline:{ title="Optional" } Where a meal is done, allow thumbs up/down votes.
    5. :material-check-all:{ title="Ubiquitous" } Reminder scheduler runs every 15 minutes and creates MEAL_REMINDER notifications.

!!! example "Implementation Tasks"
    - [ ] :material-database-sync: Create Liquibase migration for `meal_plan_entry_members` table.
    - [ ] :material-file-code: Implement member response and vote services.
    - [ ] :material-api: Implement notify, respond, vote, and done endpoints.
    - [ ] :material-cog: Implement `MealReminderScheduler` (every 15 min).
    - [ ] :material-layers: Build approval UI with accept/suggest actions and thumbs up/down buttons.

---

### US-9: Shopping List Integration :material-clock-outline: {: #us-9 }

!!! abstract "Story Definition"
    **As a** household member, **I want** to export meal ingredients to a shopping list, **so that** I can shop for what I need to cook.
    
    - **Persona:** Full-stack Engineer
    - **Estimate:** 6 hours
    - **Dependencies:** [US-3](#us-3), [US-7](#us-7)

!!! note "Validates Requirements"
    - [:material-cart-arrow-down: **FR-36: Shopping List Integration**](../requirements/recipes-meals.md#fr-36)

!!! success "Acceptance Criteria"
    1. :material-play-circle:{ title="Event-driven" } When export is requested, generate a merge preview (new items + existing items with quantity changes).
    2. :material-play-circle:{ title="Event-driven" } When the user confirms, add items to the list or create a new one.
    3. :material-check-all:{ title="Ubiquitous" } No store assigned to new items unless already in the list.
    4. :material-alert-circle:{ title="Unwanted Behavior" } If an item already exists, increase quantity rather than creating a duplicate.

!!! example "Implementation Tasks"
    - [ ] :material-cog: Implement export preview and merge logic in MealPlanService.
    - [ ] :material-api: Implement preview and export endpoints.
    - [ ] :material-layers: Build merge confirmation modal with item summary.

---

### US-10: Notifications & Messaging :material-clock-outline: {: #us-10 }

!!! abstract "Story Definition"
    **As a** household member, **I want** to receive notifications and send messages, **so that** I stay informed and can communicate within the app.
    
    - **Persona:** Full-stack Engineer
    - **Estimate:** 8 hours
    - **Dependencies:** None

!!! note "Validates Requirements"
    - [:material-bell: **FR-38: In-App Notifications**](../requirements/notifications.md#fr-38)
    - [:material-message-text: **FR-39: User Messaging**](../requirements/notifications.md#fr-39)

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } Notification bell in header with unread count badge.
    2. :material-check-all:{ title="Ubiquitous" } Typed notifications (MEAL_PLAN_PUBLISHED, MEAL_REMINDER, MEAL_SUGGESTION_MADE, NEW_RECIPE_COMMENT, NEW_MESSAGE).
    3. :material-play-circle:{ title="Event-driven" } When a notification is clicked, mark as read and navigate to the referenced entity.
    4. :material-check-all:{ title="Ubiquitous" } Direct messaging between household members with read status.

!!! example "Implementation Tasks"
    - [ ] :material-database-sync: Create Liquibase migration for `notifications` schema, `notifications` and `messages` tables.
    - [ ] :material-file-code: Implement entities, repositories, and services.
    - [ ] :material-api: Implement notification and messaging endpoints.
    - [ ] :material-layers: Build NotificationBell component, NotificationsPage, and messaging UI.

---

### US-11: Dashboard Widget & Meals This Week Page :material-clock-outline: {: #us-11 }

!!! abstract "Story Definition"
    **As a** household member, **I want** to see this week's meals at a glance, **so that** I can quickly check what's planned.
    
    - **Persona:** Full-stack Engineer
    - **Estimate:** 4 hours
    - **Dependencies:** [US-7](#us-7)

!!! note "Validates Requirements"
    - [:material-view-week: **FR-35: Meals This Week View**](../requirements/recipes-meals.md#fr-35)

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } Dashboard widget showing today's planned meals with recipe names and assigned members.
    2. :material-check-all:{ title="Ubiquitous" } Dedicated MealsThisWeekPage with full weekly view.
    3. :material-check-all:{ title="Ubiquitous" } Current week determined by ISO 8601 Monday.

!!! example "Implementation Tasks"
    - [ ] :material-api: Implement `GET /meals/this-week` endpoint.
    - [ ] :material-layers: Build "Meals This Week" dashboard card.
    - [ ] :material-layers: Build MealsThisWeekPage with full weekly grid.
