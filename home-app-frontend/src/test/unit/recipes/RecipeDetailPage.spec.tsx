import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MantineProvider } from '@mantine/core'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import RecipeDetailPage from '../../../pages/recipes/RecipeDetailPage'
import { server } from '../../mocks/server'

const renderPage = (id: number) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <MemoryRouter initialEntries={[`/recipes/${id}`]}>
          <Routes>
            <Route path="/recipes/:id" element={<RecipeDetailPage />} />
          </Routes>
        </MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>,
  )
}

describe('RecipeDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders recipe details', async () => {
    server.use(
      http.get('/api/recipes/1', () => {
        return HttpResponse.json({
          id: 1,
          name: 'Pasta Carbonara',
          description: 'Authentic **Italian** pasta.',
          servings: 2,
          prepTimeMinutes: 20,
          createdBy: 'Master Chef',
          sourceLink: 'https://example.com',
          videoLink: 'https://youtube.com',
        })
      }),
    )

    renderPage(1)

    await waitFor(() => {
      expect(screen.getByText('Pasta Carbonara')).toBeInTheDocument()
      expect(screen.getByText('By Master Chef')).toBeInTheDocument()
      expect(screen.getByText('2 servings')).toBeInTheDocument()
      expect(screen.getByText('20 min')).toBeInTheDocument()
      expect(screen.getByText('Source')).toBeInTheDocument()
      expect(screen.getByText('Video')).toBeInTheDocument()
      // Check markdown rendering
      expect(screen.getByText('Italian')).toBeInTheDocument()
    })
  })

  it('shows error message when recipe not found', async () => {
    server.use(
      http.get('/api/recipes/99', () => {
        return new HttpResponse(null, { status: 404 })
      }),
    )

    renderPage(99)

    await waitFor(() => {
      expect(screen.getByText(/Failed to load recipe detail/i)).toBeInTheDocument()
    })
  })
})
