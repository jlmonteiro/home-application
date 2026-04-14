import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { MarkdownContent } from '../../components/MarkdownContent'

describe('MarkdownContent', () => {
  const renderWithProvider = (content: string) =>
    render(
      <MantineProvider>
        <MarkdownContent content={content} />
      </MantineProvider>,
    )

  it('renders headings', () => {
    renderWithProvider('# Heading 1\n## Heading 2\n### Heading 3')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Heading 1')
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Heading 2')
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Heading 3')
  })

  it('renders paragraphs', () => {
    renderWithProvider('This is a paragraph.\n\nAnother paragraph.')
    expect(screen.getByText('This is a paragraph.')).toBeInTheDocument()
    expect(screen.getByText('Another paragraph.')).toBeInTheDocument()
  })

  it('renders unordered lists', () => {
    renderWithProvider('- Item 1\n- Item 2\n- Item 3')
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })

  it('renders ordered lists', () => {
    renderWithProvider('1. First item\n2. Second item\n3. Third item')
    expect(screen.getByText('First item')).toBeInTheDocument()
    expect(screen.getByText('Second item')).toBeInTheDocument()
  })

  it('renders tables', () => {
    renderWithProvider(`| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`)
    expect(screen.getByText('Header 1')).toBeInTheDocument()
    expect(screen.getByText('Cell 1')).toBeInTheDocument()
  })

  it('renders links with target=_blank', () => {
    renderWithProvider('[Open Google](https://google.com)')
    const link = screen.getByRole('link', { name: 'Open Google' })
    expect(link).toHaveAttribute('href', 'https://google.com')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders code blocks', () => {
    renderWithProvider('`const x = 1;`')
    expect(screen.getByText('const x = 1;')).toBeInTheDocument()
  })

  it('renders blockquotes', () => {
    renderWithProvider('> This is a quote')
    expect(screen.getByText('This is a quote')).toBeInTheDocument()
  })

  it('renders horizontal rules', () => {
    renderWithProvider('---\nSome content')
    expect(document.querySelector('hr')).toBeInTheDocument()
  })
})