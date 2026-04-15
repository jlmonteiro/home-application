import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProfilePage } from '../../pages/user/ProfilePage'
import { useAuth } from '../../context/AuthContext'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as api from '../../services/api'
import { notifications } from '@mantine/notifications'
import type { UserProfile } from '../../types/user'
import type { FamilyRole } from '../../services/api'

// Mock dependencies
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('../../services/api', () => ({
  updateUserProfile: vi.fn(),
  fetchFamilyRoles: vi.fn(),
}))

vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}))

const mockUser = {
  id: 1,
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  ageGroupName: 'Adult',
  birthdate: '1990-01-01',
  familyRoleId: 1,
}

const mockRoles = [
  { id: 1, name: 'Parent', immutable: true },
  { id: 2, name: 'Child', immutable: false },
]

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
})

describe('Given the ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser as unknown as UserProfile,
      isLoading: false,
      isError: false,
      logout: vi.fn(),
    })
    vi.mocked(api.fetchFamilyRoles).mockResolvedValue(mockRoles as unknown as FamilyRole[])
  })

  const renderProfilePage = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <ProfilePage />
        </MantineProvider>
      </QueryClientProvider>,
    )

  describe('When it is rendered', () => {
    it('Then it should pre-fill the form with user data', async () => {
      renderProfilePage()

      expect(screen.getByLabelText(/First Name/i)).toHaveValue('John')
      expect(screen.getByLabelText(/Last Name/i)).toHaveValue('Doe')
      expect(screen.getByLabelText(/Email/i)).toHaveValue('john@example.com')

      // Check Birthdate - DateInput can be tricky, but we can look for the value
      await waitFor(() => {
        expect(screen.getByDisplayValue('January 1, 1990')).toBeInTheDocument()
      })
    })
  })

  describe('When the user updates their profile with valid data', () => {
    it('Then it should call the update service and show a success notification', async () => {
      vi.mocked(api.updateUserProfile).mockResolvedValue({
        ...mockUser,
        mobilePhone: '+351912345678',
      } as unknown as UserProfile)
      renderProfilePage()

      const phoneInput = screen.getByLabelText(/Mobile Phone/i)
      fireEvent.change(phoneInput, { target: { value: '+351912345678' } })

      const saveButton = screen.getByRole('button', { name: /Save Changes/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(api.updateUserProfile).toHaveBeenCalledWith(
          expect.objectContaining({
            mobilePhone: '+351912345678',
          }),
          expect.anything(),
        )
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            title: 'Profile Updated',
            color: 'green',
          }),
        )
      })
    })
  })

  describe('When the user enters an invalid phone number', () => {
    it('Then it should display a validation error', async () => {
      renderProfilePage()

      const phoneInput = screen.getByLabelText(/Mobile Phone/i)
      fireEvent.change(phoneInput, { target: { value: 'invalid-phone' } })

      const saveButton = screen.getByRole('button', { name: /Save Changes/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/Mobile phone must be a valid phone number/i)).toBeInTheDocument()
        expect(api.updateUserProfile).not.toHaveBeenCalled()
      })
    })
  })

  describe('When the user enters an invalid social URL', () => {
    it('Then it should display a validation error for Facebook', async () => {
      renderProfilePage()

      const fbInput = screen.getByLabelText(/Facebook/i)
      fireEvent.change(fbInput, { target: { value: 'not-a-url' } })

      const saveButton = screen.getByRole('button', { name: /Save Changes/i })
      fireEvent.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/Facebook must be a valid Facebook URL/i)).toBeInTheDocument()
      })
    })
  })
})
