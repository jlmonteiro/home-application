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

## Summary & Environment

- **Testcontainers:** Used for PostgreSQL 17 integration.
- **Mocks:** Google OAuth2 and People API are mocked for deterministic testing.
- **Verification:** 100% of BDD scenarios (Happy & Sad) MUST pass.
- **Integrity:** RFC 7807 validation for all error responses.
- **Immutability:** email, firstName, and lastName remain unchanged after any profile update.
