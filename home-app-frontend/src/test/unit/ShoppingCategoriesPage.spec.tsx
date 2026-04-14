import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { ShoppingCategoriesPage } from '../../pages/shopping/ShoppingCategoriesPage'
import { server } from '../mocks/server'

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <MemoryRouter initialEntries={['/shopping/categories']}>
          <ShoppingCategoriesPage />
        </MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>,
  )
}

describe('ShoppingCategoriesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.confirm = vi.fn(() => true)
  })

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
          page: { size: 20, totalElements: 2, totalPages: 1, number: 0 },
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
        return HttpResponse.json({ _embedded: { categories: [] }, page: { size: 20, totalElements: 0, totalPages: 0, number: 0 } })
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/No categories found/i)).toBeInTheDocument()
    })
  })

  it('handles add category', async () => {
    server.use(
      http.get('/api/shopping/categories', () => {
        return HttpResponse.json({ _embedded: { categories: [] }, page: { size: 20, totalElements: 0, totalPages: 0, number: 0 } })
      }),
      http.post('/api/shopping/categories', async ({ request }) => {
        const body = await request.json() as any
        return HttpResponse.json({ id: 3, name: body.name, icon: body.icon, version: 1 }, { status: 201 })
      })
    )

    renderPage()

    fireEvent.click(screen.getByRole('button', { name: /Add Category/i }))

    const nameInput = await screen.findByLabelText(/Name/i)
    fireEvent.change(nameInput, { target: { value: 'Bakery' } })
    
    const submitBtn = document.querySelector('button[type="submit"]')
    fireEvent.click(submitBtn!)

    await waitFor(() => {
      expect(screen.queryByText('Create Category')).not.toBeInTheDocument()
    })
  })

  it('handles edit category', async () => {
    server.use(
      http.get('/api/shopping/categories', () => {
        return HttpResponse.json({
          _embedded: {
            categories: [{ id: 1, name: 'Fruits', icon: 'IconApple', version: 1 }],
          },
          page: { size: 20, totalElements: 1, totalPages: 1, number: 0 },
        })
      }),
      http.put('/api/shopping/categories/1', async ({ request }) => {
        const body = await request.json() as any
        return HttpResponse.json({ id: 1, name: body.name, icon: body.icon, version: 2 })
      })
    )

    renderPage()

    await waitFor(() => expect(screen.getByText('Fruits')).toBeInTheDocument())

    const editBtn = screen.getAllByRole('button').find(b => b.querySelector('.tabler-icon-edit'))
    fireEvent.click(editBtn!)

    const nameInput = await screen.findByLabelText(/Name/i)
    expect(nameInput).toHaveValue('Fruits')
    fireEvent.change(nameInput, { target: { value: 'Fresh Fruits' } })

    const submitBtn = document.querySelector('button[type="submit"]')
    fireEvent.click(submitBtn!)

    await waitFor(() => {
      expect(screen.queryByText('Edit Category')).not.toBeInTheDocument()
    })
  })

  it('handles delete category', async () => {
    server.use(
      http.get('/api/shopping/categories', () => {
        return HttpResponse.json({
          _embedded: {
            categories: [{ id: 1, name: 'Fruits', icon: 'IconApple', version: 1 }],
          },
          page: { size: 20, totalElements: 1, totalPages: 1, number: 0 },
        })
      }),
      http.delete('/api/shopping/categories/1', () => {
        return new HttpResponse(null, { status: 204 })
      })
    )

    renderPage()

    await waitFor(() => expect(screen.getByText('Fruits')).toBeInTheDocument())

    const deleteBtn = screen.getAllByRole('button').find(b => b.querySelector('.tabler-icon-trash'))
    fireEvent.click(deleteBtn!)

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this category? This will also delete all items in it.')
  })
})
