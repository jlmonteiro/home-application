# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: shopping.spec.ts >> Shopping List Lifecycle Flow >> Full lifecycle: Create -> Add Item -> Buy -> Complete
- Location: e2e/shopping.spec.ts:75:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: /Shopping Lists/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: /Shopping Lists/i })

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | import { ShoppingListsPage } from './pages/ShoppingListsPage'
  3   | import { ShoppingListDetailsPage } from './pages/ShoppingListDetailsPage'
  4   | 
  5   | test.describe('Shopping List Lifecycle Flow', () => {
  6   |   test.beforeEach(async ({ page }) => {
  7   |     // Debug logging
  8   |     page.on('console', (msg) => {
  9   |       if (msg.type() === 'error') console.log(`BROWSER ERROR: ${msg.text()}`)
  10  |     })
  11  | 
  12  |     // Mock user
  13  |     await page.route('**/api/user/me', async (route) => {
  14  |       await route.fulfill({
  15  |         status: 200,
  16  |         contentType: 'application/json',
  17  |         body: JSON.stringify({
  18  |           id: 1,
  19  |           email: 'j@m.com',
  20  |           firstName: 'John',
  21  |           lastName: 'Doe',
  22  |           ageGroupName: 'Adult',
  23  |         }),
  24  |       })
  25  |     })
  26  | 
  27  |     // Mock empty lists
  28  |     await page.route('**/api/shopping/lists', async (route) => {
  29  |       if (route.request().method() === 'GET') {
  30  |         await route.fulfill({
  31  |           status: 200,
  32  |           contentType: 'application/json',
  33  |           body: JSON.stringify({ _embedded: { lists: [] } }),
  34  |         })
  35  |       } else {
  36  |         await route.continue()
  37  |       }
  38  |     })
  39  | 
  40  |     // Mock master items for search
  41  |     await page.route('**/api/shopping/items?page=0&size=100', async (route) => {
  42  |       await route.fulfill({
  43  |         status: 200,
  44  |         contentType: 'application/json',
  45  |         body: JSON.stringify({
  46  |           _embedded: {
  47  |             items: [
  48  |               { id: 100, name: 'Milk', category: { id: 1, name: 'Dairy' } },
  49  |               { id: 101, name: 'Eggs', category: { id: 1, name: 'Dairy' } },
  50  |             ],
  51  |           },
  52  |         }),
  53  |       })
  54  |     })
  55  | 
  56  |     // Mock stores
  57  |     await page.route('**/api/shopping/stores?page=0&size=100', async (route) => {
  58  |       await route.fulfill({
  59  |         status: 200,
  60  |         contentType: 'application/json',
  61  |         body: JSON.stringify({ _embedded: { stores: [] } }),
  62  |       })
  63  |     })
  64  | 
  65  |     // Mock categories
  66  |     await page.route('**/api/shopping/categories?page=0&size=100', async (route) => {
  67  |       await route.fulfill({
  68  |         status: 200,
  69  |         contentType: 'application/json',
  70  |         body: JSON.stringify({ _embedded: { categories: [] } }),
  71  |       })
  72  |     })
  73  |   })
  74  | 
  75  |   test('Full lifecycle: Create -> Add Item -> Buy -> Complete', async ({ page }) => {
  76  |     const listsPage = new ShoppingListsPage(page)
  77  |     const detailsPage = new ShoppingListDetailsPage(page)
  78  | 
  79  |     await test.step('Given the user is on the Shopping Lists page', async () => {
  80  |       await listsPage.goto()
> 81  |       await expect(listsPage.title).toBeVisible()
      |                                     ^ Error: expect(locator).toBeVisible() failed
  82  |     })
  83  | 
  84  |     await test.step('When they create a new list named "Party Prep"', async () => {
  85  |       // Register a route that handles BOTH GET and POST for lists
  86  |       await page.route('**/api/shopping/lists', async (route) => {
  87  |         const method = route.request().method()
  88  |         if (method === 'POST') {
  89  |           await route.fulfill({
  90  |             status: 201,
  91  |             contentType: 'application/json',
  92  |             body: JSON.stringify({
  93  |               id: 1,
  94  |               name: 'Party Prep',
  95  |               status: 'PENDING',
  96  |               creatorName: 'John',
  97  |               createdAt: new Date().toISOString(),
  98  |               items: [],
  99  |             }),
  100 |           })
  101 |         } else if (method === 'GET') {
  102 |           await route.fulfill({
  103 |             status: 200,
  104 |             contentType: 'application/json',
  105 |             body: JSON.stringify({
  106 |               _embedded: {
  107 |                 lists: [
  108 |                   {
  109 |                     id: 1,
  110 |                     name: 'Party Prep',
  111 |                     status: 'PENDING',
  112 |                     creatorName: 'John',
  113 |                     createdAt: new Date().toISOString(),
  114 |                     items: [],
  115 |                   },
  116 |                 ],
  117 |               },
  118 |             }),
  119 |           })
  120 |         } else {
  121 |           await route.continue()
  122 |         }
  123 |       })
  124 | 
  125 |       await listsPage.createList('Party Prep', 'Stuff for Friday')
  126 |     })
  127 | 
  128 |     await test.step('And they navigate to the "Party Prep" details', async () => {
  129 |       // Mock fetching the single list
  130 |       await page.route('**/api/shopping/lists/1', async (route) => {
  131 |         await route.fulfill({
  132 |           status: 200,
  133 |           contentType: 'application/json',
  134 |           body: JSON.stringify({
  135 |             id: 1,
  136 |             name: 'Party Prep',
  137 |             status: 'PENDING',
  138 |             creatorName: 'John',
  139 |             createdAt: new Date().toISOString(),
  140 |             items: [],
  141 |           }),
  142 |         })
  143 |       })
  144 | 
  145 |       await listsPage.viewList('Party Prep')
  146 |       await expect(page).toHaveURL(/\/shopping\/lists\/1/)
  147 |     })
  148 | 
  149 |     await test.step('When they add "Milk" to the list', async () => {
  150 |       // Mock adding item
  151 |       await page.route('**/api/shopping/lists/1/items', async (route) => {
  152 |         await route.fulfill({
  153 |           status: 201,
  154 |           contentType: 'application/json',
  155 |           body: JSON.stringify({
  156 |             id: 10,
  157 |             itemId: 100,
  158 |             itemName: 'Milk',
  159 |             quantity: 2,
  160 |             unit: 'pcs',
  161 |             price: 1.5,
  162 |             bought: false,
  163 |             category: { name: 'Dairy' },
  164 |           }),
  165 |         })
  166 |       })
  167 | 
  168 |       // Mock update for GET list/1 to show the new item
  169 |       await page.route('**/api/shopping/lists/1', async (route) => {
  170 |         await route.fulfill({
  171 |           status: 200,
  172 |           contentType: 'application/json',
  173 |           body: JSON.stringify({
  174 |             id: 1,
  175 |             name: 'Party Prep',
  176 |             status: 'PENDING',
  177 |             creatorName: 'John',
  178 |             items: [
  179 |               {
  180 |                 id: 10,
  181 |                 itemId: 100,
```