import { test, expect } from '@playwright/test'

test.describe('Route Protection Integrity', () => {
  test('Unauthenticated user should be redirected to login when accessing a protected route', async ({
    page,
  }) => {
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Unauthenticated' }),
      })
    })

    await page.goto('/profile')

    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: /Home App/i })).toBeVisible()
    await expect(page.getByText(/Please login to continue/i)).toBeVisible()
  })

  test('Authenticated user should be allowed to access protected routes', async ({ page }) => {
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'user@test.com',
          firstName: 'John',
          ageGroupName: 'Adult',
          version: 1,
        }),
      })
    })

    await page.goto('/profile')

    await expect(page).toHaveURL(/\/profile/)
    await expect(page.getByRole('heading', { name: /Profile Settings/i })).toBeVisible()
  })
})
