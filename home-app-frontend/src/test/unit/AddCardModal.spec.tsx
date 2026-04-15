import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { AddCardModal } from '../../components/shopping/AddCardModal'

describe('AddCardModal', () => {
  const onClose = vi.fn()
  const onSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderWithProvider = () => {
    return render(
      <MantineProvider>
        <AddCardModal opened={true} onClose={onClose} onSubmit={onSubmit} isPending={false} />
      </MantineProvider>,
    )
  }

  it('renders modal with title', () => {
    renderWithProvider()
    expect(screen.getByRole('heading', { name: 'Add Loyalty Card' })).toBeInTheDocument()
  })

  it('shows submit button', () => {
    renderWithProvider()
    expect(screen.getByRole('button', { name: 'Add Card' })).toBeInTheDocument()
  })

  it('shows loading state when pending', () => {
    render(
      <MantineProvider>
        <AddCardModal opened={true} onClose={onClose} onSubmit={onSubmit} isPending={true} />
      </MantineProvider>,
    )
    expect(screen.getByRole('button', { name: 'Add Card' })).toBeDisabled()
  })
})