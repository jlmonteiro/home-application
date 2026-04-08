# Requirements: Authentication & User Profiles

## 1. User Journeys
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

## 2. Functional Requirements
### FR-1: Google OAuth2 Authentication
**So That** I don't have to manage another set of credentials, I want to log in using my existing Google account.
- **Acceptance Criteria:**
    1. The system SHALL redirect the user to Google's auth provider.
    2. The system SHALL process the authorization code and exchange it for a token.
    3. Sad Path: If auth fails, redirect to login with an error parameter.

### FR-2: Automatic User Registration
**So That** my experience is seamless, I want the system to automatically create an account for me when I first log in.
- **Acceptance Criteria:**
    1. If no record matches the authenticated email, create a new `User` and `UserProfile`.
    2. Data Mapping: Populate email, names, and picture from Google info.

### FR-3: User Profile Quick View
**So That** I can quickly access my info, I want to see a summary in the header menu.
- **Acceptance Criteria:**
    1. Dropdown SHALL display mobile phone and social links if populated.
    2. Provide a navigation link to the full Profile management page.

### FR-4: Update User Profile
**So That** I can customize my identity, I want to update my profile details.
- **Acceptance Criteria:**
    1. Allow updates to social links, phone, and photo.
    2. Immutable Fields: `email`, `firstName`, and `lastName` CANNOT be modified.
    3. Photo Upload: Support local file upload (convert to Base64) or external URL.

## 3. Non-Functional Requirements
### NFR-1: Security (Zero Trust)
- **Acceptance Criteria:**
    1. Any request to `/api/**` without a valid session SHALL return 401 Unauthorized.
