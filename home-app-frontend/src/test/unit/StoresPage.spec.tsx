import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { StoresPage } from '../../pages/shopping/StoresPage'
import { server } from '../mocks/server'

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <MemoryRouter initialEntries={['/shopping/stores']}>
          <StoresPage />
        </MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>,
  )
}

describe('StoresPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.confirm = vi.fn(() => true)
  })

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
          page: { size: 20, totalElements: 2, totalPages: 1, number: 0 },
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
        return HttpResponse.json({ _embedded: { stores: [] }, page: { size: 20, totalElements: 0, totalPages: 0, number: 0 } })
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/No stores found/i)).toBeInTheDocument()
    })
  })

  it('handles add store', async () => {
    server.use(
      http.get('/api/shopping/stores', () => {
        return HttpResponse.json({ _embedded: { stores: [] }, page: { size: 20, totalElements: 0, totalPages: 0, number: 0 } })
      }),
      http.post('/api/shopping/stores', async ({ request }) => {
        const body = await request.json() as any
        return HttpResponse.json({ id: 3, name: body.name, icon: body.icon, version: 1 }, { status: 201 })
      })
    )

    renderPage()

    fireEvent.click(screen.getByRole('button', { name: /Add Store/i }))

    const nameInput = await screen.findByLabelText(/Name/i)
    fireEvent.change(nameInput, { target: { value: 'Aldi' } })
    
    const submitBtn = document.querySelector('button[type="submit"]')
    fireEvent.click(submitBtn!)

    await waitFor(() => {
      expect(screen.queryByText('Create Store')).not.toBeInTheDocument()
    })
  })

  it('handles edit store', async () => {
    server.use(
      http.get('/api/shopping/stores', () => {
        return HttpResponse.json({
          _embedded: {
            stores: [{ id: 1, name: 'Tesco', icon: 'IconBuildingStore', version: 1 }],
          },
          page: { size: 20, totalElements: 1, totalPages: 1, number: 0 },
        })
      }),
      http.put('/api/shopping/stores/1', async ({ request }) => {
        const body = await request.json() as any
        return HttpResponse.json({ id: 1, name: body.name, icon: body.icon, version: 2 })
      })
    )

    renderPage()

    await waitFor(() => expect(screen.getByText('Tesco')).toBeInTheDocument())

    const editBtn = screen.getAllByRole('button').find(b => b.querySelector('.tabler-icon-edit'))
    fireEvent.click(editBtn!)

    const nameInput = await screen.findByLabelText(/Name/i)
    expect(nameInput).toHaveValue('Tesco')
    fireEvent.change(nameInput, { target: { value: 'Tesco Extra' } })

    const submitBtn = document.querySelector('button[type="submit"]')
    fireEvent.click(submitBtn!)

    await waitFor(() => {
      expect(screen.queryByText('Edit Store')).not.toBeInTheDocument()
    })
  })

  it('handles delete store', async () => {
    server.use(
      http.get('/api/shopping/stores', () => {
        return HttpResponse.json({
          _embedded: {
            stores: [{ id: 1, name: 'Tesco', icon: 'IconBuildingStore', version: 1 }],
          },
          page: { size: 20, totalElements: 1, totalPages: 1, number: 0 },
        })
      }),
      http.delete('/api/shopping/stores/1', () => {
        return new HttpResponse(null, { status: 204 })
      })
    )

    renderPage()

    await waitFor(() => expect(screen.getByText('Tesco')).toBeInTheDocument())

    const deleteBtn = screen.getAllByRole('button').find(b => b.querySelector('.tabler-icon-trash'))
    fireEvent.click(deleteBtn!)

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this store? All linked loyalty cards and coupons will be removed.')
  })
})
