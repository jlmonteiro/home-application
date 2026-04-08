# Tasks: Update User Profile

## 1. Overview
The goal of this epic is to enable authenticated users to update their profile information and to provide a detailed "Quick View" of this information in the application header.

## 2. User Stories & Implementation Plan

---

### US-1: Backend - Implement Profile Update API
**As a** home user, **I want** to securely update my profile via a REST API, **so that** my social and contact details are stored and shared within the application.

**Persona:** Backend Engineer
**Linked Requirements:** FR-4, NFR-1, NFR-3
**Estimate:** 4 hours
**Dependencies:** None

#### Acceptance Criteria
- [ ] AC-1.1: `PUT /api/user/me` endpoint exists and is secured by Spring Security.
- [ ] AC-1.2: Endpoint accepts a JSON body matching the `UserProfileUpdateRequest` schema.
- [ ] AC-1.3: Returns 200 OK with the updated HATEOAS-compliant user profile.
- [ ] AC-1.4: Rejects invalid phone numbers or social links with 400 Bad Request and RFC 7807 Problem Details.
- [ ] AC-1.5: Ensures `email`, `firstName`, and `lastName` are NOT updated even if sent in the request.
- [ ] AC-1.6: Returns 503 Service Unavailable if the database is unreachable.

#### Tasks
- [x] T-1.1: Add `putUserProfile` method to `UserProfileController` mapped to `PUT /api/user/me`.
- [x] T-1.2: Add `updateProfile` method to `UserProfileService` to handle entity updates and photo conversion (if needed).
- [x] T-1.3: Ensure `UserProfileDTO` validation annotations are correctly triggered by `@Valid` in the controller.
- [x] T-1.4: Implement `UserProfileUpdateSpec.groovy` integration test covering Happy and Sad paths (TS-7, TS-8, TS-9).
- [ ] T-1.5: Run `/sdd:check` to verify specification compliance and traceability.

---

### US-2: Frontend - Implement Profile Edit UI
**As a** home user, **I want** an intuitive interface to edit my profile, **so that** I can easily update my details without technical knowledge.

**Persona:** Frontend Engineer
**Linked Requirements:** FR-4
**Estimate:** 4 hours
**Dependencies:** US-1

#### Acceptance Criteria
- [ ] AC-2.1: User can navigate to the Profile Edit page/modal from the Header.
- [ ] AC-2.2: Form displays existing profile data; `email`, `firstName`, and `lastName` are read-only.
- [ ] AC-2.3: User can upload a local image (automatically converted to base64) or provide a URL.
- [ ] AC-2.4: Form provides real-time validation feedback for phone and social URLs using `@mantine/form`.
- [ ] AC-2.5: Successful updates show a Mantine notification and refresh the global user state.
- [ ] AC-2.6: Server-side validation errors (400) are mapped to field-level errors in the form via `form.setErrors()`.

#### Tasks
- [ ] T-2.1: Add `updateUserProfile` function to `src/services/api.ts`.
- [ ] T-2.2: Install `@mantine/form` in `home-app-frontend`.
- [ ] T-2.3: Create `ProfilePage.tsx` using `useForm` from `@mantine/form` and Mantine UI components.
- [ ] T-2.4: Implement `useMutation` for profile updates, handling 400 errors by passing the `errors` map to `form.setErrors`.
- [ ] T-2.5: Implement local file-to-base64 conversion logic for `photo` upload.
- [ ] T-2.6: Add routing for the new Profile page in `App.tsx`.
- [ ] T-2.7: Run `/sdd:check` to verify specification compliance and traceability.

---

### US-3: Frontend - Enhance Profile Dropdown UI
**As a** home user, **I want** to see my contact and social info in the header menu, **so that** I can quickly access these details.

**Persona:** Frontend Engineer
**Linked Requirements:** FR-3
**Estimate:** 2 hours
**Dependencies:** US-1

#### Acceptance Criteria
- [ ] AC-3.1: User dropdown displays phone number and social icons (FB, IG, LI) if data is available.
- [ ] AC-3.2: Social icons are clickable and open in a new tab.
- [ ] AC-3.3: "Profile" menu item is updated to "View/Edit Profile" and navigates to the new Profile page.
- [ ] AC-3.4: Sections for phone and social links are hidden if the user has not provided that data.

#### Tasks
- [ ] T-3.1: Update `Layout.tsx` to include conditional rendering logic for `user.mobilePhone`, `user.facebook`, etc.
- [ ] T-3.2: Import and integrate `@tabler/icons-react` icons (`IconPhone`, `IconBrandFacebook`, etc.) into the `Menu.Dropdown`.
- [ ] T-3.3: Link the "View/Edit Profile" menu item to the `/profile` route.
- [ ] T-3.4: Run `/sdd:check` to verify specification compliance and traceability.

---

## 3. General Requirements
### Definition of Done (DoD)
- [ ] Code follows project conventions (Java 25, React 19, Spock).
- [ ] All unit and integration tests are passing.
- [ ] RFC 7807 compliance for all error responses.
- [ ] Traceability between requirements, design, and implementation is maintained.
- [ ] `/sdd:check` passes with no compliance issues.
