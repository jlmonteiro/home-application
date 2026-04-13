import { notifications } from '@mantine/notifications'
import type { UserProfile } from '../types/user'

const API_BASE = '/api'

export interface ProblemDetail {
  type: string
  title: string
  status: number
  detail: string
  instance?: string
  errors?: Record<string, string>
}

function getCsrfToken(): string | null {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

/**
 * Wrapper around fetch that:
 * - Attaches the CSRF token on mutating requests
 * - Parses RFC 7807 ProblemDetail errors
 * - Shows a Mantine toast notification on failure
 */
async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const method = (options.method || 'GET').toUpperCase()
  const headers = new Headers(options.headers)

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const token = getCsrfToken()
    if (token) headers.set('X-XSRF-TOKEN', token)
  }

  const response = await apiFetch(url, { ...options, headers })

  if (!response.ok && response.status !== 401) {
    let message = `Request failed (${response.status})`
    let detail: ProblemDetail | null = null
    try {
      detail = await response.clone().json()
      if (detail?.detail) message = detail.detail
      if (detail?.errors) {
        const fieldErrors = Object.values(detail.errors).join('; ')
        message = fieldErrors || message
      }
    } catch { /* not JSON */ }

    notifications.show({
      title: detail?.title || 'Error',
      message,
      color: 'red',
      autoClose: 5000,
    })
  }

  return response
}

export interface AgeGroupConfig {
  id: number
  name: string
  minAge: number
  maxAge: number
}

export interface FamilyRole {
  id: number
  name: string
  immutable: boolean
}

// --- Shopping Module Types ---

export interface ShoppingCategory {
  id: number
  name: string
  description?: string
  icon?: string
  version: number
  _links?: {
    self: { href: string }
  }
}

export interface ShoppingItem {
  id: number
  name: string
  photo?: string
  categoryId: number
  categoryName: string
  categoryIcon: string
  version: number
  _links?: {
    self: { href: string }
  }
}

export interface ShoppingItemPriceHistory {
  id: number
  storeId: number | null
  storeName: string | null
  price: number
  recordedAt: string
}

export interface ShoppingStore {
  id: number
  name: string
  description?: string
  icon?: string
  photo?: string
  validCouponsCount?: number
  version: number
  _links?: {
    self: { href: string }
    loyaltyCards: { href: string }
    coupons: { href: string }
  }
}

export interface LoyaltyCard {
  id: number
  storeId: number
  storeName: string
  name: string
  number: string
  barcodeType: 'QR' | 'CODE_128'
  version: number
  _links?: {
    self: { href: string }
    delete: { href: string }
  }
}

export interface Coupon {
  id: number
  storeId: number
  storeName: string
  name: string
  description?: string
  value?: string
  photo?: string
  dueDate?: string
  code?: string
  barcodeType?: 'QR' | 'CODE_128'
  used: boolean
  version: number
  _links?: {
    self: { href: string }
    delete: { href: string }
  }
}

export interface ShoppingListItem {
  id: number
  itemId: number
  itemName: string
  itemPhoto: string
  categoryName: string
  categoryIcon: string
  storeId: number | null
  storeName: string | null
  quantity: number
  unit: string
  price: number | null
  previousPrice: number | null
  bought: boolean
  unavailable: boolean
  version: number
  _links?: {
    self: { href: string }
    update: { href: string }
    remove: { href: string }
  }
}

export interface ShoppingList {
  id: number
  name: string
  description?: string
  status: 'PENDING' | 'COMPLETED'
  createdBy: string
  creatorName: string
  items: ShoppingListItem[]
  createdAt: string
  completedAt: string | null
  version: number
  _links?: {
    self: { href: string }
    lists: { href: string }
  }
}

export interface PagedResponse<T> {
  _embedded: Record<string, T[]>
  page: {
    size: number
    totalElements: number
    totalPages: number
    number: number
  }
  _links: Record<string, { href: string }>
}

