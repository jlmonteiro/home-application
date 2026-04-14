import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { PreferencesPage } from '../../pages/settings/PreferencesPage'
import { server } from '../mocks/server'

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <MemoryRouter initialEntries={['/preferences']}>
          <PreferencesPage />
        </MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>,
  )
}

describe('PreferencesPage', () => {
  it('renders preference switches', async () => {
    server.use(
      http.get('/api/user/preferences', () => {
        return HttpResponse.json({
          showShoppingWidget: true,
          showCouponsWidget: false,
        })
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/Pending Shopping Lists/i)).toBeInTheDocument()
      expect(screen.getByText(/Pending Coupons/i)).toBeInTheDocument()
    })
  })

  it('shows shopping widget switch as checked when enabled', async () => {
    server.use(
      http.get('/api/user/preferences', () => {
        return HttpResponse.json({
          showShoppingWidget: true,
          showCouponsWidget: true,
        })
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/Pending Shopping Lists/i)).toBeInTheDocument()
    })
    
    const switches = screen.getAllByRole('switch')
    expect(switches[0]).toBeChecked()
    expect(switches[1]).toBeChecked()
  })

  it('shows loading state', async () => {
    server.use(
      http.get('/api/user/preferences', () => {
        return new HttpResponse(null, { status: 200 }) // Delayed
      }),
    )

    renderPage()

    // Mantine LoadingOverlay/Loader might not have a specific role, checking by class or visibility
    expect(document.querySelector('.mantine-Loader-root')).toBeInTheDocument()
  })
})
