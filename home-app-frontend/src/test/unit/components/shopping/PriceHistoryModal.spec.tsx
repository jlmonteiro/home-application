import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MantineProvider } from '@mantine/core'
import { PriceHistoryModal } from '../../../../components/shopping/PriceHistoryModal'

describe('PriceHistoryModal', () => {
  const renderModal = (props: any) => {
    return render(
      <MantineProvider>
        <PriceHistoryModal {...props} />
      </MantineProvider>
    )
  }

  it('renders loading overlay when isLoading is true', () => {
    renderModal({ opened: true, onClose: vi.fn(), itemName: 'Milk', history: [], isLoading: true })
    expect(document.querySelector('.mantine-LoadingOverlay-root')).toBeInTheDocument()
  })

  it('renders empty state when history is empty', () => {
    renderModal({ opened: true, onClose: vi.fn(), itemName: 'Milk', history: [], isLoading: false })
    expect(screen.getByText('No price history available for this item yet.')).toBeInTheDocument()
  })

  it('renders history timeline when data is provided', () => {
    const history = [
      { id: 1, price: 1.5, recordedAt: '2023-01-01T10:00:00Z', storeName: 'Tesco' },
      { id: 2, price: 2.0, recordedAt: '2023-01-02T12:00:00Z', storeName: null }
    ]
    renderModal({ opened: true, onClose: vi.fn(), itemName: 'Milk', history, isLoading: false })
    
    expect(screen.getByText('€1.50')).toBeInTheDocument()
    expect(screen.getByText('Tesco')).toBeInTheDocument()
    
    expect(screen.getByText('€2.00')).toBeInTheDocument()
    expect(screen.getByText('Any Store')).toBeInTheDocument()
  })
})
