# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: protected-routes.spec.ts >> Route Protection Integrity >> Unauthenticated user should be redirected to login when accessing a protected route
- Location: e2e/protected-routes.spec.ts:4:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/login/
Received string:  "http://localhost:5173/profile"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    9 × unexpected value "http://localhost:5173/profile"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Route Protection Integrity', () => {
  4  |   test('Unauthenticated user should be redirected to login when accessing a protected route', async ({
  5  |     page,
  6  |   }) => {
  7  |     // Given the backend reports the user is unauthenticated
  8  |     await page.route('**/api/user/me', async (route) => {
  9  |       await route.fulfill({
  10 |         status: 401,
  11 |         contentType: 'application/json',
  12 |         body: JSON.stringify({ detail: 'Unauthenticated' }),
  13 |       })
  14 |     })
  15 | 
  16 |     // When they attempt to navigate to a protected page like /profile
  17 |     await page.goto('/profile')
  18 | 
  19 |     // Then they should be redirected to the /login page
> 20 |     await expect(page).toHaveURL(/\/login/)
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  21 |     await expect(page.getByRole('heading', { name: /Home App/i })).toBeVisible()
  22 |     await expect(page.getByText(/Please login to continue/i)).toBeVisible()
  23 |   })
  24 | 
  25 |   test('Authenticated user should be allowed to access protected routes', async ({ page }) => {
  26 |     // Given the backend reports a valid user session
  27 |     await page.route('**/api/user/me', async (route) => {
  28 |       await route.fulfill({
  29 |         status: 200,
  30 |         contentType: 'application/json',
  31 |         body: JSON.stringify({
  32 |           id: 1,
  33 |           email: 'user@test.com',
  34 |           firstName: 'John',
  35 |           ageGroupName: 'Adult',
  36 |         }),
  37 |       })
  38 |     })
  39 | 
  40 |     // When they navigate to the profile page
  41 |     await page.goto('/profile')
  42 | 
  43 |     // Then they should stay on the profile page
  44 |     await expect(page).toHaveURL(/\/profile/)
  45 |     await expect(page.getByRole('heading', { name: /Profile Settings/i })).toBeVisible()
  46 |   })
  47 | })
  48 | 
```