import { test, expect } from '@playwright/test'

test.describe('Logout behavioral flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authenticated user
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
        }),
      })
    })

    // Mock logout endpoint
    await page.route('**/logout', async (route) => {
      await route.fulfill({
        status: 200,
      })
    })
  })

  test('User can logout successfully', async ({ page }) => {
    await test.step('Given the user is logged in and on the Dashboard', async () => {
      await page.goto('/')
      // Verify we are logged in by checking for user name
      await expect(page.getByText('John Doe')).toBeVisible()
    })

    await test.step('When the user opens the user menu and clicks "Logout"', async () => {
      // Mock user/me to return 401 before logout (so redirect works)
      await page.route('**/api/user/me', async (route) => {
        await route.fulfill({ status: 401 })
      })
      
      // Click the user menu button (the UnstyledButton in Layout.tsx)
      // Since it has no specific ID or text, we can use the avatar or name
      await page.getByText('John Doe').click()
      
      // Now the menu should be open, find and click Logout
      const logoutItem = page.getByRole('menuitem', { name: /Logout/i })
      await expect(logoutItem).toBeVisible()
      await logoutItem.click()
    })

    await test.step('Then the browser should redirect to the Login page', async () => {
      // AuthContext.tsx sets window.location.href = '/login'
      await expect(page).toHaveURL(/\/login/)
      
      // Verify we can't get back to the dashboard
      await page.goto('/', { waitUntil: 'networkidle' })
      await expect(page).toHaveURL(/\/login/)
    })
  })
})
