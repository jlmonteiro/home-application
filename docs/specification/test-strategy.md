# Test Strategy: Home Application

## 1. Testing Approach
The Home Application employs a multi-layered testing strategy to ensure the reliability, security, and performance of its features.

- **Unit Testing:** Focuses on isolated business logic.
- **Integration Testing:** Verifies the synergy between layers using Testcontainers (PostgreSQL).
- **API Testing:** Validates REST endpoints and RFC 7807 compliance.

## 2. Test Scenarios

### TS-1: Google OAuth2 User Registration (Happy Path)
- *Given*: A user who has never logged in to the application.
- *When*: The user successfully authenticates via Google OAuth2.
- *Then*: A new local user record and profile are created.
- *Validates*: FR-1, FR-2

### TS-2: Google OAuth2 Login (Returning User)
- *Given*: A user who already has a local account.
- *When*: The user successfully authenticates via Google OAuth2.
- *Then*: The existing local user record is retrieved.
- *Validates*: FR-1

### TS-3: Authentication Failure (Sad Path)
- *Given*: A user who cancels the login process at Google.
- *When*: The user is redirected back to the application.
- *Then*: The system redirects them to `/login?error=true`.
- *Validates*: FR-1 (AC-4)

### TS-4: Service Timeout / Token Exchange Failure (Sad Path)
- *Given*: An issue with Google's token endpoint.
- *When*: The backend attempts to exchange the authorization code for a token.
- *Then*: The system displays a "Service Unavailable" error message.
- *Validates*: FR-1 (AC-5)

### TS-5: Database Offline (Sad Path)
- *Given*: The PostgreSQL database is unreachable.
- *When*: An API request is made to `/api/user/me`.
- *Then*: The system returns a 503 Service Unavailable with an RFC 7807 Problem Detail.
- *Validates*: NFR-3

### TS-6: Unauthorized Access (Zero Trust)
- *Given*: An unauthenticated request.
- *When*: Accessing `/api/user/me`.
- *Then*: The system returns a 401 Unauthorized status.
- *Validates*: NFR-1

### TS-7: Successful User Profile Update (Happy Path)
- *Given*: An authenticated user.
- *When*: The user sends a `PUT /api/user/me` with valid social links, a phone number, and a new photo.
- *Then*: The system updates the profile, returns 200 OK with the updated HATEOAS resource, and displays a success notification (toast) in the UI.
- *Validates*: FR-4

### TS-8: Profile Update Validation Failure (Sad Path)
- *Given*: An authenticated user.
- *When*: The user sends a `PUT /api/user/me` with an invalid phone format or a malformed Facebook URL.
- *Then*: The system returns 400 Bad Request with a list of field-level violations.
- *Validates*: FR-4

### TS-9: Protection of Immutable Fields
- *Given*: An authenticated user.
- *When*: The user sends a `PUT /api/user/me` containing a new `firstName` or `email`.
- *Then*: The system updates the allowed profile fields but ignores the changes to `firstName` and `email`.
- *Validates*: FR-4

### TS-10: Profile Dropdown Detailed View (Conditional)
- *Given*: An authenticated user with a mobile phone and a LinkedIn profile.
- *When*: The user opens the header dropdown menu.
- *Then*: The system displays the mobile phone and a clickable LinkedIn icon/link.
- *Validates*: FR-3

### TS-11: Profile Dropdown Compact View (Fallback)
- *Given*: An authenticated user with no optional profile fields (phone, social).
- *When*: The user opens the header dropdown menu.
- *Then*: The system displays only basic info (name, photo) and the "View/Edit Profile" link, omitting phone and social sections.
- *Validates*: FR-3

### TS-12: Frontend Cache Utilization (Performance)
- *Given*: An authenticated user who has already loaded their profile.
- *When*: The user navigates between the Dashboard and Profile pages within a 5-minute window.
- *Then*: The system SHALL NOT trigger a new network request to `/api/user/me`, serving the data from the TanStack Query cache instead.
- *Validates*: NFR-2

### TS-13: Collaborative Item Check-off (Real-time)
- *Given*: Two users (A and B) belong to the same household and are viewing the same shopping list.
- *When*: User A marks "Apples" as "Bought".
- *Then*: The backend updates the item status, and User B's UI automatically reflects the "Bought" state.
- *Validates*: FR-7, FR-10

### TS-14: Intelligent Price Suggestions
- *Given*: A user has previously bought "Bread" at "Store X" for €1.50 and "Store Y" for €1.20.
- *When*: The user adds "Bread" to a new list and selects "Store X".
- *Then*: The system suggests €1.50 as the price.
- *Validates*: FR-9

### TS-15: Automatic Data Retention (Cleanup)
- *Given*: A shopping list that was marked as "Completed" 95 days ago.
- *When*: The daily retention background task executes.
- *Then*: The system SHALL permanently delete the list and all its associated `ListItem` records.
- *Validates*: FR-11

### TS-16: Dashboard Coupon Warning
- *Given*: An unused coupon for "Lidl" expiring in 48 hours.
- *When*: The user views the application Dashboard.
- *Then*: The "Expiring Coupons" panel displays the Lidl coupon with its expiration date highlighted.
- *Validates*: FR-15

### TS-17: Loyalty Card Barcode Validation
- *Given*: A loyalty card configured with the "Code 128" barcode type.
- *When*: The user views the card details in the UI.
- *Then*: The system SHALL render a linear 1D barcode encoding the exact card number.
- *Validates*: FR-12

### TS-18: First User Bootstrap (Adult Assignment)
- *Given*: A completely empty system with no users.
- *When*: The first user successfully authenticates via Google.
- *Then*: The system SHALL assign them the "Adult" age group, regardless of their actual age.
- *Validates*: UJ-1

### TS-19: Automated Age Group Classification
- *Given*: Configured age ranges: Child (0-12), Teenager (13-17), Adult (18+).
- *And*: A user with a birthdate exactly 13 years ago today.
- *When*: The user logs in or the daily recalculation task runs.
- *Then*: The user's profile SHALL be updated from "Child" to "Teenager".
- *Validates*: FR-16

### TS-20: Google Birthdate Synchronization
- *Given*: An authenticated session with the `user.birthday.read` scope.
- *When*: The onboarding process calls the Google People API.
- *Then*: The system SHALL extract the birthdate and persist it in the `UserProfile`.
- *And*: If Google returns no birthdate, the system SHALL prompt the user for manual entry.
- *Validates*: FR-17

### TS-21: Settings Access Control
- *Given*: A user classified as "Child" or "Teenager".
- *When*: They attempt to access `GET /api/settings/**` or `PUT /api/settings/**`.
- *Then*: The system SHALL return a 403 Forbidden status.
- *Validates*: FR-18, FR-19

### TS-22: Documentation Generation Verification
- *Given*: A valid `mkdocs.yml` and markdown files in `docs/`.
- *When*: The Gradle task `./gradlew generateDocs` is executed.
- *Then*: A directory `build/docs/` SHALL be created containing a functional static HTML site.
- *Validates*: FR-20, FR-21

## 3. Test Data & Environment
- **Testcontainers:** Used for PostgreSQL 16 integration.
- **Mocks:** Google OAuth2 and People API are mocked for deterministic testing.

## 4. Acceptance Criteria
- 100% of BDD scenarios (Happy & Sad) MUST pass.
- RFC 7807 validation for all error responses.
- Immutable fields (email, firstName, lastName) remain unchanged after any profile update.
- UI components correctly implement conditional rendering based on profile data presence and age-group permissions.
