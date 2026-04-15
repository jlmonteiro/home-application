import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { SettingsPage } from '../../pages/settings/SettingsPage'
import { server } from '../mocks/server'

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <MemoryRouter initialEntries={['/settings']}>
          <SettingsPage />
        </MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>,
  )
}

describe('SettingsPage', () => {
  it('renders page title and sections', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Household Settings')).toBeInTheDocument()
      expect(screen.getByText('Age Group Ranges')).toBeInTheDocument()
      expect(screen.getByText('Family Roles')).toBeInTheDocument()
    })
  })

  it('shows add family role button', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Custom Role/i })).toBeInTheDocument()
    })
  })

  it('shows save button for age groups', async () => {
    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Ranges/i })).toBeInTheDocument()
    })
  })

  it('shows loading state for save button when pending', async () => {
    server.use(
      http.put('/api/settings/age-groups', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return HttpResponse.json({ success: true })
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Ranges/i })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole('button', { name: /Save Ranges/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Ranges/i })).toBeDisabled()
    })
  })
})
