# Requirements: Google OAuth Authentication

## Overview
Implement Google OAuth 2.0 authentication for the home-app-backend Spring Boot application. The system should allow users to authenticate using their Google accounts, automatically creating user and user profile records on first login.

## User Stories

**US-001**: As a user, I want to log in using my Google account, so that I don't need to create and remember separate credentials.

**US-002**: As a new user, I want my basic profile information automatically populated from my Google account, so that I don't have to manually enter information that Google already has.

**US-003**: As a system administrator, I want user records to use sequential IDs as primary keys, so that the system can scale efficiently and support multiple authentication providers in the future.

## Functional Requirements

### REQ-001: Google OAuth Integration
The system must integrate with Google OAuth 2.0 for user authentication using Spring Security OAuth2 client.

### REQ-002: First Login User Creation
On first successful Google authentication, the system must automatically create:
- A `User` entity with information from Google account
- A `UserProfile` entity linked to the user

### REQ-003: Google Account Data Mapping
The system must retrieve and store the following from Google account:
- Email address
- First name
- Last name
- Profile photo (converted to base64 format)

### REQ-004: User Profile Initialization
On first login, the `UserProfile` must be created with:
- All fields set to null except those populated from Google
- Photo field containing base64-encoded image from Google profile picture
- Fields available for future updates: social networks, phone, etc.

### REQ-005: Primary Key Migration
The system must migrate from email-based primary keys to sequential numeric IDs:
- `User` entity: Use `BIGSERIAL` primary key (id)
- Email remains a required field with unique constraint
- Maintain referential integrity with `UserProfile`

### REQ-006: Email Uniqueness
Email must remain unique across all users with a database unique index.

### REQ-007: User-Profile Relationship
Both `User` and `UserProfile` entities must be linked with proper foreign key relationship.

## Non-Functional Requirements

### NFR-001: Security
- OAuth tokens must be securely handled and not exposed in logs
- User sessions must be managed securely
- HTTPS required for OAuth callback URLs in production

### NFR-002: Performance
- First login user creation must complete within 3 seconds
- Profile photo download and base64 conversion must not block authentication flow

### NFR-003: Data Integrity
- Database migration must preserve existing user data
- Rollback capability must be available for schema changes

### NFR-004: Compatibility
- Must work with existing Spring Boot 4.x configuration
- Must integrate with current Liquibase migration strategy

## Acceptance Criteria

### AC-001: Successful Google Login
- User can click "Login with Google" and authenticate
- User is redirected back to application after successful authentication
- User session is established

### AC-002: First Login Creates Records
- New Google user authentication creates both User and UserProfile records
- Email, first name, last name are populated from Google
- Profile photo is stored as base64 string
- Other UserProfile fields are null

### AC-003: Subsequent Logins
- Existing users can log in without creating duplicate records
- User lookup is performed by email
- Session is established with existing user data

### AC-004: Schema Migration
- Existing User and UserProfile records are migrated to new schema
- Email unique constraint is maintained
- All foreign key relationships remain intact
- No data loss occurs

### AC-005: Error Handling
- Failed Google authentication shows appropriate error message
- Network errors during profile photo download are handled gracefully
- Duplicate email attempts are prevented

## Out of Scope

- Multi-factor authentication (MFA)
- Other OAuth providers (Facebook, GitHub, etc.)
- User profile editing functionality
- Password-based authentication
- User role and permission management
- Email verification workflow
- Account deletion or deactivation

## Dependencies

- Google Cloud Console project with OAuth 2.0 credentials configured
- OAuth callback URL registered with Google
- Spring Security OAuth2 Client library
- Existing PostgreSQL database
- Liquibase for database migrations

## Assumptions

- Google OAuth credentials (Client ID and Secret) will be provided via environment variables
- Users have valid Google accounts
- Application has internet access to reach Google OAuth endpoints
- Profile photos from Google are publicly accessible
- Base64 encoding is acceptable for photo storage (future optimization to file storage is possible)

## Constraints

- Must maintain backward compatibility with existing User and UserProfile data
- Must follow existing project structure and coding standards (`.kiro/rules/`)
- Must use Spock for testing
- Must include Liquibase migrations with rollback scripts
