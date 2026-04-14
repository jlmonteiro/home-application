import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ShoppingListDetailsPage } from '../../pages/shopping/ShoppingListDetailsPage'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { notifications } from '@mantine/notifications'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

vi.mock('@mantine/notifications', () => ({
  notifications: { show: vi.fn() },
}))

const mockList = {
  id: 1,
  name: 'Weekly Groceries',
  status: 'PENDING',
  creatorName: 'John Doe',
  items: [
    {
      id: 10, itemId: 100, itemName: 'Milk', itemPhoto: null,
      category: { name: 'Dairy', icon: 'IconMilk' },
      store: { id: 1, name: 'SuperMart' },
      quantity: 2, unit: 'pcs', price: 1.5, bought: false, unavailable: false, version: 1,
    },
    {
      id: 11, itemId: 101, itemName: 'Eggs', itemPhoto: null,
      category: { name: 'Dairy', icon: 'IconMilk' },
      store: { id: 1, name: 'SuperMart' },
      quantity: 1, unit: 'pack', price: 3.0, bought: true, unavailable: false, version: 1,
    },
  ],
  version: 1,
}

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

const defaultHandlers = [
  http.get('/api/shopping/lists/1', () => HttpResponse.json(mockList)),
  http.get('/api/shopping/items', () => HttpResponse.json({ _embedded: { items: [] } })),
  http.get('/api/shopping/stores', () => HttpResponse.json({ _embedded: { stores: [] } })),
  http.get('/api/shopping/categories', () => HttpResponse.json({ _embedded: { categories: [] } })),
]

describe('Shopping List Details Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
  })

  const renderPage = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <MemoryRouter initialEntries={['/shopping/lists/1']}>
            <Routes>
              <Route path="/shopping/lists/:id" element={<ShoppingListDetailsPage />} />
            </Routes>
          </MemoryRouter>
        </MantineProvider>
      </QueryClientProvider>,
    )

  it('displays list info and calculates total costs', async () => {
    server.use(...defaultHandlers)
    renderPage()

    expect(await screen.findByText('Weekly Groceries')).toBeInTheDocument()
    expect(screen.getByText('PENDING')).toBeInTheDocument()
    expect(screen.getByText('€6.00', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText('Milk')).toBeInTheDocument()
    expect(screen.getByText('Eggs')).toBeInTheDocument()
  })

  it('calls update API when item is marked as bought', async () => {
    let capturePayload: any = null
    server.use(
      ...defaultHandlers,
      http.patch('/api/shopping/lists/items/10', async ({ request }) => {
        capturePayload = await request.json()
        return HttpResponse.json({ ...mockList.items[0], ...capturePayload })
      }),
    )

    renderPage()
    const milkCheckbox = await screen.findByRole('checkbox', { checked: false })
    fireEvent.click(milkCheckbox)

    await waitFor(() => {
      expect(capturePayload).toMatchObject({ bought: true })
    })
  })

  it('completes the list and shows success notification', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    let capturePayload: any = null
    server.use(
      ...defaultHandlers,
      http.put('/api/shopping/lists/1', async ({ request }) => {
        capturePayload = await request.json()
        return HttpResponse.json({ ...mockList, ...capturePayload })
      }),
    )

    renderPage()
    const completeButton = await screen.findByRole('button', { name: /Mark Completed/i })
    fireEvent.click(completeButton)

    await waitFor(() => {
      expect(capturePayload).toMatchObject({ status: 'COMPLETED' })
      expect(notifications.show).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'List updated' }),
      )
    })
  })

  it('shows error when list fetch fails', async () => {
    server.use(
      http.get('/api/shopping/lists/1', () => new HttpResponse(null, { status: 500 })),
      http.get('/api/shopping/items', () => HttpResponse.json({ _embedded: { items: [] } })),
      http.get('/api/shopping/stores', () => HttpResponse.json({ _embedded: { stores: [] } })),
      http.get('/api/shopping/categories', () => HttpResponse.json({ _embedded: { categories: [] } })),
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/Error|not found/i)).toBeInTheDocument()
    })
  })
})