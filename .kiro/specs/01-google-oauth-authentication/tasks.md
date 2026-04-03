# Tasks: Google OAuth Authentication

## Status Legend
- [ ] Todo
- [x] Done
- [!] Blocked

## Database Migration Tasks

### Schema Changes
- [ ] Create migration `03-migrate-user-primary-keys.sql` (REQ-005)
  - Add id columns to user and user_profile tables
  - Migrate data to new structure
  - Update foreign key relationships
  - Add unique constraint on email
  - Create index on email
  - Write rollback script
- [ ] Create migration `04-add-user-profile-photo.sql` (REQ-004)
  - Note: photo column already added in `02-create-user-profile-table.sql`; a dedicated migration is still needed if migrating existing DBs
  - Write rollback script
- [ ] Create migration `05-add-timestamps.sql`
  - Add created_at and updated_at to user table
  - Add created_at and updated_at to user_profile table
  - Write rollback script
- [x] Update `db.changelog-master.xml` to include new migrations
  - Using `<includeAll>` to auto-include all SQL files in `db/changelog/sql/`
- [ ] Test migrations on clean database
- [ ] Test rollback scripts

## Entity Updates

### User Entity
- [ ] Update User entity (Design: Data Model)
  - Change @Id from email to Long id ← not done (email still used as PK)
  - Add @GeneratedValue with IDENTITY strategy ← not done
  - Keep email field with unique constraint ← not done (email is still the PK)
  - ~~Add firstName and lastName fields~~ ← already implemented
  - ~~Add enabled field (default true)~~ ← already implemented
  - Add createdAt and updatedAt timestamps ← not done
  - ~~Add @OneToOne relationship to UserProfile~~ ← already implemented
- [ ] Create UserAdapter for User entity ← not done (no UserAdapter class exists)

### UserProfile Entity
- [ ] Update UserProfile entity (Design: Data Model)
  - Change @Id from email to Long id ← not done (email still used as PK)
  - Add @GeneratedValue with IDENTITY strategy ← not done
  - Add @OneToOne relationship to User with @JoinColumn(user_id) ← not done (uses email FK)
  - ~~Add photo field (TEXT, base64 encoded)~~ ← already implemented
  - ~~Add phone field (mobilePhone)~~ ← already implemented
  - ~~Add socialNetworks fields (facebook, instagram, linkedin)~~ ← already implemented
  - Add createdAt and updatedAt timestamps ← not done
- [ ] Update UserProfileAdapter for new Long-id structure ← adapter exists but still maps email-keyed entities

## Repository Updates

- [ ] Update UserRepository (Design: Repository Updates)
  - Change primary key type from String to Long ← not done (still `JpaRepository<User, String>`)
  - Add findByEmail(String email) method ← not done (email is still the PK, accessed via findById)
- [ ] Update UserProfileRepository (Design: Repository Updates)
  - Change primary key type from String to Long ← not done (still `JpaRepository<UserProfile, String>`)
  - Add findByUserId(Long userId) method ← not done

## Service Layer

### PhotoService
- [ ] Create PhotoService class (Design: Photo Service)
  - Implement downloadAndConvertToBase64(String imageUrl)
  - Add error handling for network failures
  - Add logging for failures
  - Add timeout configuration

### UserService Updates
- [ ] Update UserService (Design: User Service)
  - Add findOrCreateUser method
  - Implement createNewUser method
  - Integrate PhotoService for profile photo
  - Handle UserProfile creation on first login
  - Add transaction management
  - Update existing methods to work with Long id

## OAuth2 Integration

### Dependencies
- [ ] Add Spring Security OAuth2 Client dependency to build.gradle.kts
  - `implementation("org.springframework.boot:spring-boot-starter-oauth2-client")`

### Security Configuration
- [ ] Create SecurityConfig class (Design: Security Configuration)
  - Configure HttpSecurity with oauth2Login
  - Set up authorization rules
  - Configure success and failure URLs
  - Configure logout
  - Wire CustomOAuth2UserService

