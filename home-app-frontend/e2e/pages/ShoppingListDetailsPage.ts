import { Page, Locator } from '@playwright/test'

export class ShoppingListDetailsPage {
  readonly page: Page
  readonly addItemButton: Locator
  readonly itemSearchInput: Locator
  readonly quantityInput: Locator
  readonly unitSelect: Locator
  readonly priceInput: Locator
  readonly submitAddItemButton: Locator
  readonly markCompletedButton: Locator

  constructor(page: Page) {
    this.page = page
    this.addItemButton = page.getByRole('button', { name: /Add Item/i })
    this.itemSearchInput = page.getByPlaceholder(/Type to search/i)
    this.quantityInput = page.getByLabel(/Quantity/i)
    this.unitSelect = page.getByLabel(/Unit/i)
    this.priceInput = page.getByLabel(/Price per Unit/i)
    this.submitAddItemButton = page.getByRole('button', { name: /Add Item to List/i })
    this.markCompletedButton = page.getByRole('button', { name: /Mark Completed/i })
  }

  async addItem(name: string, quantity = 1) {
    await this.addItemButton.click()
    const modal = this.page.getByRole('dialog', { name: /Add Item to List/i })
    await modal.waitFor({ state: 'visible' })

    await this.itemSearchInput.fill(name)
    // Select the matching item option (not the "Create" option)
    await this.page.getByRole('option').filter({ has: this.page.getByText(name, { exact: true }) }).filter({ hasNot: this.page.getByText('Create') }).first().click()
    
    await this.quantityInput.fill(quantity.toString())
    await this.submitAddItemButton.click()

    await modal.waitFor({ state: 'hidden' })
  }

  async toggleItemBought(itemName: string) {
    // Find the row containing the text and the checkbox
    const row = this.page
      .locator('div')
      .filter({ has: this.page.getByText(itemName) })
      .filter({ has: this.page.getByRole('checkbox') })
      .first()
    await row.getByRole('checkbox').click()
  }

  async markItemUnavailable(itemName: string) {
    const row = this.page
      .locator('div')
      .filter({ has: this.page.getByText(itemName) })
      .first()
    const button = row.getByTitle(/Mark as unavailable/i)
    await button.waitFor({ state: 'visible' })
    await button.click()
  }

  async completeList() {
    this.page.on('dialog', (dialog) => dialog.accept())
    await this.markCompletedButton.click()
  }
}
