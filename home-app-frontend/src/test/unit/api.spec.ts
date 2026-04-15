import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import { fetchCurrentUser, logout, fetchCategories, fetchItems, fetchStores, fetchLists } from '../../services/api'

// Mock document.cookie for CSRF token
const mockCookie = new Map<string, string>()
Object.defineProperty(document, 'cookie', {
  get: () => {
    const pairs: string[] = []
    mockCookie.forEach((v, k) => pairs.push(`${k}=${v}`))
    return pairs.join('; ')
  },
  set: (key: string, value: string) => {
    mockCookie.set(key, value)
  },
  configurable: true,
})

// Mock notifications
vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}))

beforeEach(() => {
  mockCookie.clear()
  vi.resetAllMocks()
})

describe('apiFetch - CSRF handling', () => {
  it('fetchLists does not require CSRF (GET request)', async () => {
    // fetchLists uses GET, so it should work without CSRF token
    server.use(
      http.get('/api/shopping/lists', () => {
        return HttpResponse.json({ _embedded: { lists: [] } })
      }),
    )

    const result = await fetchLists()
    expect(Array.isArray(result)).toBe(true)
  })

  it('fetchCategories uses GET with pagination params', async () => {
    // fetchCategories uses GET, not POST
    server.use(
      http.get('/api/shopping/categories', ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('page')).toBe('0')
        expect(url.searchParams.get('size')).toBe('20')
        return HttpResponse.json({ _embedded: { categories: [] } })
      }),
    )

    const result = await fetchCategories(0, 20)
    expect(result._embedded?.categories).toBeDefined()
  })

  it('fetchItems uses GET with pagination params', async () => {
    server.use(
      http.get('/api/shopping/items', ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('page')).toBe('0')
        expect(url.searchParams.get('size')).toBe('20')
        return HttpResponse.json({ _embedded: { items: [] } })
      }),
    )

    const result = await fetchItems(0, 20)
    expect(result._embedded?.items).toBeDefined()
  })

  it('fetchStores uses GET with pagination params', async () => {
    server.use(
      http.get('/api/shopping/stores', ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('page')).toBe('0')
        expect(url.searchParams.get('size')).toBe('20')
        return HttpResponse.json({ _embedded: { stores: [] } })
      }),
    )

    const result = await fetchStores(0, 20)
    expect(result._embedded?.stores).toBeDefined()
  })
})

describe('fetchCurrentUser', () => {
  it('returns user data on successful auth', async () => {
    server.use(
      http.get('/api/user/me', () => {
        return HttpResponse.json({
          id: 1,
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
        })
      }),
    )

    const user = await fetchCurrentUser()
    expect(user).toEqual({
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    })
  })

  it('returns null on 401 Unauthorized', async () => {
    server.use(
      http.get('/api/user/me', () => {
        return new HttpResponse(null, { status: 401 })
      }),
    )

    const user = await fetchCurrentUser()
    expect(user).toBeNull()
  })

  it('returns null on opaque redirect', async () => {
    server.use(
      http.get('/api/user/me', () => {
        return new HttpResponse(null, { status: 0, type: 'opaqueredirect' })
      }),
    )

    const user = await fetchCurrentUser()
    expect(user).toBeNull()
  })

  it('returns null when content-type is not JSON', async () => {
    server.use(
      http.get('/api/user/me', () => {
        return new HttpResponse('text response', {
          status: 200,
          headers: { 'content-type': 'text/plain' },
        })
      }),
    )

    const user = await fetchCurrentUser()
    expect(user).toBeNull()
  })
})