### Custom OAuth2 User Service
- [ ] Create CustomOAuth2UserService (Design: Custom OAuth2 User Service)
  - Extend DefaultOAuth2UserService
  - Override loadUser method
  - Extract user info from OAuth2User
  - Call UserService.findOrCreateUser
  - Handle exceptions

## Configuration

- [ ] Update application.yaml (Design: Configuration)
  - Add spring.security.oauth2.client.registration.google
  - Configure client-id from environment variable
  - Configure client-secret from environment variable
  - Set scopes (email, profile)
  - Configure redirect-uri
- [ ] Update application-test.yaml for test configuration
- [ ] Document required environment variables in README
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET

## Controller Updates

- [ ] Update UserController if needed
  - Ensure endpoints work with Long id instead of email ← not done (still uses {email} path variable)
  - Update path variables from {email} to {id} ← not done
- [ ] Create LoginController (optional)
  - Add /login endpoint
  - Add /home endpoint for post-login redirect

## DTOs

- [ ] Create GoogleUserInfoDTO (Design: DTOs) ← not done
- [ ] Update UserDTO to include id field ← not done
- [ ] Update UserProfileDTO to include id field ← not done (photo already included)

## Testing Tasks

### Unit Tests

#### PhotoService Tests
- [ ] Test downloadAndConvertToBase64 with valid URL
- [ ] Test downloadAndConvertToBase64 with invalid URL
- [ ] Test downloadAndConvertToBase64 with network timeout
- [ ] Test downloadAndConvertToBase64 returns null on failure

#### UserService Tests
- [ ] Test findOrCreateUser with existing user ← not done (method does not exist yet)
- [ ] Test findOrCreateUser with new user ← not done
- [ ] Test createNewUser creates User entity ← not done
- [ ] Test createNewUser creates UserProfile entity ← not done
- [ ] Test createNewUser with photo URL ← not done
- [ ] Test createNewUser with null photo URL ← not done
- [ ] Test createNewUser sets timestamps correctly ← not done

### Integration Tests

#### OAuth Flow Tests
- [ ] Test OAuth2 login redirects to Google
- [ ] Test OAuth2 callback creates new user (mock Google response)
- [ ] Test OAuth2 callback with existing user
- [ ] Test OAuth2 failure redirects to error page

#### Database Tests
- [ ] Test User entity persistence with new schema
- [ ] Test UserProfile entity persistence with new schema
- [ ] Test User-UserProfile relationship
- [ ] Test email unique constraint
- [ ] Test findByEmail query
- [ ] Test cascade delete behavior

#### Migration Tests
- [ ] Test migration 03 on database with existing data
- [ ] Test migration 03 rollback
- [ ] Test migration 04 on clean database
- [ ] Test migration 04 rollback
- [ ] Test migration 05 on clean database
- [ ] Test migration 05 rollback

### End-to-End Tests
- [ ] Test complete first login flow (requires test Google account)
- [ ] Test subsequent login flow
- [ ] Test user profile data populated correctly
- [ ] Test photo stored as base64

## Test Data

- [ ] Create SQL script for test users with new schema
  - `src/test/resources/scripts/sql/test-users-oauth.sql`
- [ ] Update existing test data scripts for new schema
- [ ] Create mock OAuth2User for testing

## Documentation

- [ ] Update README.md with OAuth setup instructions
- [ ] Document Google Cloud Console setup steps
  - Create OAuth 2.0 credentials
  - Configure authorized redirect URIs
  - Enable Google+ API
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

- [ ] All migrations follow `.kiro/rules/database.md`
- [ ] All Java code follows `.kiro/rules/java.md`
- [ ] All tests follow `.kiro/rules/tests.md`
- [ ] Security best practices applied
- [ ] Error handling comprehensive
- [ ] Logging appropriate
- [ ] No sensitive data in logs
- [ ] Transaction boundaries correct
- [ ] All requirements addressed
- [ ] All acceptance criteria met
