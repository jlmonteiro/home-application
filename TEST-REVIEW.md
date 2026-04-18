# Backend Test Suite Review

**Date:** 2026-04-18
**Suite:** 119 tests, 0 failures
**Framework:** Spock + Spring Boot + Testcontainers (PostgreSQL)

---

## Executive Summary

The test suite has solid coverage of the **profiles** and **shopping** modules but significant gaps in **recipes**, **meals**, **notifications**, and **media**. There are several cases of duplicated coverage across spec classes, and some tests that could be simplified with data-driven (`where:`) blocks. The biggest risk areas are the completely untested `RecipeService` (268 lines, 7 public methods) and `MealPlanService` (161 lines, 8 public methods).

| Module | Service Coverage | Controller Coverage | Verdict |
|--------|-----------------|-------------------|---------|
| Profiles | ✅ Good (73% line) | ✅ Good (70% line) | Minor cleanup needed |
| Shopping | ✅ Good (62% line) | ⚠️ Thin (18% line) | Controller tests need expansion |
| Recipes | ❌ Poor (40% line) | ❌ Poor (15% line) | Major gap |
| Meals | ❌ Poor (14% line) | ❌ Poor (22% line) | Major gap |
| Notifications | ❌ None (3% line) | ❌ None (0% line) | No tests at all |
| Media | ❌ None (12% line) | ❌ None (0% line) | No tests at all |

---

## Module: Profiles

### Test Files
- `UserServiceSpec` (5 tests) — user creation/lookup
- `UserProfileServiceSpec` (7 tests) — profile CRUD
- `OAuth2FlowSpec` (2 tests) — OAuth login flow
- `OnboardingIntegrationSpec` (3 tests) — first-user bootstrap + age sync
- `AgeClassificationServiceSpec` (2 tests) — age group classification
- `GooglePeopleServiceSpec` (4 tests) — Google People API integration
- `SettingsServiceSpec` (9 tests) — family roles + age group config
- `UserProfileAdapterSpec` (7 tests) — entity↔DTO mapping
- `UserProfileControllerSpec` (7 tests) — REST API + HATEOAS + validation
- `UserProfileUpdateSpec` (4 tests) — PUT /me endpoint
- `SettingsApiSpec` (4 tests) — settings RBAC

### Duplicated / Overlapping Tests

**1. "Create new user" is tested 3 times with overlapping assertions**

| Spec | Test | Asserts |
|------|------|---------|
| `UserServiceSpec` | "create a new user when email does not exist" | email, firstName, lastName, enabled, count=1 |
| `OAuth2FlowSpec` | "find or create a local user from Google OAuth2 attributes" | email, firstName, lastName, enabled, photo, social fields null |
| `OnboardingIntegrationSpec` | "bootstrap the first user as an Adult even if young" | birthdate, ageGroupName |

**Suggestion:** `UserServiceSpec` test 1 and `OAuth2FlowSpec` test 1 overlap heavily. The OAuth2FlowSpec test is more comprehensive (also checks profile fields). Consider removing the basic creation test from `UserServiceSpec` since the data-driven photo test already exercises `findOrCreateUser` for new users. Alternatively, keep `UserServiceSpec` focused on the service contract and remove the user-creation assertions from `OAuth2FlowSpec`.

**2. "Return existing user" is tested 3 times**

| Spec | Test | Asserts |
|------|------|---------|
| `UserServiceSpec` | "return existing user when email already exists" | count unchanged, email, firstName unchanged |
| `OAuth2FlowSpec` | "return existing user if email is already registered" | count=1, firstName/lastName unchanged |
| `OnboardingIntegrationSpec` | "update birthdate and reclassify on subsequent login" | birthdate synced, ageGroupName updated |

**Suggestion:** `UserServiceSpec` test 2 and `OAuth2FlowSpec` test 2 are nearly identical. Keep one. The `OnboardingIntegrationSpec` test is distinct (tests birthdate sync) and should stay.

**3. `OAuth2FlowSpec` doesn't actually test `CustomOAuth2UserService`**

Both tests override `loadUser()` with an anonymous subclass that just calls `userService.findOrCreateUser()` directly. This means:
- The `super.loadUser()` call is never tested
- The attribute extraction logic is never tested
- The role assignment logic (`ROLE_ADULT`, etc.) is never tested
- The `GooglePeopleService` integration is never tested in this flow

**Suggestion:** Either rewrite `OAuth2FlowSpec` to actually test the real `CustomOAuth2UserService` behavior (role assignment, attribute extraction), or delete it entirely since its current tests are just duplicates of `UserServiceSpec`.

**4. `UserProfileAdapterSpec` null-guard tests are low-value**

Tests for `toDTO(null)`, `toEntity(null)`, `toUserProfileEntity(null, user)`, `toUserProfileEntity(dto, null)` — these test trivial null-check branches. If the adapter uses `if (x == null) return null`, these tests add noise without catching real bugs.

**Suggestion:** Remove the 3 null-guard tests. Keep the 2 happy-path conversion tests and the "user without profile" test.

### Simplification Opportunities

