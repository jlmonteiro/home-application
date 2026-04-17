# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> Authentication behavioral flow >> User redirected to Google login from landing page
- Location: e2e/login.spec.ts:5:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /Home App/i, level: 2 })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /Home App/i, level: 2 })

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { LoginPage } from './pages/LoginPage'
  3  | 
  4  | test.describe('Authentication behavioral flow', () => {
  5  |   test('User redirected to Google login from landing page', async ({ page }) => {
  6  |     const loginPage = new LoginPage(page)
  7  | 
  8  |     await test.step('Given the user is on the Login page', async () => {
  9  |       await loginPage.goto()
> 10 |       await expect(loginPage.title).toBeVisible()
     |                                     ^ Error: expect(locator).toBeVisible() failed
  11 |     })
  12 | 
  13 |     await test.step('When the user clicks the "Login with Google" button', async () => {
  14 |       await loginPage.login()
  15 |     })
  16 | 
  17 |     await test.step('Then the browser should redirect to the OAuth2 provider', async () => {
  18 |       // In mock mode, we can't actually redirect to Google
  19 |       // So we verify the button was clicked and the page started navigation
  20 |       await expect(page).toHaveURL(/.*(google|oauth|login).*/)
  21 |     })
  22 |   })
  23 | })
  24 | 
```