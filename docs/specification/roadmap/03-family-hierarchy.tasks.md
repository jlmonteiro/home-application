# Tasks: Family Hierarchy & Profile Updates

## 1. Overview
Implement the foundational layers for family roles and age-based classification, including Google birthdate synchronization and a configuration settings module.

!!! info "Status Legend"
    - :material-check-circle: **Completed**
    - :material-play-circle: **In Progress**
    - :material-clock-outline: **Planned**

---

## 2. User Stories

### US-1: Backend - Family Hierarchy Schema & Entities :material-check-circle: {: #us-1 }

!!! abstract "Story Definition"
    **As a** system architect, **I want** to persist family roles and age group configurations, **so that** users can be classified within the household.
    
    - **Persona:** Backend Engineer
    - **Estimate:** 4 hours
    - **Dependencies:** None

!!! note "Validates Requirements"
    - [:material-account-clock: **FR-16: Automated Age Group Classification**](../requirements/auth-profile.md#fr-16)
    - [:material-account-cog: **FR-18: Age Group Configuration**](../requirements/settings.md#fr-18)

!!! success "Acceptance Criteria"
    1. :material-database-sync:{ title="Event-driven" } When the migration runs, the database tables `family_roles` and `age_group_config` shall be created.
    2. :material-check-all:{ title="Ubiquitous" } The `user_profile` table shall include `birthdate`, `family_role_id`, and `age_group_name`.
    3. :material-check-all:{ title="Ubiquitous" } JPA entities for `FamilyRole` and `AgeGroupConfig` shall be implemented.
    4. :material-check-all:{ title="Ubiquitous" } The `UserProfile` entity shall maintain `@ManyToOne` relationships with roles.

!!! example "Implementation Tasks"
    - [x] :material-file-code: Create Liquibase migration `06-add-family-hierarchy.sql`.
    - [x] :material-cog: Implement `FamilyRole` and `AgeGroupConfig` entities and repositories.
    - [x] :material-shield-check: Update `UserProfile` entity and `UserProfileDTO`.
    - [x] :material-test-tube: Run TS-19 (automated classification) unit tests.

---

### US-2: Backend - Google Birthdate Sync & Onboarding :material-check-circle: {: #us-2 }

!!! abstract "Story Definition"
    **As a** new user, **I want** my birthdate to be automatically retrieved from Google, **so that** my onboarding experience is seamless.
    
    - **Persona:** Backend Engineer
    - **Estimate:** 6 hours
    - **Dependencies:** [US-1](#us-1)

!!! note "Validates Requirements"
    - [:material-account-sync: **FR-17: Google Birthdate Integration**](../requirements/auth-profile.md#fr-17)
    - [:material-account-star: **UJ-1: First-Time Login (Onboarding)**](../requirements/auth-profile.md#uj-1)

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } The system shall request the `user.birthday.read` scope from Google.
    2. :material-play-circle:{ title="Event-driven" } When a user completes onboarding, the system shall call Google People API to retrieve the birthdate.
    3. :material-check-all:{ title="Ubiquitous" } The system shall automatically assign the "Adult" age group to the very first user.
    4. :material-alert-circle:{ title="Unwanted Behavior" } If Google returns no birthdate, then the system shall prompt for manual entry.

!!! example "Implementation Tasks"
    - [x] :material-shield-key: Update `SecurityConfig.java` and `application.yaml` with new OAuth2 scopes.
    - [x] :material-api: Implement `GooglePeopleService` to fetch birthdays.
    - [x] :material-cog: Update `CustomOAuth2UserService` to handle age group bootstrapping.
    - [x] :material-calculator: Implement `AgeClassificationService` for range mapping.
    - [x] :material-test-tube: Verify with TS-18 and TS-20 integration tests.

---

### US-3: Backend - Settings API & Access Control :material-check-circle: {: #us-3 }

!!! abstract "Story Definition"
    **As a** parent (Adult), **I want** to configure household age ranges and roles, **so that** I can manage my family's structure.
    
    - **Persona:** Backend Engineer
    - **Estimate:** 4 hours
    - **Dependencies:** [US-2](#us-2)

!!! note "Validates Requirements"
    - [:material-account-cog: **FR-18: Age Group Configuration**](../requirements/settings.md#fr-18)
    - [:material-account-group-outline: **FR-19: Family Role Configuration**](../requirements/settings.md#fr-19)

!!! success "Acceptance Criteria"
    1. :material-api: `GET /api/settings/age-groups` and `PUT /api/settings/age-groups` endpoints implemented.
    2. :material-api: `GET /api/settings/roles` endpoint implemented.
    3. :material-shield-lock: 403 Forbidden returned if a non-Adult user accesses Settings.
    4. :material-sync: Age range updates trigger a full household age group recalculation.

!!! example "Implementation Tasks"
    - [x] :material-file-code: Implement `SettingsController` and `SettingsService`.
    - [x] :material-shield-check: Add `@PreAuthorize` security checks for "Adult" age group.
    - [x] :material-cog-sync: Implement bulk age recalculation logic.
    - [x] :material-test-tube: Verify with TS-21 integration tests.

---

### US-4: Frontend - Profile & Settings UI :material-check-circle: {: #us-4 }

!!! abstract "Story Definition"
    **As a** user, **I want** to see my age group and role, and manage household settings if I am an adult.
    
    - **Persona:** Frontend Engineer
    - **Estimate:** 6 hours
    - **Dependencies:** [US-3](#us-3)

!!! note "Validates Requirements"
    - [:material-account-edit: **FR-4: Update User Profile**](../requirements/auth-profile.md#fr-4)
    - [:material-menu: **FR-14: Module Navigation**](../requirements/shared.md#fr-14)

!!! success "Acceptance Criteria"
    1. :material-card-account-details: Profile page displays birthdate and family role selection.
    2. :material-menu: Main sidebar features a nested "Settings" menu (visible to Adults only).
    3. :material-cog: Settings module allows editing age ranges and adding custom roles.

!!! example "Implementation Tasks"
    - [x] :material-code-json: Update `UserProfileDTO` and `api.ts` in frontend.
    - [x] :material-layers: Update `ProfilePage.tsx` with new fields and validation.
    - [x] :material-layers: Implement `SettingsPage.tsx` with Mantine components.
    - [x] :material-code-tags: Implement conditional rendering for Settings menu in `Layout.tsx`.

---

## 3. Definition of Done (DoD)

!!! tip "Quality Checklist"
    - [x] :material-check-decagram: Code follows project conventions (Java 25, React 19, Spock).
    - [x] :material-test-tube: All unit and integration tests (TS-18 to TS-21) are passing.
    - [x] :material-bug: RFC 7807 compliance for all error responses.
    - [x] :material-link-variant: Traceability between requirements, design, and implementation is maintained.
