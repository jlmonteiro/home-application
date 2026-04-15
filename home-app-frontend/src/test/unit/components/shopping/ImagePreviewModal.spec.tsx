import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { MantineProvider } from '@mantine/core'
import { ImagePreviewModal } from '../../../../components/shopping/ImagePreviewModal'

describe('ImagePreviewModal', () => {
  const renderModal = (props: any) => {
    return render(
      <MantineProvider>
        <ImagePreviewModal {...props} />
      </MantineProvider>
    )
  }

  it('renders image with correct url and title', () => {
    renderModal({ opened: true, onClose: vi.fn(), url: 'http://example.com/img.png', title: 'My Image' })
    
    const imageElement = document.querySelector('img')
    expect(imageElement).toBeInTheDocument()
    expect(imageElement).toHaveAttribute('src', 'http://example.com/img.png')
    expect(screen.getByText('My Image')).toBeInTheDocument()
  })
})
