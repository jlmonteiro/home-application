import { Page, Locator } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly loginButton: Locator
  readonly title: Locator

  constructor(page: Page) {
    this.page = page
    this.loginButton = page.getByRole('button', { name: /Login with Google/i })
    this.title = page.getByRole('heading', { name: /Home App/i, level: 2 })
  }

  async goto() {
    await this.page.goto('/login')
  }

  async login() {
    await this.loginButton.click()
  }
}
