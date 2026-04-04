# Tasks: Google OAuth Authentication

## Status Legend
- [ ] Todo
- [x] Done
- [!] Blocked

## Database Migration Tasks

### Schema Changes
- [x] Create migration `03-migrate-user-primary-keys.sql` (REQ-005)
- [x] Create migration `04-add-user-profile-photo.sql` (REQ-004)
- [x] Create migration `05-add-timestamps.sql`
- [x] Update `db.changelog-master.xml` to include new migrations
- [x] Test migrations on clean database
- [x] Test rollback scripts

## Entity Updates

### User Entity
- [x] Update User entity (Design: Data Model)
- [x] Create UserAdapter for User entity

### UserProfile Entity
- [x] Update UserProfile entity (Design: Data Model)
- [x] Update UserProfileAdapter for new Long-id structure

## Repository Updates

- [x] Update UserRepository (Design: Repository Updates)
- [x] Update UserProfileRepository (Design: Repository Updates)

## Service Layer

### PhotoService
- [x] Create PhotoService class (Design: Photo Service)
- [x] Implement downloadAndConvertToBase64(String imageUrl)

### UserService Updates
- [x] Update UserService (Design: User Service)

## OAuth2 Integration

### Dependencies
- [x] Add Spring Security OAuth2 Client dependency to build.gradle.kts

### Security Configuration
- [x] Create SecurityConfig class (Design: Security Configuration)

### Custom OAuth2 User Service
- [x] Create CustomOAuth2UserService (Design: Custom OAuth2 User Service)

## Configuration

- [x] Update application.yaml (Design: Configuration)
- [x] Update application-test.yaml for test configuration
- [x] Document required environment variables in README

## Controller Updates

- [x] Update UserController if needed

## DTOs

- [x] Create GoogleUserInfoDTO (Design: DTOs)
- [x] Update UserDTO to include id field
- [x] Update UserProfileDTO to include id field

## Testing Tasks

### Unit Tests
- [x] All relevant unit tests for services, adapters, and models are implemented and passing.

### Integration Tests
- [x] Integration tests for OAuth flow and database persistence are implemented and passing.

## Documentation

- [x] Update README.md with OAuth setup instructions
- [x] Document Google Cloud Console setup steps
- [x] Document environment variable setup
