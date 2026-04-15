import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MantineProvider } from '@mantine/core'
import { EditListModal } from '../../../../components/shopping/EditListModal'

describe('EditListModal', () => {
  const renderModal = (props: any) => {
    return render(
      <MantineProvider>
        <EditListModal {...props} />
      </MantineProvider>
    )
  }

  it('renders initial values correctly', () => {
    const list = { name: 'My List', description: 'Some description' }
    renderModal({ opened: true, onClose: vi.fn(), list, onSubmit: vi.fn(), isPending: false })
    
    expect(screen.getByLabelText(/List Name/i)).toHaveValue('My List')
    expect(screen.getByLabelText(/Description/i)).toHaveValue('Some description')
  })

  it('shows validation error when name is empty', async () => {
    renderModal({ opened: true, onClose: vi.fn(), list: null, onSubmit: vi.fn(), isPending: false })
    
    const form = document.querySelector('form')
    fireEvent.submit(form!)
    
    await waitFor(() => {
      expect(screen.getByText(/Name is required/i)).toBeInTheDocument()
    })
  })

  it('calls onSubmit with form data', async () => {
    const onSubmit = vi.fn()
    const list = { id: 1, name: 'Old Name', description: 'Old Desc' } as any
    renderModal({ opened: true, onClose: vi.fn(), list, onSubmit, isPending: false })
    
    const nameInput = screen.getByLabelText(/List Name/i)
    fireEvent.change(nameInput, { target: { value: 'New Name' } })
    
    const form = document.querySelector('form')
    fireEvent.submit(form!)
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Name',
          description: 'Old Desc'
        }),
        expect.anything()
      )
    })
  })

  it('shows loading state when isPending is true', () => {
    renderModal({ opened: true, onClose: vi.fn(), list: null, onSubmit: vi.fn(), isPending: true })
    expect(screen.getByRole('button', { name: /Save Changes/i })).toHaveAttribute('data-loading')
  })

  it('calls onClose when modal is closed', () => {
    const onClose = vi.fn()
    renderModal({ opened: true, onClose, list: null, onSubmit: vi.fn(), isPending: false })
    
    const closeBtn = document.querySelector('.mantine-Modal-close')
    expect(closeBtn).toBeInTheDocument()
    fireEvent.click(closeBtn!)
    
    expect(onClose).toHaveBeenCalled()
  })
})
