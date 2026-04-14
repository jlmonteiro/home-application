import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { MantineProvider } from '@mantine/core'
import { AuthProvider } from '../../context/AuthContext'
import { Dashboard } from '../../pages/dashboard/Dashboard'

const server = setupServer()

beforeEach(() => {
  server.listen({ onUnhandledRequest: 'error' })
  server.resetHandlers()
})

afterEach(() => {
  server.close()
})

const renderDashboard = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        <AuthProvider>
          <MemoryRouter initialEntries={['/']}>
            <Dashboard />
          </MemoryRouter>
        </AuthProvider>
      </MantineProvider>
    </QueryClientProvider>,
  )
}

describe('Dashboard', () => {
  it('renders welcome message with user name', async () => {
    server.use(
      http.get('/api/user/me', () => {
        return HttpResponse.json({
          id: 1,
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          ageGroupName: 'Adult',
        })
      }),
      http.get('/api/user/preferences', () => {
        return HttpResponse.json({ showShoppingWidget: true, showCouponsWidget: true })
      }),
      http.get('/api/shopping/lists', () => {
        return HttpResponse.json({ _embedded: { lists: [] } })
      }),
      http.get('/api/shopping/coupons/expiring', () => {
        return HttpResponse.json({ _embedded: { coupons: [] } })
      }),
    )

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText(/Welcome back, John!/i)).toBeInTheDocument()
    })
  })

  it('shows pending shopping lists', async () => {
    server.use(
      http.get('/api/user/me', () => {
        return HttpResponse.json({
          id: 1,
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          ageGroupName: 'Adult',
        })
      }),
      http.get('/api/user/preferences', () => {
        return HttpResponse.json({ showShoppingWidget: true, showCouponsWidget: true })
      }),
      http.get('/api/shopping/lists', () => {
        return HttpResponse.json({
          _embedded: {
            lists: [
              {
                id: 1,
                name: 'Weekly Groceries',
                status: 'PENDING',
                items: [
                  { id: 10, itemName: 'Milk', quantity: 2, bought: false, unavailable: false },
                  { id: 11, itemName: 'Eggs', quantity: 12, bought: true, unavailable: false },
                ],
              },
            ],
          },
        })
      }),
      http.get('/api/shopping/coupons/expiring', () => {
        return HttpResponse.json({ _embedded: { coupons: [] } })
      }),
    )

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Weekly Groceries')).toBeInTheDocument()
      expect(screen.getByText(/2\/2 items/i)).toBeInTheDocument()
    })
  })

  it('shows empty state when no pending lists', async () => {
    server.use(
      http.get('/api/user/me', () => {
        return HttpResponse.json({
          id: 1,
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          ageGroupName: 'Adult',
        })
      }),
      http.get('/api/user/preferences', () => {
        return HttpResponse.json({ showShoppingWidget: true, showCouponsWidget: true })
      }),
      http.get('/api/shopping/lists', () => {
        return HttpResponse.json({ _embedded: { lists: [] } })
      }),
      http.get('/api/shopping/coupons/expiring', () => {
        return HttpResponse.json({ _embedded: { coupons: [] } })
      }),
    )

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText(/No pending shopping lists/i)).toBeInTheDocument()
    })
  })

  it('shows expiring coupons', async () => {
    server.use(
      http.get('/api/user/me', () => {
        return HttpResponse.json({
          id: 1,
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          ageGroupName: 'Adult',
        })
      }),
      http.get('/api/user/preferences', () => {
        return HttpResponse.json({ showShoppingWidget: true, showCouponsWidget: true })
      }),
      http.get('/api/shopping/lists', () => {
        return HttpResponse.json({ _embedded: { lists: [] } })
      }),
      http.get('/api/shopping/coupons/expiring', () => {
        return HttpResponse.json({
          _embedded: {
            coupons: [
              {
                id: 1,
                name: '10% Off',
                store: { name: 'Tesco' },
                dueDate: '2024-12-31',
                barcode: null,
              },
            ],
          },
        })
      }),
    )

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('10% Off')).toBeInTheDocument()
      expect(screen.getByText('Tesco')).toBeInTheDocument()
    })
  })

  it('shows expired coupon styling', async () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    server.use(
      http.get('/api/user/me', () => {
        return HttpResponse.json({
          id: 1,
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          ageGroupName: 'Adult',
        })
      }),
      http.get('/api/user/preferences', () => {
        return HttpResponse.json({ showShoppingWidget: true, showCouponsWidget: true })
      }),
      http.get('/api/shopping/lists', () => {
        return HttpResponse.json({ _embedded: { lists: [] } })
      }),
      http.get('/api/shopping/coupons/expiring', () => {
        return HttpResponse.json({
          _embedded: {
            coupons: [
              {
                id: 1,
                name: 'Expired Coupon',
                store: { name: 'Lidl' },
                dueDate: yesterdayStr,
                barcode: null,
              },
            ],
          },
        })
      }),
    )

    renderDashboard()

    await waitFor(() => {
      expect(screen.getByText('Expired Coupon')).toBeInTheDocument()
      expect(screen.getByText(/EXPIRED/i)).toBeInTheDocument()
    })
  })

  it('hides shopping widget when preference disabled', async () => {
    server.use(
      http.get('/api/user/me', () => {
        return HttpResponse.json({
          id: 1,
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          ageGroupName: 'Adult',
        })
      }),
      http.get('/api/user/preferences', () => {
        return HttpResponse.json({ showShoppingWidget: false, showCouponsWidget: true })
      }),
      http.get('/api/shopping/lists', () => {
        return HttpResponse.json({ _embedded: { lists: [] } })
      }),
      http.get('/api/shopping/coupons/expiring', () => {
        return HttpResponse.json({ _embedded: { coupons: [] } })
      }),
    )

    renderDashboard()

    await waitFor(() => {
      expect(screen.queryByText(/Pending Shopping Lists/i)).not.toBeInTheDocument()
    })
  })

  it('hides coupons widget when preference disabled', async () => {
    server.use(
      http.get('/api/user/me', () => {
        return HttpResponse.json({
          id: 1,
          email: 'john@example.com',
          firstName: 'John',
          lastName: 'Doe',
          ageGroupName: 'Adult',
        })
      }),
      http.get('/api/user/preferences', () => {
        return HttpResponse.json({ showShoppingWidget: true, showCouponsWidget: false })
      }),
      http.get('/api/shopping/lists', () => {
        return HttpResponse.json({ _embedded: { lists: [] } })
      }),
      http.get('/api/shopping/coupons/expiring', () => {
        return HttpResponse.json({ _embedded: { coupons: [] } })
      }),
    )

    renderDashboard()

    await waitFor(() => {
      expect(screen.queryByText(/Expiring Coupons/i)).not.toBeInTheDocument()
    })
  })
})