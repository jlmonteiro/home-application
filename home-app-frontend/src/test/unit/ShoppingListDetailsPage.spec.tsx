import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
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

const createQueryClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } })

const defaultHandlers = [
  http.get('/api/shopping/lists/1', () => HttpResponse.json(mockList)),
  http.get('/api/shopping/items', () => HttpResponse.json({ _embedded: { items: [{ id: 100, name: 'Milk', category: { id: 1, name: 'Dairy' } }] }, page: { size: 20, totalElements: 1, totalPages: 1, number: 0 } })),
  http.get('/api/shopping/stores', () => HttpResponse.json({ _embedded: { stores: [{ id: 1, name: 'SuperMart' }] }, page: { size: 20, totalElements: 1, totalPages: 1, number: 0 } })),
  http.get('/api/shopping/categories', () => HttpResponse.json({ _embedded: { categories: [{ id: 1, name: 'Dairy' }] }, page: { size: 20, totalElements: 1, totalPages: 1, number: 0 } })),
  http.get('/api/shopping/items/100/price-history', () => HttpResponse.json([{ id: 1, price: 1.2, recordedAt: '2023-01-01T10:00:00Z', storeName: 'SuperMart' }])),
  http.get('/api/shopping/items/100/suggested-price', () => HttpResponse.json(1.5)),
]

