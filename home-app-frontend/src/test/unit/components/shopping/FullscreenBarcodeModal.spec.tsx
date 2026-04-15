import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MantineProvider } from '@mantine/core'
import { FullscreenBarcodeModal } from '../../../../components/shopping/FullscreenBarcodeModal'

describe('FullscreenBarcodeModal', () => {
  const mockData = {
    name: 'Test Card',
    number: '123456789',
    barcodeType: 'CODE_128' as const,
  }

  const renderModal = (props: any) => {
    return render(
      <MantineProvider>
        <FullscreenBarcodeModal {...props} />
      </MantineProvider>
    )
  }

  it('renders nothing when data is null', () => {
    renderModal({ opened: true, onClose: vi.fn(), data: null })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders modal with correct data when opened', () => {
    renderModal({ opened: true, onClose: vi.fn(), data: mockData })
    
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('123456789')).toBeInTheDocument()
    // It should render a barcode (checked via its content in jsdom usually)
    expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn()
    renderModal({ opened: true, onClose, data: mockData })
    
    fireEvent.click(screen.getByRole('button', { name: /Close/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