**5. `UserProfileServiceSpec` — merge the two `getUserProfile` overload tests**

The "by ID" and "by email" tests are structurally identical. Use a data-driven test:

```groovy
@Unroll
def "getUserProfile should return profile when looked up by #lookupType"() {
    // ...
    where:
        lookupType | lookup
        "ID"       | { id -> userProfileService.getUserProfile(id) }
        "email"    | { id -> userProfileService.getUserProfile("withprofile@example.com") }
}
```

Same for the two "empty optional" tests.

**6. `UserProfileServiceSpec` — "handle user without profile" test has unnecessary mock setup**

The test calls `when(photoService.getPhotoUrl(anyString())).thenReturn(null)` but then asserts `photo == null`. The mock is irrelevant since there's no profile to get a photo URL from.

### Missing Coverage

**7. `UserPreferenceService` — 0 tests**

Has `getPreferences()`, `updatePreferences()`, and auto-creation logic. Needs at least:
- Get preferences for existing user
- Get preferences auto-creates for new user
- Update preferences
- Non-existent user throws `ObjectNotFoundException`

**8. `UserProfileController` — no test for `GET /api/user/{id}`**

The paginated list and `/me` endpoints are tested, but the individual profile fetch by ID is only tested indirectly through the 404 case in `GlobalExceptionHandlerSpec`.

**9. `UserPreferenceController` — 0 tests**

No API-level tests for the preferences endpoints.

---

## Module: Shopping

### Test Files
- `ShoppingCatalogServiceSpec` (6 tests) — categories + items CRUD
- `ShoppingStoreServiceSpec` (11 tests) — stores, loyalty cards, coupons
- `ShoppingListServiceSpec` (12 tests) — lists + list items + price suggestions
- `ShoppingApiSpec` (3 tests) — categories/items API
- `CouponApiSpec` (1 test) — coupon date format

### Duplicated / Overlapping Tests

**10. `ShoppingApiSpec` "duplicate category" test overlaps with `GlobalExceptionHandlerSpec`**

`GlobalExceptionHandlerSpec` already tests "should return 400 ProblemDetail for duplicate category name" using the same endpoint. `ShoppingApiSpec` has "should return 400 for duplicate category name" with the same assertion.

