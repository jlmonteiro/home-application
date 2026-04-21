import { test, expect } from '@playwright/test'

test.describe('Logout behavioral flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          familyRoleName: 'Admin',
          version: 1,
        }),
      })
    })
  })

  test('User can logout successfully', async ({ page }) => {
    await test.step('Given the user is logged in and on the Dashboard', async () => {
      await page.goto('/')
      await expect(page.getByText('John Doe')).toBeVisible()
    })

    await test.step('When the user opens the user menu and clicks "Logout"', async () => {
      await page.route('**/api/user/me', async (route) => {
        await route.fulfill({ status: 401 })
      })
      
      await page.getByText('John Doe').click()
      
      const logoutItem = page.getByRole('menuitem', { name: /Logout/i })
      await expect(logoutItem).toBeVisible()
      await logoutItem.click()
    })

    await test.step('Then the browser should redirect to the Login page', async () => {
      await expect(page).toHaveURL(/\/login/)
      
      await page.goto('/', { waitUntil: 'load' })
      await expect(page).toHaveURL(/\/login/)
    })
  })
})
