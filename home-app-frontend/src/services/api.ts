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