export interface UserPreference {
  showShoppingWidget: boolean
  showCouponsWidget: boolean
  version: number
}

// --- Auth & Profile ---

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  const response = await fetch(`${API_BASE}/user/me`, {
    headers: { Accept: 'application/hal+json' },
    redirect: 'manual',
  })

  // 0 = opaque redirect (manual mode), 401 = unauthenticated
  if (response.status === 401 || response.status === 0 || response.type === 'opaqueredirect') {
    return null
  }

  if (!response.ok) return null

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('json')) return null

  return response.json()
}

export async function updateUserProfile(
  profile: Partial<UserProfile>,
): Promise<UserProfile> {
  const response = await apiFetch(`${API_BASE}/user/me`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/hal+json',
    },
    body: JSON.stringify(profile),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(errorData.detail || 'Failed to update profile') as any
    error.status = response.status
    error.data = errorData
    throw error
  }

  return response.json()
}

export async function fetchUserPreferences(): Promise<UserPreference> {
  const response = await apiFetch(`${API_BASE}/user/preferences`)
  if (!response.ok) throw new Error('Failed to fetch user preferences')
  return response.json()
}

export async function updateUserPreferences(preferences: Partial<UserPreference>): Promise<UserPreference> {
  const response = await apiFetch(`${API_BASE}/user/preferences`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preferences),
  })
  if (!response.ok) throw new Error('Failed to update user preferences')
  return response.json()
}

// --- Settings ---

export async function fetchAgeGroups(): Promise<AgeGroupConfig[]> {
  const response = await apiFetch(`${API_BASE}/settings/age-groups`)
  if (!response.ok) throw new Error('Failed to fetch age groups')
  return response.json()
}

export async function updateAgeGroups(configs: AgeGroupConfig[]): Promise<void> {
  const response = await apiFetch(`${API_BASE}/settings/age-groups`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(configs),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Failed to update age groups')
  }
}

export async function fetchFamilyRoles(): Promise<FamilyRole[]> {
  const response = await apiFetch(`${API_BASE}/settings/roles`)
  if (!response.ok) throw new Error('Failed to fetch family roles')
  return response.json()
}

export async function createFamilyRole(role: Partial<FamilyRole>): Promise<FamilyRole> {
  const response = await apiFetch(`${API_BASE}/settings/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(role),
  })
  if (!response.ok) throw new Error('Failed to create family role')
  return response.json()
}

export async function updateFamilyRole(id: number, role: Partial<FamilyRole>): Promise<FamilyRole> {
  const response = await apiFetch(`${API_BASE}/settings/roles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(role),
  })
  if (!response.ok) throw new Error('Failed to update family role')
  return response.json()
}

export async function deleteFamilyRole(id: number): Promise<void> {
  const response = await apiFetch(`${API_BASE}/settings/roles/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Failed to delete family role')
  }
}

// --- Shopping Categories & Items API ---

export async function fetchCategories(page = 0, size = 20): Promise<PagedResponse<ShoppingCategory>> {
  const response = await apiFetch(`${API_BASE}/shopping/categories?page=${page}&size=${size}`)
  if (!response.ok) throw new Error('Failed to fetch categories')
  return response.json()
}

export async function createCategory(category: Partial<ShoppingCategory>): Promise<ShoppingCategory> {
  const response = await apiFetch(`${API_BASE}/shopping/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(errorData.detail || 'Failed to create category') as any
    error.data = errorData
    throw error
  }
  return response.json()
}

