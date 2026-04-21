import { createContext, useContext, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { UserProfile } from '../types/user'
import { fetchCurrentUser, logout as apiLogout } from '../services/api'
import { ErrorPage } from '../pages/errors/ErrorPage'

interface AuthContextType {
  user: UserProfile | null | undefined
  isLoading: boolean
  isError: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['user'],
    queryFn: fetchCurrentUser,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnMount: 'always',
  })

  // console.log('AuthContext State:', { user, isLoading, isError })

  const logout = async () => {
    try {
      await apiLogout()
    } finally {
      queryClient.setQueryData(['user'], null)
      window.location.href = '/login'
    }
  }

  // If we have an error fetching the user and it's not a 401 (which returns null)
  // it means the backend is likely down or returned a 5xx
  if (isError) {
    return <ErrorPage type="502" onRetry={() => refetch()} />
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isError, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
