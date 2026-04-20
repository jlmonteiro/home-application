import { Page, Locator } from '@playwright/test'

export class StoresPage {
  readonly page: Page
  readonly title: Locator
  readonly newStoreButton: Locator
  readonly storeNameInput: Locator
  readonly addressInput: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    this.page = page
    this.title = page.getByRole('heading', { name: /Shopping Stores/i })
    this.newStoreButton = page.getByRole('button', { name: /Add Store/i })
    this.storeNameInput = page.getByLabel(/Name/i).first()
    this.addressInput = page.getByLabel(/Description/i)
    this.submitButton = page.getByRole('button', { name: /Create Store/i })
  }

  async goto() {
    await this.page.goto('/shopping/stores')
  }

  async createStore(name: string, description: string) {
    await this.newStoreButton.click()
    const modal = this.page.getByRole('dialog', { name: /Add Store/i })
    await modal.waitFor({ state: 'visible' })

    await this.storeNameInput.fill(name)
    await this.addressInput.fill(description)
    
    // Upload a photo if needed (handled in spec usually)
    
    await this.submitButton.click()
    await modal.waitFor({ state: 'hidden' })
  }
}
