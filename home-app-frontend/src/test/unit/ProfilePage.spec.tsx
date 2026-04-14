import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ProfilePage } from '../../pages/user/ProfilePage'
import { useAuth } from '../../context/AuthContext'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { notifications } from '@mantine/notifications'
import type { UserProfile } from '../../types/user'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@mantine/notifications', () => ({
  notifications: { show: vi.fn() },
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

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } )

describe('Profile Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser as unknown as UserProfile,
      isLoading: false,
      isError: false,
      logout: vi.fn(),
    })
  })

  const renderProfilePage = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <ProfilePage />
        </MantineProvider>
      </QueryClientProvider>,
    )

  it('pre-fills form with user data from context', async () => {
    renderProfilePage()

    expect(screen.getByLabelText(/First Name/i)).toHaveValue('John')
    expect(screen.getByLabelText(/Last Name/i)).toHaveValue('Doe')
    expect(screen.getByLabelText(/Email/i)).toHaveValue('john@example.com')

    await waitFor(() => {
      expect(screen.getByDisplayValue('January 1, 1990')).toBeInTheDocument()
    })
  })

  it('calls update API and shows success notification', async () => {
    let capturePayload: any = null
    server.use(
      http.put('/api/user/me', async ({ request }) => {
        capturePayload = await request.json()
        return HttpResponse.json({ ...mockUser, ...capturePayload })
      }),
    )

    renderProfilePage()

    const phoneInput = screen.getByLabelText(/Mobile Phone/i)
    fireEvent.change(phoneInput, { target: { value: '+351912345678' } })

    const saveButton = screen.getByRole('button', { name: /Save Changes/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(capturePayload).toMatchObject({ mobilePhone: '+351912345678' })
      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Profile Updated', color: 'green' }),
      )
    })
  })

  it('shows validation error for invalid phone', async () => {
    renderProfilePage()

    const phoneInput = screen.getByLabelText(/Mobile Phone/i)
    fireEvent.change(phoneInput, { target: { value: 'invalid-phone' } })

    const saveButton = screen.getByRole('button', { name: /Save Changes/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/Mobile phone must be a valid phone number/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid Facebook URL', async () => {
    renderProfilePage()

    const fbInput = screen.getByLabelText(/Facebook/i)
    fireEvent.change(fbInput, { target: { value: 'not-a-url' } })

    const saveButton = screen.getByRole('button', { name: /Save Changes/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(screen.getByText(/Facebook must be a valid Facebook URL/i)).toBeInTheDocument()
    })
  })

  it('shows photo upload section', async () => {
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByText(/Photo/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Upload/i })).toBeInTheDocument()
    })
  })

  it('displays user initials when no photo', async () => {
    const userWithoutPhoto = { ...mockUser, photo: null }
    vi.mocked(useAuth).mockReturnValue({
      user: userWithoutPhoto as unknown as UserProfile,
      isLoading: false,
      isError: false,
      logout: vi.fn(),
    })

    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByText('JD')).toBeInTheDocument()
    })
  })

  it('shows social link inputs', async () => {
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByLabelText(/Facebook/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Instagram/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/LinkedIn/i)).toBeInTheDocument()
    })
  })

  it('shows contact info section when phone exists', async () => {
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByText(/Contact Info/i)).toBeInTheDocument()
    })
  })

  it('displays family role badge', async () => {
    renderProfilePage()

    await waitFor(() => {
      expect(screen.getByText('Adult')).toBeInTheDocument()
    })
  })

  it('shows error notification on API failure', async () => {
    server.use(
      http.put('/api/user/me', () => {
        return HttpResponse.json({ detail: 'Update failed' }, { status: 500 })
      }),
    )

    renderProfilePage()

    const phoneInput = screen.getByLabelText(/Mobile Phone/i)
    fireEvent.change(phoneInput, { target: { value: '+351912345678' } })

    const saveButton = screen.getByRole('button', { name: /Save Changes/i })
    fireEvent.click(saveButton)

    await waitFor(() => {
      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'red' }),
      )
    })
  })
})