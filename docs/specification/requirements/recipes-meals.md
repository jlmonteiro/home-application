# Requirements: Recipes & Meals Module

!!! info "EARS Syntax Legend (Hover for trigger name)"

    - :material-check-all:{ title="Ubiquitous" } **Ubiquitous:** "The system shall..." (Always true)
    - :material-play-circle:{ title="Event-driven" } **Event-driven:** "When <trigger>, the system shall..."
    - :material-alert-circle:{ title="Unwanted Behavior" } **Unwanted Behavior:** "If <condition>, then the system shall..."
    - :material-clock-outline:{ title="State-driven" } **State-driven:** "While <state>, the system shall..."
    - :material-plus-circle-outline:{ title="Optional" } **Optional:** "Where <feature exists>, the system shall..."
    - :material-layers-outline:{ title="Complex" } **Complex:** Combinations of the above triggers.

## 1. User Journeys

### UJ-6: Recipe Creation {: #uj-6 }

!!! info ""

    1. **User A** navigates to **Recipes & Meals** :material-arrow-right: **Recipes** and clicks **New Recipe**.
    2. **User A** enters a name ("Grandma's Lasagna"), a markdown description, sets servings to 6, prep time to 90 minutes, and a source link.
    3. **User A** uploads two photos and selects one as the **default photo** for the recipes list.
    4. **User A** types labels: "Comfort Food" (autocompleted from existing) and "Italian" (created on demand).
    5. **User A** adds ingredients from the master item catalog: "Ground Beef" (500g), "Lasagna Sheets" (1 PACK), "Mozzarella" (200g).
    6. **User A** adds three preparation steps with markdown instructions and times, then reorders step 2 and 3 via drag-and-drop.
    7. **User A** saves the recipe. It appears in the recipes list with the default photo, name, average rating, and labels.

### UJ-7: Weekly Meal Planning {: #uj-7 }

!!! info ""

    1. **User A** navigates to **Recipes & Meals** :material-arrow-right: **Meal Planner** and creates a plan for the current week (Monday–Sunday).
    2. **User A** assigns "Scrambled Eggs" to Monday breakfast for Jorge and Vilma, and "Toast" for Fernanda.
    3. **User A** assigns "Grandma's Lasagna" + "Caesar Salad" (multi-recipe meal) to Monday dinner for the entire household.
    4. **User A** also assigns a standalone item "Fresh Orange Juice" (2 UNIT) to Monday breakfast for everyone.
    5. **User A** clicks **Notify Household**. All members receive an in-app notification with the plan status set to `PUBLISHED`.
    6. After dinner, **Jorge** marks Monday dinner as "done" and gives it a thumbs-up vote.

### UJ-8: Meal-to-Shopping-List Export {: #uj-8 }

!!! info ""
    1. **User A** opens the current week's meal plan and clicks **Export to Shopping List**.
    2. The system generates a **merge preview** showing: new items to add and existing items whose quantities will increase.
    3. **User A** reviews the preview, selects an existing "Weekly Groceries" list as the target, and confirms.
    4. The system adds new ingredients without a store assignment and increases quantities for items already in the list.

---

## 2. Functional Requirements

### FR-23: Recipe Management {: #fr-23 }

!!! success "Acceptance Criteria"

    1. :material-check-all:{ title="Ubiquitous" } The system shall allow any household member to create, read, update, and delete recipes.
    2. :material-check-all:{ title="Ubiquitous" } The system shall store a recipe with a `name`, `description` (markdown), `servings`, `source_link`, `video_link`, and `prep_time_minutes`.
    3. :material-check-all:{ title="Ubiquitous" } The system shall support zero or more **labels** per recipe.
    4. :material-play-circle:{ title="Event-driven" } When a user types a label that does not exist, the system shall create it automatically.
    5. :material-play-circle:{ title="Event-driven" } When a user types a label, the system shall provide autocomplete suggestions from existing labels.
    6. :material-play-circle:{ title="Event-driven" } When a label is removed from a recipe and no other recipe references it, the system shall delete the label from the database.
    7. :material-alert-circle:{ title="Unwanted Behavior" } If a recipe is referenced by any meal plan, then the system shall prevent its deletion and return a validation error.

!!! quote "Rationale"
    **So That** our family can build a shared cookbook, I want to create and manage recipes collaboratively.

### FR-24: Recipe Photos {: #fr-24 }

