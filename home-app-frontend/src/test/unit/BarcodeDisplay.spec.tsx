import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { BarcodeDisplay } from '../../components/shopping/BarcodeDisplay'

describe('BarcodeDisplay', () => {
  const renderWithProvider = (component: React.ReactNode) => {
    return render(<MantineProvider>{component}</MantineProvider>)
  }

  it('renders without crashing for QR type', () => {
    expect(() => renderWithProvider(<BarcodeDisplay code="12345" type="QR" />)).not.toThrow()
  })

  it('renders without crashing for CODE_128 type', () => {
    expect(() => renderWithProvider(<BarcodeDisplay code="12345" type="CODE_128" />)).not.toThrow()
  })

  it('renders with sm size', () => {
    expect(() => renderWithProvider(<BarcodeDisplay code="12345" type="QR" size="sm" />)).not.toThrow()
  })

  it('renders with md size by default', () => {
    expect(() => renderWithProvider(<BarcodeDisplay code="12345" type="QR" />)).not.toThrow()
  })

  it('renders with lg size', () => {
    expect(() => renderWithProvider(<BarcodeDisplay code="12345" type="QR" size="lg" />)).not.toThrow()
  })
})