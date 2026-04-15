import { Page, Locator } from '@playwright/test'

export class ProfilePage {
  readonly page: Page
  readonly title: Locator
  readonly birthdateInput: Locator
  readonly familyRoleSelect: Locator
  readonly mobilePhoneInput: Locator
  readonly facebookInput: Locator
  readonly saveButton: Locator
  readonly successNotification: Locator

  constructor(page: Page) {
    this.page = page
    this.title = page.getByRole('heading', { name: /Profile Settings/i })
    this.birthdateInput = page.getByLabel(/Birthdate/i)
    this.familyRoleSelect = page.getByLabel(/Family Role/i)
    this.mobilePhoneInput = page.getByLabel(/Mobile Phone/i)
    this.facebookInput = page.getByLabel(/Facebook/i)
    this.saveButton = page.getByRole('button', { name: /Save Changes/i })
    this.successNotification = page.getByText(/Your profile has been updated successfully/i)
  }

  async goto() {
    await this.page.goto('/profile')
  }

  async updateProfile(details: { mobilePhone?: string; facebook?: string }) {
    if (details.mobilePhone) {
      await this.mobilePhoneInput.fill(details.mobilePhone)
    }
    if (details.facebook) {
      await this.facebookInput.fill(details.facebook)
    }
    await this.saveButton.click()
  }
}
