import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ShoppingListsPage } from '../../pages/shopping/ShoppingListsPage'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { notifications } from '@mantine/notifications'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

// Mock Notifications
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
    version: 1,
  },
]

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
})

describe('Shopping Lists Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queryClient.clear()
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

  describe('When viewing lists', () => {
    it('should display existing shopping lists from the server', async () => {
      server.use(
        http.get('/api/shopping/lists', () => {
          return HttpResponse.json({
            _embedded: { lists: mockLists },
          })
        }),
      )

      renderPage()

      expect(await screen.findByText('Weekly Groceries')).toBeInTheDocument()
      expect(screen.getByText('PENDING')).toBeInTheDocument()
      expect(screen.getByText('By John Doe')).toBeInTheDocument()
    })
  })

  describe('When creating a new list', () => {
    it('should validate form fields and call the creation API', async () => {
      let capturePayload = null
      server.use(
        http.post('/api/shopping/lists', async ({ request }) => {
          capturePayload = await request.json()
          return HttpResponse.json({
            id: 2,
            name: 'Party Supplies',
            status: 'PENDING',
            version: 1,
          })
        }),
      )

      renderPage()

      fireEvent.click(screen.getByText(/New List/i))

      const nameInput = await screen.findByLabelText(/List Name/i)
      fireEvent.change(nameInput, { target: { value: 'P' } })

      fireEvent.click(screen.getByRole('button', { name: /Create List/i }))
      expect(await screen.findByText(/Name must have at least 2 characters/i)).toBeInTheDocument()

      fireEvent.change(nameInput, { target: { value: 'Party Supplies' } })
      fireEvent.click(screen.getByRole('button', { name: /Create List/i }))

      await waitFor(() => {
        expect(capturePayload).toMatchObject({ name: 'Party Supplies' })
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'Shopping list created',
          }),
        )
      })
    })
  })

  describe('When deleting a list', () => {
    it('should prompt for confirmation and call the deletion API', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      let deleteCalled = false
      server.use(
        http.delete('/api/shopping/lists/:id', () => {
          deleteCalled = true
          return new HttpResponse(null, { status: 204 })
        }),
      )

      renderPage()

      const deleteBtn = await screen.findByTestId('delete-list-1')
      fireEvent.click(deleteBtn)

      await waitFor(() => {
        expect(deleteCalled).toBe(true)
        expect(notifications.show).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'List deleted',
          }),
        )
      })
    })
  })
})
