# Requirements: Home Application

## 1. Overview
The Home Application is a centralized platform designed to help users manage household-related activities, starting with robust user profile management and secure authentication.

## 2. Business Context & Stakeholders
### Business Context (The "North Star")
The primary goal is to provide a unified, secure entry point for all household management features. By centralizing authentication via Google OAuth2, we reduce user friction (no new passwords) and establish a trusted identity for all future modules (finance, tasks, inventory).

### Stakeholders
- **Home Users:** Primary users who need a simple, secure way to access their household data.
- **Developers:** Need a standardized, well-documented API and authentication flow to build new modules.
- **System Administrators:** Responsible for monitoring system health and ensuring data integrity.

## 3. User Journeys
### UJ-1: First-Time Login (Onboarding)
1. User navigates to the application and is presented with the "Login with Google" option.
2. User clicks the button and is redirected to Google's identity provider.
3. After successful authentication and consent, Google redirects the user back to the application.
4. **The system SHALL** detect that this is a new user and automatically create a local `User` record and a default `UserProfile`.
5. User is redirected to the Dashboard and sees their name and profile picture.

### UJ-2: Returning User Login
1. User navigates to the application.
2. **The system SHALL** identify the existing session; if expired, the user clicks "Login with Google."
3. Google authenticates the user (likely via an existing session).
4. **The system SHALL** match the Google email with the existing local record and establish a session.
5. User is redirected to the Dashboard.

## 4. Functional Requirements
### FR-1: Google OAuth2 Authentication
**So That** I don't have to manage another set of credentials, I want to log in using my existing Google account.

**Acceptance Criteria:**
1. **Redirect to Provider:** The system SHALL redirect the user to `https://accounts.google.com/o/oauth2/v2/auth` upon clicking the login button.
2. **Handle Callback:** The system SHALL successfully process the authorization code returned to `/login/oauth2/code/google`.
3. **Token Exchange:** The system SHALL exchange the code for an access token and retrieve user info (email, given_name, family_name, picture).
4. **Sad Path - Authentication Failure:** If the user cancels the login at Google, the system SHALL redirect them back to the login page with a `?error=true` parameter.
5. **Sad Path - Token Timeout:** If the exchange with Google fails or times out, the system SHALL display a "Service Unavailable" error message.

### FR-2: Automatic User Registration
**So That** my experience is seamless, I want the system to automatically create an account for me when I first log in via Google.

**Acceptance Criteria:**
1. **Implicit Creation:** If no record matches the authenticated email, the system SHALL create a new `User` entity.
2. **Data Mapping:** The new record SHALL include `email`, `firstName`, `lastName`, and `pictureUrl` from Google.
3. **Validation Rules:** 
    - `email` MUST be a valid format and unique.
    - `firstName` and `lastName` MUST be populated (Google defaults are expected).
4. **Profile Initialization:** A `UserProfile` SHALL be created and linked to the new `User` automatically.

### FR-3: User Profile Quick View (Header Menu)
**So That** I can quickly access my contact and social information, I want to see a detailed summary in the header's user dropdown menu.

**Acceptance Criteria:**
1. **Expanded Info:** The user dropdown SHALL display the user's mobile phone number and social network links (Facebook, Instagram, LinkedIn).
2. **Conditional Visibility:** Social links and the phone number SHALL ONLY be displayed if they are populated in the user's profile.
3. **Branded Icons:** Each social network link SHALL be accompanied by its respective platform icon (e.g., LinkedIn, Facebook).
4. **Navigation:** The menu SHALL provide a "View/Edit Profile" link that navigates to the full profile management page.
5. **Session Info:** The menu SHALL continue to display basic info like name, email, and profile photo.

### FR-4: Update User Profile
**So That** I can customize my identity and share contact info, I want to update my profile with social links, a phone number, and a custom photo.

