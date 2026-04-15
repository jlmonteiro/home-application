import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProtectedRoute } from '../../components/ProtectedRoute'
import { useAuth } from '../../context/AuthContext'
import { MemoryRouter, Navigate } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import type { UserProfile } from '../../types/user'

// Mock useAuth
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

// Mock react-router-dom Navigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: vi.fn(() => <div data-testid="navigate-to-login" />),
  }
})

describe('Route Protection', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderProtected = (children: React.ReactNode) =>
    render(
      <MantineProvider>
        <MemoryRouter>
          <ProtectedRoute>{children}</ProtectedRoute>
        </MemoryRouter>
      </MantineProvider>,
    )

  describe('When the authentication state is loading', () => {
    it('should display the loading overlay and hide content', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isLoading: true,
        isError: false,
        logout: vi.fn(),
      })

      renderProtected(<div data-testid="protected-content">Secret Content</div>)

      expect(screen.getByTestId('auth-loading-overlay')).toBeInTheDocument()
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
    })
  })

  describe('When the user is not authenticated', () => {
    it('should redirect to the login page', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isLoading: false,
        isError: false,
        logout: vi.fn(),
      })

      renderProtected(<div data-testid="protected-content">Secret Content</div>)

      expect(screen.getByTestId('navigate-to-login')).toBeInTheDocument()
      expect(Navigate).toHaveBeenCalledWith(
        expect.objectContaining({ to: '/login', replace: true }),
        undefined,
      )
    })
  })

  describe('When there is an authentication error', () => {
    it('should redirect to the login page', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isLoading: false,
        isError: true,
        logout: vi.fn(),
      })

      renderProtected(<div data-testid="protected-content">Secret Content</div>)

      expect(screen.getByTestId('navigate-to-login')).toBeInTheDocument()
    })
  })

  describe('When the user is authenticated', () => {
    it('should render the protected children', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: { id: 1, firstName: 'John' } as unknown as UserProfile,
        isLoading: false,
        isError: false,
        logout: vi.fn(),
      })

      renderProtected(<div data-testid="protected-content">Secret Content</div>)

      expect(screen.getByTestId('protected-content')).toBeInTheDocument()
      expect(screen.getByText('Secret Content')).toBeInTheDocument()
      expect(screen.queryByTestId('navigate-to-login')).not.toBeInTheDocument()
    })
  })
})
