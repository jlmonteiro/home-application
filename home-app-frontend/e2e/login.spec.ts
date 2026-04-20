import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'

test.describe('Authentication behavioral flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/user/me', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ detail: 'Unauthenticated' }),
        })
      } else {
        await route.continue()
      }
    })
  })

  test('User redirected to Google login from landing page', async ({ page }) => {
    const loginPage = new LoginPage(page)

    await test.step('Given the user is on the Login page', async () => {
      await loginPage.goto()
      await expect(loginPage.title).toBeVisible()
    })

    await test.step('When the user clicks the "Login with Google" button', async () => {
      await loginPage.login()
    })

    await test.step('Then the browser should redirect to the OAuth2 provider', async () => {
      await expect(page).toHaveURL(/.*(google|oauth|login).*/)
    })
  })
})
