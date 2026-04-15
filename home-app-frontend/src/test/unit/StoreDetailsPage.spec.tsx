import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { notifications } from '@mantine/notifications'
import { StoreDetailsPage } from '../../pages/shopping/StoreDetailsPage'
import { server } from '../mocks/server'

vi.mock('@mantine/notifications', () => ({
  notifications: { show: vi.fn() },
}))

const renderPage = (storeId: number) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <MemoryRouter initialEntries={[`/shopping/stores/${storeId}`]}>
          <Routes>
            <Route path="/shopping/stores/:id" element={<StoreDetailsPage />} />
          </Routes>
        </MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>,
  )
}

describe('StoreDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.confirm = vi.fn(() => true)
  })

  it('renders store details and tabs', async () => {
    server.use(
      http.get('/api/shopping/stores/1', () => HttpResponse.json({ id: 1, name: 'Tesco', description: 'Big store', version: 1 })),
      http.get('/api/shopping/stores/1/loyalty-cards', () => HttpResponse.json({ _embedded: { loyaltyCards: [{ id: 1, name: 'Tesco Clubcard', barcode: { code: '12345', type: 'CODE_128' } }] } })),
      http.get('/api/shopping/stores/1/coupons', () => HttpResponse.json({ _embedded: { coupons: [] }, page: { size: 20, totalElements: 0, totalPages: 0, number: 0 } }))
    )

    renderPage(1)

    await waitFor(() => {
      expect(screen.getByText('Tesco')).toBeInTheDocument()
      expect(screen.getByText('Big store')).toBeInTheDocument()
      expect(screen.getByText(/Loyalty Cards \(1\)/i)).toBeInTheDocument()
      expect(screen.getByText('Tesco Clubcard')).toBeInTheDocument()
    })
  })

  it('handles add loyalty card and error handling', async () => {
    let mockError = false
    server.use(
      http.get('/api/shopping/stores/1', () => HttpResponse.json({ id: 1, name: 'Tesco', version: 1 })),
      http.get('/api/shopping/stores/1/loyalty-cards', () => HttpResponse.json({ _embedded: { loyaltyCards: [] } })),
      http.get('/api/shopping/stores/1/coupons', () => HttpResponse.json({ _embedded: { coupons: [] }, page: { size: 20, totalElements: 0, totalPages: 0, number: 0 } })),
      http.post('/api/shopping/stores/1/loyalty-cards', async ({ request }) => {
        if (mockError) return HttpResponse.json({ detail: 'Error adding card' }, { status: 400 })
        const body = await request.json() as any
        return HttpResponse.json({ id: 2, name: body.name, barcode: body.barcode }, { status: 201 })
      })
    )

    renderPage(1)
    await waitFor(() => expect(screen.getByText('Tesco')).toBeInTheDocument())

    fireEvent.click(screen.getByRole('button', { name: /Add Card/i }))
    const nameInput = await screen.findByLabelText(/Card Name/i)
    fireEvent.change(nameInput, { target: { value: 'My Card' } })
    fireEvent.change(screen.getByLabelText(/Card Number/i), { target: { value: '98765' } })

    // Test Error
    mockError = true
    const submitBtn = screen.getAllByRole('button', { name: /Add Card/i }).find(b => (b as HTMLButtonElement).type === 'submit')
    fireEvent.click(submitBtn!)

    await waitFor(() => {
      expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ color: 'red' }))
    })

    // Test Success
    mockError = false
    fireEvent.click(submitBtn!)
    await waitFor(() => {
      expect(screen.queryByText('Add Loyalty Card')).not.toBeInTheDocument()
      expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ color: 'green' }))
    })
  })

  it('handles delete loyalty card', async () => {
    server.use(
      http.get('/api/shopping/stores/1', () => HttpResponse.json({ id: 1, name: 'Tesco', version: 1 })),
      http.get('/api/shopping/stores/1/loyalty-cards', () => HttpResponse.json({ _embedded: { loyaltyCards: [{ id: 1, name: 'Tesco Clubcard', barcode: { code: '12345', type: 'CODE_128' } }] } })),
      http.get('/api/shopping/stores/1/coupons', () => HttpResponse.json({ _embedded: { coupons: [] }, page: { size: 20, totalElements: 0, totalPages: 0, number: 0 } })),
      http.delete('/api/shopping/loyalty-cards/1', () => new HttpResponse(null, { status: 204 }))
    )

    renderPage(1)
    await waitFor(() => expect(screen.getByText('Tesco Clubcard')).toBeInTheDocument())

    const deleteBtn = screen.getAllByRole('button').find(b => b.querySelector('.tabler-icon-trash'))
    fireEvent.click(deleteBtn!)
    expect(window.confirm).toHaveBeenCalledWith('Delete this card?')

    await waitFor(() => {
      expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Card removed' }))
    })
  })

  it('handles coupon creation and deletion', async () => {
    server.use(
      http.get('/api/shopping/stores/1', () => HttpResponse.json({ id: 1, name: 'Tesco', version: 1 })),
      http.get('/api/shopping/stores/1/loyalty-cards', () => HttpResponse.json({ _embedded: { loyaltyCards: [] } })),
      http.get('/api/shopping/stores/1/coupons', () => HttpResponse.json({
        _embedded: { coupons: [{ id: 1, name: '5 Euro Off', value: '€5.00', used: false }] },
        page: { size: 20, totalElements: 1, totalPages: 1, number: 0 }
      })),
      http.post('/api/shopping/stores/1/coupons', async ({ request }) => {
        const body = await request.json() as any
        return HttpResponse.json({ id: 2, name: body.name }, { status: 201 })
      }),
      http.delete('/api/shopping/coupons/1', () => new HttpResponse(null, { status: 204 }))
    )

    renderPage(1)
    await waitFor(() => expect(screen.getByText('Tesco')).toBeInTheDocument())
    fireEvent.click(screen.getByText(/Coupons/i))
    await waitFor(() => expect(screen.getByText('5 Euro Off')).toBeInTheDocument())

    // Add Coupon - opens modal
    fireEvent.click(screen.getByRole('button', { name: /Add Coupon/i }))
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Add Coupon' })).toBeInTheDocument()
    })

    // Delete Coupon
    const deleteBtn = screen.getAllByRole('button').find(b => b.querySelector('.tabler-icon-trash'))
    fireEvent.click(deleteBtn!)
    expect(window.confirm).toHaveBeenCalledWith('Delete this coupon?')
  })

  it('handles coupon update and toggle status', async () => {
    server.use(
      http.get('/api/shopping/stores/1', () => HttpResponse.json({ id: 1, name: 'Tesco', version: 1 })),
      http.get('/api/shopping/stores/1/loyalty-cards', () => HttpResponse.json({ _embedded: { loyaltyCards: [] } })),
      http.get('/api/shopping/stores/1/coupons', () => HttpResponse.json({
        _embedded: { coupons: [{ id: 1, name: '5 Euro Off', value: '€5.00', used: false, barcode: { code: '123', type: 'QR' } }] },
        page: { size: 20, totalElements: 1, totalPages: 1, number: 0 }
      })),
      http.put('/api/shopping/coupons/1', async ({ request }) => {
        const body = await request.json() as any
        return HttpResponse.json({ id: 1, ...body })
      }),
      http.patch('/api/shopping/coupons/1', async ({ request }) => {
        const body = await request.json() as any
        return HttpResponse.json({ id: 1, ...body })
      })
    )

    renderPage(1)
    await waitFor(() => expect(screen.getByText('Tesco')).toBeInTheDocument())
    fireEvent.click(screen.getByText(/Coupons/i))
    await waitFor(() => expect(screen.getByText('5 Euro Off')).toBeInTheDocument())

    // Edit Coupon - opens modal
    const editBtn = screen.getAllByRole('button').find(b => b.querySelector('.tabler-icon-edit'))
    fireEvent.click(editBtn!)
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Edit Coupon' })).toBeInTheDocument()
    })

    // Toggle Status
    const markUsedBtn = screen.getByRole('button', { name: /Mark Used/i })
    fireEvent.click(markUsedBtn)
  })

  it('handles fullscreen barcode modal', async () => {
    server.use(
      http.get('/api/shopping/stores/1', () => HttpResponse.json({ id: 1, name: 'Tesco', version: 1 })),
      http.get('/api/shopping/stores/1/loyalty-cards', () => HttpResponse.json({ _embedded: { loyaltyCards: [{ id: 1, name: 'Tesco Clubcard', barcode: { code: '12345', type: 'CODE_128' } }] } })),
      http.get('/api/shopping/stores/1/coupons', () => HttpResponse.json({ _embedded: { coupons: [] }, page: { size: 20, totalElements: 0, totalPages: 0, number: 0 } }))
    )

    renderPage(1)
    await waitFor(() => expect(screen.getByText('Tesco Clubcard')).toBeInTheDocument())

    // Open fullscreen
    const maximizeBtn = screen.getAllByRole('button').find(b => b.querySelector('.tabler-icon-maximize'))
    fireEvent.click(maximizeBtn!)

    await waitFor(() => {
      // Use getAllByText as it might appear multiple times (header + body)
      expect(screen.getAllByText('12345').length).toBeGreaterThan(0)
    })

    // Close fullscreen - use findByText or findByRole to wait for portal content
    const closeBtn = await screen.findByRole('button', { name: /Close/i })
    fireEvent.click(closeBtn)
  })
})
