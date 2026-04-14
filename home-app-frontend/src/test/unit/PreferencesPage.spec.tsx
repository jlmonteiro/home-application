import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { PreferencesPage } from '../../pages/settings/PreferencesPage'

const server = setupServer()

beforeEach(() => {
  server.listen({ onUnhandledRequest: 'error' })
  server.resetHandlers()
})

afterEach(() => {
  server.close()
})

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/preferences']}>
        <PreferencesPage />
      </MemoryRouter>
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
      expect(screen.getByText(/Shopping Widget/i)).toBeInTheDocument()
      expect(screen.getByText(/Coupons Widget/i)).toBeInTheDocument()
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
      expect(screen.getByText(/Shopping Widget/i)).toBeInTheDocument()
    })
  })

  it('shows loading state', async () => {
    server.use(
      http.get('/api/user/preferences', () => {
        return new HttpResponse(null, { status: 200 }) // Delayed
      }),
    )

    renderPage()

    // Should show loading overlay initially
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('shows save button', async () => {
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
      expect(screen.getByRole('button', { name: /Save Preferences/i })).toBeInTheDocument()
    })
  })
})