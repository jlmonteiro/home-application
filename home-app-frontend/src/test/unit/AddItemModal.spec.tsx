import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { AddItemModal } from '../../components/shopping/AddItemModal'
import type { ShoppingItem } from '../../services/api'

vi.mock('../../services/api', () => ({
  fetchSuggestedPrice: vi.fn(() => Promise.resolve(1.5)),
}))

const mockItems: ShoppingItem[] = [
  {
    id: 1,
    name: 'Milk',
    category: { id: 1, name: 'Dairy' },
    version: 1,
    unit: 'l',
    nutritionSampleSize: 100,
    nutritionSampleUnit: 'ml',
  },
  {
    id: 2,
    name: 'Eggs',
    category: { id: 1, name: 'Dairy' },
    version: 1,
    unit: 'pcs',
    nutritionSampleSize: 1,
    nutritionSampleUnit: 'pcs',
  },
]

const storeOptions = [
  { value: '1', label: 'SuperMart' },
  { value: '2', label: 'OtherStore' },
]

describe('AddItemModal', () => {
  const onClose = vi.fn()
  const onSubmit = vi.fn()
  const onCreateNew = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderWithProvider = () => {
    return render(
      <MantineProvider>
        <AddItemModal
          opened={true}
          onClose={onClose}
          masterItems={mockItems}
          storeOptions={storeOptions}
          onSubmit={onSubmit}
          onCreateNew={onCreateNew}
          isPending={false}
        />
      </MantineProvider>,
    )
  }

  it('renders modal with title', () => {
    renderWithProvider()
    expect(screen.getByRole('heading', { name: 'Add Item to List' })).toBeInTheDocument()
  })

  it('shows search input', () => {
    renderWithProvider()
    expect(screen.getByPlaceholderText('Type to search...')).toBeInTheDocument()
  })

  it('filters items based on search', () => {
    renderWithProvider()
    const input = screen.getByPlaceholderText('Type to search...')
    fireEvent.change(input, { target: { value: 'Milk' } })
    fireEvent.focus(input)
    expect(screen.getByText('Milk')).toBeInTheDocument()
    expect(screen.queryByText('Eggs')).not.toBeInTheDocument()
  })

  it('shows create option when no items match', () => {
    renderWithProvider()
    const input = screen.getByPlaceholderText('Type to search...')
    fireEvent.change(input, { target: { value: 'Bread' } })
    fireEvent.focus(input)
    // Use exact text in the Combobox option
    const createOption = screen.getByRole('option', { name: /Create "Bread"/i })
    expect(createOption).toBeInTheDocument()
  })

  it('calls onCreateNew when create option is clicked', () => {
    renderWithProvider()
    const input = screen.getByPlaceholderText('Type to search...')
    fireEvent.change(input, { target: { value: 'Bread' } })
    fireEvent.focus(input)
    const createOption = screen.getByRole('option', { name: /Create "Bread"/i })
    fireEvent.click(createOption)
    expect(onCreateNew).toHaveBeenCalledWith('Bread')
  })

  it('shows store select', () => {
    renderWithProvider()
    expect(screen.getByText('Store (Optional)')).toBeInTheDocument()
  })

  it('shows quantity and unit fields', () => {
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
    expect(screen.getByRole('button', { name: 'Add Item to List' })).toBeInTheDocument()
  })
})