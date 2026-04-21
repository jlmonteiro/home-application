import { test, expect } from '@playwright/test'
import { ProfilePage } from './pages/ProfilePage'

test.describe('Profile Management Behavioral Flow', () => {
  test.beforeEach(async ({ page }) => {
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
          familyRole: { id: 1, name: 'Parent', immutable: true },
          social: { facebook: '', instagram: '', linkedin: '' },
          version: 1,
        }),
      })
    })

    await page.route('**/api/settings/roles', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Parent', immutable: true, version: 1 },
          { id: 2, name: 'Child', immutable: false, version: 1 },
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
              familyRole: { id: 1, name: 'Parent', immutable: true },
              mobilePhone: '+351912345678',
              social: { facebook: 'https://facebook.com/testuser' },
              version: 2,
            }),
          })
        } else {
          await route.continue()
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
      await profilePage.updateProfile({ facebook: 'invalid-url' })
    })

    await test.step('Then a validation message for Facebook should appear', async () => {
      await expect(page.getByText(/Facebook must be a valid Facebook URL/i)).toBeVisible()
    })
  })
})
