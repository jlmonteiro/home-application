import { Page, Locator } from '@playwright/test'

export class ShoppingItemsPage {
  readonly page: Page
  readonly title: Locator
  readonly newItemButton: Locator
  readonly itemNameInput: Locator
  readonly categorySelect: Locator
  readonly unitSelect: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    this.page = page
    this.title = page.getByRole('heading', { name: /Shopping Items/i })
    this.newItemButton = page.getByRole('button', { name: /Add Item/i }).first()
    this.itemNameInput = page.getByLabel(/Name/i).first()
    this.categorySelect = page.getByRole('combobox', { name: /Category/i })
    this.unitSelect = page.getByRole('combobox', { name: /Default Unit/i })
    this.submitButton = page.getByRole('button', { name: /Create Item/i })
  }

  async goto() {
    await this.page.goto('/shopping/items')
  }

  async createItem(name: string, category: string, unit: string) {
    await this.newItemButton.click()
    const modal = this.page.getByRole('dialog', { name: /Create New Item|Add Item/i })
    await modal.waitFor({ state: 'visible' })

    await this.itemNameInput.fill(name)
    await this.categorySelect.click()
    await this.page.getByRole('option', { name: category }).click()
    
    await this.unitSelect.click()
    await this.page.getByRole('option', { name: unit }).click()
    
    await this.submitButton.click()
    await modal.waitFor({ state: 'hidden' })
  }
}
