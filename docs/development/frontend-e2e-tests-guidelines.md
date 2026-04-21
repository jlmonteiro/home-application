# Frontend E2E Tests Guidelines

## Overview

This document defines the standards and patterns for writing frontend end-to-end (E2E) tests in the Home Application. E2E tests use **Playwright** with the **Page Object Model**.

---

## 1. E2E Testing with Playwright

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

## 2. Best Practices

### Test Behavior, Not Implementation

- :material-check-all: Assert on visible text, form values, and element presence
- :material-check-all: Query by role, label, and text — the way a user would find elements
- :material-alert-circle: Never assert on CSS classes, component state, or internal method calls

---

## AI Alignment

!!! info "Directives for AI Agents"
    - :material-gavel: USE Page Object Model for all E2E tests, placed in `e2e/pages/`.
    - :material-gavel: USE `test.step` with Given/When/Then labels in E2E tests.
    - :material-gavel: USE `page.route()` for API mocking in Playwright tests.
    - :material-gavel: NEVER assert on CSS classes, internal state, or component internals.
