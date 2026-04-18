import { http, HttpResponse } from 'msw'

const API_BASE = '/api'

export const handlers = [
  // --- Auth & User ---
  http.get(`${API_BASE}/user/me`, () => {
    return HttpResponse.json({
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      photo: { data: null, url: null },
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

  // --- Family Roles ---
  http.get(`${API_BASE}/settings/roles`, () => {
    return HttpResponse.json([
      { id: 1, name: 'Admin', immutable: true, version: 1 },
      { id: 2, name: 'Member', immutable: false, version: 1 },
    ])
  }),

  // --- Age Groups ---
  http.get(`${API_BASE}/settings/age-groups`, () => {
    return HttpResponse.json([
      { id: 1, name: 'Child', minAge: 0, maxAge: 12 },
      { id: 2, name: 'Adult', minAge: 13, maxAge: 99 },
    ])
  }),

  http.put(`${API_BASE}/settings/age-groups`, async ({ request }) => {
    return HttpResponse.json({ success: true })
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
