# Recipes & Meals

The Recipes & Meals module is the family cookbook and meal planning hub. Create recipes, plan weekly meals, get reminders, and export ingredients directly to your shopping lists.

## Core Features

<div class="grid cards" markdown>

-   :material-chef-hat: **Shared Cookbook**
    
    Create recipes with photos, ingredients, preparation steps, and nutrition data. The whole family can comment and rate.

-   :material-calendar-week: **Weekly Meal Planner**
    
    Plan meals for the week, assign recipes to family members, and notify the household for review.

-   :material-cart-arrow-down: **Shopping Integration**
    
    Export meal ingredients to a new or existing shopping list with a merge preview before applying.

-   :material-bell-ring: **Reminders & Notifications**
    
    Get notified when a meal plan is published and receive preparation reminders before meal time.

</div>

---

## User Guides

### 1. Creating a Recipe
1.  Navigate to **Recipes & Meals** :material-arrow-right: **Recipes**.
2.  Click :material-plus: **New Recipe** and fill in the name, description (supports markdown), servings, and prep time.
3.  Optionally add a source link and video link for reference.
4.  Upload one or more **photos** and select a default photo for the recipes list.
5.  Add **labels** by typing — existing labels will autocomplete, new ones are created automatically.

### 2. Managing Ingredients
1.  On the recipe detail page, click **Add Ingredient**.
2.  Search and select an item from the shopping catalog.
3.  Specify the **quantity** and **unit** (KG, G, L, ML, PACK, UNIT).
4.  If the item has nutrition data, the recipe's nutrition totals update automatically.

### 3. Preparation Steps
1.  Add steps with markdown instructions and optional time (e.g., "knead for 10 minutes").
2.  Steps are displayed in order. Use **drag-and-drop** to reorder them.
3.  The new order is saved automatically.

### 4. Viewing Nutrition Data
- The recipe detail page shows **total nutrition** aggregated from all ingredients, grouped by nutrient type (e.g., calories, protein, fat).
- Nutrition entries are flexible key-value-unit triples — you can track any nutrient (calories, protein, sodium, fiber, etc.).
- Ingredients without nutrition entries are flagged so you know what's missing.
- To add nutrition data to an item, go to the item in the shopping catalog and add entries like `protein: 23.4 g` or `calories: 165 kcal`.

### 5. Rating Recipes
- Click the **stars** on a recipe to rate it from 1 to 5.
- The recipes list shows the **average rating**.
- Expand the rating section to see who rated, what score, and when.

### 6. Adding Comments
- Scroll to the comments section on any recipe and add your thoughts, tips, or variations.
- The recipe creator receives a notification when a new comment is added.

### 7. Configuring Meal Times
1.  Navigate to **Recipes & Meals** :material-arrow-right: **Meal Times**.
2.  Create meal times like Breakfast, Lunch, Dinner, or Snack.
3.  Set different times for each day of the week (e.g., Lunch at 12:00 on weekdays, 13:00 on weekends).

### 8. Planning Weekly Meals
1.  Navigate to **Recipes & Meals** :material-arrow-right: **Meal Planner**.
2.  Create a plan for a specific week (Monday–Sunday).
3.  For each meal time and day, assign one or more recipes.
4.  Assign recipes to **specific members** or to the **entire household**.
5.  Optionally set a **reminder** (e.g., 60 minutes before the meal).

### 9. Responding to Meal Plans
1.  When a plan is published, you'll receive a notification.
2.  Review your assigned meals and either **accept** or **suggest a change**.
3.  If you suggest a different recipe, your assignment is automatically updated.

### 10. Thumbs Up/Down
- After a meal is marked as **done**, give it a :material-thumb-up: or :material-thumb-down:.
- This helps the family track which meals everyone enjoyed.

### 11. Exporting to Shopping Lists
1.  Open a meal plan and click **Export to Shopping List**.
2.  Choose to create a **new list** or add to an **existing list**.
3.  Review the **merge preview** — it shows new items and quantity increases for existing items.
4.  Confirm to apply. New items are added without a store assignment.

### 12. Notifications & Messages
- The **bell icon** in the header shows your unread notification count.
- Click it to see notifications for meal plans, reminders, comments, and messages.
- Use the **Messages** section to send direct messages to other household members.

---

## Rationale & Logic

!!! info "Traceability"
    - :material-link: **[FR-23: Recipe Management](../specification/requirements/recipes-meals.md#fr-23)**: Core recipe CRUD with labels and metadata.
    - :material-link: **[FR-31: Weekly Meal Plan](../specification/requirements/recipes-meals.md#fr-31)**: Monday–Sunday planner with multi-recipe meals.
    - :material-link: **[FR-36: Shopping List Integration](../specification/requirements/recipes-meals.md#fr-36)**: Export with merge preview and confirmation.
    - :material-link: **[FR-38: In-App Notifications](../specification/requirements/notifications.md#fr-38)**: Notification bell with typed events.

!!! tip "Automatic Cleanup"
    Meal plans older than 10 weeks are automatically purged. Recipe labels with no associated recipes are deleted automatically.
