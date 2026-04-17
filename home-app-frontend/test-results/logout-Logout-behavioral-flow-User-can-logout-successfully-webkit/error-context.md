# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: logout.spec.ts >> Logout behavioral flow >> User can logout successfully
- Location: e2e/logout.spec.ts:28:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('John Doe')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('John Doe')

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Logout behavioral flow', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Mock authenticated user
  6  |     await page.route('**/api/user/me', async (route) => {
  7  |       await route.fulfill({
  8  |         status: 200,
  9  |         contentType: 'application/json',
  10 |         body: JSON.stringify({
  11 |           id: 1,
  12 |           email: 'john@example.com',
  13 |           firstName: 'John',
  14 |           lastName: 'Doe',
  15 |           familyRoleName: 'Admin',
  16 |         }),
  17 |       })
  18 |     })
  19 | 
  20 |     // Mock logout endpoint
  21 |     await page.route('**/logout', async (route) => {
  22 |       await route.fulfill({
  23 |         status: 200,
  24 |       })
  25 |     })
  26 |   })
  27 | 
  28 |   test('User can logout successfully', async ({ page }) => {
  29 |     await test.step('Given the user is logged in and on the Dashboard', async () => {
  30 |       await page.goto('/')
  31 |       // Verify we are logged in by checking for user name
> 32 |       await expect(page.getByText('John Doe')).toBeVisible()
     |                                                ^ Error: expect(locator).toBeVisible() failed
  33 |     })
  34 | 
  35 |     await test.step('When the user opens the user menu and clicks "Logout"', async () => {
  36 |       // Mock user/me to return 401 before logout (so redirect works)
  37 |       await page.route('**/api/user/me', async (route) => {
  38 |         await route.fulfill({ status: 401 })
  39 |       })
  40 |       
  41 |       // Click the user menu button (the UnstyledButton in Layout.tsx)
  42 |       // Since it has no specific ID or text, we can use the avatar or name
  43 |       await page.getByText('John Doe').click()
  44 |       
  45 |       // Now the menu should be open, find and click Logout
  46 |       const logoutItem = page.getByRole('menuitem', { name: /Logout/i })
  47 |       await expect(logoutItem).toBeVisible()
  48 |       await logoutItem.click()
  49 |     })
  50 | 
  51 |     await test.step('Then the browser should redirect to the Login page', async () => {
  52 |       // AuthContext.tsx sets window.location.href = '/login'
  53 |       await expect(page).toHaveURL(/\/login/)
  54 |       
  55 |       // Verify we can't get back to the dashboard
  56 |       await page.goto('/', { waitUntil: 'networkidle' })
  57 |       await expect(page).toHaveURL(/\/login/)
  58 |     })
  59 |   })
  60 | })
  61 | 
```