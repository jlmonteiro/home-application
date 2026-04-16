# Tasks: User Profile Updates

## 1. Overview
The goal of this epic is to enable authenticated users to update their profile information and to provide a detailed "Quick View" of this information in the application header.

!!! info "Status Legend"
    - :material-check-circle: **Completed**
    - :material-play-circle: **In Progress**
    - :material-clock-outline: **Planned**

---

## 2. User Stories

### US-1: Backend - Implement Profile Update API :material-check-circle: {: #us-1 }

!!! abstract "Story Definition"
    **As a** home user, **I want** to securely update my profile via a REST API, **so that** my social and contact details are stored and shared within the application.
    
    - **Persona:** Backend Engineer
    - **Estimate:** 4 hours
    - **Dependencies:** None

!!! note "Validates Requirements"
    - [:material-account-edit: **FR-4: Update User Profile**](../requirements/auth-profile.md#fr-4)
    - [:material-shield-check: **NFR-1: Security (Zero Trust)**](../requirements/auth-profile.md#nfr-1)

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } `PUT /api/user/me` endpoint exists and is secured by Spring Security.
    2. :material-check-all:{ title="Ubiquitous" } Endpoint accepts a JSON body matching the `UserProfileUpdateRequest` schema.
    3. :material-check-all:{ title="Ubiquitous" } Returns 200 OK with the updated HATEOAS-compliant user profile.
    4. :material-alert-circle:{ title="Unwanted Behavior" } If invalid phone numbers or social links are provided, then the system shall return 400 Bad Request with RFC 7807 details.
    5. :material-check-all:{ title="Ubiquitous" } The system shall prevent updates to `email`, `firstName`, and `lastName`.
    6. :material-alert-circle:{ title="Unwanted Behavior" } If the database is unreachable, then the system shall return 503 Service Unavailable.

!!! example "Implementation Tasks"
    - [x] :material-file-code: Add `putUserProfile` method to `UserProfileController`.
    - [x] :material-cog: Add `updateProfile` method to `UserProfileService`.
    - [x] :material-shield-check: Ensure `UserProfileDTO` validation annotations are correctly triggered.
    - [x] :material-test-tube: Implement `UserProfileUpdateSpec.groovy` integration test.

---

### US-2: Frontend - Implement Profile Edit UI :material-check-circle: {: #us-2 }

!!! abstract "Story Definition"
    **As a** home user, **I want** an intuitive interface to edit my profile, **so that** I can easily update my details without technical knowledge.
    
    - **Persona:** Frontend Engineer
    - **Estimate:** 4 hours
    - **Dependencies:** [US-1](#us-1)

!!! note "Validates Requirements"
    - [:material-account-edit: **FR-4: Update User Profile**](../requirements/auth-profile.md#fr-4)

!!! success "Acceptance Criteria"
    1. :material-play-circle:{ title="Event-driven" } When the user selects the profile menu, the system shall navigate to the Profile Edit page.
    2. :material-check-all:{ title="Ubiquitous" } The system shall display existing profile data with `email`, `firstName`, and `lastName` marked as read-only.
    3. :material-plus-circle-outline:{ title="Optional" } Where a user provides a local file, the system shall upload it as a profile photo.
    4. :material-play-circle:{ title="Event-driven" } When a user enters data, the system shall provide real-time validation for phone and social URLs.
    5. :material-check-all:{ title="Ubiquitous" } The system shall show a success notification upon a successful profile update.

!!! example "Implementation Tasks"
    - [x] :material-api: Add `updateUserProfile` function to `src/services/api.ts`.
    - [x] :material-layers: Create `ProfilePage.tsx` using `useForm` from `@mantine/form`.
    - [x] :material-sync: Implement `useMutation` for profile updates.
    - [x] :material-router: Add routing for the new Profile page in `App.tsx`.

---

### US-3: Frontend - Enhance Profile Dropdown UI :material-check-circle: {: #us-3 }

!!! abstract "Story Definition"
    **As a** home user, **I want** to see my contact and social info in the header menu, **so that** I can quickly access these details.
    
    - **Persona:** Frontend Engineer
    - **Estimate:** 2 hours
    - **Dependencies:** [US-1](#us-1)

!!! note "Validates Requirements"
    - [:material-account-box: **FR-3: User Profile Quick View**](../requirements/auth-profile.md#fr-3)

!!! success "Acceptance Criteria"
    1. :material-clock-outline:{ title="State-driven" } While data is available, the system shall display the phone number and social icons in the dropdown.
    2. :material-play-circle:{ title="Event-driven" } When a user clicks a social icon, the system shall open the link in a new tab.
    3. :material-check-all:{ title="Ubiquitous" } The system shall provide a link to "View/Edit Profile" within the dropdown menu.
    4. :material-plus-circle-outline:{ title="Optional" } Where profile data is missing, the system shall hide the corresponding sections in the dropdown.

!!! example "Implementation Tasks"
    - [x] :material-code-json: Update `Layout.tsx` with conditional rendering logic.
    - [x] :material-vector-square: Integrate Tabler icons into the menu.
    - [x] :material-link: Link the menu item to the `/profile` route.

---

## 3. Definition of Done (DoD)

!!! tip "Quality Checklist"
    - [x] :material-check-decagram: Code follows project conventions (Java 25, React 19, Spock).
    - [x] :material-test-tube: All unit and integration tests are passing.
    - [x] :material-bug: RFC 7807 compliance for all error responses.
    - [x] :material-link-variant: Traceability between requirements, design, and implementation is maintained.
