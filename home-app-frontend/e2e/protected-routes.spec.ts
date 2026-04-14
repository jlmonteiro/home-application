import { test, expect } from '@playwright/test'

test.describe('Route Protection Integrity', () => {
  test('Unauthenticated user should be redirected to login when accessing a protected route', async ({
    page,
  }) => {
    // Given the backend reports the user is unauthenticated
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Unauthenticated' }),
      })
    })

    // When they attempt to navigate to a protected page like /profile
    await page.goto('/profile')

    // Then they should be redirected to the /login page
    await expect(page).toHaveURL(/\/login/)
    await expect(page.getByRole('heading', { name: /Home App/i })).toBeVisible()
    await expect(page.getByText(/Please login to continue/i)).toBeVisible()
  })

  test('Authenticated user should be allowed to access protected routes', async ({ page }) => {
    // Given the backend reports a valid user session
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'user@test.com',
          firstName: 'John',
          ageGroupName: 'Adult',
        }),
      })
    })

    // When they navigate to the profile page
    await page.goto('/profile')

    // Then they should stay on the profile page
    await expect(page).toHaveURL(/\/profile/)
    await expect(page.getByRole('heading', { name: /Profile Settings/i })).toBeVisible()
  })
})