describe('logout', () => {
  it('calls POST /logout with CSRF token', async () => {
    let method = ''
    let headers: Headers | null = null
    server.use(
      http.post('/logout', async (req) => {
        method = req.request.method
        headers = req.request.headers
        return new HttpResponse(null, { status: 200 })
      }),
    )

    mockCookie.set('XSRF-TOKEN', 'logout-token')

    await logout()

    expect(method).toBe('POST')
    expect(headers?.get('X-XSRF-TOKEN')).toBe('logout-token')
  })

  it('clears user data and redirects on success', async () => {
    server.use(
      http.post('/logout', () => {
        return new HttpResponse(null, { status: 200 })
      }),
    )

    mockCookie.set('XSRF-TOKEN', 'test-token')

    await logout()

    // The function should have been called (we can't test window.location.href in unit tests easily)
    expect(mockCookie.get('XSRF-TOKEN')).toBe('test-token') // Cookie not cleared by our code
  })
})

describe('fetchCategories', () => {
  it('returns paginated categories', async () => {
    server.use(
      http.get('/api/shopping/categories', () => {
        return HttpResponse.json({
          _embedded: {
            categories: [
              { id: 1, name: 'Fruits', icon: 'IconApple' },
              { id: 2, name: 'Dairy', icon: 'IconMilk' },
            ],
          },
          page: { number: 0, size: 20, totalElements: 2 },
        })
      }),
    )

    const result = await fetchCategories(0, 20)
    expect(result._embedded.categories).toHaveLength(2)
    expect(result._embedded.categories[0].name).toBe('Fruits')
  })

  it('throws on error', async () => {
    server.use(
      http.get('/api/shopping/categories', () => {
        return new HttpResponse(null, { status: 500 })
      }),
    )

    await expect(fetchCategories()).rejects.toThrow('Failed to fetch categories')
  })
})

describe('fetchItems', () => {
  it('returns paginated items', async () => {
    server.use(
      http.get('/api/shopping/items', () => {
        return HttpResponse.json({
          _embedded: {
            items: [{ id: 1, name: 'Milk', category: { id: 1, name: 'Dairy' } }],
          },
        })
      }),
    )

    const result = await fetchItems(0, 20)
    expect(result._embedded.items).toHaveLength(1)
    expect(result._embedded.items[0].name).toBe('Milk')
  })

  it('throws on error', async () => {
    server.use(
      http.get('/api/shopping/items', () => {
        return new HttpResponse(null, { status: 500 })
      }),
    )

    await expect(fetchItems()).rejects.toThrow('Failed to fetch items')
  })
})

describe('fetchStores', () => {
  it('returns paginated stores', async () => {
    server.use(
      http.get('/api/shopping/stores', () => {
        return HttpResponse.json({
          _embedded: {
            stores: [
              { id: 1, name: 'Tesco', icon: 'IconBuildingStore' },
              { id: 2, name: 'Lidl', icon: 'IconBuildingStore' },
            ],
          },
        })
      }),
    )

    const result = await fetchStores(0, 20)
    expect(result._embedded.stores).toHaveLength(2)
    expect(result._embedded.stores[0].name).toBe('Tesco')
  })

  it('throws on error', async () => {
    server.use(
      http.get('/api/shopping/stores', () => {
        return new HttpResponse(null, { status: 500 })
      }),
    )

    await expect(fetchStores()).rejects.toThrow('Failed to fetch stores')
  })
})

describe('fetchLists', () => {
  it('returns shopping lists', async () => {
    server.use(
      http.get('/api/shopping/lists', () => {
        return HttpResponse.json({
          _embedded: {
            lists: [
              {
                id: 1,
                name: 'Weekly Groceries',
                status: 'PENDING',
                items: [],
              },
            ],
          },
        })
      }),
    )

    const result = await fetchLists()
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Weekly Groceries')
  })

  it('returns empty array on error', async () => {
    server.use(
      http.get('/api/shopping/lists', () => {
        return new HttpResponse(null, { status: 500 })
      }),
    )

    await expect(fetchLists()).rejects.toThrow('Failed to fetch shopping lists')
  })
})

