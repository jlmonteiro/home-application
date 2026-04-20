import { test, expect } from '@playwright/test'

test.describe('Profile Dropdown Views', () => {
  test('TS-10: Detailed view shows phone and social links', async ({ page }) => {
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
          mobilePhone: '+351912345678',
          familyRole: { id: 1, name: 'Parent', immutable: true },
          social: {
            facebook: '',
            instagram: '',
            linkedin: 'https://linkedin.com/in/testuser',
          },
          version: 1,
        }),
      })
    })

    await page.goto('/')

    await test.step('When the user opens the header dropdown menu', async () => {
      await page.getByText('Test User').click()
    })

    await test.step('Then the phone number and LinkedIn icon are visible', async () => {
      await expect(page.getByText('+351912345678')).toBeVisible()
      await expect(page.locator('a[href="https://linkedin.com/in/testuser"]')).toBeVisible()
    })
  })

  test('TS-11: Compact view omits phone and social when empty', async ({ page }) => {
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
          familyRole: { id: 1, name: 'Parent', immutable: true },
          social: { facebook: '', instagram: '', linkedin: '' },
          version: 1,
        }),
      })
    })

    await page.goto('/')

    await test.step('When the user opens the header dropdown menu', async () => {
      await page.getByText('Test User').click()
    })

    await test.step('Then only basic info and View/Edit Profile link are shown', async () => {
      await expect(page.getByText('View/Edit Profile')).toBeVisible()
      // Contact Info and Social Profiles sections should not be present
      await expect(page.getByText('Contact Info')).not.toBeVisible()
      await expect(page.getByText('Social Profiles')).not.toBeVisible()
    })
  })
})
