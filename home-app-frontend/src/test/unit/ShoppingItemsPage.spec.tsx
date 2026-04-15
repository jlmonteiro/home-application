import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { ShoppingItemsPage } from '../../pages/shopping/ShoppingItemsPage'
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
        <MemoryRouter initialEntries={['/shopping/items']}>
          <ShoppingItemsPage />
        </MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>,
  )
}

describe('ShoppingItemsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.confirm = vi.fn(() => true)
  })

  it('renders item list and handles local search', async () => {
    server.use(
      http.get('/api/shopping/items', () => {
        return HttpResponse.json({
          _embedded: {
            items: [
              { id: 1, name: 'Milk', category: { id: 1, name: 'Dairy' }, version: 1 },
              { id: 2, name: 'Bread', category: { id: 2, name: 'Bakery' }, version: 1 },
            ],
          },
          page: { size: 20, totalElements: 2, totalPages: 1, number: 0 },
        })
      }),
      http.get('/api/shopping/categories', () => {
        return HttpResponse.json({
          _embedded: { categories: [{ id: 1, name: 'Dairy', icon: 'IconMilk' }] },
          page: { size: 20, totalElements: 1, totalPages: 1, number: 0 },
        })
      }),
    )

    renderPage()
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument())
    expect(screen.getByText('Bread')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText(/Search items/i)
    fireEvent.change(searchInput, { target: { value: 'Milk' } })

    expect(screen.getByText('Milk')).toBeInTheDocument()
    expect(screen.queryByText('Bread')).not.toBeInTheDocument()
  })

  it('handles empty state', async () => {
    server.use(
      http.get('/api/shopping/items', () => {
        return HttpResponse.json({ _embedded: { items: [] }, page: { size: 20, totalElements: 0, totalPages: 0, number: 0 } })
      }),
      http.get('/api/shopping/categories', () => HttpResponse.json({ _embedded: { categories: [] } })),
    )

    renderPage()
    await waitFor(() => expect(screen.getByText('No items found')).toBeInTheDocument())
  })

  it('shows price history modal', async () => {
    server.use(
      http.get('/api/shopping/items', () => HttpResponse.json({
        _embedded: { items: [{ id: 1, name: 'Milk', category: { id: 1, name: 'Dairy' }, version: 1 }] },
        page: { size: 20, totalElements: 1, totalPages: 1, number: 0 },
      })),
      http.get('/api/shopping/items/1/price-history', () => HttpResponse.json([
        { id: 1, price: 1.5, recordedAt: new Date().toISOString(), storeName: 'SuperMart' }
      ])),
      http.get('/api/shopping/categories', () => HttpResponse.json({ _embedded: { categories: [] } })),
    )

    renderPage()
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument())

    fireEvent.click(screen.getByTitle('Price History'))
    
    expect(await screen.findByText(/Price History: Milk/i)).toBeInTheDocument()
    expect(screen.getByText('€1.50')).toBeInTheDocument()
    expect(screen.getByText('SuperMart')).toBeInTheDocument()
  })

  it('handles add item with photo upload and removal', async () => {
    server.use(
      http.get('/api/shopping/items', () => {
        return HttpResponse.json({ _embedded: { items: [] }, page: { size: 20, totalElements: 0, totalPages: 0, number: 0 } })
      }),
      http.get('/api/shopping/categories', () => {
        return HttpResponse.json({
          _embedded: { categories: [{ id: 1, name: 'Dairy', icon: 'IconMilk' }] },
          page: { size: 20, totalElements: 1, totalPages: 1, number: 0 },
        })
      }),
      http.post('/api/shopping/items', async ({ request }) => {
        const body = await request.json() as any
        return HttpResponse.json({ id: 3, ...body }, { status: 201 })
      })
    )

    renderPage()
    fireEvent.click(screen.getByRole('button', { name: /Add Item/i }))

    fireEvent.change(await screen.findByLabelText(/Name/i), { target: { value: 'Eggs' } })
    
    // Select category - use placeholder
    fireEvent.click(screen.getByPlaceholderText(/Select category/i))
    fireEvent.click(await screen.findByRole('option', { name: 'Dairy' }))
    
    // Mock file upload
    const file = new File(['dummy content'], 'test.png', { type: 'image/png' })
    const fileInput = document.querySelector('input[type="file"]')!
    fireEvent.change(fileInput, { target: { files: [file] } })

    // Wait for preview and then remove
    await waitFor(() => expect(screen.getByRole('img')).toBeInTheDocument())
    fireEvent.click(screen.getByRole('button', { name: /Remove/i }))
    expect(screen.queryByRole('img')).not.toBeInTheDocument()

    const submitBtn = screen.getByRole('button', { name: /^Create Item$/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Item created successfully' }))
    })
  })

  it('handles pagination', async () => {
    let capturedPage = 0
    server.use(
      http.get('/api/shopping/items', ({ request }) => {
        const url = new URL(request.url)
        capturedPage = parseInt(url.searchParams.get('page') || '0')
        return HttpResponse.json({
          _embedded: { items: [] },
          page: { size: 20, totalElements: 40, totalPages: 2, number: capturedPage },
        })
      }),
      http.get('/api/shopping/categories', () => HttpResponse.json({ _embedded: { categories: [] }, page: { size: 20, totalElements: 0, totalPages: 0, number: 0 } })),
    )

    renderPage()
    
    // Wait for the pagination to appear by searching for button with text "2"
    const page2Btn = await screen.findByText('2')
    fireEvent.click(page2Btn)

    await waitFor(() => {
      expect(capturedPage).toBe(1)
    })
  })

  it('handles edit and delete item', async () => {
    server.use(
      http.get('/api/shopping/items', () => HttpResponse.json({
        _embedded: { items: [{ id: 1, name: 'Milk', category: { id: 1, name: 'Dairy' }, version: 1 }] },
        page: { size: 20, totalElements: 1, totalPages: 1, number: 0 },
      })),
      http.get('/api/shopping/categories', () => HttpResponse.json({
        _embedded: { categories: [{ id: 1, name: 'Dairy', icon: 'IconMilk' }] },
        page: { size: 20, totalElements: 1, totalPages: 1, number: 0 },
      })),
      http.put('/api/shopping/items/1', async ({ request }) => {
        const body = await request.json() as any
        return HttpResponse.json({ id: 1, ...body })
      }),
      http.delete('/api/shopping/items/1', () => new HttpResponse(null, { status: 204 }))
    )

    renderPage()
    await waitFor(() => expect(screen.getByText('Milk')).toBeInTheDocument())

    // Edit
    fireEvent.click(screen.getAllByRole('button').find(b => b.querySelector('.tabler-icon-edit'))!)
    fireEvent.change(await screen.findByLabelText(/Name/i), { target: { value: 'Organic Milk' } })
    fireEvent.click(screen.getByRole('button', { name: /^Save Changes$/i }))
    await waitFor(() => {
      expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Item updated successfully' }))
    })

    // Delete
    fireEvent.click(screen.getAllByRole('button').find(b => b.querySelector('.tabler-icon-trash'))!)
    expect(window.confirm).toHaveBeenCalled()
    await waitFor(() => {
      expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Item deleted successfully' }))
    })
  })
})
