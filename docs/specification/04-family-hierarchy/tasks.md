# Tasks: Family Hierarchy & Profile Updates

## 1. Overview
Implement the foundational layers for family roles and age-based classification, including Google birthdate synchronization and a configuration settings module.

## 2. User Stories & Implementation Plan

---

### US-1: Backend - Family Hierarchy Schema & Entities
**As a** system architect, **I want** to persist family roles and age group configurations, **so that** users can be classified within the household.

**Persona:** Backend Engineer
**Linked Requirements:** FR-16, FR-18, FR-19
**Estimate:** 4 hours
**Dependencies:** None

#### Acceptance Criteria
- [x] AC-1.1: Database tables `family_roles` and `age_group_config` exist in the `profiles` schema.
- [x] AC-1.2: `user_profile` table updated with `birthdate`, `family_role_id`, and `age_group_name`.
- [x] AC-1.3: JPA entities for `FamilyRole` and `AgeGroupConfig` implemented.
- [x] AC-1.4: `UserProfile` entity updated with new fields and `@ManyToOne` relationship to `FamilyRole`.

#### Tasks
- [x] T-1.1: Create Liquibase migration `06-add-family-hierarchy.sql`.
- [x] T-1.2: Implement `FamilyRole` and `AgeGroupConfig` entities and repositories.
- [x] T-1.3: Update `UserProfile` entity and `UserProfileDTO`.
- [x] T-1.4: Run TS-19 (automated classification) unit tests.
- [x] Run /sdd:check to verify specification compliance and traceability.

---

### US-2: Backend - Google Birthdate Sync & Onboarding
**As a** new user, **I want** my birthdate to be automatically retrieved from Google, **so that** my onboarding experience is seamless.

**Persona:** Backend Engineer
**Linked Requirements:** FR-17, UJ-1
**Estimate:** 6 hours
**Dependencies:** US-1

#### Acceptance Criteria
- [x] AC-2.1: System requests `user.birthday.read` scope from Google.
- [x] AC-2.2: Onboarding process calls Google People API to retrieve birthdate.
- [x] AC-2.3: The very first user in the system is automatically assigned the "Adult" age group.
- [x] AC-2.4: System prompts for manual birthdate entry if Google returns null.

#### Tasks
- [x] T-2.1: Update `SecurityConfig.java` and `application.yaml` with new OAuth2 scopes.
- [x] T-2.2: Implement `GooglePeopleService` to fetch birthdays.
- [x] T-2.3: Update `CustomOAuth2UserService` to handle age group bootstrapping and birthdate sync.
- [x] T-2.4: Implement `AgeClassificationService` to map age to config ranges.
- [x] T-2.5: Verify with TS-18 and TS-20 integration tests.

---

### US-3: Backend - Settings API & Access Control
**As a** parent (Adult), **I want** to configure household age ranges and roles, **so that** I can manage my family's structure.

**Persona:** Backend Engineer
**Linked Requirements:** FR-18, FR-19
**Estimate:** 4 hours
**Dependencies:** US-2

#### Acceptance Criteria
- [x] AC-3.1: `GET /api/settings/age-groups` and `PUT /api/settings/age-groups` endpoints implemented.
- [x] AC-3.2: `GET /api/settings/roles` endpoint implemented.
- [x] AC-3.3: 403 Forbidden returned if a non-Adult user accesses Settings endpoints.
- [x] AC-3.4: Age range updates trigger a full household age group recalculation.

#### Tasks
- [x] T-3.1: Implement `SettingsController` and `SettingsService`.
- [x] T-3.2: Add `@PreAuthorize` or custom security checks for "Adult" age group.
- [x] T-3.3: Implement bulk age recalculation logic.
- [x] T-3.4: Verify with TS-21 integration tests.

---

### US-4: Frontend - Profile & Settings UI
**As a** user, **I want** to see my age group and role, and manage household settings if I am an adult.

**Persona:** Frontend Engineer
**Linked Requirements:** FR-4, FR-14
**Estimate:** 6 hours
**Dependencies:** US-3

#### Acceptance Criteria
- [x] AC-4.1: Profile page displays birthdate and family role selection.
- [x] AC-4.2: Main sidebar features a nested "Settings" menu (visible to Adults only).
- [x] AC-4.3: Settings module allows editing age ranges and adding custom roles.

#### Tasks
- [x] T-4.1: Update `UserProfileDTO` and `api.ts` in frontend.
- [x] T-4.2: Update `ProfilePage.tsx` with new fields and validation.
- [x] T-4.3: Implement `SettingsPage.tsx` with Mantine components.
- [x] T-4.4: Implement conditional rendering for Settings menu in `Layout.tsx`.

---

## 3. General Requirements
### Definition of Done (DoD)
- [x] Code follows project conventions (Java 25, React 19, Spock).
- [x] All unit and integration tests (TS-18 to TS-21) are passing.
- [x] RFC 7807 compliance for all error responses.
- [x] Traceability between requirements, design, and implementation is maintained.
- [x] `/sdd:check` passes with no compliance issues.