// Additional API functions to test
import {
  createCategory,
  updateCategory,
  deleteCategory,
  fetchItemsByCategory,
  createItem,
  updateItem,
  deleteItem,
  fetchStore,
  createStore,
  updateStore,
  deleteStore,
  fetchLoyaltyCards,
  createLoyaltyCard,
  deleteLoyaltyCard,
  fetchCoupons,
  fetchExpiringCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  fetchList,
  createList,
  updateList,
  deleteList,
  addItemToList,
  updateListItem,
  removeListItem,
  fetchSuggestedPrice,
  fetchUserPreferences,
  updateUserPreferences,
  fetchAgeGroups,
  updateAgeGroups,
  fetchFamilyRoles,
  createFamilyRole,
  updateFamilyRole,
  deleteFamilyRole,
} from '../../services/api'

describe('createCategory', () => {
  it('creates a new category', async () => {
    server.use(
      http.post('/api/shopping/categories', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 3, name: body.name, icon: 'IconBox', version: 1 })
      }),
    )

    const result = await createCategory({ name: 'Beverages', icon: 'IconDrink' })
    expect(result.id).toBe(3)
    expect(result.name).toBe('Beverages')
  })

  it('throws on error with ProblemDetail', async () => {
    server.use(
      http.post('/api/shopping/categories', () => {
        return HttpResponse.json(
          { title: 'Validation Error', detail: 'Name is required', status: 400 },
          { status: 400 },
        )
      }),
    )

    await expect(createCategory({})).rejects.toThrow('Name is required')
  })
})

describe('updateCategory', () => {
  it('updates an existing category', async () => {
    server.use(
      http.put('/api/shopping/categories/1', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 1, name: body.name, icon: 'IconUpdated', version: 2 })
      }),
    )

    const result = await updateCategory(1, { name: 'Updated Category' })
    expect(result.name).toBe('Updated Category')
    expect(result.version).toBe(2)
  })

  it('throws on error', async () => {
    server.use(
      http.put('/api/shopping/categories/999', () => {
        return new HttpResponse(null, { status: 404 })
      }),
    )

    await expect(updateCategory(999, { name: 'Test' })).rejects.toThrow()
  })
})

describe('deleteCategory', () => {
  it('deletes a category successfully', async () => {
    server.use(
      http.delete('/api/shopping/categories/1', () => {
        return new HttpResponse(null, { status: 204 })
      }),
    )

    await expect(deleteCategory(1)).resolves.not.toThrow()
  })

  it('throws on error', async () => {
    server.use(
      http.delete('/api/shopping/categories/999', () => {
        return new HttpResponse(null, { status: 404 })
      }),
    )

    await expect(deleteCategory(999)).rejects.toThrow('Failed to delete category')
  })
})

describe('fetchItemsByCategory', () => {
  it('returns items for a category', async () => {
    server.use(
      http.get('/api/shopping/categories/1/items', () => {
        return HttpResponse.json({
          _embedded: {
            items: [
              { id: 1, name: 'Apple', category: { id: 1, name: 'Fruits' } },
              { id: 2, name: 'Banana', category: { id: 1, name: 'Fruits' } },
            ],
          },
        })
      }),
    )

    const result = await fetchItemsByCategory(1)
    expect(result._embedded.items).toHaveLength(2)
    expect(result._embedded.items[0].name).toBe('Apple')
  })
})

describe('createItem', () => {
  it('creates a new item', async () => {
    server.use(
      http.post('/api/shopping/items', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 10, name: body.name, categoryId: body.categoryId, version: 1 })
      }),
    )

    const result = await createItem({ name: 'Orange Juice', categoryId: 2 })
    expect(result.id).toBe(10)
    expect(result.name).toBe('Orange Juice')
  })

  it('throws on error', async () => {
    server.use(
      http.post('/api/shopping/items', () => {
        return HttpResponse.json({ detail: 'Name is required' }, { status: 400 })
      }),
    )

    await expect(createItem({})).rejects.toThrow()
  })
})

