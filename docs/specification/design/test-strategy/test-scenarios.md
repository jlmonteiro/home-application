# Test Scenarios

!!! info "Legend"
    - :material-check-circle: **Positive Case**: Verifies expected behavior under normal conditions.
    - :material-alert-circle: **Negative Case**: Verifies system resilience and error handling under failure or invalid conditions.

## Authentication & Onboarding

### TS-1: Google OAuth2 User Registration :material-check-circle: {: #ts-1 }
- :material-arrow-right-circle: **Given**: A user who has never logged in to the application.
- :material-play-circle: **When**: The user successfully authenticates via Google OAuth2.
- :material-check-all: **Then**: A new local user record and profile are created.

!!! info "Validates"
    - [FR-1: Google OAuth2 Authentication](../../requirements/auth-profile.md#fr-1)
    - [FR-2: Automatic User Registration](../../requirements/auth-profile.md#fr-2)

### TS-2: Google OAuth2 Login (Returning User) :material-check-circle: {: #ts-2 }
- :material-arrow-right-circle: **Given**: A user who already has a local account.
- :material-play-circle: **When**: The user successfully authenticates via Google OAuth2.
- :material-check-all: **Then**: The existing local user record is retrieved.

!!! info "Validates"
    - [FR-1: Google OAuth2 Authentication](../../requirements/auth-profile.md#fr-1)

### TS-3: Authentication Failure :material-alert-circle: {: #ts-3 }
- :material-arrow-right-circle: **Given**: A user who cancels the login process at Google.
- :material-play-circle: **When**: The user is redirected back to the application.
- :material-check-all: **Then**: The system redirects them to `/login?error=true`.

!!! info "Validates"
    - [FR-1: Google OAuth2 Authentication](../../requirements/auth-profile.md#fr-1)

### TS-4: Service Timeout / Token Exchange Failure :material-alert-circle: {: #ts-4 }
- :material-arrow-right-circle: **Given**: An issue with Google's token endpoint.
- :material-play-circle: **When**: The backend attempts to exchange the authorization code for a token.
- :material-check-all: **Then**: The system displays a "Service Unavailable" error message.

!!! info "Validates"
    - [FR-1: Google OAuth2 Authentication](../../requirements/auth-profile.md#fr-1)

## User Profile Management

### TS-7: Successful User Profile Update :material-check-circle: {: #ts-7 }
- :material-arrow-right-circle: **Given**: An authenticated user.
- :material-play-circle: **When**: The user sends a `PUT /api/user/me` with valid social links, a phone number, and a new photo.
- :material-check-all: **Then**: The system updates the profile, returns 200 OK with the updated HATEOAS resource, and displays a success notification (toast) in the UI.

!!! info "Validates"
    - [FR-4: Update User Profile](../../requirements/auth-profile.md#fr-4)

### TS-8: Profile Update Validation Failure :material-alert-circle: {: #ts-8 }
- :material-arrow-right-circle: **Given**: An authenticated user.
- :material-play-circle: **When**: The user sends a `PUT /api/user/me` with an invalid phone format or a malformed Facebook URL.
- :material-check-all: **Then**: The system returns 400 Bad Request with a list of field-level violations.

!!! info "Validates"
    - [FR-4: Update User Profile](../../requirements/auth-profile.md#fr-4)

### TS-9: Protection of Immutable Fields :material-check-circle: {: #ts-9 }
- :material-arrow-right-circle: **Given**: An authenticated user.
- :material-play-circle: **When**: The user sends a `PUT /api/user/me` containing a new `firstName` or `email`.
- :material-check-all: **Then**: The system updates the allowed profile fields but ignores the changes to `firstName` and `email`.

!!! info "Validates"
    - [FR-4: Update User Profile](../../requirements/auth-profile.md#fr-4)

### TS-10: Profile Dropdown Detailed View (Conditional) :material-check-circle: {: #ts-10 }
- :material-arrow-right-circle: **Given**: An authenticated user with a mobile phone and a LinkedIn profile.
- :material-play-circle: **When**: The user opens the header dropdown menu.
- :material-check-all: **Then**: The system displays the mobile phone and a clickable LinkedIn icon/link.

!!! info "Validates"
    - [FR-3: User Profile Quick View](../../requirements/auth-profile.md#fr-3)

### TS-11: Profile Dropdown Compact View (Fallback) :material-check-circle: {: #ts-11 }
- :material-arrow-right-circle: **Given**: An authenticated user with no optional profile fields (phone, social).
- :material-play-circle: **When**: The user opens the header dropdown menu.
- :material-check-all: **Then**: The system displays only basic info (name, photo) and the "View/Edit Profile" link, omitting phone and social sections.

!!! info "Validates"
    - [FR-3: User Profile Quick View](../../requirements/auth-profile.md#fr-3)

## Shopping Module Scenarios

### TS-23: Category & Master Item Creation :material-check-circle: {: #ts-23 }
- :material-arrow-right-circle: **Given**: An authenticated user.
- :material-play-circle: **When**: The user creates a "Dairy" category and then adds a "Whole Milk" item linked to it.
- :material-check-all: **Then**: The system SHALL persist the category and the item, ensuring the link is established.

!!! info "Validates"
    - [FR-5: Category & Item Management](../../requirements/shopping-list.md#fr-5)

### TS-30: Store Management with Photos :material-check-circle: {: #ts-30 }
- :material-arrow-right-circle: **Given**: An authenticated user.
- :material-play-circle: **When**: The user creates a new Store with a name, description, and an uploaded photo.
- :material-check-all: **Then**: The system SHALL save the store details and correctly display the photo in the list.

!!! info "Validates"
    - [FR-6: Store Management](../../requirements/shopping-list.md#fr-6)

### TS-31: Shopping List Visibility & Collaboration :material-check-circle: {: #ts-31 }
- :material-arrow-right-circle: **Given**: User A creates a "Weekend Party" shopping list.
- :material-play-circle: **When**: User B logs in.
- :material-check-all: **Then**: User B SHALL see the "Weekend Party" list on their dashboard and be able to add items to it.

!!! info "Validates"
    - [FR-7: Shopping List Creation & Collaboration](../../requirements/shopping-list.md#fr-7)

### TS-13: Collaborative Item Check-off (Real-time) :material-check-circle: {: #ts-13 }
- :material-arrow-right-circle: **Given**: Two users (A and B) belong to the same household and are viewing the same shopping list.
- :material-play-circle: **When**: User A marks "Apples" as "Bought".
- :material-check-all: **Then**: The backend updates the item status, and User B's UI automatically reflects the "Bought" state.

!!! info "Validates"
    - [FR-7: Shopping List Creation & Collaboration](../../requirements/shopping-list.md#fr-7)
    - [FR-10: In-Store Progress Tracking](../../requirements/shopping-list.md#fr-10)

### TS-14: Intelligent Price Suggestions :material-check-circle: {: #ts-14 }
- :material-arrow-right-circle: **Given**: A user has previously bought "Bread" at "Store X" for €1.50 and "Store Y" for €1.20.
- :material-play-circle: **When**: The user adds "Bread" to a new list and selects "Store X".
- :material-check-all: **Then**: The system suggests €1.50 as the price.

!!! info "Validates"
    - [FR-9: Price History & Suggestions](../../requirements/shopping-list.md#fr-9)

### TS-25: Global Price Suggestion Fallback :material-check-circle: {: #ts-25 }
- :material-arrow-right-circle: **Given**: A user has previously bought "Bread" at "Store X" for €1.50 (most recent) and "Store Y" for €1.20.
- :material-play-circle: **When**: The user adds "Bread" to a list and selects "Any Place".
- :material-check-all: **Then**: The system SHALL suggest €1.50 as the Global Last Price.

!!! info "Validates"
    - [FR-9: Price History & Suggestions](../../requirements/shopping-list.md#fr-9)

### TS-15: Automatic Data Retention (Cleanup) :material-check-circle: {: #ts-15 }
- :material-arrow-right-circle: **Given**: A shopping list that was marked as "Completed" 95 days ago.
- :material-play-circle: **When**: The daily retention background task executes.
- :material-check-all: **Then**: The system SHALL permanently delete the list and all its associated `ListItem` records.

!!! info "Validates"
    - [FR-11: Automatic Data Retention](../../requirements/shopping-list.md#fr-11)

### TS-17: Loyalty Card Barcode Validation :material-check-circle: {: #ts-17 }
- :material-arrow-right-circle: **Given**: A loyalty card configured with the "Code 128" barcode type.
- :material-play-circle: **When**: The user views the card details in the UI.
- :material-check-all: **Then**: The system SHALL render a linear 1D barcode encoding the exact card number.

!!! info "Validates"
    - [FR-12: Loyalty Cards](../../requirements/shopping-list.md#fr-12)

### TS-24: Coupon Usage Tracking & Filtering :material-check-circle: {: #ts-24 }
- :material-arrow-right-circle: **Given**: An authenticated user with an active coupon.
- :material-play-circle: **When**: The user marks the coupon as "Used".
- :material-check-all: **Then**: The coupon SHALL be hidden from the default active view and the Dashboard warning panel.

!!! info "Validates"
    - [FR-13: Store Coupons](../../requirements/shopping-list.md#fr-13)

### TS-16: Dashboard Coupon Warning :material-check-circle: {: #ts-16 }
- :material-arrow-right-circle: **Given**: An unused coupon for "Lidl" expiring in 48 hours.
- :material-play-circle: **When**: The user views the application Dashboard.
- :material-check-all: **Then**: The "Expiring Coupons" panel displays the Lidl coupon with its expiration date highlighted.

!!! info "Validates"
    - [FR-15: Expiration Warning Panel (Dashboard)](../../requirements/shopping-list.md#fr-15)

## Family Hierarchy & Age Groups

### TS-18: First User Bootstrap (Onboarding) :material-check-circle: {: #ts-18 }
- :material-arrow-right-circle: **Given**: A completely empty system with no users.
- :material-play-circle: **When**: The first user successfully authenticates via Google.
- :material-check-all: **Then**: The system SHALL assign them the "Adult" age group, regardless of their actual age.

!!! info "Validates"
    - [UJ-1: First-Time Login (Onboarding)](../../requirements/auth-profile.md#uj-1)

### TS-19: Automated Age Group Classification :material-check-circle: {: #ts-19 }
- :material-arrow-right-circle: **Given**: Configured age ranges: Child (0-12), Teenager (13-17), Adult (18+).
- :material-arrow-right-circle: **And**: A user with a birthdate exactly 13 years ago today.
- :material-play-circle: **When**: The user logs in or the daily recalculation task runs.
- :material-check-all: **Then**: The user's profile SHALL be updated from "Child" to "Teenager".

!!! info "Validates"
    - [FR-16: Automated Age Group Classification](../../requirements/auth-profile.md#fr-16)

### TS-20: Google Birthdate Synchronization :material-check-circle: {: #ts-20 }
- :material-arrow-right-circle: **Given**: An authenticated session with the `user.birthday.read` scope.
- :material-play-circle: **When**: The onboarding process calls the Google People API.
- :material-check-all: **Then**: The system SHALL extract the birthdate and persist it in the `UserProfile`.
- :material-check-all: **And**: If Google returns no birthdate, the system SHALL prompt the user for manual entry.

!!! info "Validates"
    - [FR-17: Google Birthdate Integration](../../requirements/auth-profile.md#fr-17)

### TS-28: Age Range Update & Global Recalculation :material-check-circle: {: #ts-28 }
- :material-arrow-right-circle: **Given**: An "Adult" user.
- :material-play-circle: **When**: The user modifies the "Teenager" range in the Settings module.
- :material-check-all: **Then**: The system SHALL trigger a recalculation of age groups for all household members based on the new ranges.

!!! info "Validates"
    - [FR-18: Age Group Configuration](../../requirements/settings.md#fr-18)
    - [UJ-5: Configuring Household Age Groups](../../requirements/settings.md#uj-5)

### TS-27: Age Range Contiguity & Overlap Validation :material-alert-circle: {: #ts-27 }
- :material-arrow-right-circle: **Given**: An "Adult" user.
- :material-play-circle: **When**: The user attempts to save age ranges that overlap (e.g., Child 0-13, Teenager 12-18).
- :material-check-all: **Then**: The system SHALL return a validation error and prevent saving.

!!! info "Validates"
    - [FR-18: Age Group Configuration](../../requirements/settings.md#fr-18)

### TS-26: Custom Family Role Management :material-check-circle: {: #ts-26 }
- :material-arrow-right-circle: **Given**: An "Adult" user.
- :material-play-circle: **When**: The user creates a custom role "Grandmother" in the Settings module.
- :material-check-all: **Then**: The role SHALL become available for selection in user profiles.

!!! info "Validates"
    - [FR-19: Family Role Configuration](../../requirements/settings.md#fr-19)

### TS-21: Settings Access Control :material-alert-circle: {: #ts-21 }
- :material-arrow-right-circle: **Given**: A user classified as "Child" or "Teenager".
- :material-play-circle: **When**: They attempt to access `GET /api/settings/**` or `PUT /api/settings/**`.
- :material-check-all: **Then**: The system SHALL return a 403 Forbidden status.

!!! info "Validates"
    - [FR-18: Age Group Configuration](../../requirements/settings.md#fr-18)
    - [FR-19: Family Role Configuration](../../requirements/settings.md#fr-19)

## Infrastructure & Reliability

### TS-5: Database Offline :material-alert-circle: {: #ts-5 }
- :material-arrow-right-circle: **Given**: The PostgreSQL database is unreachable.
- :material-play-circle: **When**: An API request is made to `/api/user/me`.
- :material-check-all: **Then**: The system returns a 503 Service Unavailable with an RFC 7807 Problem Detail.

!!! info "Validates"
    - [NFR-3: Reliability & Sync](../../requirements/shopping-list.md#nfr-3)

### TS-6: Unauthorized Access (Zero Trust) :material-alert-circle: {: #ts-6 }
- :material-arrow-right-circle: **Given**: An unauthenticated request.
- :material-play-circle: **When**: Accessing `/api/user/me`.
- :material-check-all: **Then**: The system returns a 401 Unauthorized status.

!!! info "Validates"
    - [NFR-1: Security (Zero Trust)](../../requirements/auth-profile.md#nfr-1)

### TS-12: Frontend Cache Utilization :material-check-circle: {: #ts-12 }
- :material-arrow-right-circle: **Given**: An authenticated user who has already loaded their profile.
- :material-play-circle: **When**: The user navigates between the Dashboard and Profile pages within a 5-minute window.
- :material-check-all: **Then**: The system SHALL NOT trigger a new network request to `/api/user/me`, serving the data from the TanStack Query cache instead.

!!! info "Validates"
    - [NFR-2: Performance (Latency)](../../requirements/shared.md#nfr-2)

### TS-22: Documentation Generation Verification :material-check-circle: {: #ts-22 }
- :material-arrow-right-circle: **Given**: A valid `mkdocs.yml` and markdown files in `docs/`.
- :material-play-circle: **When**: The Gradle task `./gradlew generateDocs` is executed.
- :material-check-all: **Then**: A directory `build/docs/` SHALL be created containing a functional static HTML site.

!!! info "Validates"
    - [FR-20: Integrated Documentation Build (MkDocs)](../../requirements/documentation.md#fr-20)
    - [FR-21: Gradle Integration](../../requirements/documentation.md#fr-21)

## Recipes Module Scenarios

### TS-30B: Recipe CRUD with Photos :material-check-circle: {: #ts-30b }
- :material-arrow-right-circle: **Given**: An authenticated user.
- :material-play-circle: **When**: The user creates a recipe with a name, markdown description, two photos, and sets one as default.
- :material-check-all: **Then**: The system SHALL persist the recipe and photos, and the recipes list SHALL display the default photo.

!!! info "Validates"
    - [FR-23: Recipe Management](../../requirements/recipes-meals.md#fr-23)
    - [FR-24: Recipe Photos](../../requirements/recipes-meals.md#fr-24)

### TS-31B: Dynamic Label Lifecycle :material-check-circle: {: #ts-31b }
- :material-arrow-right-circle: **Given**: An authenticated user creating a recipe.
- :material-play-circle: **When**: The user types "Italian" (new label) and "Comfort Food" (existing label).
- :material-check-all: **Then**: The system SHALL create "Italian" in the labels table and link both labels to the recipe.
- :material-play-circle: **When**: The user later removes "Italian" from the only recipe that uses it.
- :material-check-all: **Then**: The system SHALL delete "Italian" from the labels table.

!!! info "Validates"
    - [FR-23: Recipe Management](../../requirements/recipes-meals.md#fr-23)

### TS-32: Ingredient Linking with Unit Validation :material-check-circle: {: #ts-32 }
- :material-arrow-right-circle: **Given**: A recipe and a shopping item "Chicken Breast" in the catalog.
- :material-play-circle: **When**: The user adds "Chicken Breast" as an ingredient with quantity 500 and unit G.
- :material-check-all: **Then**: The system SHALL persist the ingredient with the same unit enum used by the Shopping module.

!!! info "Validates"
    - [FR-25: Recipe Ingredients](../../requirements/recipes-meals.md#fr-25)

### TS-33: Step Reordering :material-check-circle: {: #ts-33 }
- :material-arrow-right-circle: **Given**: A recipe with 3 preparation steps in order [A, B, C].
- :material-play-circle: **When**: The user drags step C to position 1.
- :material-check-all: **Then**: The system SHALL update sort_order values so the order becomes [C, A, B] in a single transaction.

!!! info "Validates"
    - [FR-27: Preparation Steps](../../requirements/recipes-meals.md#fr-27)

### TS-34: On-the-Fly Nutrition Calculation :material-check-circle: {: #ts-34 }
- :material-arrow-right-circle: **Given**: A recipe with 2 ingredients: "Rice" (200g, nutrition entries: [calories: 130 kcal, protein: 2.7 g]) and "Chicken" (300g, nutrition entries: [calories: 165 kcal, protein: 31 g]).
- :material-play-circle: **When**: The user views the recipe detail.
- :material-check-all: **Then**: The system SHALL display aggregated totals grouped by nutrient key: [calories: 295 kcal, protein: 14.7 g], computed on-the-fly.

!!! info "Validates"
    - [FR-26: Nutrition Data](../../requirements/recipes-meals.md#fr-26)

### TS-35: Nutrition Calculation with Missing Data :material-alert-circle: {: #ts-35 }
- :material-arrow-right-circle: **Given**: A recipe with 2 ingredients, one with nutrition entries and one without.
- :material-play-circle: **When**: The user views the recipe detail.
- :material-check-all: **Then**: The system SHALL calculate totals from the ingredient with entries and indicate which ingredient is missing nutrition data.

!!! info "Validates"
    - [FR-26: Nutrition Data](../../requirements/recipes-meals.md#fr-26)

### TS-36: Rating Average with Individual Votes :material-check-circle: {: #ts-36 }
- :material-arrow-right-circle: **Given**: User A rates a recipe 4 stars, User B rates it 5 stars.
- :material-play-circle: **When**: Any user views the recipe.
- :material-check-all: **Then**: The system SHALL display an average of 4.5 and, when expanded, show User A (4 stars) and User B (5 stars) with timestamps.

!!! info "Validates"
    - [FR-29: Recipe Ratings](../../requirements/recipes-meals.md#fr-29)

### TS-37: Rating Uniqueness :material-alert-circle: {: #ts-37 }
- :material-arrow-right-circle: **Given**: User A has already rated a recipe 3 stars.
- :material-play-circle: **When**: User A submits a new rating of 5 stars.
- :material-check-all: **Then**: The system SHALL update the existing rating to 5 (not create a duplicate).

!!! info "Validates"
    - [FR-29: Recipe Ratings](../../requirements/recipes-meals.md#fr-29)

### TS-38: Recipe Comment Notification :material-check-circle: {: #ts-38 }
- :material-arrow-right-circle: **Given**: User A created a recipe.
- :material-play-circle: **When**: User B adds a comment to the recipe.
- :material-check-all: **Then**: The system SHALL create a `NEW_RECIPE_COMMENT` notification for User A.

!!! info "Validates"
    - [FR-28: Recipe Comments](../../requirements/recipes-meals.md#fr-28)

### TS-39: Recipe Deletion RESTRICT :material-alert-circle: {: #ts-39 }
- :material-arrow-right-circle: **Given**: A recipe referenced in an active meal plan.
- :material-play-circle: **When**: A user attempts to delete the recipe.
- :material-check-all: **Then**: The system SHALL return a validation error and prevent deletion.

!!! info "Validates"
    - [FR-23: Recipe Management](../../requirements/recipes-meals.md#fr-23)

## Meals Module Scenarios

### TS-40: Meal Time Configuration :material-check-circle: {: #ts-40 }
- :material-arrow-right-circle: **Given**: An authenticated user.
- :material-play-circle: **When**: The user creates "Lunch" with time 12:00 on weekdays and 13:00 on weekends.
- :material-check-all: **Then**: The system SHALL persist the meal time with 7 schedule entries.

!!! info "Validates"
    - [FR-30: Meal Time Configuration](../../requirements/recipes-meals.md#fr-30)

### TS-41: Meal Plan Creation (Week Boundary) :material-check-circle: {: #ts-41 }
- :material-arrow-right-circle: **Given**: An authenticated user.
- :material-play-circle: **When**: The user creates a meal plan for the week of Monday April 13, 2026.
- :material-check-all: **Then**: The system SHALL create a plan with `week_start_date = 2026-04-13`.

!!! info "Validates"
    - [FR-31: Weekly Meal Plan](../../requirements/recipes-meals.md#fr-31)

### TS-42: Duplicate Week Plan :material-alert-circle: {: #ts-42 }
- :material-arrow-right-circle: **Given**: A meal plan already exists for week of April 13, 2026.
- :material-play-circle: **When**: A user attempts to create another plan for the same week.
- :material-check-all: **Then**: The system SHALL return a validation error due to the unique constraint on `week_start_date`.

!!! info "Validates"
    - [FR-31: Weekly Meal Plan](../../requirements/recipes-meals.md#fr-31)

### TS-43: Multi-Recipe Meal Assignment :material-check-circle: {: #ts-43 }
- :material-arrow-right-circle: **Given**: A meal plan with a Monday dinner entry.
- :material-play-circle: **When**: The user assigns "Grilled Chicken" and "Caesar Salad" to the entry for the entire household.
- :material-check-all: **Then**: The system SHALL create two `meal_plan_entry_recipes` records with null `user_id`.

!!! info "Validates"
    - [FR-31: Weekly Meal Plan](../../requirements/recipes-meals.md#fr-31)

### TS-44: Per-Member Assignment :material-check-circle: {: #ts-44 }
- :material-arrow-right-circle: **Given**: A meal plan with a Monday breakfast entry.
- :material-play-circle: **When**: The user assigns "Scrambled Eggs" to Jorge and "Toast" to Fernanda.
- :material-check-all: **Then**: The system SHALL create separate `meal_plan_entry_recipes` records with the respective `user_id` values.

!!! info "Validates"
    - [FR-31: Weekly Meal Plan](../../requirements/recipes-meals.md#fr-31)

### TS-45: Meal Plan Publish & Notify :material-check-circle: {: #ts-45 }
- :material-arrow-right-circle: **Given**: A PENDING meal plan with entries.
- :material-play-circle: **When**: The creator clicks "Notify Household".
- :material-check-all: **Then**: The system SHALL set status to `PUBLISHED` and create `MEAL_PLAN_PUBLISHED` notifications for all household members.

!!! info "Validates"
    - [FR-32: Meal Plan Publish & Notify](../../requirements/recipes-meals.md#fr-32)

### TS-48: Thumbs Up/Down on Meal :material-check-circle: {: #ts-48 }
- :material-arrow-right-circle: **Given**: A meal entry marked as "done".
- :material-play-circle: **When**: User A gives a thumbs-up.
- :material-check-all: **Then**: The system SHALL create a record in `meal_plan_votes` with `vote = true` for User A on that entry.
- :material-play-circle: **When**: User A changes their vote to thumbs-down.
- :material-check-all: **Then**: The system SHALL update the existing vote record to `vote = false`.

!!! info "Validates"
    - [FR-37: Meal Thumbs Up/Down](../../requirements/recipes-meals.md#fr-37)

### TS-50: Meal Plan Retention :material-check-circle: {: #ts-50 }
- :material-arrow-right-circle: **Given**: A meal plan with `week_start_date` 11 weeks ago.
- :material-play-circle: **When**: The daily retention task executes at 03:00 AM.
- :material-check-all: **Then**: The system SHALL permanently delete the plan and all associated entries, recipes, and member records.

!!! info "Validates"
    - [FR-34: Meal Plan Data Retention](../../requirements/recipes-meals.md#fr-34)

### TS-51: Shopping List Export Preview :material-check-circle: {: #ts-51 }
- :material-arrow-right-circle: **Given**: A meal plan with recipes requiring "Eggs" (6 UNIT) and "Milk" (1 L). An existing shopping list already has "Eggs" (3 UNIT).
- :material-play-circle: **When**: The user requests an export preview targeting the existing list.
- :material-check-all: **Then**: The system SHALL return: existing items = [Eggs: 3→9 UNIT], new items = [Milk: 1 L].

!!! info "Validates"
    - [FR-36: Shopping List Integration](../../requirements/recipes-meals.md#fr-36)

### TS-52: Shopping List Export Confirm :material-check-circle: {: #ts-52 }
- :material-arrow-right-circle: **Given**: A confirmed export preview.
- :material-play-circle: **When**: The user confirms the export.
- :material-check-all: **Then**: The system SHALL increase "Eggs" quantity to 9 and add "Milk" (1 L) with no store assigned.

!!! info "Validates"
    - [FR-36: Shopping List Integration](../../requirements/recipes-meals.md#fr-36)

### TS-53: Mark Meal as Done :material-check-circle: {: #ts-53 }
- :material-arrow-right-circle: **Given**: A meal plan entry that is not done.
- :material-play-circle: **When**: A user marks it as done.
- :material-check-all: **Then**: The system SHALL set `is_done = true`.

!!! info "Validates"
    - [FR-31: Weekly Meal Plan](../../requirements/recipes-meals.md#fr-31)

## Notifications & Messaging Scenarios

### TS-54: Notification Delivery & Unread Count :material-check-circle: {: #ts-54 }
- :material-arrow-right-circle: **Given**: User A has 3 unread notifications.
- :material-play-circle: **When**: User A queries the unread count endpoint.
- :material-check-all: **Then**: The system SHALL return `{ count: 3 }`.

!!! info "Validates"
    - [FR-38: In-App Notifications](../../requirements/notifications.md#fr-38)

### TS-55: Mark Notification as Read :material-check-circle: {: #ts-55 }
- :material-arrow-right-circle: **Given**: An unread notification for User A.
- :material-play-circle: **When**: User A marks it as read.
- :material-check-all: **Then**: The system SHALL set `read = true` and the unread count SHALL decrease by 1.

!!! info "Validates"
    - [FR-38: In-App Notifications](../../requirements/notifications.md#fr-38)

### TS-56: Send and Receive Message :material-check-circle: {: #ts-56 }
- :material-arrow-right-circle: **Given**: User A and User B in the same household.
- :material-play-circle: **When**: User A sends a message to User B.
- :material-check-all: **Then**: The system SHALL persist the message, create a `NEW_MESSAGE` notification for User B, and the message SHALL appear in both users' conversation view.

!!! info "Validates"
    - [FR-39: User Messaging](../../requirements/notifications.md#fr-39)

### TS-57: Message Read Status :material-check-circle: {: #ts-57 }
- :material-arrow-right-circle: **Given**: User B has an unread message from User A.
- :material-play-circle: **When**: User B opens the conversation with User A.
- :material-check-all: **Then**: The system SHALL mark the message as read.

!!! info "Validates"
    - [FR-39: User Messaging](../../requirements/notifications.md#fr-39)

## Summary & Environment

- **Testcontainers:** Used for PostgreSQL 17 integration.
- **Mocks:** Google OAuth2 and People API are mocked for deterministic testing.
- **Verification:** 100% of BDD scenarios (Happy & Sad) MUST pass.
- **Integrity:** RFC 7807 validation for all error responses.
- **Immutability:** email, firstName, and lastName remain unchanged after any profile update.

---

## New Scenarios (Post-Implementation)

### TS-58: Centralized Photo Upload & Retrieval :material-check-circle: {: #ts-58 }
- :material-arrow-right-circle: **Given**: An authenticated user.
- :material-play-circle: **When**: The user uploads a photo via any module (profile, recipe, item, store).
- :material-check-all: **Then**: The system SHALL store the binary data in `media.photos` and return a URL reference (`/api/images/{name}`).
- :material-play-circle: **When**: The URL is requested via GET.
- :material-check-all: **Then**: The system SHALL return the binary image with the correct `Content-Type` header.

!!! info "Validates"
    - [FR-42: Centralized Media Service](../../requirements/shared.md#fr-42)

### TS-59: Standalone Item Assignment to Meal Entry :material-check-circle: {: #ts-59 }
- :material-arrow-right-circle: **Given**: A meal plan with a Monday breakfast entry.
- :material-play-circle: **When**: The user assigns "Fresh Orange Juice" (2 UNIT) directly to the entry for the entire household.
- :material-check-all: **Then**: The system SHALL create a `meal_plan_entry_items` record with `item_id`, `quantity=2`, `unit=UNIT`, and `user_id=null`.

!!! info "Validates"
    - [FR-41: Standalone Meal Items](../../requirements/recipes-meals.md#fr-41)

### TS-60: Nutrient Master Catalog CRUD :material-check-circle: {: #ts-60 }
- :material-arrow-right-circle: **Given**: An authenticated Adult user.
- :material-play-circle: **When**: The user creates a new nutrient "Omega-3" with unit "mg".
- :material-check-all: **Then**: The system SHALL persist the nutrient in `recipes.nutrients`.
- :material-play-circle: **When**: The user attempts to delete a nutrient referenced by nutrition entries.
- :material-check-all: **Then**: The system SHALL return a validation error and prevent deletion.

!!! info "Validates"
    - [FR-40: Nutrient Master Catalog](../../requirements/recipes-meals.md#fr-40)

### TS-61: Ingredient Grouping :material-check-circle: {: #ts-61 }
- :material-arrow-right-circle: **Given**: A recipe with ingredients.
- :material-play-circle: **When**: The user adds "Flour" with `group_name = "For the dough"` and "Tomato Sauce" with `group_name = "For the topping"`.
- :material-check-all: **Then**: The system SHALL persist the `group_name` and the UI SHALL display ingredients grouped by their group name.

!!! info "Validates"
    - [FR-25: Recipe Ingredients](../../requirements/recipes-meals.md#fr-25)

### TS-62: Coupon Barcode Rendering :material-check-circle: {: #ts-62 }
- :material-arrow-right-circle: **Given**: A coupon with `code = "SAVE10"` and `barcode_type = "QR"`.
- :material-play-circle: **When**: The user views the coupon details.
- :material-check-all: **Then**: The system SHALL render a QR code encoding "SAVE10".

!!! info "Validates"
    - [FR-13: Store Coupons](../../requirements/shopping-list.md#fr-13)

### TS-63: Shopping List Item Unavailability :material-check-circle: {: #ts-63 }
- :material-arrow-right-circle: **Given**: A shopping list with an item "Organic Milk".
- :material-play-circle: **When**: The user marks "Organic Milk" as unavailable.
- :material-check-all: **Then**: The system SHALL set `unavailable = true` and visually distinguish it from bought and pending items.

!!! info "Validates"
    - [FR-10: In-Store Progress Tracking](../../requirements/shopping-list.md#fr-10)

### TS-64: Recipe Multiplier in Meal Plan :material-check-circle: {: #ts-64 }
- :material-arrow-right-circle: **Given**: A meal plan entry with "Pancakes" assigned.
- :material-play-circle: **When**: The user sets the multiplier to 2.0.
- :material-check-all: **Then**: The system SHALL persist `multiplier = 2.0` on the `meal_plan_entry_recipes` record and use it for shopping list export quantity calculations.

!!! info "Validates"
    - [FR-31: Weekly Meal Plan](../../requirements/recipes-meals.md#fr-31)

### TS-65: Shopping Item Enriched Fields :material-check-circle: {: #ts-65 }
- :material-arrow-right-circle: **Given**: An authenticated user creating a shopping item "Milk (1L Bottle)".
- :material-play-circle: **When**: The user sets `unit = "pcs"`, `pc_quantity = 1.0`, `pc_unit = "L"`, `nutrition_sample_size = 100`, `nutrition_sample_unit = "ml"`.
- :material-check-all: **Then**: The system SHALL persist all fields and use them for unit conversion and nutrition calculations.

!!! info "Validates"
    - [FR-5: Category & Item Management](../../requirements/shopping-list.md#fr-5)

### TS-66: Meal Plan Export with Standalone Items :material-check-circle: {: #ts-66 }
- :material-arrow-right-circle: **Given**: A meal plan with a recipe requiring "Eggs" (6 UNIT) and a standalone item "Orange Juice" (2 L).
- :material-play-circle: **When**: The user requests an export preview.
- :material-check-all: **Then**: The system SHALL include both recipe ingredients and standalone items in the merge preview.

!!! info "Validates"
    - [FR-36: Shopping List Integration](../../requirements/recipes-meals.md#fr-36)
    - [FR-41: Standalone Meal Items](../../requirements/recipes-meals.md#fr-41)
