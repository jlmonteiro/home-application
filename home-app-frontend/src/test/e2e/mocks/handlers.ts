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
      photo: { data: null, url: null },
      familyRoleName: 'Admin',
      familyRoleId: 1,
      ageGroupName: 'Adult',
      birthdate: '1990-01-01',
      mobilePhone: '+351912345678',
      social: {
        facebook: '',
        instagram: '',
        linkedin: '',
      },
      version: 1,
    })
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
  http.post(`${API_BASE}/shopping/lists/:listId/items`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: Math.floor(Math.random() * 1000),
      ...body,
      checked: false,
      version: 1,
    }, { status: 201 })
  }),

  http.patch(`${API_BASE}/shopping/lists/items/:itemId`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      ...body,
      version: 2,
    })
  }),

  http.delete(`${API_BASE}/shopping/lists/items/:itemId`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // --- Suggest Price ---
  http.get(`${API_BASE}/shopping/lists/suggest-price`, ({ request }) => {
    const url = new URL(request.url)
    const itemId = url.searchParams.get('itemId')
    const storeId = url.searchParams.get('storeId')
    // Backend returns BigDecimal directly, not an object
    return HttpResponse.json(storeId ? 2.99 : 1.50)
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
    return HttpResponse.json({ _embedded: { coupons: [] } })
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
      ageGroupName: 'Adult',
      birthdate: '1990-01-01',
      mobilePhone: '+351912345678',
      social: {
        facebook: '',
        instagram: '',
        linkedin: '',
      },
      ...body,
      version: 2,
    })
  }),

  // --- User Preferences ---
  http.get(`${API_BASE}/user/preferences`, () => {
    return HttpResponse.json({
      showShoppingWidget: true,
      showCouponsWidget: true,
      showMealPlanWidget: true,
    })
  }),

  http.put(`${API_BASE}/user/preferences`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json(body)
  }),

  // --- Shopping Items ---
  http.get(`${API_BASE}/shopping/items`, ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get('search')
    return HttpResponse.json({
      _embedded: {
        items: search
          ? [{ id: 100, name: 'Milk', unit: 'l', category: { id: 1, name: 'Dairy' } }]
          : [],
      },
      page: { totalPages: 1, totalElements: search ? 1 : 0, size: 20, number: 0 }
    })
  }),

  http.post(`${API_BASE}/shopping/items`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: 200,
      ...body,
      version: 1,
    }, { status: 201 })
  }),

  http.get(`${API_BASE}/shopping/items/{id}`, ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      name: 'Milk',
      unit: 'l',
      category: { id: 1, name: 'Dairy' },
    })
  }),

  // --- Shopping Stores ---
  http.get(`${API_BASE}/shopping/stores`, () => {
    return HttpResponse.json({
      _embedded: {
        stores: [
          { id: 1, name: 'Tesco', icon: 'IconBuildingStore', version: 1 },
          { id: 2, name: 'Lidl', icon: 'IconBuildingStore', version: 1 },
        ],
      },
      page: { totalPages: 1, totalElements: 2, size: 20, number: 0 }
    })
  }),

  http.post(`${API_BASE}/shopping/stores`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: 1,
      ...body,
      version: 1,
    }, { status: 201 })
  }),

  http.get(`${API_BASE}/shopping/stores/{id}`, ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      name: 'Test Store',
      address: '123 Test St',
      loyaltyProgram: null,
      version: 1,
    })
  }),

  // --- Shopping Categories ---
  http.get(`${API_BASE}/shopping/categories`, () => {
    return HttpResponse.json({
      _embedded: {
        categories: [
          { id: 1, name: 'Fruits & Vegetables', icon: 'IconApple', version: 1 },
          { id: 2, name: 'Dairy & Eggs', icon: 'IconEgg', version: 1 },
        ],
      },
      page: { totalPages: 1, totalElements: 2, size: 20, number: 0 }
    })
  }),

  http.post(`${API_BASE}/shopping/categories`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: 1,
      ...body,
      version: 1,
    }, { status: 201 })
  }),

  // --- Settings ---
  http.get(`${API_BASE}/settings/age-groups`, () => {
    return HttpResponse.json([
      { id: 1, name: 'Child', minAge: 0, maxAge: 12 },
      { id: 2, name: 'Teenager', minAge: 13, maxAge: 17 },
      { id: 3, name: 'Adult', minAge: 18, maxAge: 120 },
    ])
  }),

  http.put(`${API_BASE}/settings/age-groups`, async ({ request }) => {
    await request.json()
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${API_BASE}/settings/roles`, () => {
    return HttpResponse.json([
      { id: 1, name: 'Admin', immutable: true, version: 1 },
      { id: 2, name: 'Member', immutable: false, version: 1 },
    ])
  }),

  http.post(`${API_BASE}/settings/roles`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: 3,
      ...body,
      immutable: false,
      version: 1,
    })
  }),

  http.put(`${API_BASE}/settings/roles/{id}`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: Number(params.id),
      ...body,
      version: 2,
    })
  }),

  http.delete(`${API_BASE}/settings/roles/{id}`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // --- Labels ---
  http.get(`${API_BASE}/labels`, ({ request }) => {
    const url = new URL(request.url)
    const query = url.searchParams.get('q')
    if (query) {
      return HttpResponse.json([
        { name: 'Italian' },
        { name: 'Comfort Food' },
      ])
    }
    return HttpResponse.json([])
  }),

  // --- Nutrients ---
  http.get(`${API_BASE}/settings/nutrients`, () => {
    return HttpResponse.json([
      { id: 1, name: 'Calories', unit: 'kcal' },
      { id: 2, name: 'Protein', unit: 'g' },
    ])
  }),

  http.post(`${API_BASE}/settings/nutrients`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: 3,
      ...body,
      version: 1,
    }, { status: 201 })
  }),

  http.put(`${API_BASE}/settings/nutrients/{id}`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: Number(params.id),
      ...body,
      version: 2,
    })
  }),

  http.delete(`${API_BASE}/settings/nutrients/{id}`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // --- Meal Times ---
  http.get(`${API_BASE}/settings/meal-times`, () => {
    return HttpResponse.json([
      { id: 1, name: 'Breakfast', time: '08:00', weekday: true },
      { id: 2, name: 'Lunch', time: '13:00', weekday: true },
    ])
  }),

  http.post(`${API_BASE}/settings/meal-times`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: 3,
      ...body,
      version: 1,
    }, { status: 201 })
  }),

  http.put(`${API_BASE}/settings/meal-times/{id}`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: Number(params.id),
      ...body,
      version: 2,
    })
  }),

  http.delete(`${API_BASE}/settings/meal-times/{id}`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // --- Recipes ---
  http.get(`${API_BASE}/recipes`, ({ request }) => {
    const url = new URL(request.url)
    const search = url.searchParams.get('q')
    return HttpResponse.json({
      _embedded: {
        recipes: search
          ? [{
              id: 1,
              name: 'Pancakes',
              description: 'Delicious pancakes',
              defaultPhoto: { name: 'pancakes.jpg', url: '/api/images/pancakes.jpg' },
              rating: { average: 4.5, count: 2 },
            }]
          : [],
      },
      page: { totalPages: 1, totalElements: search ? 1 : 0, size: 20, number: 0 }
    })
  }),

  http.get(`${API_BASE}/recipes/{id}`, ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      name: 'Pancakes',
      description: 'Delicious pancakes',
      defaultPhoto: { name: 'pancakes.jpg', url: '/api/images/pancakes.jpg' },
      rating: { average: 4.5, count: 2 },
      ingredients: [],
      steps: [],
    })
  }),

  http.post(`${API_BASE}/recipes`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: 1,
      ...body,
      version: 1,
    }, { status: 201 })
  }),

  http.put(`${API_BASE}/recipes/{id}`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: Number(params.id),
      ...body,
      version: 2,
    })
  }),

  http.delete(`${API_BASE}/recipes/{id}`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.put(`${API_BASE}/recipes/{id}/steps/reorder`, async ({ params, request }) => {
    await request.json()
    return HttpResponse.json({
      id: Number(params.id),
      steps: [],
      version: 2,
    })
  }),

  // --- Recipe Feedback ---
  http.get(`${API_BASE}/recipes/{id}/comments`, ({ params }) => {
    return HttpResponse.json([])
  }),

  http.post(`${API_BASE}/recipes/{id}/comments`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: 1,
      recipeId: Number(params.id),
      ...body,
      version: 1,
    }, { status: 201 })
  }),

  http.delete(`${API_BASE}/recipes/{id}/comments/{commentId}`, () => {
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${API_BASE}/recipes/{id}/rating`, () => {
    return HttpResponse.json({
      id: 1,
      rating: 4,
      version: 1,
    })
  }),

  http.post(`${API_BASE}/recipes/{id}/rating`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: 1,
      ...body,
      version: 2,
    })
  }),

  // --- Meal Plans ---
  http.get(`${API_BASE}/meals/plans`, ({ request }) => {
    const url = new URL(request.url)
    const date = url.searchParams.get('date')
    return HttpResponse.json({
      id: 1,
      weekStartDate: date || '2026-04-20',
      status: 'PENDING',
      entries: [],
    })
  }),

  http.put(`${API_BASE}/meals/plans/{id}`, async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: Number(params.id),
      ...body,
      version: 2,
    })
  }),

  http.post(`${API_BASE}/meals/plans/{id}/notify`, () => {
    return new HttpResponse(null, { status: 200 })
  }),

  http.post(`${API_BASE}/meals/plans/{id}/accept`, () => {
    return new HttpResponse(null, { status: 200 })
  }),

  http.post(`${API_BASE}/meals/plans/entries/{entryId}/vote`, async ({ request }) => {
    const body = await request.json()
    return new HttpResponse(null, { status: body.vote ? 200 : 200 })
  }),

  http.get(`${API_BASE}/meals/plans/{id}/export-preview`, ({ request }) => {
    const url = new URL(request.url)
    const listId = url.searchParams.get('listId')
    return HttpResponse.json([
      { itemId: 100, itemName: 'Milk', quantity: 6, unit: 'pcs', existingQuantity: 3, type: 'ingredient' },
    ])
  }),

  http.post(`${API_BASE}/meals/plans/{id}/export`, async ({ request }) => {
    await request.json()
    return new HttpResponse(null, { status: 200 })
  }),

  // --- Notifications ---
  http.get(`${API_BASE}/notifications`, () => {
    return HttpResponse.json([
      { id: 1, type: 'NEW_MESSAGE', read: false, message: { id: 1, content: 'Hello' } },
    ])
  }),

  http.post(`${API_BASE}/notifications/{id}/read`, () => {
    return new HttpResponse(null, { status: 200 })
  }),

  http.get(`${API_BASE}/notifications/unread-count`, () => {
    return HttpResponse.json(1)
  }),

  http.get(`${API_BASE}/notifications/messages/{otherId}`, () => {
    return HttpResponse.json([
      { id: 1, content: 'Hello', read: true, sender: 'user1@example.com' },
    ])
  }),

  http.post(`${API_BASE}/notifications/messages/{recipientId}`, async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: 1,
      ...body,
      version: 1,
    }, { status: 201 })
  }),

  // --- Image Upload ---
  http.post(`${API_BASE}/images`, async ({ request }) => {
    return HttpResponse.json({
      name: 'test.jpg',
      url: '/api/images/test.jpg',
    }, { status: 201 })
  }),

  http.get(`${API_BASE}/images/{name}`, ({ params }) => {
    return new HttpResponse('image-data', {
      status: 200,
      headers: { 'Content-Type': 'image/jpeg' },
    })
  }),
]