# Frontend Tests Guidelines

## Overview

This document defines the standards and patterns for writing frontend tests in the Home Application. Unit tests use **Vitest** with **Testing Library** and **MSW**. End-to-end tests use **Playwright** with the **Page Object Model**.

---

## 1. Test Infrastructure

### Vitest Configuration

The test runner is configured in `vitest.config.ts`, merging with the Vite config.

| Setting | Value | Purpose |
| :------ | :---- | :------ |
| `environment` | `jsdom` | Simulates browser DOM |
| `globals` | `true` | Enables `describe`, `it`, `expect` without imports |
| `setupFiles` | `./src/test/setup.ts` | Global test bootstrap |
| `coverage.provider` | `v8` | Code coverage engine |
| `coverage.thresholds` | `80%` (lines, functions, branches, statements) | Minimum coverage gates |

### Test Setup

The `setup.ts` file bootstraps the test environment before any spec runs:

- :material-check-all: Imports `@testing-library/jest-dom` for DOM matchers
- :material-check-all: Starts the MSW server with `onUnhandledRequest: 'error'`
- :material-check-all: Mocks browser APIs: `matchMedia`, `ResizeObserver`, `scrollIntoView`
- :material-check-all: Mocks external rendering libraries: `react-barcode`, `qrcode.react`

### MSW (Mock Service Worker)

All API mocking uses a centralized MSW server. Default handlers provide baseline responses for every endpoint. Individual tests override specific handlers via `server.use()`.

=== "Server"

    ```typescript
    // src/test/mocks/server.ts
    import { setupServer } from 'msw/node'
    import { handlers } from './handlers'

    export const server = setupServer(...handlers)
    ```

=== "Handlers"

    ```typescript
    // src/test/mocks/handlers.ts
    import { http, HttpResponse } from 'msw'

    export const handlers = [
      http.get('/api/user/me', () => {
        return HttpResponse.json({
          id: 1,
          email: 'test@example.com',
          firstName: 'Test',
        })
      }),
      // ... other default handlers
    ]
    ```

=== "Lifecycle"

    ```typescript
    // src/test/setup.ts
    beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
    afterEach(() => server.resetHandlers())
    afterAll(() => server.close())
    ```

!!! warning "Unhandled Requests"
    `onUnhandledRequest: 'error'` ensures every API call has a matching handler. If a test makes an unexpected request, it fails immediately — preventing silent network calls.

---

## 2. Test Organization

### File Structure

| Location | Content | Extension |
| :------- | :------ | :-------- |
| `src/test/unit/` | Page and top-level component tests | `.spec.tsx` |
| `src/test/unit/components/<domain>/` | Nested component tests | `.spec.tsx` |
| `src/test/unit/` | Pure utility/logic tests | `.spec.ts` |
| `src/test/mocks/` | MSW server and handlers | `.ts` |
| `e2e/` | Playwright E2E specs | `.spec.ts` |
| `e2e/pages/` | Page Object classes | `.ts` |

### Naming Conventions

Test method names follow a BDD-style structure:

```typescript
describe('Shopping Lists Management', () => {
  describe('When creating a new list', () => {
    it('should validate form fields and call the creation API', async () => {
```

| Level | Pattern | Example |
| :---- | :------ | :------ |
| Top `describe` | Feature name | `"Shopping Lists Management"` |
| Nested `describe` | "When..." context | `"When creating a new list"` |
| `it` | "should..." behavior | `"should validate form fields and call the creation API"` |

---

## 3. Component Rendering

Every component test must wrap the component under test with the required providers. Extract a `renderPage()` helper at the top of each spec.

!!! success "Standard Wrapper"
    - :material-check-all: `QueryClientProvider` with `retry: false`
    - :material-check-all: `MantineProvider` for UI components
    - :material-check-all: `MemoryRouter` for components using routing

```tsx
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const renderPage = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <MemoryRouter>
          <ShoppingListsPage />
        </MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>,
  )
```

