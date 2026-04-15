import { http, HttpResponse } from 'msw'

const API_BASE = '/api'

export const e2eHandlers = [
  // --- Auth & User ---
  http.get(`${API_BASE}/user/me`, () => {
    return HttpResponse.json({
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      photo: null,
      familyRoleName: 'Admin',
      familyRoleId: 1,
      version: 1,
    })
  }),

  http.post('/logout', () => {
    return new HttpResponse(null, { status: 200 })
  }),

  // --- Shopping Lists ---
  http.get(`${API_BASE}/shopping/lists`, () => {
    return HttpResponse.json({
      _embedded: {
        lists: [
          {
            id: 1,
            name: 'Weekly Groceries',
            description: 'Weekly food shop',
            status: 'PENDING',
            createdBy: 'test@example.com',
            creatorName: 'Test User',
            items: [],
            createdAt: new Date().toISOString(),
            completedAt: null,
            version: 1,
          },
        ],
      },
    })
  }),

  http.get(`${API_BASE}/shopping/lists/:id`, ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      name: 'Weekly Groceries',
      description: 'Weekly food shop',
      status: 'PENDING',
      createdBy: 'test@example.com',
      creatorName: 'Test User',
      items: [],
      createdAt: new Date().toISOString(),
      completedAt: null,
      version: 1,
    })
  }),

  http.post(`${API_BASE}/shopping/lists`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: 2,
      ...body,
      createdAt: new Date().toISOString(),
      version: 1,
    }, { status: 201 })
  }),

  http.put(`${API_BASE}/shopping/lists/:id`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: Number(params.id),
      ...body,
      version: 2,
    })
  }),

  http.delete(`${API_BASE}/shopping/lists/:id`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // --- Shopping Items ---
  http.get(`${API_BASE}/shopping/lists/:listId/items`, ({ params }) => {
    return HttpResponse.json({
      _embedded: {
        items: [
          { id: 1, name: 'Milk', quantity: 2, unit: 'liters', checked: false, categoryId: 2, version: 1 },
          { id: 2, name: 'Apples', quantity: 6, unit: 'pieces', checked: false, categoryId: 1, version: 1 },
        ],
      },
    })
  }),

  http.post(`${API_BASE}/shopping/lists/:listId/items`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: Math.floor(Math.random() * 1000),
      ...body,
      checked: false,
      version: 1,
    }, { status: 201 })
  }),

  http.put(`${API_BASE}/shopping/lists/:listId/items/:itemId`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      ...body,
      version: 2,
    })
  }),

  http.delete(`${API_BASE}/shopping/lists/:listId/items/:itemId`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // --- Stores ---
  http.get(`${API_BASE}/shopping/stores`, () => {
    return HttpResponse.json({
      _embedded: {
        stores: [
          { id: 1, name: 'Tesco', icon: 'IconBuildingStore', version: 1 },
          { id: 2, name: 'Lidl', icon: 'IconBuildingStore', version: 1 },
        ],
      },
    })
  }),

  http.get(`${API_BASE}/shopping/stores/:id`, ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      name: 'Test Store',
      address: '123 Test St',
      loyaltyProgram: null,
      version: 1,
    })
  }),

  // --- Categories ---
  http.get(`${API_BASE}/shopping/categories`, () => {
    return HttpResponse.json({
      _embedded: {
        categories: [
          { id: 1, name: 'Fruits & Vegetables', icon: 'IconApple', version: 1 },
          { id: 2, name: 'Dairy & Eggs', icon: 'IconEgg', version: 1 },
        ],
      },
    })
  }),

  // --- Coupons ---
  http.get(`${API_BASE}/shopping/coupons/expiring`, () => {
    return HttpResponse.json({
      _embedded: {
        coupons: [],
      },
    })
  }),

  // --- Family Roles ---
  http.get(`${API_BASE}/settings/roles`, () => {
    return HttpResponse.json([
      { id: 1, name: 'Admin', version: 1 },
      { id: 2, name: 'Member', version: 1 },
    ])
  }),

  // --- Profile Update ---
  http.put(`${API_BASE}/user/me`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      ...body,
      version: 2,
    })
  }),
]