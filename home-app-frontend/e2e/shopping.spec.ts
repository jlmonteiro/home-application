import { test, expect } from '@playwright/test'
import { ShoppingListsPage } from './pages/ShoppingListsPage'
import { ShoppingListDetailsPage } from './pages/ShoppingListDetailsPage'

test.describe('Shopping List Lifecycle Flow', () => {
  test.beforeEach(async ({ page }) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') console.log(`BROWSER ERROR: ${msg.text()}`)
    })

    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, email: 'j@m.com', firstName: 'John', lastName: 'Doe', ageGroupName: 'Adult', version: 1 }),
      })
    })

    await page.route('**/api/shopping/lists', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ _embedded: { lists: [] }, page: { totalPages: 0, totalElements: 0, size: 20, number: 0 } }),
        })
      } else {
        await route.continue()
      }
    })

    // NOTE: trailing * is required to match query params like ?page=0&size=100
    await page.route('**/api/shopping/items*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _embedded: { items: [{ id: 100, name: 'Milk', unit: 'l', category: { id: 1, name: 'Dairy' }, version: 1 }] },
          page: { totalPages: 1, totalElements: 1, size: 100, number: 0 }
        }),
      })
    })

    await page.route('**/api/shopping/stores*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ _embedded: { stores: [] }, page: { totalPages: 0, totalElements: 0, size: 100, number: 0 } }),
      })
    })

    await page.route('**/api/shopping/categories*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ _embedded: { categories: [] }, page: { totalPages: 0, totalElements: 0, size: 100, number: 0 } }),
      })
    })

    await page.route('**/api/shopping/lists/suggest-price*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '1.50' })
    })
  })

  test('Full lifecycle: Create -> Add Item -> Buy -> Complete', async ({ page }) => {
    const listsPage = new ShoppingListsPage(page)
    const detailsPage = new ShoppingListDetailsPage(page)

    await test.step('Given the user is on the Shopping Lists page', async () => {
      await listsPage.goto()
      await expect(listsPage.title).toBeVisible()
    })

    await test.step('When they create a new list named "Party Prep"', async () => {
      await page.route('**/api/shopping/lists', async (route) => {
        const method = route.request().method()
        if (method === 'POST') {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({ id: 1, name: 'Party Prep', status: 'PENDING', creatorName: 'John', createdAt: new Date().toISOString(), items: [], version: 1 }),
          })
        } else if (method === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              _embedded: { lists: [{ id: 1, name: 'Party Prep', status: 'PENDING', creatorName: 'John', createdAt: new Date().toISOString(), items: [], version: 1 }] },
              page: { totalPages: 1, totalElements: 1, size: 20, number: 0 }
            }),
          })
        } else {
          await route.continue()
        }
      })
      await listsPage.createList('Party Prep', 'Stuff for Friday')
    })

    await test.step('And they navigate to the "Party Prep" details', async () => {
      await page.route('**/api/shopping/lists/1', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 1, name: 'Party Prep', status: 'PENDING', creatorName: 'John', createdAt: new Date().toISOString(), items: [], version: 1 }),
        })
      })
      await listsPage.viewList('Party Prep')
      await expect(page).toHaveURL(/\/shopping\/lists\/1/)
    })

    await test.step('When they add "Milk" to the list', async () => {
      await page.route('**/api/shopping/lists/1/items', async (route) => {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 10, itemId: 100, item: { id: 100, name: 'Milk', category: { id: 1, name: 'Dairy' } }, quantity: 2, unit: 'pcs', price: 1.5, bought: false, unavailable: false, version: 1 }),
        })
      })

      await page.route('**/api/shopping/lists/1', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1, name: 'Party Prep', status: 'PENDING', creatorName: 'John',
            items: [{ id: 10, itemId: 100, item: { id: 100, name: 'Milk', unit: 'l', category: { id: 1, name: 'Dairy' } }, quantity: 2, unit: 'pcs', pricing: { price: 1.5 }, bought: false, unavailable: false, version: 1 }],
            version: 1,
          }),
        })
      })

      await detailsPage.addItem('Milk', 2)
      await expect(page.getByText('Milk')).toBeVisible()
    })

    await test.step('Then they mark "Milk" as bought', async () => {
      await page.route('**/api/shopping/lists/items/10', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 10, itemId: 100, item: { id: 100, name: 'Milk', category: { id: 1, name: 'Dairy' } }, quantity: 2, unit: 'pcs', pricing: { price: 1.5 }, bought: true, unavailable: false, version: 2 }),
        })
      })

      await page.route('**/api/shopping/lists/1', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1, name: 'Party Prep', status: 'PENDING', creatorName: 'John',
            items: [{ id: 10, itemId: 100, item: { id: 100, name: 'Milk', unit: 'l', category: { id: 1, name: 'Dairy' } }, quantity: 2, unit: 'pcs', pricing: { price: 1.5 }, bought: true, unavailable: false, version: 2 }],
            version: 1,
          }),
        })
      })

      await detailsPage.toggleItemBought('Milk')
      await page.waitForLoadState('networkidle')
    })
  })
})