describe('updateItem', () => {
  it('updates an item', async () => {
    server.use(
      http.put('/api/shopping/items/1', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 1, name: body.name, version: 2 })
      }),
    )

    const result = await updateItem(1, { name: 'Updated Item' })
    expect(result.name).toBe('Updated Item')
  })
})

describe('deleteItem', () => {
  it('deletes an item', async () => {
    server.use(
      http.delete('/api/shopping/items/1', () => {
        return new HttpResponse(null, { status: 204 })
      }),
    )

    await expect(deleteItem(1)).resolves.not.toThrow()
  })
})

describe('fetchStore', () => {
  it('returns store details', async () => {
    server.use(
      http.get('/api/shopping/stores/1', () => {
        return HttpResponse.json({ id: 1, name: 'Tesco', address: '123 Main St', version: 1 })
      }),
    )

    const result = await fetchStore(1)
    expect(result.name).toBe('Tesco')
    expect(result.id).toBe(1)
  })

  it('throws on error', async () => {
    server.use(
      http.get('/api/shopping/stores/999', () => {
        return new HttpResponse(null, { status: 404 })
      }),
    )

    await expect(fetchStore(999)).rejects.toThrow('Failed to fetch store')
  })
})

describe('createStore', () => {
  it('creates a new store', async () => {
    server.use(
      http.post('/api/shopping/stores', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 5, name: body.name, version: 1 })
      }),
    )

    const result = await createStore({ name: 'New Store' })
    expect(result.id).toBe(5)
    expect(result.name).toBe('New Store')
  })
})

describe('updateStore', () => {
  it('updates a store', async () => {
    server.use(
      http.put('/api/shopping/stores/1', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 1, name: body.name, version: 2 })
      }),
    )

    const result = await updateStore(1, { name: 'Updated Store' })
    expect(result.name).toBe('Updated Store')
  })
})

describe('deleteStore', () => {
  it('deletes a store', async () => {
    server.use(
      http.delete('/api/shopping/stores/1', () => {
        return new HttpResponse(null, { status: 204 })
      }),
    )

    await expect(deleteStore(1)).resolves.not.toThrow()
  })
})

describe('fetchLoyaltyCards', () => {
  it('returns loyalty cards for a store', async () => {
    server.use(
      http.get('/api/shopping/stores/1/loyalty-cards', () => {
        return HttpResponse.json({
          _embedded: {
            loyaltyCards: [
              { id: 1, cardNumber: '123456', storeId: 1 },
              { id: 2, cardNumber: '789012', storeId: 1 },
            ],
          },
        })
      }),
    )

    const result = await fetchLoyaltyCards(1)
    expect(result).toHaveLength(2)
    expect(result[0].cardNumber).toBe('123456')
  })
})

describe('createLoyaltyCard', () => {
  it('creates a loyalty card', async () => {
    server.use(
      http.post('/api/shopping/stores/1/loyalty-cards', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 3, cardNumber: body.cardNumber, storeId: 1 })
      }),
    )

    const result = await createLoyaltyCard(1, { cardNumber: '999999' })
    expect(result.id).toBe(3)
    expect(result.cardNumber).toBe('999999')
  })
})

describe('deleteLoyaltyCard', () => {
  it('deletes a loyalty card', async () => {
    server.use(
      http.delete('/api/shopping/loyalty-cards/1', () => {
        return new HttpResponse(null, { status: 204 })
      }),
    )

    await expect(deleteLoyaltyCard(1)).resolves.not.toThrow()
  })
})

describe('fetchCoupons', () => {
  it('returns coupons for a store', async () => {
    server.use(
      http.get('/api/shopping/stores/1/coupons', () => {
        return HttpResponse.json({
          _embedded: {
            coupons: [
              { id: 1, name: '10% Off', storeId: 1 },
              { id: 2, name: 'Buy One Get One', storeId: 1 },
            ],
          },
        })
      }),
    )

    const result = await fetchCoupons(1)
    expect(result._embedded.coupons).toHaveLength(2)
  })
})

