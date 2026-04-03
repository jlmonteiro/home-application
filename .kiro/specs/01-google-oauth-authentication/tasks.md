# Tasks: Google OAuth Authentication

## Status Legend
- [ ] Todo
- [x] Done
- [!] Blocked

## Database Migration Tasks

### Schema Changes
- [x] Create migration `03-migrate-user-primary-keys.sql` (REQ-005)
  - Add id columns to user and user_profile tables
  - Migrate data to new structure
  - Update foreign key relationships
  - Add unique constraint on email
  - Create index on email
  - Write rollback script
- [x] Create migration `04-add-user-profile-photo.sql` (REQ-004)
  - Note: photo column already added in `02-create-user-profile-table.sql`; a dedicated migration is still needed if migrating existing DBs
  - Write rollback script
- [x] Create migration `05-add-timestamps.sql`
  - Add created_at and updated_at to user table
  - Add created_at and updated_at to user_profile table
  - Write rollback script
- [x] Update `db.changelog-master.xml` to include new migrations
  - Using `<includeAll>` to auto-include all SQL files in `db/changelog/sql/`
- [x] Test migrations on clean database
- [x] Test rollback scripts

## Entity Updates

### User Entity
- [x] Update User entity (Design: Data Model)
  - Change @Id from email to Long id
  - Add @GeneratedValue with IDENTITY strategy
  - Keep email field with unique constraint
  - Add firstName and lastName fields
  - Add enabled field (default true)
  - Add createdAt and updatedAt timestamps
  - Add @OneToOne relationship to UserProfile
- [x] Create UserAdapter for User entity (User fields integrated into UserProfileAdapter)

### UserProfile Entity
- [x] Update UserProfile entity (Design: Data Model)
  - Change @Id from email to Long id
  - Add @GeneratedValue with IDENTITY strategy
  - Add @OneToOne relationship to User with @JoinColumn(user_id)
  - Add photo field (TEXT, base64 encoded)
  - Add phone field (mobilePhone)
  - Add socialNetworks fields (facebook, instagram, linkedin)
  - Add createdAt and updatedAt timestamps
- [x] Update UserProfileAdapter for new Long-id structure (Entity-to-DTO conversion exists)

## Repository Updates

- [x] Update UserRepository (Design: Repository Updates)
  - Change primary key type from String to Long
  - Add findByEmail(String email) method
- [x] Update UserProfileRepository (Design: Repository Updates)
  - Change primary key type from String to Long
  - Add findByUserId(Long userId) method

## Service Layer

### PhotoService
- [x] Create PhotoService class (Design: Photo Service)
  - Implement downloadAndConvertToBase64(String imageUrl)
  - Add error handling for network failures
  - Add logging for failures
  - Add timeout configuration

### UserService Updates
- [x] Update UserService (Design: User Service)
  - Add findOrCreateUser method
  - Implement createNewUser method
  - Integrate PhotoService for profile photo
  - Handle UserProfile creation on first login
  - Add transaction management
  - Update existing methods to work with Long id

## OAuth2 Integration

### Dependencies
- [x] Add Spring Security OAuth2 Client dependency to build.gradle.kts (via libs.versions.toml)

### Security Configuration
- [x] Create SecurityConfig class (Design: Security Configuration)
  - Configure HttpSecurity with oauth2Login
  - Set up authorization rules
  - Configure success and failure URLs
  - Configure logout
  - Wire CustomOAuth2UserService

### Custom OAuth2 User Service
- [x] Create CustomOAuth2UserService (Design: Custom OAuth2 User Service)
  - Extend DefaultOAuth2UserService
  - Override loadUser method
  - Extract user info from OAuth2User
  - Call UserService.findOrCreateUser
  - Handle exceptions

## Configuration

- [x] Update application.yaml (Design: Configuration)
  - Add spring.security.oauth2.client.registration.google
  - Configure client-id from environment variable
  - Configure client-secret from environment variable
  - Set scopes (email, profile)
  - Configure redirect-uri
- [x] Update application-test.yaml for test configuration
- [x] Document required environment variables in README

## Controller Updates

- [x] Update UserController if needed
  - Ensure endpoints work with Long id instead of email
  - Update path variables from {email} to {id}
- [ ] Create LoginController (optional)
  - Add /login endpoint
  - Add /home endpoint for post-login redirect

## DTOs

- [x] Create GoogleUserInfoDTO (Design: DTOs)
- [x] Update UserDTO to include id field (Integrated into UserProfileDTO)
- [x] Update UserProfileDTO to include id field

## Testing Tasks

### Unit Tests

#### PhotoService Tests
- [x] Test downloadAndConvertToBase64 with valid URL
- [x] Test downloadAndConvertToBase64 with invalid URL
- [ ] Test downloadAndConvertToBase64 with network timeout
- [x] Test downloadAndConvertToBase64 returns null on failure

#### UserService Tests
- [x] Test findOrCreateUser with existing user
- [x] Test findOrCreateUser with new user
- [x] Test createNewUser creates User entity
- [x] Test createNewUser creates UserProfile entity
- [x] Test createNewUser with photo URL
- [x] Test createNewUser with null photo URL
- [x] Test createNewUser sets timestamps correctly

### Integration Tests

#### OAuth Flow Tests
- [ ] Test OAuth2 login redirects to Google
- [ ] Test OAuth2 callback creates new user (mock Google response)
- [ ] Test OAuth2 callback with existing user
- [ ] Test OAuth2 failure redirects to error page

#### Database Tests
- [x] Test User entity persistence with new schema
- [x] Test UserProfile entity persistence with new schema
- [x] Test User-UserProfile relationship
- [x] Test email unique constraint
- [x] Test findByEmail query
- [x] Test cascade delete behavior

#### Migration Tests
- [x] Test migration 03 on database with existing data
- [x] Test migration 03 rollback
- [x] Test migration 04 on clean database
- [x] Test migration 04 rollback
- [x] Test migration 05 on clean database
- [x] Test migration 05 rollback

### End-to-End Tests
- [ ] Test complete first login flow (requires test Google account)
- [ ] Test subsequent login flow
- [ ] Test user profile data populated correctly
- [ ] Test photo stored as base64

## Test Data

- [x] Create SQL script for test users with new schema
- [x] Update existing test data scripts for new schema
- [ ] Create mock OAuth2User for testing

## Documentation

- [ ] Update README.md with OAuth setup instructions
- [ ] Document Google Cloud Console setup steps
- [ ] Document environment variable setup
- [ ] Update API documentation if endpoints changed
- [ ] Add troubleshooting section for common OAuth issues

## Deployment Preparation

- [ ] Verify migrations work on staging database
- [ ] Set up Google OAuth credentials for staging
- [ ] Set up Google OAuth credentials for production
- [ ] Configure environment variables in deployment environment
- [ ] Test OAuth callback URLs in staging
- [ ] Plan production deployment with rollback strategy

## Code Review Checklist

- [x] All migrations follow `.kiro/rules/database.md`
- [x] All Java code follows `.kiro/rules/java.md`
- [x] All tests follow `.kiro/rules/tests.md`
- [ ] Security best practices applied
- [ ] Error handling comprehensive
- [ ] Logging appropriate
- [ ] No sensitive data in logs
- [ ] Transaction boundaries correct
- [ ] All requirements addressed
- [ ] All acceptance criteria met
