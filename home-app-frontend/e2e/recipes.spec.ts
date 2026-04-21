import { test, expect } from '@playwright/test'

const RECIPE_MOCK = {
  id: 1,
  name: 'Grandma Lasagna',
  description: 'A classic **Italian** dish.',
  servings: 4,
  prepTimeMinutes: 60,
  labels: ['Italian', 'Comfort Food'],
  averageRating: 4.5,
  ratingCount: 2,
  creator: { id: 1, name: 'Test User' },
  photos: [{ id: 1, photoUrl: '/api/images/lasagna.jpg', isDefault: true }],
  ingredients: [
    { id: 1, item: { id: 100, name: 'Chicken Breast', unit: 'g', category: { id: 1, name: 'Meat' } }, quantity: 500, unit: 'g', groupName: '' },
  ],
  steps: [
    { id: 1, instruction: 'Preheat oven to 180C', sortOrder: 0, timeMinutes: 5 },
    { id: 2, instruction: 'Layer the pasta sheets', sortOrder: 1, timeMinutes: 10 },
    { id: 3, instruction: 'Bake for 45 minutes', sortOrder: 2, timeMinutes: 45 },
  ],
  version: 1,
}

test.describe('Recipe Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 1, email: 'test@example.com', firstName: 'Test', lastName: 'User', ageGroupName: 'Adult', version: 1 }),
      })
    })

    await page.route('**/api/labels*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{ name: 'Italian' }, { name: 'Comfort Food' }]),
      })
    })

    await page.route('**/api/shopping/items*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _embedded: { items: [{ id: 100, name: 'Chicken Breast', unit: 'g', category: { id: 1, name: 'Meat' }, version: 1 }] },
          page: { totalPages: 1, totalElements: 1, size: 500, number: 0 },
        }),
      })
    })

    await page.route('**/api/shopping/categories*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          _embedded: { categories: [{ id: 1, name: 'Meat', icon: 'IconMeat', version: 1 }] },
          page: { totalPages: 1, totalElements: 1, size: 500, number: 0 },
        }),
      })
    })
  })

  test('TS-30B: Create recipe and land on detail page', async ({ page }) => {
    await page.route('**/api/recipes*', async (route) => {
      const url = route.request().url()
      if (route.request().method() === 'GET' && !url.match(/\/recipes\/\d+/)) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ _embedded: { recipes: [] }, page: { totalPages: 0, totalElements: 0, size: 12, number: 0 } }),
        })
      } else {
        await route.continue()
      }
    })

    await test.step('Given the user navigates to the recipes page', async () => {
      await page.goto('/recipes')
      await expect(page.getByRole('heading', { name: 'Cookbook' })).toBeVisible()
    })

    await test.step('When they fill the recipe form and submit', async () => {
      await page.getByRole('link', { name: /Add Recipe/i }).click()
      await expect(page).toHaveURL(/\/recipes\/new/)

      await page.getByLabel('Recipe Name').fill('Grandma Lasagna')
      await page.getByLabel('Servings').fill('4')
      await page.getByLabel('Prep Time').fill('60')

      await page.route('**/api/recipes', async (route) => {
        if (route.request().method() === 'POST') {
          await route.fulfill({ status: 201, contentType: 'application/json', body: JSON.stringify(RECIPE_MOCK) })
        } else {
          await route.continue()
        }
      })

      await page.route('**/api/recipes/1', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(RECIPE_MOCK) })
      })

      await page.getByRole('button', { name: /Create Recipe/i }).click()
    })

    await test.step('Then the user lands on the recipe detail page', async () => {
      await expect(page).toHaveURL(/\/recipes\/1/)
      await expect(page.getByText('Grandma Lasagna')).toBeVisible()
    })
  })

  test('TS-31B: Select existing label via TagsInput autocomplete', async ({ page }) => {
    await test.step('Given the user is on the new recipe form', async () => {
      await page.goto('/recipes/new')
      await expect(page.getByRole('heading', { name: 'New Recipe' })).toBeVisible()
    })

    await test.step('When they type in the labels field and select from dropdown', async () => {
      const tagsInput = page.locator('.mantine-TagsInput-input')
      await tagsInput.click()
      await tagsInput.pressSequentially('Ital')
      await page.getByRole('option', { name: 'Italian' }).click()
    })

    await test.step('Then the label appears as a pill', async () => {
      await expect(page.locator('.mantine-TagsInput-pill').filter({ hasText: 'Italian' })).toBeVisible()
    })
  })

  test('TS-33: Reorder preparation steps using move buttons', async ({ page }) => {
    await page.route('**/api/recipes/1', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(RECIPE_MOCK) })
    })

    await test.step('Given the user is editing a recipe with 3 steps', async () => {
      await page.goto('/recipes/1/edit')
      await expect(page.getByText('Preheat oven to 180C')).toBeVisible()
      await expect(page.getByText('Bake for 45 minutes')).toBeVisible()
    })

    await test.step('When they click "Move Up" on the last step', async () => {
      const moveUpButtons = page.getByTitle('Move Up')
      await moveUpButtons.nth(2).click()
    })

    await test.step('Then the step order changes to [Preheat, Bake, Layer]', async () => {
      const stepTexts = await page.getByTitle('Move Up').evaluateAll((buttons) => {
        return buttons.map((btn) => {
          const paper = btn.closest('.mantine-Paper-root')
          return paper?.textContent || ''
        })
      })
      expect(stepTexts[0]).toContain('Preheat oven')
      expect(stepTexts[1]).toContain('Bake for 45')
      expect(stepTexts[2]).toContain('Layer the pasta')
    })
  })
})
