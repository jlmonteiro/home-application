import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'

test.describe('Authentication behavioral flow', () => {
  test('User redirected to Google login from landing page', async ({ page }) => {
    const loginPage = new LoginPage(page)

    await test.step('Given the user is on the Login page', async () => {
      await loginPage.goto()
      await expect(loginPage.title).toBeVisible()
    })

    await test.step('When the user clicks the "Login with Google" button', async () => {
      // In a real E2E, we'd mock the OAuth flow or use a test account.
      // For this example, we verify it attempts to redirect.
      await loginPage.login()
    })

    await test.step('Then the browser should redirect to the OAuth2 provider', async () => {
      // Expecting the URL to contain google accounts or the local redirect
      await expect(page).toHaveURL(/.*google.*/)
    })
  })
})