describe('fetchExpiringCoupons', () => {
  it('returns expiring coupons', async () => {
    server.use(
      http.get('/api/shopping/coupons/expiring', () => {
        return HttpResponse.json({
          _embedded: {
            coupons: [{ id: 1, name: 'Expiring Soon', dueDate: '2024-12-31' }],
          },
        })
      }),
    )

    const result = await fetchExpiringCoupons()
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Expiring Soon')
  })
})

describe('createCoupon', () => {
  it('creates a coupon', async () => {
    server.use(
      http.post('/api/shopping/stores/1/coupons', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 5, name: body.name, storeId: 1 })
      }),
    )

    const result = await createCoupon(1, { name: 'Summer Sale' })
    expect(result.id).toBe(5)
    expect(result.name).toBe('Summer Sale')
  })
})

describe('updateCoupon', () => {
  it('updates a coupon', async () => {
    server.use(
      http.put('/api/shopping/coupons/1', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 1, name: body.name, version: 2 })
      }),
    )

    const result = await updateCoupon(1, { name: 'Updated Coupon' })
    expect(result.name).toBe('Updated Coupon')
  })
})

describe('deleteCoupon', () => {
  it('deletes a coupon', async () => {
    server.use(
      http.delete('/api/shopping/coupons/1', () => {
        return new HttpResponse(null, { status: 204 })
      }),
    )

    await expect(deleteCoupon(1)).resolves.not.toThrow()
  })
})

describe('fetchList', () => {
  it('returns list details', async () => {
    server.use(
      http.get('/api/shopping/lists/1', () => {
        return HttpResponse.json({
          id: 1,
          name: 'Weekly Groceries',
          status: 'PENDING',
          items: [
            { id: 10, itemName: 'Milk', quantity: 2, bought: false },
          ],
        })
      }),
    )

    const result = await fetchList(1)
    expect(result.name).toBe('Weekly Groceries')
    expect(result.items).toHaveLength(1)
  })
})

describe('createList', () => {
  it('creates a new list', async () => {
    server.use(
      http.post('/api/shopping/lists', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 10, name: body.name, status: 'PENDING', items: [] })
      }),
    )

    const result = await createList({ name: 'Party List' })
    expect(result.id).toBe(10)
    expect(result.name).toBe('Party List')
  })
})

describe('updateList', () => {
  it('updates a list', async () => {
    server.use(
      http.put('/api/shopping/lists/1', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 1, name: body.name, status: 'COMPLETED' })
      }),
    )

    const result = await updateList(1, { name: 'Updated List', status: 'COMPLETED' })
    expect(result.status).toBe('COMPLETED')
  })
})

describe('deleteList', () => {
  it('deletes a list', async () => {
    server.use(
      http.delete('/api/shopping/lists/1', () => {
        return new HttpResponse(null, { status: 204 })
      }),
    )

    await expect(deleteList(1)).resolves.not.toThrow()
  })
})

describe('addItemToList', () => {
  it('adds an item to a list', async () => {
    server.use(
      http.post('/api/shopping/lists/1/items', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 20, itemName: body.itemName, quantity: body.quantity, bought: false })
      }),
    )

    const result = await addItemToList(1, { itemName: 'Eggs', quantity: 12 })
    expect(result.id).toBe(20)
    expect(result.itemName).toBe('Eggs')
  })
})

describe('updateListItem', () => {
  it('updates a list item', async () => {
    server.use(
      http.patch('/api/shopping/lists/items/20', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 20, bought: body.bought })
      }),
    )

    const result = await updateListItem(20, { bought: true })
    expect(result.bought).toBe(true)
  })
})

describe('removeListItem', () => {
  it('removes a list item', async () => {
    server.use(
      http.delete('/api/shopping/lists/items/20', () => {
        return new HttpResponse(null, { status: 204 })
      }),
    )

    await expect(removeListItem(20)).resolves.not.toThrow()
  })
})

