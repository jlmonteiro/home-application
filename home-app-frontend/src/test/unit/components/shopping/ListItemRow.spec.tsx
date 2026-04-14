import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MantineProvider } from '@mantine/core'
import { ListItemRow } from '../../../../components/shopping/ListItemRow'

vi.mock('../../../../utils/photo', () => ({
  getPhotoSrc: vi.fn((photo) => photo ? `mock-url-${photo}` : null)
}))

describe('ListItemRow', () => {
  const mockItem = {
    id: 1,
    itemName: 'Milk',
    quantity: 2,
    unit: 'L',
    price: 1.5,
    previousPrice: 1.5,
    bought: false,
    unavailable: false,
    itemPhoto: 'photo-id'
  } as any

  const defaultProps = {
    item: mockItem,
    listStatus: 'PENDING',
    onToggleBought: vi.fn(),
    onEdit: vi.fn(),
    onRemove: vi.fn(),
    onMarkUnavailable: vi.fn(),
    onShowHistory: vi.fn(),
    onPreviewImage: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    window.confirm = vi.fn(() => true)
  })

  const renderRow = (props = {}) => {
    return render(
      <MantineProvider>
        <ListItemRow {...defaultProps} {...props} />
      </MantineProvider>
    )
  }

  it('renders basic item details correctly', () => {
    renderRow()
    expect(screen.getByText('Milk')).toBeInTheDocument()
    expect(screen.getByText('2 L • €1.50')).toBeInTheDocument()
  })

  it('calls onToggleBought when checkbox is clicked', () => {
    renderRow()
    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)
    expect(defaultProps.onToggleBought).toHaveBeenCalledWith(1, true)
  })

  it('renders price trend indicators correctly', () => {
    const { rerender } = renderRow({ item: { ...mockItem, price: 2.0, previousPrice: 1.5 } })
    expect(screen.getByTitle('Price Increased')).toBeInTheDocument()

    rerender(
      <MantineProvider>
        <ListItemRow {...defaultProps} item={{ ...mockItem, price: 1.0, previousPrice: 1.5 }} />
      </MantineProvider>
    )
    expect(screen.getByTitle('Price Decreased')).toBeInTheDocument()

    rerender(
      <MantineProvider>
        <ListItemRow {...defaultProps} item={{ ...mockItem, price: 1.5, previousPrice: 1.5 }} />
      </MantineProvider>
    )
    expect(screen.getByTitle('Price Same')).toBeInTheDocument()
  })

  it('calls onShowHistory when price trend is clicked', () => {
    renderRow()
    fireEvent.click(screen.getByTitle('Price Same'))
    expect(defaultProps.onShowHistory).toHaveBeenCalledWith(mockItem)
  })

  it('calls onPreviewImage when photo is clicked', () => {
    const { container } = renderRow()
    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    fireEvent.click(img!)
    expect(defaultProps.onPreviewImage).toHaveBeenCalledWith('mock-url-photo-id', 'Milk')
  })

  it('calls onEdit when edit button is clicked', () => {
    const { container } = renderRow()
    const editIcon = container.querySelector('.tabler-icon-edit')
    fireEvent.click(editIcon!.closest('button')!)
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockItem)
  })

  it('calls onRemove when remove button is clicked and confirmed', () => {
    const { container } = renderRow()
    const trashIcon = container.querySelector('.tabler-icon-trash')
    fireEvent.click(trashIcon!.closest('button')!)
    expect(window.confirm).toHaveBeenCalledWith('Remove this item?')
    expect(defaultProps.onRemove).toHaveBeenCalledWith(1)
  })

  it('calls onMarkUnavailable when unavailable button is clicked', () => {
    renderRow()
    fireEvent.click(screen.getByTitle('Mark as unavailable'))
    expect(defaultProps.onMarkUnavailable).toHaveBeenCalledWith(1, true)
  })

  it('calls onMarkAvailable when available button is clicked', () => {
    renderRow({ item: { ...mockItem, unavailable: true } })
    fireEvent.click(screen.getByTitle('Mark as available'))
    expect(defaultProps.onMarkUnavailable).toHaveBeenCalledWith(1, false)
  })

  it('disables checkbox when list is COMPLETED', () => {
    renderRow({ listStatus: 'COMPLETED' })
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })

  it('disables checkbox when item is unavailable', () => {
    renderRow({ item: { ...mockItem, unavailable: true } })
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
  })
})