---

## 4. Query & Assertion Patterns

### Testing Library Query Priority

Use the most accessible query available. Fall back to less specific queries only when necessary.

| Priority | Query | Use When |
| :------: | :---- | :------- |
| 1 | `getByRole` | Buttons, headings, links, inputs with labels |
| 2 | `getByLabelText` | Form inputs with associated labels |
| 3 | `getByText` | Static text content |
| 4 | `getByDisplayValue` | Pre-filled input values |
| 5 | `getByTestId` | **Last resort** — no accessible query available |

!!! tip "Test User-Visible Behavior"
    Test what the user sees and does, not internal state or component structure. Never assert on CSS classes, internal state variables, or component instance methods. If you can't write a test without reaching into implementation details, the component may need a better public API.

### Async Patterns

Use `findBy` for waiting on elements to appear after data loads. Use `waitFor` for asserting non-DOM side effects.

=== "findBy (DOM queries)"

    ```typescript
    // Wait for element to appear after API response
    expect(await screen.findByText('Weekly Groceries')).toBeInTheDocument()
    ```

=== "waitFor (side effects)"

    ```typescript
    // Wait for API call and notification
    await waitFor(() => {
      expect(capturePayload).toMatchObject({ name: 'Party Supplies' })
      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Shopping list created' }),
      )
    })
    ```

!!! warning "No Snapshot Testing"
    Do not use `toMatchSnapshot()` or `toMatchInlineSnapshot()`. Snapshots are brittle, produce low-signal failures, and encourage "update snapshot" without review. Always use explicit assertions like `toBeInTheDocument()`, `toHaveValue()`, and `toHaveTextContent()`.

---

## 5. Mocking Strategy

!!! tip "When to Use Each"
    - :material-check-all: **MSW** — for all HTTP/API interactions. Centralized handlers + per-test overrides.
    - :material-check-all: **`vi.mock()`** — for non-HTTP module dependencies (notifications, auth context, external rendering libs).
    - :material-alert-circle: NEVER mock `fetch` or `api.ts` directly — always use MSW.

### Per-Test API Overrides

Override default MSW handlers for specific test scenarios:

```typescript
server.use(
  http.get('/api/user/me', () => {
    return new HttpResponse(null, { status: 401 })
  }),
)
```

### Capturing Mutation Payloads

Verify the data sent to the API by capturing the request body:

```typescript
let capturePayload = null
server.use(
  http.post('/api/shopping/lists', async ({ request }) => {
    capturePayload = await request.json()
    return HttpResponse.json({ id: 2, name: 'Party Supplies' })
  }),
)

// ... trigger the mutation ...

await waitFor(() => {
  expect(capturePayload).toMatchObject({ name: 'Party Supplies' })
})
```

### Notification Assertions

Mock `@mantine/notifications` and assert on `notifications.show`:

```typescript
vi.mock('@mantine/notifications', () => ({
  notifications: { show: vi.fn() },
}))

// After mutation:
expect(notifications.show).toHaveBeenCalledWith(
  expect.objectContaining({ message: 'Shopping list created' }),
)
```

---

## 6. Test Isolation

!!! success "Mandatory Cleanup"
    - :material-check-all: Call `vi.clearAllMocks()` in `beforeEach` — resets mock call counts and return values.
    - :material-check-all: Call `queryClient.clear()` in `beforeEach` — empties the TanStack Query cache.
    - :material-alert-circle: NEVER rely on test execution order — each test must be independently runnable.

```typescript
beforeEach(() => {
  vi.clearAllMocks()
  queryClient.clear()
})
```

---

## 7. E2E Testing with Playwright

### Test Structure

E2E tests use `test.describe` for feature grouping, `test.beforeEach` for API route mocking, and `test.step` with Given/When/Then labels for BDD readability.

