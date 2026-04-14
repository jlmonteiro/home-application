import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ShoppingListsPage } from '../../pages/shopping/ShoppingListsPage'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import * as api from '../../services/api'
import { notifications } from '@mantine/notifications'
import type { ShoppingList } from '../../services/api'

// Mock API and Notifications
vi.mock('../../services/api', () => ({
  fetchLists: vi.fn(),
  createList: vi.fn(),
  deleteList: vi.fn(),
}))

vi.mock('@mantine/notifications', () => ({
  notifications: {
    show: vi.fn(),
  },
}))

const mockLists = [
  {
    id: 1,
    name: 'Weekly Groceries',
    description: 'Milk, Eggs, Bread',
    status: 'PENDING',
    creatorName: 'John Doe',
    createdAt: '2023-10-01T10:00:00Z',
    items: [],
  },
]

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
})

describe('Given the ShoppingListsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(api.fetchLists).mockResolvedValue(mockLists as unknown as ShoppingList[])
  })

  const renderPage = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MantineProvider>
          <MemoryRouter>
            <ShoppingListsPage />
          </MemoryRouter>
        </MantineProvider>
      </QueryClientProvider>,
    )

  describe('When it is rendered', () => {
    it('Then it should display existing shopping lists', async () => {
      renderPage()

      expect(await screen.findByText('Weekly Groceries')).toBeInTheDocument()
      expect(screen.getByText('PENDING')).toBeInTheDocument()
      expect(screen.getByText('By John Doe')).toBeInTheDocument()
    })
  })

  describe('When the user creates a new list', () => {
    it('Then it should validate the name and call createList', async () => {
      vi.mocked(api.createList).mockResolvedValue({
        id: 2,
        name: 'Party Supplies',
        status: 'PENDING',
      } as unknown as ShoppingList)
      renderPage()

      fireEvent.click(screen.getByText(/New List/i))

      const nameInput = await screen.findByLabelText(/List Name/i)
      fireEvent.change(nameInput, { target: { value: 'P' } }) // Too short

      fireEvent.click(screen.getByRole('button', { name: /Create List/i }))
      expect(await screen.findByText(/Name must have at least 2 characters/i)).toBeInTheDocument()

      fireEvent.change(nameInput, { target: { value: 'Party Supplies' } })
      fireEvent.click(screen.getByRole('button', { name: /Create List/i }))

      await waitFor(() => {
        expect(api.createList).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'Party Supplies' }),
        )
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Shopping list created',
          }),
        )
      })
    })
  })

  describe('When the user deletes a list', () => {
    it('Then it should confirm and call deleteList', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      vi.mocked(api.deleteList).mockResolvedValue(undefined)

      renderPage()

      // Need a better way to find the trash icon. It's an ActionIcon with IconTrash inside.
      // Let's use the container or title since we have only one.
      const trashBtn = screen.getByRole('button', { name: '' }).closest('button')
      if (trashBtn) fireEvent.click(trashBtn)

      await waitFor(() => {
        expect(api.deleteList).toHaveBeenCalledWith(1, expect.anything())
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'List deleted',
          }),
        )
      })
    })
  })
})
