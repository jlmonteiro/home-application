import type { UserProfile } from '../types/user'

const API_BASE = '/api'

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
