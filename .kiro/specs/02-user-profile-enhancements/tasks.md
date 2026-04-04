# Tasks: User Profile Enhancements

## Status Legend
- [ ] Todo
- [x] Done
- [!] Blocked

## 1. Implementation: "Who Am I" Endpoint

### Controller Layer
- [ ] Implement `GET /api/user/me` in `UserProfileController` (Design: Section 1)
  - Use `@AuthenticationPrincipal` to get the user's email
  - Add defensive null/blank check for the email attribute
  - Call `userProfileService.getUserProfile(email)`
  - Use `resourceAssembler.toModel()` to wrap the result
  - Manually add the supplementary `me` relation link
- [ ] Update `SecurityConfig` to ensure `/api/user/me` is explicitly protected (if needed, currently `/api/user/**` is protected)

## 2. Test Data Preparation

### SQL Scripts
- [ ] Create `home-app-backend/src/test/resources/scripts/sql/pagination-test-data.sql`
  - Insert 20 unique users with varying names/emails
  - Insert 20 corresponding user profiles with mixed data (photos, phones, etc.)

## 3. Enhanced Integration Testing

### "Who Am I" Verification
- [ ] Add `GET /api/user/me should return 401 when unauthenticated`
- [ ] Add `GET /api/user/me should return 200 with canonical links when authenticated`
  - Use `oauth2Login()` post-processor
  - Assert `_links.self.href` contains the user's numeric ID
  - Assert `_links.me.href` contains `/api/user/me`
- [ ] Add `GET /api/user/me should return 404 when user record is missing in DB`

### HATEOAS & Pagination Verification
- [ ] Add `GET /api/user should return paginated navigation links`
  - Use `@Sql("/scripts/sql/pagination-test-data.sql")`
  - Request a specific page (e.g., page 1, size 5)
  - Assert existence of `first`, `prev`, `self`, `next`, and `last` links
  - Verify pagination metadata accuracy
- [ ] Add `GET /api/user should preserve sorting parameters in links`
  - Request with `sort=firstName,desc`
  - Assert that `_links.self.href` contains `sort=firstName,desc`

## 4. Documentation & Cleanup
- [ ] Update `tasks.md` with final status
- [ ] Run full test suite to ensure no regressions