!!! success "Acceptance Criteria"

    1. :material-check-all:{ title="Ubiquitous" } The system shall allow users to upload one or more photos per recipe, stored via the centralized media service and referenced by `photo_name`.
    2. :material-check-all:{ title="Ubiquitous" } The system shall allow the user to designate one photo as the **default photo** (via an `is_default` boolean) for display in the recipes list.
    3. :material-alert-circle:{ title="Unwanted Behavior" } If no default photo is explicitly set and photos exist, then the system shall use the first uploaded photo as the default.

!!! quote "Rationale"
    **So That** recipes are visually appealing and easy to identify, I want to attach photos to my recipes.

### FR-25: Recipe Ingredients {: #fr-25 }

!!! success "Acceptance Criteria"

    1. :material-check-all:{ title="Ubiquitous" } The system shall allow users to add ingredients to a recipe by selecting items from the `shopping.shopping_items` master catalog.
    2. :material-check-all:{ title="Ubiquitous" } The system shall require a `quantity` and a `unit` (KG, G, L, ML, PACK, UNIT) for each ingredient, using the same unit enum as the Shopping module.
    3. :material-check-all:{ title="Ubiquitous" } The system shall allow a recipe to have one or more ingredients.
    4. :material-plus-circle-outline:{ title="Optional" } Where a user specifies a `group_name` (e.g., "For the sauce", "For the dough"), the system shall group ingredients visually by that label.

!!! quote "Rationale"
    **So That** I know exactly what I need to prepare a recipe, I want to link catalog items as ingredients with precise quantities.

### FR-26: Nutrition Data {: #fr-26 }

!!! success "Acceptance Criteria"

    1. :material-check-all:{ title="Ubiquitous" } The system shall maintain a **nutrients master catalog** (`recipes.nutrients`) with predefined entries (e.g., Energy, Fat, Protein, Carbohydrate) each having a `name`, `description`, and `unit`.
    2. :material-plus-circle-outline:{ title="Optional" } Where a shopping item has nutrition data, the system shall store zero or more `nutrition_entries` linking the item to a nutrient from the master catalog with a numeric `value`.
    3. :material-check-all:{ title="Ubiquitous" } The system shall define a `nutrition_sample_size` and `nutrition_sample_unit` per shopping item to specify the reference portion (e.g., "per 100g").
    4. :material-play-circle:{ title="Event-driven" } When a recipe detail is requested, the system shall calculate the total nutrition values on-the-fly by summing each ingredient's nutrition entries (grouped by nutrient) scaled by its quantity relative to the sample size.
    5. :material-alert-circle:{ title="Unwanted Behavior" } If an ingredient has no nutrition entries, then the system shall exclude it from the nutrition totals and indicate which ingredients are missing data.

!!! quote "Rationale"
    **So That** I can track dietary intake with standardized nutrition metrics, I want a structured nutrition system backed by a managed nutrient catalog.

### FR-27: Preparation Steps {: #fr-27 }

!!! success "Acceptance Criteria"

    1. :material-check-all:{ title="Ubiquitous" } The system shall allow users to add one or more preparation steps to a recipe.
    2. :material-check-all:{ title="Ubiquitous" } The system shall store each step with an `instruction` (markdown) and an optional `time_minutes`.
    3. :material-check-all:{ title="Ubiquitous" } The system shall persist the order of steps via a `sort_order` column and present them in that order.
    4. :material-check-all:{ title="Ubiquitous" } The system shall support drag-and-drop reordering of steps in the UI.
    5. :material-play-circle:{ title="Event-driven" } When a user reorders steps, the system shall update the `sort_order` values for all affected steps in a single transaction.

!!! quote "Rationale"
    **So That** anyone can follow the recipe, I want clear, ordered preparation instructions.

### FR-28: Recipe Comments {: #fr-28 }

!!! success "Acceptance Criteria"

    1. :material-check-all:{ title="Ubiquitous" } The system shall allow any household member to add comments to a recipe.
    2. :material-clock-outline:{ title="State-driven" } While a comment exists, the system shall display the author's name and the timestamp.
    3. :material-play-circle:{ title="Event-driven" } When a comment is added, the system shall create a `NEW_RECIPE_COMMENT` notification for the recipe creator.

!!! quote "Rationale"
    **So That** we can share tips and feedback, I want to comment on family recipes.

### FR-29: Recipe Ratings {: #fr-29 }

