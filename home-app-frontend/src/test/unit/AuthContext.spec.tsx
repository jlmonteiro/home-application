import { waitFor, renderHook } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../context/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'
import type { ReactNode } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
})

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>{children}</AuthProvider>
  </QueryClientProvider>
)

describe('Authentication Context', () => {
  beforeEach(() => {
    queryClient.clear()
    vi.clearAllMocks()
  })

  describe('When the application loads', () => {
    it('should fetch the current user and provide it to components', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper })

      // Initially loading
      expect(result.current.isLoading).toBe(true)

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.user).toMatchObject({
        email: 'test@example.com',
        firstName: 'Test',
      })
      expect(result.current.isError).toBe(false)
    })

    it('should handle unauthenticated users by setting user to null', async () => {
      server.use(
        http.get('/api/user/me', () => {
          return new HttpResponse(null, { status: 401 })
        }),
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      expect(result.current.user).toBeNull()
      expect(result.current.isError).toBe(false)
    })
  })

  describe('When logging out', () => {
    it('should call the logout API, clear query data and redirect to login', async () => {
      // Mock window.location
      const originalLocation = window.location
      const locationMock = new URL('http://localhost/')
      vi.stubGlobal('location', {
        ...originalLocation,
        href: locationMock.href,
      })

      let logoutCalled = false
      server.use(
        http.post('/logout', () => {
          logoutCalled = true
          return new HttpResponse(null, { status: 200 })
        }),
      )

      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => expect(result.current.isLoading).toBe(false))

      await result.current.logout()

      expect(logoutCalled).toBe(true)
      expect(window.location.href).toBe('/login')

      // Check if query data was cleared
      expect(queryClient.getQueryData(['user'])).toBeNull()

      vi.unstubAllGlobals()
    })
  })

  describe('When useAuth is used outside AuthProvider', () => {
    it('should throw an error', () => {
      // Prevent console.error clutter from expected error
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => renderHook(() => useAuth())).toThrow(
        'useAuth must be used within an AuthProvider',
      )
      
      spy.mockRestore()
    })
  })
})
