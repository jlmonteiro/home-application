import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ShoppingListDetailsPage } from '../../pages/shopping/ShoppingListDetailsPage'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import * as api from '../../services/api'
import { notifications } from '@mantine/notifications'
import type {
  ShoppingList,
  ShoppingListItem,
  PagedResponse,
  ShoppingItem,
  ShoppingStore,
  ShoppingCategory,
} from '../../services/api'

// Mock APIs
vi.mock('../../services/api', () => ({
  fetchList: vi.fn(),
  fetchItems: vi.fn(),
  addItemToList: vi.fn(),
  updateListItem: vi.fn(),
  removeListItem: vi.fn(),
  fetchSuggestedPrice: vi.fn(),
  updateList: vi.fn(),
  fetchStores: vi.fn(),
  createItem: vi.fn(),
  fetchCategories: vi.fn(),
  fetchItemPriceHistory: vi.fn(),
}))

vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}))

const mockList = {
  id: 1,
  name: 'Weekly Groceries',
  status: 'PENDING',
  creatorName: 'John Doe',
  items: [
    {
      id: 10,
      itemId: 100,
      itemName: 'Milk',
      itemPhoto: null,
      category: { name: 'Dairy', icon: 'IconMilk' },
      store: { id: 1, name: 'SuperMart' },
      quantity: 2,
      unit: 'pcs',
      price: 1.5,
      bought: false,
      unavailable: false,
    },
    {
      id: 11,
      itemId: 101,
      itemName: 'Eggs',
      itemPhoto: null,
      category: { name: 'Dairy', icon: 'IconMilk' },
      store: { id: 1, name: 'SuperMart' },
      quantity: 1,
      unit: 'pack',
      price: 3.0,
      bought: true,
      unavailable: false,
    },
  ],
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
})

describe('Given the ShoppingListDetailsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.fetchList).mockResolvedValue(mockList as unknown as ShoppingList)
    vi.mocked(api.fetchItems).mockResolvedValue({
      _embedded: { items: [] },
    } as unknown as PagedResponse<ShoppingItem>)
    vi.mocked(api.fetchStores).mockResolvedValue({
      _embedded: { stores: [] },
    } as unknown as PagedResponse<ShoppingStore>)
    vi.mocked(api.fetchCategories).mockResolvedValue({
      _embedded: { categories: [] },
    } as unknown as PagedResponse<ShoppingCategory>)
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

  describe('When it is rendered', () => {
    it('Then it should display the list details and grouped items', async () => {
      renderPage()

      expect(await screen.findByText('Weekly Groceries')).toBeInTheDocument()
      expect(screen.getByText('PENDING')).toBeInTheDocument()

      // Totals check: (2 * 1.5) + (1 * 3.0) = 6.00
      expect(screen.getByText('€6.00', { selector: 'p' })).toBeInTheDocument()

      // Items check
      expect(screen.getByText('Milk')).toBeInTheDocument()
      expect(screen.getByText('Eggs')).toBeInTheDocument()
      expect(screen.getByText('SuperMart')).toBeInTheDocument()
    })
  })

  describe('When the user marks an item as bought', () => {
    it('Then it should call updateListItem', async () => {
      vi.mocked(api.updateListItem).mockResolvedValue({
        ...mockList.items[0],
        bought: true,
      } as unknown as ShoppingListItem)
      renderPage()

      const milkCheckbox = await screen.findByRole('checkbox', { checked: false })
      fireEvent.click(milkCheckbox)

      await waitFor(() => {
        expect(api.updateListItem).toHaveBeenCalledWith(
          10,
          expect.objectContaining({
            bought: true,
          }),
        )
      })
    })
  })

  describe('When the user marks the list as completed', () => {
    it('Then it should confirm and call updateList', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      vi.mocked(api.updateList).mockResolvedValue({
        ...mockList,
        status: 'COMPLETED',
      } as unknown as ShoppingList)
      renderPage()

      const completeButton = await screen.findByRole('button', { name: /Mark Completed/i })
      fireEvent.click(completeButton)

      await waitFor(() => {
        expect(api.updateList).toHaveBeenCalledWith(
          1,
          expect.objectContaining({
            status: 'COMPLETED',
          }),
        )
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'List updated',
          }),
        )
      })
    })
  })
})
