import { test, expect } from '@playwright/test'

const MEAL_TIMES = [
  { id: 1, name: 'Breakfast', schedules: [
    { dayOfWeek: 'MONDAY', startTime: '08:00' }, { dayOfWeek: 'TUESDAY', startTime: '08:00' },
    { dayOfWeek: 'WEDNESDAY', startTime: '08:00' }, { dayOfWeek: 'THURSDAY', startTime: '08:00' },
    { dayOfWeek: 'FRIDAY', startTime: '08:00' }, { dayOfWeek: 'SATURDAY', startTime: '09:00' },
    { dayOfWeek: 'SUNDAY', startTime: '09:00' },
  ]},
  { id: 2, name: 'Lunch', schedules: [
    { dayOfWeek: 'MONDAY', startTime: '12:00' }, { dayOfWeek: 'TUESDAY', startTime: '12:00' },
    { dayOfWeek: 'WEDNESDAY', startTime: '12:00' }, { dayOfWeek: 'THURSDAY', startTime: '12:00' },
    { dayOfWeek: 'FRIDAY', startTime: '12:00' }, { dayOfWeek: 'SATURDAY', startTime: '13:00' },
    { dayOfWeek: 'SUNDAY', startTime: '13:00' },
  ]},
]

const EMPTY_PLAN = { id: 1, weekStartDate: '2026-04-20', status: 'PENDING', entries: [], version: 1 }

