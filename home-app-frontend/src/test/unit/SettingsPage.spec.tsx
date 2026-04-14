import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { SettingsPage } from '../../pages/settings/SettingsPage'

const server = setupServer()

beforeEach(() => {
  server.listen({ onUnhandledRequest: 'error' })
  server.resetHandlers()
})

afterEach(() => {
  server.close()
})

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <MemoryRouter initialEntries={['/settings']}>
          <SettingsPage />
        </MemoryRouter>
      </MantineProvider>
    </QueryClientProvider>,
  )
}

describe('SettingsPage', () => {
  it('renders age groups section', async () => {
    server.use(
      http.get('/api/settings/age-groups', () => {
        return HttpResponse.json([
          { name: 'Child', maxAge: 12 },
          { name: 'Adult', maxAge: 99 },
        ])
      }),
      http.get('/api/settings/roles', () => {
        return HttpResponse.json([{ id: 1, name: 'Parent', immutable: true }])
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Child')).toBeInTheDocument()
      expect(screen.getByText('Adult')).toBeInTheDocument()
    })
  })

  it('renders family roles section', async () => {
    server.use(
      http.get('/api/settings/age-groups', () => {
        return HttpResponse.json([{ name: 'Adult', maxAge: 99 }])
      }),
      http.get('/api/settings/roles', () => {
        return HttpResponse.json([
          { id: 1, name: 'Parent', immutable: true },
          { id: 2, name: 'Child', immutable: false },
        ])
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByText('Parent')).toBeInTheDocument()
      expect(screen.getByText('Child')).toBeInTheDocument()
    })
  })

  it('shows add family role button', async () => {
    server.use(
      http.get('/api/settings/age-groups', () => {
        return HttpResponse.json([{ name: 'Adult', maxAge: 99 }])
      }),
      http.get('/api/settings/roles', () => {
        return HttpResponse.json([{ id: 1, name: 'Parent', immutable: true }])
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Add Role/i })).toBeInTheDocument()
    })
  })

  it('shows save button for age groups', async () => {
    server.use(
      http.get('/api/settings/age-groups', () => {
        return HttpResponse.json([{ name: 'Adult', maxAge: 99 }])
      }),
      http.get('/api/settings/roles', () => {
        return HttpResponse.json([{ id: 1, name: 'Parent', immutable: true }])
      }),
    )

    renderPage()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Save Age Groups/i })).toBeInTheDocument()
    })
  })
})