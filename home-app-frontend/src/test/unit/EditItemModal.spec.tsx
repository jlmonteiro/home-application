import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { EditItemModal } from '../../components/shopping/EditItemModal'
import type { ShoppingListItem } from '../../services/api'

const mockItem: ShoppingListItem = {
  id: 10,
  itemId: 100,
  itemName: 'Milk',
  itemPhoto: null,
  category: { name: 'Dairy', icon: 'IconMilk' },
  store: { id: 1, name: 'SuperMart' },
  quantity: 2,
  unit: 'pcs',
  price: 1.5,
  previousPrice: 1.2,
  bought: false,
  unavailable: false,
  version: 1,
}

const storeOptions = [
  { value: '1', label: 'SuperMart' },
  { value: '2', label: 'OtherStore' },
]

describe('EditItemModal', () => {
  const onClose = vi.fn()
  const onSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderWithProvider = () => {
    return render(
      <MantineProvider>
        <EditItemModal
          opened={true}
          onClose={onClose}
          item={mockItem}
          storeOptions={storeOptions}
          onSubmit={onSubmit}
          isPending={false}
        />
      </MantineProvider>,
    )
  }

  it('renders modal with title', () => {
    renderWithProvider()
    expect(screen.getByRole('heading', { name: 'Edit Milk' })).toBeInTheDocument()
  })

  it('shows store select with pre-selected value', () => {
    renderWithProvider()
    expect(screen.getByText('Change Store')).toBeInTheDocument()
  })

  it('shows quantity and unit fields with pre-filled values', () => {
    renderWithProvider()
    expect(screen.getByText('Quantity')).toBeInTheDocument()
    expect(screen.getByText('Unit')).toBeInTheDocument()
  })

  it('shows price input', () => {
    renderWithProvider()
    expect(screen.getByText('Price per Unit (€)')).toBeInTheDocument()
  })

  it('shows submit button', () => {
    renderWithProvider()
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument()
  })

  it('calls onSubmit when form is submitted', () => {
    renderWithProvider()
    const submitBtn = screen.getByRole('button', { name: 'Save Changes' })
    fireEvent.click(submitBtn)
    expect(onSubmit).toHaveBeenCalledWith(10, expect.objectContaining({
      storeId: '1',
      quantity: 2,
      unit: 'pcs',
      price: 1.5,
    }))
  })

  it('renders null item gracefully', () => {
    render(
      <MantineProvider>
        <EditItemModal
          opened={true}
          onClose={onClose}
          item={null}
          storeOptions={storeOptions}
          onSubmit={onSubmit}
          isPending={false}
        />
      </MantineProvider>,
    )
    expect(screen.getByRole('heading', { name: 'Edit Item' })).toBeInTheDocument()
  })
})