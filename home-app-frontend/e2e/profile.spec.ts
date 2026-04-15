import { test, expect } from '@playwright/test'
import { ProfilePage } from './pages/ProfilePage'

test.describe('Profile Management Behavioral Flow', () => {
  // In a real scenario, we would use a global setup to login once and reuse the state
  // or mock the /api/user/me call to return a logged-in user.

  test.beforeEach(async ({ page }) => {
    // Mocking the current user API for the E2E test to simulate being logged in
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          ageGroupName: 'Adult',
          birthdate: '1990-01-01',
          familyRoleId: 1,
        }),
      })
    })

    // Mock family roles
    await page.route('**/api/settings/roles', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Parent', immutable: true },
          { id: 2, name: 'Child', immutable: false },
        ]),
      })
    })
  })

  test('User can update their profile information', async ({ page }) => {
    const profilePage = new ProfilePage(page)

    await test.step('Given the user is on the Profile page', async () => {
      await profilePage.goto()
      await expect(profilePage.title).toBeVisible()
    })

    await test.step('When they update their mobile phone and social links', async () => {
      // Mock the update API call
      await page.route('**/api/user/me', async (route) => {
        if (route.request().method() === 'PUT') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 1,
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
              ageGroupName: 'Adult',
              birthdate: '1990-01-01',
              familyRoleId: 1,
              mobilePhone: '+351912345678',
              facebook: 'https://facebook.com/testuser',
            }),
          })
        }
      })

      await profilePage.updateProfile({
        mobilePhone: '+351912345678',
        facebook: 'https://facebook.com/testuser',
      })
    })

    await test.step('Then a success notification should be displayed', async () => {
      await expect(profilePage.successNotification).toBeVisible()
    })
  })

  test('User sees validation errors for invalid input', async ({ page }) => {
    const profilePage = new ProfilePage(page)

    await test.step('Given the user is on the Profile page', async () => {
      await profilePage.goto()
    })

    await test.step('When they enter an invalid Facebook URL', async () => {
      await profilePage.updateProfile({
        facebook: 'invalid-url',
      })
    })

    await test.step('Then a validation message for Facebook should appear', async () => {
      await expect(page.getByText(/Facebook must be a valid Facebook URL/i)).toBeVisible()
    })
  })
})
