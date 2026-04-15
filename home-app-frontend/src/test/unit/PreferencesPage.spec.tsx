import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { PreferencesPage } from '../../pages/settings/PreferencesPage'
import { server } from '../mocks/server'
import { notifications } from '@mantine/notifications'

vi.mock('@mantine/notifications', () => ({
  notifications: { show: vi.fn() },
}))

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

  it('handles preference updates', async () => {
    let capturedBody = null
    server.use(
      http.get('/api/user/preferences', () => {
        return HttpResponse.json({
          showShoppingWidget: true,
          showCouponsWidget: false,
        })
      }),
      http.put('/api/user/preferences', async ({ request }) => {
        capturedBody = await request.json()
        return HttpResponse.json(capturedBody)
      })
    )

    renderPage()
    await screen.findByText(/Pending Shopping Lists/i)

    const switches = screen.getAllByRole('switch')
    fireEvent.click(switches[0]) // Toggle shopping widget

    await waitFor(() => {
      expect(capturedBody).toEqual(expect.objectContaining({
        showShoppingWidget: false,
      }))
      expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ 
        message: expect.stringMatching(/updated/i) 
      }))
    })
  })

  it('handles update error', async () => {
    server.use(
      http.get('/api/user/preferences', () => {
        return HttpResponse.json({
          showShoppingWidget: true,
          showCouponsWidget: false,
        })
      }),
      http.put('/api/user/preferences', () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    renderPage()
    await screen.findByText(/Pending Shopping Lists/i)

    const switches = screen.getAllByRole('switch')
    fireEvent.click(switches[0])

    await waitFor(() => {
      expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ color: 'red' }))
    })
  })

  it('shows loading state', async () => {
    server.use(
      http.get('/api/user/preferences', () => {
        return new Promise(() => {}) // Never resolves
      }),
    )

    renderPage()
    expect(document.querySelector('.mantine-Loader-root')).toBeInTheDocument()
  })
})
