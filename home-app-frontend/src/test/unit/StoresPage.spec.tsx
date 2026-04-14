import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { StoresPage } from '../../pages/shopping/StoresPage'

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
      <MemoryRouter initialEntries={['/shopping/stores']}>
        <StoresPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('StoresPage', () => {
  it('renders store list', async () => {
    server.use(
      http.get('/api/shopping/stores', () => {
        return HttpResponse.json({
          _embedded: {
            stores: [
              { id: 1, name: 'Tesco', icon: 'IconBuildingStore', version: 1 },
              { id: 2, name: 'Lidl', icon: 'IconBuildingStore', version: 1 },
            ],
          },
        })
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Tesco')).toBeInTheDocument()
      expect(screen.getByText('Lidl')).toBeInTheDocument()
    })
  })

  it('shows empty state when no stores', async () => {
    server.use(
      http.get('/api/shopping/stores', () => {
        return HttpResponse.json({ _embedded: { stores: [] } })
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/No stores found/i)).toBeInTheDocument()
    })
  })

  it('shows add store button', async () => {
    server.use(
      http.get('/api/shopping/stores', () => {
        return HttpResponse.json({ _embedded: { stores: [] } })
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Store/i })).toBeInTheDocument()
    })
  })

  it('navigates to store details on click', async () => {
    server.use(
      http.get('/api/shopping/stores', () => {
        return HttpResponse.json({
          _embedded: {
            stores: [{ id: 1, name: 'Tesco', icon: 'IconBuildingStore', version: 1 }],
          },
        })
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Tesco')).toBeInTheDocument()
    })
  })
})