import { test, expect } from '@playwright/test'
import { ShoppingListsPage } from './pages/ShoppingListsPage'
import { ShoppingListDetailsPage } from './pages/ShoppingListDetailsPage'

test.describe('Shopping List Lifecycle Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Debug logging
    page.on('console', (msg) => {
      if (msg.type() === 'error') console.log(`BROWSER ERROR: ${msg.text()}`)
    })

    // Mock user
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'j@m.com',
          firstName: 'John',
          lastName: 'Doe',
          ageGroupName: 'Adult',
        }),
      })
    })

    // Mock empty lists
    await page.route('**/api/shopping/lists', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ _embedded: { lists: [] } }),
        })
      } else {
        await route.continue()
      }
    })

    // Mock master items for search
    await page.route('**/api/shopping/items?page=0&size=100', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _embedded: {
            items: [
              { id: 100, name: 'Milk', category: { id: 1, name: 'Dairy' } },
              { id: 101, name: 'Eggs', category: { id: 1, name: 'Dairy' } },
            ],
          },
        }),
      })
    })

    // Mock stores
    await page.route('**/api/shopping/stores?page=0&size=100', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ _embedded: { stores: [] } }),
      })
    })

    // Mock categories
    await page.route('**/api/shopping/categories?page=0&size=100', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ _embedded: { categories: [] } }),
      })
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
      // Register a route that handles BOTH GET and POST for lists
      await page.route('**/api/shopping/lists', async (route) => {
        const method = route.request().method()
        if (method === 'POST') {
          await route.fulfill({
            status: 201,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 1,
              name: 'Party Prep',
              status: 'PENDING',
              creatorName: 'John',
              createdAt: new Date().toISOString(),
              items: [],
            }),
          })
        } else if (method === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              _embedded: {
                lists: [
                  {
                    id: 1,
                    name: 'Party Prep',
                    status: 'PENDING',
                    creatorName: 'John',
                    createdAt: new Date().toISOString(),
                    items: [],
                  },
                ],
              },
            }),
          })
        } else {
          await route.continue()
        }
      })

      await listsPage.createList('Party Prep', 'Stuff for Friday')
    })

    await test.step('And they navigate to the "Party Prep" details', async () => {
      // Mock fetching the single list
      await page.route('**/api/shopping/lists/1', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            name: 'Party Prep',
            status: 'PENDING',
            creatorName: 'John',
            createdAt: new Date().toISOString(),
            items: [],
          }),
        })
      })

      await listsPage.viewList('Party Prep')
      await expect(page).toHaveURL(/\/shopping\/lists\/1/)
    })

    await test.step('When they add "Milk" to the list', async () => {
      // Mock adding item
      await page.route('**/api/shopping/lists/1/items', async (route) => {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 10,
            itemId: 100,
            itemName: 'Milk',
            quantity: 2,
            unit: 'pcs',
            price: 1.5,
            bought: false,
            category: { name: 'Dairy' },
          }),
        })
      })

      // Mock update for GET list/1 to show the new item
      await page.route('**/api/shopping/lists/1', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 1,
            name: 'Party Prep',
            status: 'PENDING',
            creatorName: 'John',
            items: [
              {
                id: 10,
                itemId: 100,
                itemName: 'Milk',
                quantity: 2,
                unit: 'pcs',
                price: 1.5,
                bought: false,
                category: { name: 'Dairy' },
              },
            ],
          }),
        })
      })

      await detailsPage.addItem('Milk', 2)
      await expect(page.getByText('Milk')).toBeVisible()
    })

    await test.step('Then they mark "Milk" as bought', async () => {
      // Mock update list item
      await page.route('**/api/shopping/lists/items/10', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 10, bought: true }),
        })
      })

      await detailsPage.toggleItemBought('Milk')
    })
  })
})