describe('Shopping List Details Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.confirm = vi.fn(() => true)
    window.innerWidth = 1200
    window.dispatchEvent(new Event('resize'))
  })

  const renderPage = () => {
    const queryClient = createQueryClient()
    return render(
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
  }

  it('displays list info and calculates total costs', async () => {
    server.use(...defaultHandlers)
    renderPage()

    expect(await screen.findByText('Weekly Groceries')).toBeInTheDocument()
    expect(screen.getByText('PENDING')).toBeInTheDocument()
    expect(screen.getByText('€6.00', { selector: 'p' })).toBeInTheDocument()
    expect(screen.getByText('Milk')).toBeInTheDocument()
    expect(screen.getByText('Eggs')).toBeInTheDocument()
  })

  it('handles editing list metadata', async () => {
    server.use(
      ...defaultHandlers,
      http.put('/api/shopping/lists/1', async ({ request }) => {
        const body = await request.json() as any
        return HttpResponse.json({ ...mockList, ...body })
      })
    )
    renderPage()
    await screen.findByText('Weekly Groceries')

    fireEvent.click(screen.getByRole('button', { name: /Edit Info/i }))
    const modal = await screen.findByRole('dialog')
    const nameInput = within(modal).getByLabelText(/List Name/i)
    fireEvent.change(nameInput, { target: { value: 'New List Name' } })
    
    const submitBtn = within(modal).getByRole('button', { name: /Save Changes/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'List updated' }))
    })
  })

  it('handles item addition via combobox', async () => {
    server.use(
      ...defaultHandlers,
      http.post('/api/shopping/lists/1/items', async ({ request }) => {
        const body = await request.json() as any
        return HttpResponse.json({ id: 12, ...body }, { status: 201 })
      })
    )
    renderPage()
    await screen.findByText('Weekly Groceries')

    fireEvent.click(screen.getByRole('button', { name: /Add Item/i }))
    
    const modal = await screen.findByRole('dialog')
    const searchInput = within(modal).getByPlaceholderText(/Type to search/i)
    
    fireEvent.focus(searchInput)
    fireEvent.change(searchInput, { target: { value: 'Milk' } })
    
    const milkOption = await screen.findByText(/^Milk$/i, { selector: '.mantine-Combobox-option p' })
    fireEvent.click(milkOption)

    const addItemBtn = within(modal).getByRole('button', { name: /Add Item to List/i })
    fireEvent.click(addItemBtn)

    await waitFor(() => {
      expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Item added' }))
    })
  })

  it('handles item update', async () => {
    server.use(
      ...defaultHandlers,
      http.patch('/api/shopping/lists/items/10', async ({ request }) => {
        const body = await request.json() as any
        return HttpResponse.json({ ...mockList.items[0], ...body })
      })
    )
    renderPage()
    await screen.findByText('Milk')

    // Find the edit button globally - try finding by icon or text
    const editBtns = await screen.findAllByRole('button')
    const itemEditBtn = editBtns.find(b => b.querySelector('.tabler-icon-edit') && b.textContent !== 'Edit Info')
    
    // Fallback: try finding by title globally
    const btnByTitle = itemEditBtn || screen.queryByTitle('Edit Item')
    fireEvent.click(btnByTitle!)

    // Wait for modal
    const itemModal = await screen.findByText(/Edit Milk/i).then(el => el.closest('.mantine-Modal-content')!)
    
    const qtyInput = within(itemModal).getByLabelText(/Quantity/i)
    fireEvent.change(qtyInput, { target: { value: '5' } })

    const saveBtn = within(itemModal).getByRole('button', { name: /Save Changes/i })
    fireEvent.click(saveBtn)

    await waitFor(() => {
      expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Item updated' }))
    })
  })

  it('handles creating new master item', async () => {
    server.use(
      ...defaultHandlers,
      http.post('/api/shopping/items', async ({ request }) => {
        const body = await request.json() as any
        return HttpResponse.json({ id: 200, ...body }, { status: 201 })
      })
    )
    renderPage()
    await screen.findByText('Weekly Groceries')

    fireEvent.click(screen.getByRole('button', { name: /Add Item/i }))
    
    const modal = await screen.findByRole('dialog')
    const searchInput = within(modal).getByPlaceholderText(/Type to search/i)
    fireEvent.focus(searchInput)
    fireEvent.change(searchInput, { target: { value: 'Bread' } })
    
    // Find option by partial text and pick the one that looks like a button label
    const createNewBtn = await screen.findAllByText(/Create "Bread"/i).then(els => els.find(el => el.classList.contains('mantine-Button-label'))!)
    fireEvent.click(createNewBtn)

    // Wait for nested modal
    const createModal = await screen.findByText('Create New Master Item').then(el => el.closest('.mantine-Modal-content')!)

    const categorySelect = within(createModal).getByPlaceholderText(/Select category/i)
    fireEvent.click(categorySelect)
    
    const categoryOption = await screen.findByRole('option', { name: /^Dairy$/i })
    fireEvent.click(categoryOption)

    // Fill name
    const nameInput = within(createModal).getByLabelText(/Item Name/i)
    fireEvent.change(nameInput, { target: { value: 'Bread' } })

    const createBtn = within(createModal).getByRole('button', { name: /Create and Select/i })
    fireEvent.click(createBtn)

    await waitFor(() => {
      expect(notifications.show).toHaveBeenCalledWith(expect.objectContaining({ message: 'Master item created' }))
    })
  })

  it('shows price history modal', async () => {
    server.use(...defaultHandlers)
    renderPage()
    await screen.findByText('Milk')

    const trendIcons = screen.getAllByTitle('Price Same')
    fireEvent.click(trendIcons[0])

    await waitFor(() => {
      expect(screen.getByText(/Price History/i)).toBeInTheDocument()
      expect(screen.getByText('€1.20')).toBeInTheDocument()
    })
  })

  it('shows empty state when no items', async () => {
    server.use(
      http.get('/api/shopping/lists/1', () => HttpResponse.json({ ...mockList, items: [] })),
      http.get('/api/shopping/items', () => HttpResponse.json({ _embedded: { items: [] }, page: { size: 20, totalElements: 0, totalPages: 0, number: 0 } })),
      http.get('/api/shopping/stores', () => HttpResponse.json({ _embedded: { stores: [] }, page: { size: 20, totalElements: 0, totalPages: 0, number: 0 } })),
      http.get('/api/shopping/categories', () => HttpResponse.json({ _embedded: { categories: [] }, page: { size: 20, totalElements: 0, totalPages: 0, number: 0 } })),
    )
    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/Your list is empty/i)).toBeInTheDocument()
    })
  })
})
