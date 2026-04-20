import { test, expect } from '@playwright/test'

test.describe('Household Settings', () => {
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
          familyRole: { id: 1, name: 'Parent', immutable: true },
          social: { facebook: '', instagram: '', linkedin: '' },
          version: 1,
        }),
      })
    })

    await page.route('**/api/settings/age-groups*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Child', minAge: 0, maxAge: 12 },
          { id: 2, name: 'Teenager', minAge: 13, maxAge: 17 },
          { id: 3, name: 'Adult', minAge: 18, maxAge: 120 },
        ]),
      })
    })

    await page.route('**/api/settings/roles*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 1, name: 'Parent', immutable: true, version: 1 },
            { id: 2, name: 'Child', immutable: true, version: 1 },
          ]),
        })
      } else {
        await route.continue()
      }
    })
  })

  test('TS-26: Create a custom family role', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('heading', { name: 'Household Settings' })).toBeVisible()

    await test.step('When the user clicks "Add Custom Role"', async () => {
      await page.getByRole('button', { name: /Add Custom Role/i }).click()
      await expect(page.getByRole('dialog', { name: /Add Custom Role/i })).toBeVisible()
    })

    await test.step('And enters "Grandmother" and saves', async () => {
      await page.route('**/api/settings/roles*', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ id: 3, name: 'Grandmother', immutable: false, version: 1 }),
          })
        } else {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              { id: 1, name: 'Parent', immutable: true, version: 1 },
              { id: 2, name: 'Child', immutable: true, version: 1 },
              { id: 3, name: 'Grandmother', immutable: false, version: 1 },
            ]),
          })
        }
      })

      await page.getByLabel('Role Name').fill('Grandmother')
      await page.getByRole('button', { name: 'Save Role' }).click()
    })

    await test.step('Then "Grandmother" appears in the roles list', async () => {
      await expect(page.getByText('Grandmother')).toBeVisible()
      await expect(page.getByText('Custom').first()).toBeVisible()
    })
  })

  test('TS-21: Settings access blocked for non-Adult users', async ({ page }) => {
    // Override user to be a Teenager
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 2,
          email: 'teen@example.com',
          firstName: 'Teen',
          lastName: 'User',
          ageGroupName: 'Teenager',
          familyRole: { id: 2, name: 'Child', immutable: true },
          social: { facebook: '', instagram: '', linkedin: '' },
          version: 1,
        }),
      })
    })

    await page.goto('/')

    await test.step('Then the Settings nav link should not be visible', async () => {
      await expect(page.getByText('Household Settings')).not.toBeVisible()
    })

    await test.step('When navigating directly to /settings', async () => {
      // Mock the settings API to return 403
      await page.route('**/api/settings/age-groups*', async (route) => {
        await route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Access denied' }),
        })
      })

      await page.route('**/api/settings/roles*', async (route) => {
        await route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Access denied' }),
        })
      })

      await page.goto('/settings')
    })

    await test.step('Then the user should not see settings content', async () => {
      // The sidebar should not show the settings section for non-adults
      await expect(page.getByText('Administration')).not.toBeVisible()
    })
  })
})