export async function updateCategory(id: number, category: Partial<ShoppingCategory>): Promise<ShoppingCategory> {
  const response = await apiFetch(`${API_BASE}/shopping/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(category),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(errorData.detail || 'Failed to update category') as any
    error.data = errorData
    throw error
  }
  return response.json()
}

export async function deleteCategory(id: number): Promise<void> {
  const response = await apiFetch(`${API_BASE}/shopping/categories/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete category')
}

export async function fetchItems(page = 0, size = 20): Promise<PagedResponse<ShoppingItem>> {
  const response = await apiFetch(`${API_BASE}/shopping/items?page=${page}&size=${size}`)
  if (!response.ok) throw new Error('Failed to fetch items')
  return response.json()
}

export async function fetchItemsByCategory(categoryId: number, page = 0, size = 20): Promise<PagedResponse<ShoppingItem>> {
  const response = await apiFetch(`${API_BASE}/shopping/categories/${categoryId}/items?page=${page}&size=${size}`)
  if (!response.ok) throw new Error('Failed to fetch items by category')
  return response.json()
}

export async function createItem(item: Partial<ShoppingItem>): Promise<ShoppingItem> {
  const response = await apiFetch(`${API_BASE}/shopping/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(errorData.detail || 'Failed to create item') as any
    error.data = errorData
    throw error
  }
  return response.json()
}

export async function updateItem(id: number, item: Partial<ShoppingItem>): Promise<ShoppingItem> {
  const response = await apiFetch(`${API_BASE}/shopping/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(errorData.detail || 'Failed to update item') as any
    error.data = errorData
    throw error
  }
  return response.json()
}

export async function deleteItem(id: number): Promise<void> {
  const response = await apiFetch(`${API_BASE}/shopping/items/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete item')
}

export async function fetchItemPriceHistory(id: number): Promise<ShoppingItemPriceHistory[]> {
  const response = await apiFetch(`${API_BASE}/shopping/items/${id}/price-history`)
  if (!response.ok) throw new Error('Failed to fetch price history')
  return response.json()
}

// --- Shopping Stores API ---

export async function fetchStores(page = 0, size = 20): Promise<PagedResponse<ShoppingStore>> {
  const response = await apiFetch(`${API_BASE}/shopping/stores?page=${page}&size=${size}`)
  if (!response.ok) throw new Error('Failed to fetch stores')
  return response.json()
}

export async function fetchStore(id: number): Promise<ShoppingStore> {
  const response = await apiFetch(`${API_BASE}/shopping/stores/${id}`)
  if (!response.ok) throw new Error('Failed to fetch store')
  return response.json()
}

export async function createStore(store: Partial<ShoppingStore>): Promise<ShoppingStore> {
  const response = await apiFetch(`${API_BASE}/shopping/stores`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(store),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(errorData.detail || 'Failed to create store') as any
    error.data = errorData
    throw error
  }
  return response.json()
}

export async function updateStore(id: number, store: Partial<ShoppingStore>): Promise<ShoppingStore> {
  const response = await apiFetch(`${API_BASE}/shopping/stores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(store),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(errorData.detail || 'Failed to update store') as any
    error.data = errorData
    throw error
  }
  return response.json()
}

export async function deleteStore(id: number): Promise<void> {
  const response = await apiFetch(`${API_BASE}/shopping/stores/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete store')
}

// --- Loyalty Cards API ---

export async function fetchLoyaltyCards(storeId: number): Promise<LoyaltyCard[]> {
  const response = await apiFetch(`${API_BASE}/shopping/stores/${storeId}/loyalty-cards`)
  if (!response.ok) throw new Error('Failed to fetch loyalty cards')
  const data = await response.json()
  return data._embedded?.loyaltyCards || []
}

export async function createLoyaltyCard(storeId: number, card: Partial<LoyaltyCard>): Promise<LoyaltyCard> {
  const response = await apiFetch(`${API_BASE}/shopping/stores/${storeId}/loyalty-cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(card),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(errorData.detail || 'Failed to create loyalty card') as any
    error.data = errorData
    throw error
  }
  return response.json()
}

export async function deleteLoyaltyCard(id: number): Promise<void> {
  const response = await apiFetch(`${API_BASE}/shopping/loyalty-cards/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete loyalty card')
}

// --- Coupons API ---

export async function fetchCoupons(storeId: number, page = 0, size = 20): Promise<PagedResponse<Coupon>> {
  const response = await apiFetch(`${API_BASE}/shopping/stores/${storeId}/coupons?page=${page}&size=${size}`)
  if (!response.ok) throw new Error('Failed to fetch coupons')
  return response.json()
}

export async function fetchExpiringCoupons(): Promise<Coupon[]> {
  const response = await apiFetch(`${API_BASE}/shopping/coupons/expiring`)
  if (!response.ok) throw new Error('Failed to fetch expiring coupons')
  const data = await response.json()
  return data._embedded?.coupons || []
}

export async function createCoupon(storeId: number, coupon: Partial<Coupon>): Promise<Coupon> {
  const response = await apiFetch(`${API_BASE}/shopping/stores/${storeId}/coupons`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(coupon),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const error = new Error(errorData.detail || 'Failed to create coupon') as any
    error.data = errorData
    throw error
  }
  return response.json()
}

export async function updateCoupon(id: number, coupon: Partial<Coupon>): Promise<Coupon> {
  const response = await apiFetch(`${API_BASE}/shopping/coupons/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(coupon),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Failed to update coupon')
  }
  return response.json()
}

export async function deleteCoupon(id: number): Promise<void> {
  const response = await apiFetch(`${API_BASE}/shopping/coupons/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete coupon')
}

// --- Shopping Lists API ---

export async function fetchLists(): Promise<ShoppingList[]> {
  const response = await apiFetch(`${API_BASE}/shopping/lists`)
  if (!response.ok) throw new Error('Failed to fetch shopping lists')
  const data = await response.json()
  return data._embedded?.lists || []
}

export async function fetchList(id: number): Promise<ShoppingList> {
  const response = await apiFetch(`${API_BASE}/shopping/lists/${id}`)
  if (!response.ok) throw new Error('Failed to fetch shopping list')
  return response.json()
}

export async function createList(list: Partial<ShoppingList>): Promise<ShoppingList> {
  const response = await apiFetch(`${API_BASE}/shopping/lists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(list),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Failed to create shopping list')
  }
  return response.json()
}

export async function updateList(id: number, list: Partial<ShoppingList>): Promise<ShoppingList> {
  const response = await apiFetch(`${API_BASE}/shopping/lists/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(list),
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Failed to update shopping list')
  }
  return response.json()
}

export async function deleteList(id: number): Promise<void> {
  const response = await apiFetch(`${API_BASE}/shopping/lists/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete shopping list')
}

export async function addItemToList(listId: number, item: Partial<ShoppingListItem>): Promise<ShoppingListItem> {
  const response = await apiFetch(`${API_BASE}/shopping/lists/${listId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
  if (!response.ok) throw new Error('Failed to add item to list')
  return response.json()
}

export async function updateListItem(itemId: number, item: Partial<ShoppingListItem>): Promise<ShoppingListItem> {
  const response = await apiFetch(`${API_BASE}/shopping/lists/items/${itemId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  })
  if (!response.ok) throw new Error('Failed to update list item')
  return response.json()
}

export async function removeListItem(itemId: number): Promise<void> {
  const response = await apiFetch(`${API_BASE}/shopping/lists/items/${itemId}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to remove item from list')
}

export async function fetchSuggestedPrice(itemId: number, storeId?: number): Promise<number | null> {
  const url = storeId 
    ? `${API_BASE}/shopping/lists/suggest-price?itemId=${itemId}&storeId=${storeId}`
    : `${API_BASE}/shopping/lists/suggest-price?itemId=${itemId}`
  const response = await apiFetch(url)
  if (!response.ok) throw new Error('Failed to fetch suggested price')
  return response.json()
}

// --- Auth ---

export async function logout(): Promise<void> {
  await apiFetch('/logout', { method: 'POST' })
}