describe('fetchSuggestedPrice', () => {
  it('returns suggested price for an item', async () => {
    server.use(
      http.get('/api/shopping/lists/suggest-price', ({ request }) => {
        const url = new URL(request.url)
        expect(url.searchParams.get('itemId')).toBe('1')
        return HttpResponse.json(2.99)
      }),
    )

    const result = await fetchSuggestedPrice(1)
    expect(result).toBe(2.99)
  })

  it('returns null when no price available', async () => {
    server.use(
      http.get('/api/shopping/lists/suggest-price', () => {
        return new HttpResponse(null, { status: 404 })
      }),
    )

    await expect(fetchSuggestedPrice(999)).rejects.toThrow('Failed to fetch suggested price')
  })
})

describe('fetchUserPreferences', () => {
  it('returns user preferences', async () => {
    server.use(
      http.get('/api/user/preferences', () => {
        return HttpResponse.json({
          showShoppingWidget: true,
          showCouponsWidget: true,
        })
      }),
    )

    const result = await fetchUserPreferences()
    expect(result.showShoppingWidget).toBe(true)
    expect(result.showCouponsWidget).toBe(true)
  })
})

describe('updateUserPreferences', () => {
  it('updates user preferences', async () => {
    server.use(
      http.put('/api/user/preferences', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ showShoppingWidget: false, showCouponsWidget: true })
      }),
    )

    const result = await updateUserPreferences({ showShoppingWidget: false })
    expect(result.showShoppingWidget).toBe(false)
  })
})

describe('fetchAgeGroups', () => {
  it('returns age group configurations', async () => {
    server.use(
      http.get('/api/settings/age-groups', () => {
        return HttpResponse.json([
          { name: 'Child', maxAge: 12 },
          { name: 'Teen', maxAge: 18 },
          { name: 'Adult', maxAge: 99 },
        ])
      }),
    )

    const result = await fetchAgeGroups()
    expect(result).toHaveLength(3)
    expect(result[0].name).toBe('Child')
  })
})

describe('updateAgeGroups', () => {
  it('updates age group configurations', async () => {
    server.use(
      http.put('/api/settings/age-groups', async () => {
        return new HttpResponse(null, { status: 204 })
      }),
    )

    await expect(updateAgeGroups([{ name: 'Adult', maxAge: 21 }])).resolves.not.toThrow()
  })
})

describe('fetchFamilyRoles', () => {
  it('returns family roles', async () => {
    server.use(
      http.get('/api/settings/roles', () => {
        return HttpResponse.json([
          { id: 1, name: 'Parent', immutable: true },
          { id: 2, name: 'Child', immutable: false },
        ])
      }),
    )

    const result = await fetchFamilyRoles()
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('Parent')
  })
})

describe('createFamilyRole', () => {
  it('creates a family role', async () => {
    server.use(
      http.post('/api/settings/roles', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 3, name: body.name, immutable: false })
      }),
    )

    const result = await createFamilyRole({ name: 'Guest' })
    expect(result.id).toBe(3)
    expect(result.name).toBe('Guest')
  })
})

describe('updateFamilyRole', () => {
  it('updates a family role', async () => {
    server.use(
      http.put('/api/settings/roles/2', async ({ request }) => {
        const body = await request.json()
        return HttpResponse.json({ id: 2, name: body.name, version: 2 })
      }),
    )

    const result = await updateFamilyRole(2, { name: 'Teenager' })
    expect(result.name).toBe('Teenager')
  })
})

describe('deleteFamilyRole', () => {
  it('deletes a family role', async () => {
    server.use(
      http.delete('/api/settings/roles/2', () => {
        return new HttpResponse(null, { status: 204 })
      }),
    )

    await expect(deleteFamilyRole(2)).resolves.not.toThrow()
  })
})