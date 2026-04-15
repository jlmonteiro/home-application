import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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

  const renderWithProvider = () => {
    return render(
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
  }

  it('renders modal with title', () => {
    renderWithProvider()
    expect(screen.getByRole('heading', { name: 'Create New Master Item' })).toBeInTheDocument()
  })

  it('shows upload photo button', () => {
    renderWithProvider()
    expect(screen.getByRole('button', { name: /Upload Photo/i })).toBeInTheDocument()
  })

  it('shows submit button', () => {
    renderWithProvider()
    expect(screen.getByRole('button', { name: 'Create and Select' })).toBeInTheDocument()
  })

  it('shows loading state when pending', () => {
    render(
      <MantineProvider>
        <CreateItemModal
          opened={true}
          onClose={onClose}
          categoryOptions={categoryOptions}
          initialName=""
          onSubmit={onSubmit}
          isPending={true}
        />
      </MantineProvider>,
    )
    expect(screen.getByRole('button', { name: 'Create and Select' })).toBeDisabled()
  })
})