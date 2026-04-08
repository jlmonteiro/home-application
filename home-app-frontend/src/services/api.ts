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
