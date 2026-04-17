import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import RecipeFormPage from '../../../pages/recipes/RecipeFormPage'
import { server } from '../../mocks/server'

const renderPage = (initialPath = '/recipes/new') => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            <Route path="/recipes/new" element={<RecipeFormPage />} />
            <Route path="/recipes/:id/edit" element={<RecipeFormPage />} />
            <Route path="/recipes/:id" element={<div>Recipe Detail</div>} />
          </Routes>
        </MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>,
  )
}

describe('RecipeFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('handles create recipe', async () => {
    server.use(
      http.post('/api/recipes', async ({ request }) => {
        const body = await request.json() as any
        return HttpResponse.json({ id: 1, name: body.name, servings: body.servings, version: 1 }, { status: 201 })
      })
    )

    renderPage('/recipes/new')

    fireEvent.change(screen.getByLabelText(/Recipe Name/i), { target: { value: 'New Recipe' } })
    fireEvent.change(screen.getByLabelText(/Servings/i), { target: { value: '4' } })
    fireEvent.change(screen.getByLabelText(/Prep Time/i), { target: { value: '30' } })

    fireEvent.click(screen.getByRole('button', { name: /Create Recipe/i }))

    await waitFor(() => {
      expect(screen.getByText('Recipe Detail')).toBeInTheDocument()
    })
  })

  it('handles edit recipe', async () => {
    server.use(
      http.get('/api/recipes/1', () => {
        return HttpResponse.json({
          id: 1,
          name: 'Old Name',
          description: 'Old Desc',
          servings: 2,
          prepTimeMinutes: 20,
          createdBy: 'Me',
          version: 1,
        })
      }),
      http.put('/api/recipes/1', async ({ request }) => {
        const body = await request.json() as any
        return HttpResponse.json({ id: 1, name: body.name, version: 2 })
      })
    )

    renderPage('/recipes/1/edit')

    await waitFor(() => {
      expect(screen.getByLabelText(/Recipe Name/i)).toHaveValue('Old Name')
    })

    fireEvent.change(screen.getByLabelText(/Recipe Name/i), { target: { value: 'Updated Name' } })
    fireEvent.click(screen.getByRole('button', { name: /Update Recipe/i }))

    await waitFor(() => {
      expect(screen.getByText('Recipe Detail')).toBeInTheDocument()
    })
  })

  it('shows validation errors', async () => {
    renderPage('/recipes/new')

    const nameInput = screen.getByLabelText(/Recipe Name/i)
    fireEvent.change(nameInput, { target: { value: ' ' } }) // Trigger validation

    fireEvent.click(screen.getByRole('button', { name: /Create Recipe/i }))

    await waitFor(() => {
      expect(screen.getByText(/Name must have at least 2 characters/i)).toBeInTheDocument()
    })
  })
})