test.describe('Meal Planner User Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User', ageGroupName: 'Adult', version: 1 }),
      })
    })

    await page.route('**/api/settings/meal-times*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ _embedded: { mealTimes: MEAL_TIMES } }),
      })
    })

    await page.route('**/api/recipes*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _embedded: { recipes: [
            { id: 1, name: 'Grilled Chicken', labels: [], averageRating: 0 },
            { id: 2, name: 'Caesar Salad', labels: [], averageRating: 0 },
          ]},
          page: { totalPages: 1, totalElements: 2, size: 1000, number: 0 },
        }),
      })
    })

    await page.route('**/api/shopping/items*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _embedded: { items: [{ id: 100, name: 'Orange Juice', unit: 'l', version: 1 }] },
          page: { totalPages: 1, totalElements: 1, size: 1000, number: 0 },
        }),
      })
    })

    await page.route('**/api/user/all*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, firstName: 'Test', lastName: 'User' },
          { id: 2, firstName: 'Jane', lastName: 'Doe' },
        ]),
      })
    })
  })

  test('Assign recipe to a meal slot, then notify household', async ({ page }) => {
    let savedPlan = { ...EMPTY_PLAN }

    await page.route('**/api/meals/plans*', async (route) => {
      const url = route.request().url()
      if (url.includes('notify')) {
        savedPlan = { ...savedPlan, status: 'PUBLISHED' }
        await route.fulfill({ status: 200 })
      } else if (route.request().method() === 'PUT') {
        const body = JSON.parse(route.request().postData() || '{}')
        savedPlan = { ...savedPlan, ...body }
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(savedPlan) })
      } else if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(savedPlan) })
      } else {
        await route.continue()
      }
    })

    await test.step('Given the user is on the Meal Planner page', async () => {
      await page.goto('/recipes/planner')
      await expect(page.getByRole('heading', { name: 'Meal Planner' })).toBeVisible()
      await expect(page.getByText('Breakfast')).toBeVisible()
      await expect(page.getByText('Lunch')).toBeVisible()
    })

    await test.step('When they click on the Monday Lunch cell', async () => {
      // The table has meal times as rows and days as columns
      // Click the Lunch row, Monday column (2nd row, 2nd column)
      const lunchRow = page.locator('tr').filter({ hasText: 'Lunch' })
      await lunchRow.locator('td').nth(1).click()
      await expect(page.getByText('Edit Meal Entry')).toBeVisible()
    })

    await test.step('And add "Grilled Chicken" recipe to the meal', async () => {
      await page.getByRole('button', { name: /Add Recipe to Meal/i }).click()
      await page.getByRole('combobox', { name: 'Recipe' }).click()
      await page.getByRole('option', { name: 'Grilled Chicken' }).click()
    })

    await test.step('And save the entry', async () => {
      const [saveRequest] = await Promise.all([
        page.waitForRequest((req) => req.url().includes('/meals/plans/') && req.method() === 'PUT', { timeout: 5000 }),
        page.getByRole('button', { name: /Save Entry/i }).click(),
      ])
      expect(saveRequest).toBeTruthy()
      // Dismiss modal
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)
    })

    await test.step('Then "Grilled Chicken" appears in the Monday Lunch cell', async () => {
      const lunchRow = page.locator('tr').filter({ hasText: 'Lunch' })
      await expect(lunchRow.getByText('Grilled Chicken')).toBeVisible()
    })

    await test.step('When they click "Notify Household"', async () => {
      // After notify, override GET to return PUBLISHED status
      await page.route('**/api/meals/plans/1/notify', async (route) => {
        await route.fulfill({ status: 200 })
      })

      await page.route('**/api/meals/plans*', async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ ...savedPlan, status: 'PUBLISHED', entries: savedPlan.entries }),
          })
        } else {
          await route.continue()
        }
      })

      const [notifyRequest] = await Promise.all([
        page.waitForRequest((req) => req.url().includes('/notify') && req.method() === 'POST', { timeout: 5000 }),
        page.getByRole('button', { name: /Notify Household/i }).click(),
      ])
      expect(notifyRequest).toBeTruthy()
    })

    await test.step('Then the plan status changes to "Review Requested"', async () => {
      await expect(page.getByText('Review Requested')).toBeVisible()
    })
  })

  test('Mark meal as done and vote on it', async ({ page }) => {
    const planWithDoneEntry = {
      ...EMPTY_PLAN,
      status: 'ACCEPTED',
      entries: [{
        id: 10,
        mealTimeId: 2,
        dayOfWeek: 0,
        isDone: false,
        recipes: [{ recipe: { id: 1, name: 'Grilled Chicken' }, multiplier: 1, users: [] }],
        items: [],
        reactions: { thumbsUp: 0, thumbsDown: 0 },
      }],
    }

    let currentPlan = { ...planWithDoneEntry }

    await page.route('**/api/meals/plans*', async (route) => {
      const url = route.request().url()
      if (url.includes('vote')) {
        await route.fulfill({ status: 200 })
      } else if (route.request().method() === 'PUT') {
        const body = JSON.parse(route.request().postData() || '{}')
        currentPlan = { ...currentPlan, ...body }
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(currentPlan) })
      } else if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(currentPlan) })
      } else {
        await route.continue()
      }
    })

    await test.step('Given the planner shows a meal entry', async () => {
      await page.goto('/recipes/planner')
      await expect(page.getByText('Grilled Chicken')).toBeVisible()
    })

    await test.step('When the user opens the entry and marks it as done', async () => {
      const lunchRow = page.locator('tr').filter({ hasText: 'Lunch' })
      await lunchRow.locator('td').filter({ hasText: 'Grilled Chicken' }).click()
      await expect(page.getByText('Edit Meal Entry')).toBeVisible()

      // Update mock so after save, isDone=true
      currentPlan = {
        ...currentPlan,
        entries: [{ ...currentPlan.entries[0], isDone: true }],
      }

      await page.getByRole('button', { name: /Mark as Done/i }).click()
      // Wait for save to complete
      await page.waitForResponse((resp) => resp.url().includes('/meals/plans/') && resp.request().method() === 'PUT')
    })

    await test.step('Then voting buttons are available in the entry', async () => {
      // Close modal and reopen the cell
      await page.locator('.mantine-Modal-close').click()
      await page.waitForTimeout(500)
      const lunchRow = page.locator('tr').filter({ hasText: 'Lunch' })
      await lunchRow.locator('td').filter({ hasText: 'Grilled Chicken' }).click()
      await expect(page.getByText('Edit Meal Entry')).toBeVisible()
      await expect(page.getByRole('button', { name: /Yum/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /Not for me/i })).toBeVisible()
    })

    await test.step('When the user gives a thumbs up', async () => {
      const [voteRequest] = await Promise.all([
        page.waitForRequest((req) => req.url().includes('/vote') && req.method() === 'POST'),
        page.getByRole('button', { name: /Yum/i }).click(),
      ])
      expect(voteRequest.url()).toContain('vote=true')
    })
  })

  test('Export meal plan ingredients to shopping list', async ({ page }) => {
    const planWithEntry = {
      ...EMPTY_PLAN,
      entries: [{
        id: 10,
        mealTimeId: 2,
        dayOfWeek: 0,
        isDone: false,
        recipes: [{ recipe: { id: 1, name: 'Grilled Chicken' }, multiplier: 1, users: [] }],
        items: [{ item: { id: 100, name: 'Orange Juice' }, quantity: 2, unit: 'l', users: [] }],
        reactions: { thumbsUp: 0, thumbsDown: 0 },
      }],
    }

    await page.route('**/api/meals/plans*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(planWithEntry) })
      } else {
        await route.continue()
      }
    })

    await page.route('**/api/meals/plans/*/export-preview*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { itemId: 100, itemName: 'Orange Juice', quantity: 2, unit: 'l', existingQuantity: 0, suggestedPrice: 1.50 },
        ]),
      })
    })

    await page.route('**/api/meals/plans/*/export?*', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 200 })
      } else {
        await route.continue()
      }
    })

    await page.route('**/api/shopping/lists', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _embedded: { lists: [{ id: 1, name: 'Weekly Groceries', status: 'PENDING', items: [], version: 1 }] },
          page: { totalPages: 1, totalElements: 1, size: 20, number: 0 },
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

    await test.step('Given the planner has a meal with ingredients', async () => {
      await page.goto('/recipes/planner')
      await expect(page.getByText('Grilled Chicken')).toBeVisible()
    })

    await test.step('When the user clicks "Export to Shopping List"', async () => {
      await page.getByRole('button', { name: /Export to Shopping List/i }).click()
      await expect(page.getByRole('heading', { name: /Export to Shopping List/i })).toBeVisible()
    })

    await test.step('And selects a target list and confirms', async () => {
      const listSelect = page.getByRole('combobox', { name: 'Select Target Shopping List' })
      await listSelect.click()
      await page.getByRole('option', { name: 'Weekly Groceries' }).click()

      // Wait for preview items to load
      await expect(page.getByText('Orange Juice')).toBeVisible({ timeout: 10000 })

      // Verify the Confirm Export button is enabled
      const confirmBtn = page.getByRole('button', { name: /Confirm Export/i })
      await expect(confirmBtn).toBeEnabled({ timeout: 10000 })

      const [exportRequest] = await Promise.all([
        page.waitForRequest((req) => req.url().includes('/export') && req.method() === 'POST', { timeout: 10000 }),
        confirmBtn.click(),
      ])

      expect(exportRequest).toBeTruthy()
    })

    await test.step('Then a success notification appears', async () => {
      await expect(page.getByText('Ingredients exported successfully')).toBeVisible({ timeout: 10000 })
    })
  })
})
