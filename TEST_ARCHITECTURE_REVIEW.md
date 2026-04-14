# Test Architecture Review

## Current Coverage

### Unit Tests (5 files, ~30 tests)
| File | Coverage |
|------|----------|
| `LoginPage.spec.tsx` | button visibility, OAuth redirect, auth redirect |
| `ProfilePage.spec.tsx` | form pre-fill, update, validation (phone, Facebook) |
| `ProtectedRoute.spec.tsx` | loading, unauth redirect, error redirect, auth render |
| `ShoppingListsPage.spec.tsx` | list display, create (validation), delete |
| `ShoppingListDetailsPage.spec.tsx` | details display, mark bought, mark completed |

### E2E Tests (4 files)
| File | Coverage |
|------|----------|
| `login.spec.ts` | Google OAuth redirect |
| `shopping.spec.ts` | Full lifecycle (create → add item → buy) |
| `profile.spec.ts` | update profile, validation errors |
| `protected-routes.spec.ts` | auth redirect logic |

---

## Gaps & Improvements

### 1. Missing Unit Tests

| Component | Missing Coverage |
|-----------|------------------|
| `AuthContext` | logout, token refresh, error states |
| `api.ts` services | fetchStores, fetchCategories, price history |
| `SettingsPage` | adult-only restriction, preferences |
| `StoresPage` | loyalty cards, barcode/QR display |
| `Dashboard` | widget rendering, stats |
| Error boundaries | 404 page, error fallback UI |

### 2. Missing E2E Tests

| Flow | Priority |
|------|----------|
| Logout flow | High |
| Settings (adult-only access) | High |
| Store management (add/edit/remove) | Medium |
| Coupon management | Medium |
| Network failure recovery | Medium |
| Mobile viewport (375px) | Low |

### 3. Test Quality Issues

**Unit Tests:**
- `ProtectedRoute.spec.tsx:27` - Loading overlay check is fragile (relies on Mantine internals)
- `ShoppingListsPage.spec.tsx:77` - Delete button selector is brittle
- No snapshot tests for component stability
- No tests for optimistic updates in TanStack Query

**E2E Tests:**
- `login.spec.ts` - Expects URL to contain "google" but OAuth may redirect to callback first
- No test for session expiration handling
- No test for concurrent list editing
- Missing `test.afterEach` cleanup for auth state

### 4. Infrastructure Gaps

| Issue | Recommendation |
|-------|----------------|
| Coverage thresholds 80% | Start at 50%, ramp up gradually |
| No `vi.useFakeTimers()` | Needed for notification timeout tests |
| No MSW integration | Would replace `vi.spyOn(fetch)` with realistic handlers |
| No visual regression tests | Add `@playwright/test/screenshots` |

### 5. BDD Consistency

Backend Spock tests use `@Title`/`@Narrative` annotations. Frontend lacks this pattern:

```typescript
// Current
describe('Given the ProfilePage', () => {

// Recommended (matching backend style)
describe('Profile Management', () => {
  it('should update user profile successfully', () => {
    // ...
  })
```

---

## Priority Recommendations

1. **Add `AuthContext.spec.tsx`** - Critical for auth flows
2. **Add logout E2E test** - Missing core flow
3. **Fix brittle selectors** - Use `data-testid` attributes
4. **Add Settings E2E** - Adult-only restriction is a security feature
5. **Add MSW** - Better API mocking than `vi.spyOn`