**Suggestion:** Remove the duplicate from whichever spec is less appropriate. The `GlobalExceptionHandlerSpec` version tests the error format; the `ShoppingApiSpec` version tests the business rule. Keep the one in `ShoppingApiSpec` (it's the domain owner) and remove from `GlobalExceptionHandlerSpec`.

### Simplification Opportunities

**11. `ShoppingStoreServiceSpec` — the "delete throws on re-fetch" pattern is awkward**

```groovy
def "deleteStore should remove store and throw exception on subsequent fetch"() {
    when: "deleting the store"
        storeService.deleteStore(store.id)
    and: "trying to fetch it"
        storeService.getStore(store.id)
    then:
        thrown(ObjectNotFoundException)
}
```

This conflates two operations in one test. The `thrown()` could be from either call. Split into: (a) delete succeeds, (b) fetch after delete throws.

**12. `ShoppingListServiceSpec` — `removeListItem` test conflates delete + re-delete**

Same pattern: calls `removeListItem` twice and asserts `thrown()` on the second call. The first call's success is never verified independently.

### Missing Coverage

**13. `ShoppingController` — only 3 API tests for a controller with ~10 endpoints**

Missing tests for:
- `PUT /api/shopping/categories/{id}` (update category)
- `DELETE /api/shopping/categories/{id}` (delete category)
- `PUT /api/shopping/items/{id}` (update item)
- `DELETE /api/shopping/items/{id}` (delete item)
- `GET /api/shopping/items` (list items)

**14. `StoreController` — only 1 API test (coupon date format)**

Missing tests for:
- `POST /api/shopping/stores` (create store)
- `PUT /api/shopping/stores/{id}` (update store)
- `DELETE /api/shopping/stores/{id}` (delete store)
- Loyalty card CRUD endpoints
- Coupon CRUD endpoints (beyond date format)
- HATEOAS links on all responses

**15. `ShoppingListController` — 0 API tests**

No controller-level tests for shopping list endpoints. The service layer is well-tested, but HTTP concerns (status codes, HATEOAS links, pagination, auth) are not verified.

**16. `ShoppingDataRetentionService` — 0 tests**

The scheduled `purgeOldLists()` method has no test. It deletes data older than 3 months. This is a destructive operation that should be tested.

---

## Module: Recipes

### Test Files
- `RecipeApiSpec` (4 tests) — basic CRUD via API

### Missing Coverage — Critical

**17. `RecipeService` — 0 service-level tests (268 lines, 7 public methods)**

This is the largest untested service. It handles:
- Recipe CRUD with photo management
- Ingredient management
- Step management
- Label assignment
- Complex entity graph creation/update

**18. `RecipeFeedbackService` — 0 tests (95 lines, 6 public methods)**

Handles ratings and comments. No coverage for:
- Adding/updating ratings
- Adding/deleting comments
- Average rating calculation

**19. `NutritionEntryService` — 0 tests (61 lines, 4 public methods)**

**20. `NutrientService` — 0 tests (56 lines, 5 public methods)**

**21. `LabelService` — 0 tests (64 lines, 4 public methods)**

**22. `RecipeAdapter` — 35% line coverage, 18% branch coverage**

Only exercised indirectly through `RecipeApiSpec`. No dedicated adapter tests.

**23. Recipe controllers — only `RecipeController` has tests**

Missing tests for:
- `RecipeFeedbackController` (ratings + comments)
- `NutritionEntryController`
- `NutrientController`
- `LabelController`

---

## Module: Meals

### Test Files
- `MealPlanApiSpec` (3 tests) — plan retrieval + export

### Missing Coverage — Critical

**24. `MealPlanService` — 0 service-level tests (161 lines, 8 public methods)**

Handles:
- Weekly plan creation/retrieval (get-or-create pattern)
- Plan entries (add/remove recipes to days)
- Voting on meal plans
- Status transitions (PENDING → APPROVED)

**25. `MealPlanExportService` — 0 tests (139 lines, 3 public methods)**

Exports meal plan ingredients to shopping lists. Only tested indirectly through `MealPlanApiSpec` export test.

**26. `MealTimeService` — 0 tests (93 lines, 6 public methods)**

Manages meal time definitions and schedules.

**27. `MealReminderScheduler` — 0 tests**

Scheduled task that sends notifications before meals. Untested.

**28. `MealTimeController` — 0 tests**

**29. `MealAdapter` — 15% line coverage**

Only exercised indirectly.

---

## Module: Notifications

### Missing Coverage — Complete Gap

**30. `NotificationService` — 0 tests (100+ lines, 6 public methods)**

Handles:
- Fetching user notifications
- Marking as read
- Creating notifications
- Direct messaging (conversations)
- Unread count

**31. `NotificationController` — 0 tests**

**32. `NotificationAdapter` — 0% coverage**

---

## Module: Media

### Missing Coverage — Complete Gap

**33. `PhotoService` — 0 dedicated tests (12% coverage from indirect use)**

Critical service used by profiles, shopping, and recipes. Handles:
- Base64 decoding and binary storage
- Content-type detection from data URI prefix
- Photo retrieval by name
- URL generation
- Filename generation

This is particularly important to test because it handles binary data parsing and has multiple edge cases (with/without data URI prefix, various image formats, whitespace in base64).

**34. `ImageController` — 0 tests**

Serves binary image data. No tests for:
- Successful image retrieval with correct content-type
- 404 for non-existent image
- Empty image data handling

---

## Module: Config / Cross-Cutting

### Test Files
- `GlobalExceptionHandlerSpec` (6 tests) — RFC 7807 error format

### Issues

**35. `GlobalExceptionHandlerSpec` — duplicate category test (see #10)**

**36. `GlobalExceptionHandlerSpec` — `enrichWithExceptionDetails` is a unit test in an integration spec**

The stack trace filtering test constructs a `GlobalExceptionHandler` directly and tests a method with synthetic data. This doesn't need `@SpringBootTest` or Testcontainers. It should be a plain `Specification` unit test to avoid the ~10s Spring context startup cost.

**37. `TestSecurityConfig` — not a test, it's test infrastructure**

This is fine as-is, just noting it's a config class, not a test.

---

## Priority Action Plan

### P0 — High-value, high-risk gaps
1. **Add `PhotoService` tests** — used everywhere, handles binary data, zero coverage
2. **Add `RecipeService` tests** — largest service, complex entity graph, zero coverage
3. **Add `MealPlanService` tests** — core feature, get-or-create + voting logic, zero coverage
4. **Add `NotificationService` tests** — messaging + notification logic, zero coverage

### P1 — Cleanup and deduplication
5. **Rewrite or delete `OAuth2FlowSpec`** — currently tests nothing that `UserServiceSpec` doesn't
6. **Remove duplicate "create user" tests** across `UserServiceSpec` / `OAuth2FlowSpec` / `OnboardingIntegrationSpec`
7. **Remove duplicate "duplicate category" test** from `GlobalExceptionHandlerSpec`
8. **Move `enrichWithExceptionDetails` test** to a plain unit spec
9. **Remove null-guard tests** from `UserProfileAdapterSpec`

### P2 — Controller coverage expansion
10. **Add `ShoppingController` tests** for update/delete endpoints
11. **Add `StoreController` tests** for full CRUD
12. **Add `ShoppingListController` tests** — zero API-level coverage
13. **Add recipe sub-controller tests** (feedback, nutrition, labels)
14. **Add `MealTimeController` tests**
15. **Add `NotificationController` tests**
16. **Add `ImageController` tests**

### P3 — Service coverage expansion
17. **Add `RecipeFeedbackService` tests**
18. **Add `MealTimeService` tests**
19. **Add `MealPlanExportService` tests**
20. **Add `UserPreferenceService` tests**
21. **Add `ShoppingDataRetentionService` tests**
22. **Add `NutritionEntryService` + `NutrientService` + `LabelService` tests**
