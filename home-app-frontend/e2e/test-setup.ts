import { test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  // Mock Current User
  await page.route('**/api/user/me', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          ageGroupName: 'Adult',
          birthdate: '1990-01-01',
          familyRole: { id: 1, name: 'Admin', immutable: true },
          social: { facebook: '', instagram: '', linkedin: '' },
          version: 1,
        }),
      })
    } else {
      await route.continue()
    }
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

  await page.route('**/api/meals/plans*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: 1, weekStartDate: '2026-04-20', status: 'PENDING', entries: [] }),
    })
  })

  await page.route('**/api/settings/roles*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Admin', immutable: true, version: 1 },
        { id: 2, name: 'Member', immutable: false, version: 1 },
      ]),
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

  await page.route('**/api/shopping/items*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ _embedded: { items: [] }, page: { totalPages: 0, totalElements: 0, size: 20, number: 0 } }),
    })
  })

  await page.route('**/api/shopping/stores*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ _embedded: { stores: [] }, page: { totalPages: 0, totalElements: 0, size: 20, number: 0 } }),
    })
  })

  await page.route('**/api/shopping/categories*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ _embedded: { categories: [] }, page: { totalPages: 0, totalElements: 0, size: 20, number: 0 } }),
    })
  })

  await page.route('**/api/shopping/coupons/expiring*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ _embedded: { coupons: [] } }) })
  })

  await page.route('**/api/shopping/lists/suggest-price*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '1.50' })
  })

  await page.route('**/api/labels*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  })

  await page.route('**/api/settings/nutrients*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  })

  await page.route('**/api/settings/meal-times*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  })

  await page.route('**/api/recipes*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ _embedded: { recipes: [] }, page: { totalPages: 0, totalElements: 0, size: 20, number: 0 } }),
    })
  })
})
