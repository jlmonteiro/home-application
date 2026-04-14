import { Page, Locator } from '@playwright/test'

export class ShoppingListsPage {
  readonly page: Page
  readonly title: Locator
  readonly newListButton: Locator
  readonly listNameInput: Locator
  readonly listDescriptionInput: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    this.page = page
    this.title = page.getByRole('heading', { name: /Shopping Lists/i })
    this.newListButton = page.getByRole('button', { name: /New List/i })
    this.listNameInput = page.getByLabel(/List Name/i)
    this.listDescriptionInput = page.getByLabel(/Description/i)
    this.submitButton = page.getByRole('button', { name: /Create List/i })
  }

  async goto() {
    await this.page.goto('/shopping/lists')
  }

  async createList(name: string, description?: string) {
    await this.newListButton.click()
    const modal = this.page.getByRole('dialog', { name: /Create New Shopping List/i })
    await modal.waitFor({ state: 'visible' })

    await this.listNameInput.fill(name)
    if (description) {
      await this.listDescriptionInput.fill(description)
    }
    await this.submitButton.click()
    // Wait for this specific modal to close
    await modal.waitFor({ state: 'hidden' })
  }

  async viewList(name: string) {
    // Find the card containing the list name and click its "View Items" link
    const card = this.page
      .locator('.mantine-Paper-root')
      .filter({ has: this.page.getByText(name, { exact: true }) })
    await card.getByRole('link', { name: /View Items/i }).click()
  }
}
