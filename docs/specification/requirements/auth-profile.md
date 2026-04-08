# Requirements: Authentication & User Profiles

## 1. User Journeys
### UJ-1: First-Time Login (Onboarding)
1. User navigates to the application and is presented with the "Login with Google" option.
2. User clicks the button and is redirected to Google's identity provider.
3. After successful authentication and consent, Google redirects the user back to the application.
4. **The system SHALL** detect that this is a new user and automatically create a local `User` record and a default `UserProfile`.
5. **Age Group Bootstrapping:** If this is the **first user** in the system, they SHALL be automatically assigned to the "Adult" age group, regardless of their actual age.
6. **Birthdate Synchronization:** The system SHALL attempt to fetch the user's birthdate from Google via the People API.
7. User is redirected to the Dashboard and sees their name and profile picture.

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
    1. Allow updates to social links, phone, photo, and **Birthdate** (if missing).
    2. **Family Role:** Users SHALL select exactly one role from the configured family roles (e.g., Mother, Father, Son, Daughter).
    3. Immutable Fields: `email`, `firstName`, and `lastName` CANNOT be modified.
    4. Photo Upload: Support local file upload (convert to Base64) or external URL.

#### FR-16: Automated Age Group Classification
**So That** the system can enforce age-appropriate access, users must be categorized into age groups.
- **Acceptance Criteria:**
    1. **Data Source:** The system SHALL use the `birthdate` (synced from Google or provided manually) to calculate the user's current age.
    2. **Mapping:** The system SHALL map the calculated age to a specific **Age Group** (e.g., Child, Teenager, Adult) based on the ranges configured in the Settings module.
    3. **Dynamic Updates:** The age group classification MUST be recalculated periodically or upon user login to account for birthdays.

#### FR-17: Google Birthdate Integration
**So That** onboarding is seamless, the system should automatically retrieve the user's birthday.
- **Acceptance Criteria:**
    1. **Scope:** The system SHALL request the `https://www.googleapis.com/auth/user.birthday.read` scope during OAuth2 authentication.
    2. **Integration:** The system SHALL call `https://people.googleapis.com/v1/people/me?personFields=birthdays` to retrieve the birthdate.
    3. **Fallback:** If the birthdate is not provided by Google (due to privacy settings or missing data), the system SHALL prompt the user to provide it manually during the first profile setup.

## 3. Non-Functional Requirements
### NFR-1: Security (Zero Trust)
- **Acceptance Criteria:**
    1. Any request to `/api/**` without a valid session SHALL return 401 Unauthorized.
