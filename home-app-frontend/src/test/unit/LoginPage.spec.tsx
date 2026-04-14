import { render, screen, fireEvent } from '@testing-library/react'
import { LoginPage } from '../../pages/auth/LoginPage'
import { useAuth } from '../../context/AuthContext'
import { MemoryRouter, Navigate } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MantineProvider } from '@mantine/core'
import type { UserProfile } from '../../types/user'

// Mock the AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

// Mock react-router-dom Navigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: vi.fn(() => <div data-testid="navigate" />),
  }
})

describe('Given the LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('When the user is not authenticated', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isLoading: false,
        isError: false,
        logout: vi.fn(),
      })
    })

    it('Then it should render the login button', () => {
      render(
        <MantineProvider>
          <MemoryRouter>
            <LoginPage />
          </MemoryRouter>
        </MantineProvider>,
      )

      expect(screen.getByText(/Login with Google/i)).toBeInTheDocument()
      expect(screen.getByText(/Home App/i)).toBeInTheDocument()
    })

    it('Then clicking the login button should redirect to the OAuth2 endpoint', () => {
      // Mock window.location.href
      const originalLocation = window.location
      const locationMock = new URL('http://localhost:5173')
      vi.stubGlobal('location', {
        ...originalLocation,
        assign: vi.fn(),
        replace: vi.fn(),
        href: locationMock.href,
      })

      render(
        <MantineProvider>
          <MemoryRouter>
            <LoginPage />
          </MemoryRouter>
        </MantineProvider>,
      )

      fireEvent.click(screen.getByText(/Login with Google/i))

      expect(window.location.href).toBe('/oauth2/authorization/google')

      // Restore window.location
      vi.unstubAllGlobals()
    })
  })

  describe('When the user is already authenticated', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        user: { id: 1, firstName: 'John', lastName: 'Doe' } as unknown as UserProfile,
        isLoading: false,
        isError: false,
        logout: vi.fn(),
      })
    })

    it('Then it should redirect to the home page', () => {
      render(
        <MantineProvider>
          <MemoryRouter>
            <LoginPage />
          </MemoryRouter>
        </MantineProvider>,
      )

      expect(screen.getByTestId('navigate')).toBeInTheDocument()
      expect(Navigate).toHaveBeenCalledWith(
        expect.objectContaining({ to: '/', replace: true }),
        undefined,
      )
    })
  })
})
