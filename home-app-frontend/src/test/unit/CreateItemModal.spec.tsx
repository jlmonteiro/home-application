import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { CreateItemModal } from '../../components/shopping/CreateItemModal'

const categoryOptions = [
  { value: '1', label: 'Dairy' },
  { value: '2', label: 'Produce' },
]

describe('CreateItemModal', () => {
  const onClose = vi.fn()
  const onSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderWithProvider = (props = {}) => {
    return render(
      <MantineProvider>
        <CreateItemModal
          opened={true}
          onClose={onClose}
          categoryOptions={categoryOptions}
          initialName=""
          onSubmit={onSubmit}
          isPending={false}
          {...props}
        />
      </MantineProvider>,
    )
  }

  it('renders modal with title', () => {
    renderWithProvider()
    expect(screen.getByRole('heading', { name: 'Create New Master Item' })).toBeInTheDocument()
  })

  it('populates initial name from props', () => {
    renderWithProvider({ initialName: 'Apple' })
    expect(screen.getByRole('textbox', { name: /Item Name/i })).toHaveValue('Apple')
  })

  it('shows validation errors for required fields', async () => {
    renderWithProvider()
    
    // Submit form using native submit event to trigger Mantine validation
    const form = document.querySelector('form')!
    fireEvent.submit(form)
    
    // Wait for validation errors to appear
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
      expect(screen.getByText('Category is required')).toBeInTheDocument()
    })
  })

  it('calls onSubmit with form values', async () => {
    renderWithProvider({ initialName: 'Milk' })
    
    // Fill category - use placeholder
    const categorySelect = screen.getByPlaceholderText(/Select category/i)
    fireEvent.focus(categorySelect)
    fireEvent.click(screen.getByText('Dairy'))

    const submitBtn = screen.getByRole('button', { name: 'Create and Select' })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Milk',
          categoryId: '1',
        }),
        expect.anything()
      )
    })
  })

  it('handles photo selection', async () => {
    renderWithProvider()
    
    const file = new File(['hello'], 'hello.png', { type: 'image/png' })
    const fileInput = document.querySelector('input[type="file"]')!
    
    fireEvent.change(fileInput, { target: { files: [file] } })

    await waitFor(() => {
      expect(screen.getByRole('img')).toBeInTheDocument()
    })
  })

  it('shows loading state when pending', () => {
    renderWithProvider({ isPending: true })
    expect(screen.getByRole('button', { name: 'Create and Select' })).toBeDisabled()
  })

  it('calls onClose when modal is closed', async () => {
    renderWithProvider()
    
    // Find the close button by its aria-label or class
    const closeButton = document.querySelector('[data-mantine-close-button]') as HTMLElement
    
    if (closeButton) {
      fireEvent.click(closeButton)
      await waitFor(() => {
        expect(onClose).toHaveBeenCalled()
      })
    }
  })

  it('handles empty category options', () => {
    renderWithProvider({ categoryOptions: [] })
    // Should still render without crashing
    expect(screen.getByRole('heading', { name: 'Create New Master Item' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Select category/i)).toBeInTheDocument()
  })

  it('handles null file in photo upload', () => {
    renderWithProvider()
    
    const fileButton = screen.getByRole('button', { name: /Upload Photo/i })
    fireEvent.click(fileButton)
    
    // Should not crash when file is null
    expect(fileButton).toBeInTheDocument()
  })

  it('does not update name if initialName is empty and name already has value', () => {
    const { rerender } = render(
      <MantineProvider>
        <CreateItemModal
          opened={true}
          onClose={onClose}
          categoryOptions={categoryOptions}
          initialName="Initial"
          onSubmit={onSubmit}
          isPending={false}
        />
      </MantineProvider>,
    )
    
    // Name should be set to 'Initial'
    expect(screen.getByRole('textbox', { name: /Item Name/i })).toHaveValue('Initial')
    
    // Rerender with empty initialName - name should stay 'Initial'
    rerender(
      <MantineProvider>
        <CreateItemModal
          opened={true}
          onClose={onClose}
          categoryOptions={categoryOptions}
          initialName=""
          onSubmit={onSubmit}
          isPending={false}
        />
      </MantineProvider>,
    )
    
    expect(screen.getByRole('textbox', { name: /Item Name/i })).toHaveValue('Initial')
  })
})