```typescript
test.describe('Shopping List Lifecycle Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, email: 'user@test.com', ageGroupName: 'Adult' }),
      })
    })
  })

  test('Full lifecycle: Create -> Add Item -> Complete', async ({ page }) => {
    await test.step('Given the user is on the Shopping Lists page', async () => {
      await listsPage.goto()
    })

    await test.step('When the user creates a new list', async () => {
      await listsPage.createList('Weekly Groceries')
    })

    await test.step('Then the list should appear on the page', async () => {
      await expect(page.getByText('Weekly Groceries')).toBeVisible()
    })
  })
})
```

### Page Object Model

All E2E tests use Page Objects in `e2e/pages/`. Each class encapsulates locators and actions for a single page.

```typescript
import { Page, Locator } from '@playwright/test'

export class ShoppingListsPage {
  readonly page: Page
  readonly title: Locator
  readonly newListButton: Locator

  constructor(page: Page) {
    this.page = page
    this.title = page.getByRole('heading', { name: /Shopping Lists/i })
    this.newListButton = page.getByRole('button', { name: /New List/i })
  }

  async goto() {
    await this.page.goto('/shopping/lists')
  }

  async createList(name: string) {
    await this.newListButton.click()
    // ...
  }
}
```

!!! info "Page Object Conventions"
    - :material-file-code: One class per page: `<Feature>Page.ts` in `e2e/pages/`
    - :material-check-all: Expose key elements as `readonly Locator` properties
    - :material-check-all: Provide action methods (`goto()`, `createList()`, `viewList()`)
    - :material-alert-circle: Keep assertions in the spec file, not in the Page Object

---

## 8. Best Practices

### Prefer `userEvent` over `fireEvent`

`@testing-library/user-event` simulates real browser behavior (focus, blur, keyboard events) more accurately than `fireEvent`. Prefer it for all user interactions.

```typescript
import userEvent from '@testing-library/user-event'

const user = userEvent.setup()

await user.click(screen.getByRole('button', { name: /Create List/i }))
await user.type(screen.getByLabelText(/List Name/i), 'Weekly Groceries')
```

!!! tip "When to Use `fireEvent`"
    Reserve `fireEvent` for edge cases where you need low-level control over a specific DOM event (e.g., custom events, drag-and-drop). For standard clicks, typing, and selections, always use `userEvent`.

### No Snapshot Testing

Snapshots are intentionally not used in this project. They produce brittle tests that break on any markup change and encourage "update snapshot" without meaningful review. Always write explicit assertions that verify specific, user-visible behavior.

### Test Behavior, Not Implementation

- :material-check-all: Assert on visible text, form values, and element presence
- :material-check-all: Query by role, label, and text — the way a user would find elements
- :material-alert-circle: Never assert on CSS classes, component state, or internal method calls

---

## AI Alignment

!!! info "Directives for AI Agents"
    - :material-gavel: ALWAYS wrap components in `QueryClientProvider` + `MantineProvider` + `MemoryRouter`.
    - :material-gavel: ALWAYS configure `QueryClient` with `retry: false` in tests.
    - :material-gavel: ALWAYS use MSW for API mocking — never mock `fetch` or `api.ts` directly.
    - :material-gavel: ALWAYS call `vi.clearAllMocks()` and `queryClient.clear()` in `beforeEach`.
    - :material-gavel: ALWAYS use `server.use()` for per-test API overrides.
    - :material-gavel: PREFER `userEvent` over `fireEvent` for user interactions.
    - :material-gavel: PREFER Testing Library query priority: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`.
    - :material-gavel: PREFER `findBy` for async DOM queries, `waitFor` for side-effect assertions.
    - :material-gavel: NEVER use snapshot testing — use explicit assertions.
    - :material-gavel: NEVER assert on CSS classes, internal state, or component internals.
    - :material-gavel: USE Page Object Model for all E2E tests, placed in `e2e/pages/`.
    - :material-gavel: USE `test.step` with Given/When/Then labels in E2E tests.
    - :material-gavel: USE `page.route()` for API mocking in Playwright tests.