!!! success "Acceptance Criteria"

    1. :material-check-all:{ title="Ubiquitous" } The system shall allow each household member to rate a recipe from 1 to 5 stars.
    2. :material-check-all:{ title="Ubiquitous" } The system shall enforce a unique rating per user per recipe (updating replaces the previous rating).
    3. :material-check-all:{ title="Ubiquitous" } The system shall display the **average rating** on the recipe list and detail views.
    4. :material-plus-circle-outline:{ title="Optional" } Where a user expands the rating section, the system shall display individual votes showing who rated, what score, and when.

!!! quote "Rationale"
    **So That** we can identify our favorite recipes, I want a collaborative rating system.

### FR-30: Meal Time Configuration {: #fr-30 }

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } The system shall allow users to configure meal times (e.g., Breakfast, Lunch, Dinner, Snack).
    2. :material-check-all:{ title="Ubiquitous" } The system shall allow different times per day of the week for each meal time (e.g., Lunch at 12:00 on weekdays, 13:00 on weekends).
    3. :material-check-all:{ title="Ubiquitous" } The system shall store meal time schedules via a `meal_time_schedules` table linking meal times to day-of-week and time-of-day.

!!! quote "Rationale"
    **So That** the meal planner reflects our actual routine, I want to configure when we eat each meal.

### FR-31: Weekly Meal Plan {: #fr-31 }

!!! success "Acceptance Criteria"

    1. :material-check-all:{ title="Ubiquitous" } The system shall support weekly meal plans running **Monday through Sunday** (ISO 8601).
    2. :material-check-all:{ title="Ubiquitous" } The system shall enforce a unique `week_start_date` (the Monday) per meal plan.
    3. :material-check-all:{ title="Ubiquitous" } The system shall allow users to assign one or more recipes to a meal time entry (multi-recipe meals), each with an optional `multiplier` (default 1.0) for quantity scaling.
    4. :material-check-all:{ title="Ubiquitous" } The system shall allow users to assign standalone shopping items directly to a meal time entry (without requiring a recipe), specifying a `quantity` and `unit`.
    5. :material-plus-circle-outline:{ title="Optional" } Where a recipe or item is assigned to specific members, the system shall record the `user_id` on the assignment. A null `user_id` means it applies to the entire household.
    6. :material-play-circle:{ title="Event-driven" } When a user marks a meal entry as "done", the system shall update the `is_done` flag.
    7. :material-check-all:{ title="Ubiquitous" } The system shall track meal plan status using the values: `PENDING`, `PUBLISHED`, `ACCEPTED`, `CHANGED`.

!!! quote "Rationale"
    **So That** our family knows what to eat each day, I want to plan meals for the entire week.

### FR-32: Meal Plan Publish & Notify {: #fr-32 }

!!! warning "Scope Change"
    The original approval workflow (per-member PENDING/ACCEPTED/CHANGED tracking) was **dropped** during implementation. Only the publish and notify flow remains.

!!! success "Acceptance Criteria"

    1. :material-play-circle:{ title="Event-driven" } When a user clicks "Notify Household", the system shall change the meal plan status to `PUBLISHED` and create a `MEAL_PLAN_PUBLISHED` notification for all household members.

!!! quote "Rationale"
    **So That** everyone knows what's planned, I want to notify the household when the meal plan is ready.

### FR-33: Meal Preparation Reminders {: #fr-33 }

!!! warning "Deferred"
    This feature is **scaffolded but not yet functional**. The `MealReminderScheduler` service exists but the `reminder_offset_minutes` column is not yet in the database schema.

!!! success "Acceptance Criteria"

    1. :material-plus-circle-outline:{ title="Optional" } Where a meal plan entry has a `reminder_offset_minutes` configured, the system shall create a `MEAL_REMINDER` notification for all assigned members at the calculated time (meal time minus offset).
    2. :material-check-all:{ title="Ubiquitous" } The system shall check for pending reminders every 15 minutes via a scheduled task.

!!! quote "Rationale"
    **So That** I don't forget to start cooking, I want to receive a reminder before meal preparation time.

### FR-34: Meal Plan Data Retention {: #fr-34 }

!!! success "Acceptance Criteria"

    1. :material-check-all:{ title="Ubiquitous" } The system shall preserve the last 10 weeks of meal plan history.
    2. :material-play-circle:{ title="Event-driven" } When the daily retention task executes (03:00 AM), the system shall permanently delete all meal plans with a `week_start_date` older than 10 weeks and their associated entries, recipes, and member records.