**Acceptance Criteria:**
1. **Full Profile Update:** The system SHALL allow the user to update their profile via `PUT /api/user/me`.
2. **Social Networks:** The user can provide links for Facebook, Instagram, and LinkedIn.
3. **Phone Number:** The user can provide a mobile phone number that must match the system's regex validation.
4. **Profile Picture - URL:** The user can provide a direct URL to a profile picture.
5. **Profile Picture - File:** The user can upload a local image file. The system SHALL convert this to a base64 string for storage.
6. **Immutable Fields:** The `email`, `firstName`, and `lastName` fields SHALL be read-only in the UI as they are managed by the OAuth2 provider.
7. **Success Notification:** Upon successful update, the system SHALL display a success notification (toast) to the user (e.g., "Profile updated successfully").
8. **Sad Path - Validation Failure:** If any field fails validation (e.g., malformed URL, invalid phone format), the system SHALL return a 400 Bad Request with a detailed field-level error report (RFC 7807).
9. **Sad Path - Unauthorized Update:** If an unauthenticated user attempts to update a profile, the system SHALL return a 401 Unauthorized.

**Validation Rules:**
- **Facebook/Instagram/LinkedIn:** MUST be a valid URL starting with `https?://(www\.)?facebook|instagram|linkedin\.com/` or be empty.
- **Mobile Phone:** MUST be a valid format (7-20 characters) or be empty. The system supports:
    - Optional leading `+` sign.
    - Digits, spaces, hyphens `-`, and parentheses `()`.
    - Example: `+351 912 345 678`, `(555) 123-4567`, or `0044 20 1234 5678`.
    - Technical Regex: `^\+?[0-9\s\-()]{7,20}$`
- **Photo URL:** If provided, MUST be a valid, reachable URL.
- **Photo File:** If uploaded, MUST be an image (JPEG, PNG, WEBP) and NOT exceed 2MB.
- **Email/First/Last Name:** These fields CANNOT be modified via the profile update request.

## 5. Non-Functional Requirements
### NFR-1: Security (Zero Trust)
**So That** my data is protected, the system must ensure all API endpoints are secured.

**Acceptance Criteria:**
1. **Unauthorized Access:** Any request to `/api/**` without a valid JSESSIONID SHALL return a 401 Unauthorized status.
2. **CSRF Protection:** The system SHALL disable CSRF only for stateless OAuth2 endpoints or use appropriate cookie-based CSRF protection for the UI.

### NFR-2: Performance (Latency)
**So That** the app feels responsive, API response times MUST be minimal.

**Acceptance Criteria:**
1. **Backend Latency:** 95% of requests to `/api/user/me` SHALL complete in less than 150ms under a load of 10 concurrent users.
2. **Frontend Caching:** The user profile SHALL be cached by TanStack Query for 5 minutes (`staleTime`) to avoid redundant backend calls.

### NFR-3: Reliability (Graceful Degradation)
**So That** I am not left confused when things fail, the system must handle errors gracefully.

**Acceptance Criteria:**
1. **Error Messaging:** All backend errors SHALL be returned as RFC 7807 Problem Details.
2. **Database Offline:** If the database is unreachable, the system SHALL return a 503 Service Unavailable error instead of a stack trace.

## 6. Architectural Decisions
### ADR-1: HATEOAS for REST API
- **Status:** Accepted
- **Context:** To ensure the API is discoverable and decoupled from the client.
- **Decision:** Use Spring HATEOAS with `PagedModel` and `EntityModel`.
- **Consequences:** Easier client-side navigation; slightly higher payload size.

### ADR-2: Monorepo with Gradle
- **Status:** Accepted
- **Decision:** Use a single Gradle project with sub-modules.

## 7. Glossary
| Term | Definition |
| ---- | ---------- |
| HATEOAS | Hypermedia as the Engine of Application State. |
| RFC 7807 | Standard for Problem Details for HTTP APIs. |
| JSESSIONID | The default cookie name used by Spring Security for session tracking. |
