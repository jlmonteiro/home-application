import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { ShoppingItemsPage } from '../../pages/shopping/ShoppingItemsPage'

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
      <MantineProvider>
        <MemoryRouter initialEntries={['/shopping/items']}>
          <ShoppingItemsPage />
        </MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>,
  )
}

describe('ShoppingItemsPage', () => {
  it('renders item list', async () => {
    server.use(
      http.get('/api/shopping/items', () => {
        return HttpResponse.json({
          _embedded: {
            items: [
              { id: 1, name: 'Milk', category: { id: 1, name: 'Dairy' }, version: 1 },
              { id: 2, name: 'Eggs', category: { id: 1, name: 'Dairy' }, version: 1 },
            ],
          },
        })
      }),
      http.get('/api/shopping/categories', () => {
        return HttpResponse.json({
          _embedded: {
            categories: [
              { id: 1, name: 'Dairy', icon: 'IconMilk', version: 1 },
            ],
          },
        })
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Milk')).toBeInTheDocument()
      expect(screen.getByText('Eggs')).toBeInTheDocument()
    })
  })

  it('shows empty state when no items', async () => {
    server.use(
      http.get('/api/shopping/items', () => {
        return HttpResponse.json({ _embedded: { items: [] } })
      }),
      http.get('/api/shopping/categories', () => {
        return HttpResponse.json({ _embedded: { categories: [] } })
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/No items found/i)).toBeInTheDocument()
    })
  })

  it('shows add item button', async () => {
    server.use(
      http.get('/api/shopping/items', () => {
        return HttpResponse.json({ _embedded: { items: [] } })
      }),
      http.get('/api/shopping/categories', () => {
        return HttpResponse.json({ _embedded: { categories: [] } })
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Item/i })).toBeInTheDocument()
    })
  })
})