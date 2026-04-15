import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { CouponFormModal } from '../../components/shopping/CouponFormModal'
import type { Coupon } from '../../services/api'

const mockCoupon: Coupon = {
  id: 1,
  store: { id: 1, name: 'Test Store' },
  name: '€5 Off',
  description: 'Test coupon',
  value: '€5.00',
  dueDate: '2024-12-31',
  barcode: { code: '12345', type: 'CODE_128' },
  used: false,
  version: 1,
}

describe('CouponFormModal', () => {
  const onClose = vi.fn()
  const onSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderWithProvider = () => {
    return render(
      <MantineProvider>
        <CouponFormModal
          opened={true}
          onClose={onClose}
          editingCoupon={null}
          onSubmit={onSubmit}
          isPending={false}
        />
      </MantineProvider>,
    )
  }

  it('renders modal with title', () => {
    renderWithProvider()
    expect(screen.getByRole('heading', { name: 'Add Coupon' })).toBeInTheDocument()
  })

  it('shows submit button', () => {
    renderWithProvider()
    expect(screen.getByRole('button', { name: 'Add Coupon' })).toBeInTheDocument()
  })

  it('shows edit title when editing', () => {
    render(
      <MantineProvider>
        <CouponFormModal
          opened={true}
          onClose={onClose}
          editingCoupon={mockCoupon}
          onSubmit={onSubmit}
          isPending={false}
        />
      </MantineProvider>,
    )
    expect(screen.getByRole('heading', { name: 'Edit Coupon' })).toBeInTheDocument()
  })

  it('shows loading state when pending', () => {
    render(
      <MantineProvider>
        <CouponFormModal
          opened={true}
          onClose={onClose}
          editingCoupon={null}
          onSubmit={onSubmit}
          isPending={true}
        />
      </MantineProvider>,
    )
    expect(screen.getByRole('button', { name: 'Add Coupon' })).toBeDisabled()
  })
})