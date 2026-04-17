# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: profile.spec.ts >> Profile Management Behavioral Flow >> User can update their profile information
- Location: e2e/profile.spec.ts:39:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /Profile Settings/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /Profile Settings/i })

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | import { ProfilePage } from './pages/ProfilePage'
  3  | 
  4  | test.describe('Profile Management Behavioral Flow', () => {
  5  |   // In a real scenario, we would use a global setup to login once and reuse the state
  6  |   // or mock the /api/user/me call to return a logged-in user.
  7  | 
  8  |   test.beforeEach(async ({ page }) => {
  9  |     // Mocking the current user API for the E2E test to simulate being logged in
  10 |     await page.route('**/api/user/me', async (route) => {
  11 |       await route.fulfill({
  12 |         status: 200,
  13 |         contentType: 'application/json',
  14 |         body: JSON.stringify({
  15 |           id: 1,
  16 |           email: 'test@example.com',
  17 |           firstName: 'Test',
  18 |           lastName: 'User',
  19 |           ageGroupName: 'Adult',
  20 |           birthdate: '1990-01-01',
  21 |           familyRoleId: 1,
  22 |         }),
  23 |       })
  24 |     })
  25 | 
  26 |     // Mock family roles
  27 |     await page.route('**/api/settings/roles', async (route) => {
  28 |       await route.fulfill({
  29 |         status: 200,
  30 |         contentType: 'application/json',
  31 |         body: JSON.stringify([
  32 |           { id: 1, name: 'Parent', immutable: true },
  33 |           { id: 2, name: 'Child', immutable: false },
  34 |         ]),
  35 |       })
  36 |     })
  37 |   })
  38 | 
  39 |   test('User can update their profile information', async ({ page }) => {
  40 |     const profilePage = new ProfilePage(page)
  41 | 
  42 |     await test.step('Given the user is on the Profile page', async () => {
  43 |       await profilePage.goto()
> 44 |       await expect(profilePage.title).toBeVisible()
     |                                       ^ Error: expect(locator).toBeVisible() failed
  45 |     })
  46 | 
  47 |     await test.step('When they update their mobile phone and social links', async () => {
  48 |       // Mock the update API call
  49 |       await page.route('**/api/user/me', async (route) => {
  50 |         if (route.request().method() === 'PUT') {
  51 |           await route.fulfill({
  52 |             status: 200,
  53 |             contentType: 'application/json',
  54 |             body: JSON.stringify({
  55 |               id: 1,
  56 |               email: 'test@example.com',
  57 |               firstName: 'Test',
  58 |               lastName: 'User',
  59 |               ageGroupName: 'Adult',
  60 |               birthdate: '1990-01-01',
  61 |               familyRoleId: 1,
  62 |               mobilePhone: '+351912345678',
  63 |               facebook: 'https://facebook.com/testuser',
  64 |             }),
  65 |           })
  66 |         }
  67 |       })
  68 | 
  69 |       await profilePage.updateProfile({
  70 |         mobilePhone: '+351912345678',
  71 |         facebook: 'https://facebook.com/testuser',
  72 |       })
  73 |     })
  74 | 
  75 |     await test.step('Then a success notification should be displayed', async () => {
  76 |       await expect(profilePage.successNotification).toBeVisible()
  77 |     })
  78 |   })
  79 | 
  80 |   test('User sees validation errors for invalid input', async ({ page }) => {
  81 |     const profilePage = new ProfilePage(page)
  82 | 
  83 |     await test.step('Given the user is on the Profile page', async () => {
  84 |       await profilePage.goto()
  85 |     })
  86 | 
  87 |     await test.step('When they enter an invalid Facebook URL', async () => {
  88 |       await profilePage.updateProfile({
  89 |         facebook: 'invalid-url',
  90 |       })
  91 |     })
  92 | 
  93 |     await test.step('Then a validation message for Facebook should appear', async () => {
  94 |       await expect(page.getByText(/Facebook must be a valid Facebook URL/i)).toBeVisible()
  95 |     })
  96 |   })
  97 | })
  98 | 
```