!!! quote "Rationale"
    **So That** the system remains performant, old meal plans should be removed automatically.

### FR-35: Meals This Week View {: #fr-35 }

!!! success "Acceptance Criteria"

    1. :material-check-all:{ title="Ubiquitous" } The system shall provide a **dashboard widget** summarizing the current week's planned meals.
    2. :material-check-all:{ title="Ubiquitous" } The system shall provide a **dedicated page** showing the full weekly meal plan with all entries, assigned recipes, and member statuses.
    3. :material-check-all:{ title="Ubiquitous" } The system shall determine the current week using the ISO 8601 Monday of the current date.

!!! quote "Rationale"
    **So That** I can quickly see what's planned, I want a "Meals This Week" view on the dashboard and as a full page.

### FR-36: Shopping List Integration {: #fr-36 }

!!! success "Acceptance Criteria"

    1. :material-play-circle:{ title="Event-driven" } When a user requests an export, the system shall generate a **merge preview** listing new items and existing items with updated quantities.
    2. :material-play-circle:{ title="Event-driven" } When the user confirms the preview, the system shall add ingredients to the selected shopping list or create a new one.
    3. :material-check-all:{ title="Ubiquitous" } The system shall use the same unit system (KG, G, L, ML, PACK, UNIT) as the Shopping module.
    4. :material-alert-circle:{ title="Unwanted Behavior" } If an ingredient item already exists in the target list, then the system shall increase the quantity by the recipe amount rather than creating a duplicate entry.
    5. :material-check-all:{ title="Ubiquitous" } The system shall NOT assign a store to newly added items unless the item already exists in the list with a store assignment.

!!! quote "Rationale"

    **So That** I can shop for what I need to cook, I want to export meal ingredients directly to my shopping list.

### FR-37: Meal Thumbs Up/Down {: #fr-37 }

!!! success "Acceptance Criteria"

    1. :material-plus-circle-outline:{ title="Optional" } Where a meal entry is marked as "done", the system shall allow assigned members to give a thumbs-up or thumbs-down vote.
    2. :material-check-all:{ title="Ubiquitous" } The system shall store votes in a dedicated `meal_plan_votes` table with a unique constraint per entry and user (boolean: true = thumbs-up, false = thumbs-down).
    3. :material-check-all:{ title="Ubiquitous" } The system shall display aggregated vote counts (thumbs-up and thumbs-down totals) on each meal entry.

!!! quote "Rationale"

    **So That** we can track which meals the family enjoyed, I want to give quick feedback after eating.

### FR-40: Nutrient Master Catalog {: #fr-40 }

!!! success "Acceptance Criteria"

    1. :material-check-all:{ title="Ubiquitous" } The system shall maintain a `recipes.nutrients` master table with predefined nutrient entries (Energy, Fat, Saturated Fat, Mono-unsaturated Fat, Poly-unsaturated Fat, Carbohydrate, Sugars, Polyols, Starch, Fibre, Protein, Salt, Sodium, Vitamin A, Vitamin C, Calcium, Iron).
    2. :material-check-all:{ title="Ubiquitous" } The system shall store each nutrient with a `name`, optional `description`, and `unit` (e.g., kcal, g, mg, µg).
    3. :material-clock-outline:{ title="State-driven" } While a user is classified as an **Adult**, the system shall allow the user to create, update, and delete nutrients via the Nutrient Settings page (`/settings/nutrients`).
    4. :material-alert-circle:{ title="Unwanted Behavior" } If a nutrient is referenced by any nutrition entry, then the system shall prevent its deletion.

!!! quote "Rationale"
    **So That** nutrition tracking uses standardized, consistent metrics, I want a managed catalog of nutrients rather than free-form text entries.

### FR-41: Standalone Meal Items {: #fr-41 }

!!! success "Acceptance Criteria"

    1. :material-check-all:{ title="Ubiquitous" } The system shall allow users to assign shopping items directly to a meal plan entry without requiring a recipe.
    2. :material-check-all:{ title="Ubiquitous" } The system shall store each meal item assignment with a reference to the shopping item, a `quantity`, a `unit`, and an optional `user_id` for per-member assignment.
    3. :material-check-all:{ title="Ubiquitous" } The system shall include standalone meal items in the shopping list export alongside recipe ingredients.

!!! quote "Rationale"
    **So That** I can plan simple items (fruit, yogurt, juice) without creating a recipe for each, I want to assign items directly to meals.
