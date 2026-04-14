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

  async addItem(name: string, quantity: number = 1) {
    await this.addItemButton.click()
    const modal = this.page.getByRole('dialog', { name: /Add Item to List/i })
    await modal.waitFor({ state: 'visible' })

    await this.itemSearchInput.fill(name)
    // Select from combobox - use exact match to avoid matching "Create 'name'"
    await this.page.getByRole('option', { name, exact: true }).click()
    await this.quantityInput.fill(quantity.toString())
    await this.submitAddItemButton.click()
    
    await modal.waitFor({ state: 'hidden' })
  }

  async toggleItemBought(itemName: string) {
    // Find the text and then the checkbox in the same visual row
    const row = this.page.locator('div').filter({ has: this.page.getByText(itemName, { exact: true }) }).filter({ has: this.page.getByRole('checkbox') }).first()
    await row.getByRole('checkbox').click()
  }

  async completeList() {
    this.page.on('dialog', (dialog) => dialog.accept())
    await this.markCompletedButton.click()
  }
}
