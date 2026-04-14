import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { ShoppingCategoriesPage } from '../../pages/shopping/ShoppingCategoriesPage'

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
      <MemoryRouter initialEntries={['/shopping/categories']}>
        <ShoppingCategoriesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ShoppingCategoriesPage', () => {
  it('renders category list', async () => {
    server.use(
      http.get('/api/shopping/categories', () => {
        return HttpResponse.json({
          _embedded: {
            categories: [
              { id: 1, name: 'Fruits', icon: 'IconApple', version: 1 },
              { id: 2, name: 'Dairy', icon: 'IconMilk', version: 1 },
            ],
          },
        })
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Fruits')).toBeInTheDocument()
      expect(screen.getByText('Dairy')).toBeInTheDocument()
    })
  })

  it('shows empty state when no categories', async () => {
    server.use(
      http.get('/api/shopping/categories', () => {
        return HttpResponse.json({ _embedded: { categories: [] } })
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/No categories found/i)).toBeInTheDocument()
    })
  })

  it('opens create category modal', async () => {
    server.use(
      http.get('/api/shopping/categories', () => {
        return HttpResponse.json({ _embedded: { categories: [] } })
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Category/i })).toBeInTheDocument()
    })
  })

  it('shows error on fetch failure', async () => {
    server.use(
      http.get('/api/shopping/categories', () => {
        return new HttpResponse(null, { status: 500 })
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeInTheDocument()
    })
  })
})