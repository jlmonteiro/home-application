# Tasks: User Profile Enhancements

## Status Legend
- [ ] Todo
- [x] Done
- [!] Blocked

## 1. Implementation: "Who Am I" Endpoint

### Controller Layer
- [x] Implement `GET /api/user/me` in `UserProfileController` (Design: Section 1)
- [x] Update `SecurityConfig` to ensure `/api/user/me` is explicitly protected (Protected via `anyRequest().authenticated()`)

## 2. Test Data Preparation

### SQL Scripts
- [x] Create `home-app-backend/src/test/resources/scripts/sql/pagination-test-data.sql`

## 3. Enhanced Integration Testing

### "Who Am I" Verification
- [x] Add `GET /api/user/me should return 302 redirection when unauthenticated`
- [x] Add `GET /api/user/me should return 200 with canonical links when authenticated`
- [x] Add `GET /api/user/me should return 404 when user record is missing in DB`

### HATEOAS & Pagination Verification
- [x] Add `GET /api/user should return paginated navigation links`
- [x] Add `GET /api/user should preserve sorting parameters in links`

## 4. Documentation & Cleanup
- [x] Update `tasks.md` with final status
- [x] Run full test suite to ensure no regressions
