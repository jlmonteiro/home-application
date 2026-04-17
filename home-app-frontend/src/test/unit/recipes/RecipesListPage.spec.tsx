import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import RecipesListPage from '../../../pages/recipes/RecipesListPage'
import { server } from '../../mocks/server'

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <MemoryRouter initialEntries={['/recipes']}>
          <RecipesListPage />
        </MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>,
  )
}

describe('RecipesListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.confirm = vi.fn(() => true)
  })

  it('renders recipe list', async () => {
    server.use(
      http.get('/api/recipes', () => {
        return HttpResponse.json({
          _embedded: {
            recipes: [
              { id: 1, name: 'Pasta', createdBy: 'Chef', prepTimeMinutes: 20, description: 'Yummy' },
              { id: 2, name: 'Pizza', createdBy: 'Baker', prepTimeMinutes: 45, description: 'Cheesy' },
            ],
          },
          page: { size: 12, totalElements: 2, totalPages: 1, number: 0 },
        })
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Pasta')).toBeInTheDocument()
      expect(screen.getByText('Pizza')).toBeInTheDocument()
    })
  })

  it('shows empty state when no recipes', async () => {
    server.use(
      http.get('/api/recipes', () => {
        return HttpResponse.json({ _embedded: { recipes: [] }, page: { size: 12, totalElements: 0, totalPages: 0, number: 0 } })
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByText(/No recipes found/i)).toBeInTheDocument()
    })
  })

  it('handles delete recipe', async () => {
    server.use(
      http.get('/api/recipes', () => {
        return HttpResponse.json({
          _embedded: {
            recipes: [{ id: 1, name: 'Pasta', createdBy: 'Chef', prepTimeMinutes: 20 }],
          },
          page: { size: 12, totalElements: 1, totalPages: 1, number: 0 },
        })
      }),
      http.delete('/api/recipes/1', () => {
        return new HttpResponse(null, { status: 204 })
      })
    )

    renderPage()

    await waitFor(() => expect(screen.getByText('Pasta')).toBeInTheDocument())

    // Find the card containing 'Pasta' and then the trash icon within it
    const pastaCard = screen.getByText('Pasta').closest('.mantine-Card-root')
    const deleteBtn = pastaCard?.querySelector('.tabler-icon-trash')
    fireEvent.click(deleteBtn!.parentElement!)

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this recipe?')
  })
})
