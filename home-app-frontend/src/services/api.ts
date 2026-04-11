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
  version: number
  _links?: {
    self: { href: string }
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

// --- Auth & Profile ---

export async function fetchCurrentUser(): Promise<UserProfile | null> {
  const response = await fetch(`${API_BASE}/user/me`, {
    headers: {
      Accept: 'application/hal+json',
    },
  })

  if (response.status === 401) {
    return null
  }

  if (!response.ok) {
    throw new Error('Failed to fetch user profile')
  }

  return response.json()
}

export async function updateUserProfile(
  profile: Partial<UserProfile>,
): Promise<UserProfile> {
  const response = await fetch(`${API_BASE}/user/me`, {
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

// --- Settings ---

export async function fetchAgeGroups(): Promise<AgeGroupConfig[]> {
  const response = await fetch(`${API_BASE}/settings/age-groups`)
  if (!response.ok) throw new Error('Failed to fetch age groups')
  return response.json()
}

export async function updateAgeGroups(configs: AgeGroupConfig[]): Promise<void> {
  const response = await fetch(`${API_BASE}/settings/age-groups`, {
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
  const response = await fetch(`${API_BASE}/settings/roles`)
  if (!response.ok) throw new Error('Failed to fetch family roles')
  return response.json()
}

export async function createFamilyRole(role: Partial<FamilyRole>): Promise<FamilyRole> {
  const response = await fetch(`${API_BASE}/settings/roles`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(role),
  })
  if (!response.ok) throw new Error('Failed to create family role')
  return response.json()
}

export async function updateFamilyRole(id: number, role: Partial<FamilyRole>): Promise<FamilyRole> {
  const response = await fetch(`${API_BASE}/settings/roles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(role),
  })
  if (!response.ok) throw new Error('Failed to update family role')
  return response.json()
}

export async function deleteFamilyRole(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/settings/roles/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.detail || 'Failed to delete family role')
  }
}

// --- Shopping API ---

export async function fetchCategories(page = 0, size = 20): Promise<PagedResponse<ShoppingCategory>> {
  const response = await fetch(`${API_BASE}/shopping/categories?page=${page}&size=${size}`)
  if (!response.ok) throw new Error('Failed to fetch categories')
  return response.json()
}

export async function createCategory(category: Partial<ShoppingCategory>): Promise<ShoppingCategory> {
  const response = await fetch(`${API_BASE}/shopping/categories`, {
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
  const response = await fetch(`${API_BASE}/shopping/categories/${id}`, {
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
  const response = await fetch(`${API_BASE}/shopping/categories/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete category')
}

export async function fetchItems(page = 0, size = 20): Promise<PagedResponse<ShoppingItem>> {
  const response = await fetch(`${API_BASE}/shopping/items?page=${page}&size=${size}`)
  if (!response.ok) throw new Error('Failed to fetch items')
  return response.json()
}

export async function fetchItemsByCategory(categoryId: number, page = 0, size = 20): Promise<PagedResponse<ShoppingItem>> {
  const response = await fetch(`${API_BASE}/shopping/categories/${categoryId}/items?page=${page}&size=${size}`)
  if (!response.ok) throw new Error('Failed to fetch items by category')
  return response.json()
}

export async function createItem(item: Partial<ShoppingItem>): Promise<ShoppingItem> {
  const response = await fetch(`${API_BASE}/shopping/items`, {
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
  const response = await fetch(`${API_BASE}/shopping/items/${id}`, {
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
  const response = await fetch(`${API_BASE}/shopping/items/${id}`, {
    method: 'DELETE',
  })
  if (!response.ok) throw new Error('Failed to delete item')
}

// --- Auth ---

export async function logout(): Promise<void> {
  const response = await fetch('/logout', {
    method: 'GET',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
    },
  })

  if (!response.ok && response.status !== 401) {
    throw new Error('Logout failed')
  }
}
