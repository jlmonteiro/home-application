import { test, expect } from '@playwright/test'
import { StoresPage } from './pages/StoresPage'
import { ShoppingItemsPage } from './pages/ShoppingItemsPage'

test.describe('Advanced Shopping Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User', ageGroupName: 'Adult', version: 1 }),
      })
    })

    await page.route('**/api/user/preferences*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ showShoppingWidget: true, showCouponsWidget: true, showMealPlanWidget: true }),
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

    await page.route('**/api/shopping/coupons/expiring*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
      } else {
        await route.continue()
      }
    })

    await page.route('**/api/meals/plans*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, weekStartDate: '2026-04-20', status: 'PENDING', entries: [] }),
      })
    })
  })

  test('TS-23: Category & Master Item Creation', async ({ page }) => {
    const itemsPage = new ShoppingItemsPage(page)

    await page.route('**/api/shopping/categories*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _embedded: { categories: [{ id: 1, name: 'Dairy', icon: 'IconEgg', version: 1 }] },
          page: { totalPages: 1, totalElements: 1, size: 20, number: 0 }
        }),
      })
    })

    await page.route('**/api/shopping/items*', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 200, name: 'Whole Milk', unit: 'l', category: { id: 1, name: 'Dairy' }, version: 1 }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ _embedded: { items: [] }, page: { totalPages: 1, totalElements: 0, size: 20, number: 0 } }),
        })
      }
    })

    await itemsPage.goto()

    // After creation, override GET to return the new item
    await page.route('**/api/shopping/items*', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 200, name: 'Whole Milk', unit: 'l', category: { id: 1, name: 'Dairy' }, version: 1 }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            _embedded: { items: [{ id: 200, name: 'Whole Milk', unit: 'l', category: { id: 1, name: 'Dairy' }, version: 1 }] },
            page: { totalPages: 1, totalElements: 1, size: 20, number: 0 }
          }),
        })
      }
    })

    await itemsPage.createItem('Whole Milk', 'Dairy', 'Liters (l)')
    await expect(page.getByText('Whole Milk')).toBeVisible()
  })

  test('TS-30: Store Management', async ({ page }) => {
    const storesPage = new StoresPage(page)

    await page.route('**/api/shopping/stores*', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 1, name: 'SuperMart', address: '123 Main St', version: 1 }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ _embedded: { stores: [] }, page: { totalPages: 1, totalElements: 0, size: 20, number: 0 } }),
        })
      }
    })

    await storesPage.goto()

    // After creation, override GET to return the new store
    await page.route('**/api/shopping/stores*', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 1, name: 'SuperMart', address: '123 Main St', version: 1 }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            _embedded: { stores: [{ id: 1, name: 'SuperMart', address: '123 Main St', version: 1 }] },
            page: { totalPages: 1, totalElements: 1, size: 20, number: 0 }
          }),
        })
      }
    })

    await storesPage.createStore('SuperMart', '123 Main St')
    await expect(page.getByText('SuperMart')).toBeVisible()
  })

  test('TS-16: Dashboard Coupon Warning', async ({ page }) => {
    const expiringDate = new Date()
    expiringDate.setDate(expiringDate.getDate() + 1)

    // Unroute the empty coupons mock from beforeEach, then set the one with data
    await page.unrouteAll({ behavior: 'ignoreErrors' })

    // Re-register essential mocks for dashboard
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User', ageGroupName: 'Adult', version: 1 }),
      })
    })

    await page.route('**/api/user/preferences*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ showShoppingWidget: true, showCouponsWidget: true, showMealPlanWidget: true }),
      })
    })

    await page.route('**/api/notifications/unread-count*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(0) })
    })

    await page.route('**/api/notifications', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
    })

    await page.route('**/api/shopping/lists', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ _embedded: { lists: [] }, page: { totalPages: 0, totalElements: 0, size: 20, number: 0 } }),
      })
    })

    await page.route('**/api/meals/plans*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, weekStartDate: '2026-04-20', status: 'PENDING', entries: [] }),
      })
    })

    await page.route('**/api/shopping/coupons/expiring*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _embedded: {
            coupons: [
              { id: 1, name: '10% OFF Milk', dueDate: expiringDate.toISOString(), store: { id: 1, name: 'Lidl' }, barcode: { code: 'SAVE10', type: 'QR' } }
            ]
          }
        }),
      })
    })

    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Expiring Coupons' })).toBeVisible()
    await expect(page.getByText('10% OFF Milk')).toBeVisible()
    await expect(page.getByText('Lidl')).toBeVisible()
  })
})
