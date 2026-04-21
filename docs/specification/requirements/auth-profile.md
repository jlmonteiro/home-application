# Requirements: Authentication & User Profiles

!!! info "EARS Syntax Legend (Hover for trigger name)"

    - :material-check-all:{ title="Ubiquitous" } **Ubiquitous:** "The system shall..." (Always true)
    - :material-play-circle:{ title="Event-driven" } **Event-driven:** "When <trigger>, the system shall..."
    - :material-alert-circle:{ title="Unwanted Behavior" } **Unwanted Behavior:** "If <condition>, then the system shall..."
    - :material-clock-outline:{ title="State-driven" } **State-driven:** "While <state>, the system shall..."
    - :material-plus-circle-outline:{ title="Optional" } **Optional:** "Where <feature exists>, the system shall..."
    - :material-layers-outline:{ title="Complex" } **Complex:** Combinations of the above triggers.

## 1. User Journeys

### UJ-1: First-Time Login (Onboarding) {: #uj-1 }

!!! info ""

    1. User navigates to the application and is presented with the "Login with Google" option.
    2. User clicks the button and is redirected to Google's identity provider.
    3. After successful authentication and consent, Google redirects the user back to the application.
    4. **The system SHALL** detect that this is a new user and automatically create a local `User` record and a default `UserProfile`.
    5. **Age Group Bootstrapping:** If this is the **first user** in the system, they SHALL be automatically assigned to the "Adult" age group, regardless of their actual age.
    6. **Birthdate Synchronization:** The system SHALL attempt to fetch the user's birthdate from Google via the People API.
    7. User is redirected to the Dashboard and sees their name and profile picture.

### UJ-2: Returning User Login {: #uj-2 }

!!! info ""

    1. User navigates to the application.
    2. **The system SHALL** identify the existing session; if expired, the user clicks "Login with Google."
    3. Google authenticates the user (likely via an existing session).
    4. **The system SHALL** match the Google email with the existing local record and establish a session.
    5. User is redirected to the Dashboard.

---

## 2. Functional Requirements

### FR-1: Google OAuth2 Authentication {: #fr-1 }

!!! success "Acceptance Criteria"

    1. :material-play-circle:{ title="Event-driven" } When the user initiates a login, the system shall redirect the user to Google's authorization provider.
    2. :material-play-circle:{ title="Event-driven" } When Google returns a valid authorization code, the system shall exchange it for an access token and user identity information.
    3. :material-alert-circle:{ title="Unwanted Behavior" } If the Google authentication process fails or is cancelled, then the system shall redirect the user to the login page with a visible error parameter.

!!! quote "Rationale"

    **So That** I don't have to manage another set of credentials, I want to log in using my existing Google account.

### FR-2: Automatic User Registration {: #fr-2 }

!!! success "Acceptance Criteria"

    1. :material-alert-circle:{ title="Unwanted Behavior" } If an authenticated Google email does not exist in the local database, then the system shall create a new `User` record and a linked `UserProfile`.
    2. :material-check-all:{ title="Ubiquitous" } The system shall populate the new user's email, name, and profile picture URL using the data provided by the Google identity token.

!!! quote "Rationale"
    **So That** my experience is seamless, I want the system to automatically create an account for me when I first log in.

### FR-3: User Profile Quick View {: #fr-3 }

!!! success "Acceptance Criteria"
    1. :material-clock-outline:{ title="State-driven" } While the user is authenticated, the system shall display a profile summary in the application header.
    2. :material-plus-circle-outline:{ title="Optional" } Where a user has provided social links or a mobile phone number, the system shall display corresponding interactive icons in the quick view dropdown.

!!! quote "Rationale"
    **So That** I can quickly access my info, I want to see a summary in the header menu.

### FR-4: Update User Profile {: #fr-4 }

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } The system shall allow users to modify their social links, mobile phone number, and profile photo.
    2. :material-layers-outline:{ title="Complex" } When a user updates their profile, the system shall ensure that exactly one family role is selected.
    3. :material-check-all:{ title="Ubiquitous" } The system shall prevent the modification of the `email`, `firstName`, and `lastName` fields.
    4. :material-plus-circle-outline:{ title="Optional" } Where a user provides a local file, the system shall upload the file to the centralized media service and store the resulting URL reference as the profile photo.
    5. :material-check-all:{ title="Ubiquitous" } The system shall serve profile photos via the centralized media endpoint (`/api/images/{name}`), using URL-based references rather than inline Base64 data.

!!! quote "Rationale"
    **So That** I can customize my identity, I want to update my profile details.

#### FR-16: Automated Age Group Classification {: #fr-16 }

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } The system shall calculate the user's current age using their stored birthdate.
    2. :material-check-all:{ title="Ubiquitous" } The system shall map the user to an **Age Group** based on the current system-wide age range configurations.
    3. :material-play-circle:{ title="Event-driven" } When a user logs in or the daily recalculation task runs, the system shall update the user's age group classification.

!!! quote "Rationale"
    **So That** the system can enforce age-appropriate access, users must be categorized into age groups.

#### FR-17: Google Birthdate Integration {: #fr-17 }

!!! success "Acceptance Criteria"
    1. :material-check-all:{ title="Ubiquitous" } The system shall request the `user.birthday.read` scope during the initial OAuth2 authorization request.
    2. :material-play-circle:{ title="Event-driven" } When a user completes their first login, the system shall attempt to retrieve their birthdate via the Google People API.
    3. :material-alert-circle:{ title="Unwanted Behavior" } If Google does not provide a birthdate, then the system shall prompt the user to provide it manually during the profile setup.

!!! quote "Rationale"
    **So That** onboarding is seamless, the system should automatically retrieve the user's birthday.

---

## 3. Non-Functional Requirements

### NFR-1: Security (Zero Trust) {: #nfr-1 }

!!! success "Acceptance Criteria"
    1. :material-alert-circle:{ title="Unwanted Behavior" } If a request is made to any `/api/**` endpoint without a valid session token, then the system shall return a `401 Unauthorized` response.
