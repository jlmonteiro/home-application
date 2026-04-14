import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MarkdownContent } from '../../components/MarkdownContent'

describe('MarkdownContent', () => {
  it('renders headings', () => {
    render(<MarkdownContent content="# Heading 1\n## Heading 2\n### Heading 3" />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Heading 1')
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Heading 2')
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Heading 3')
  })

  it('renders paragraphs', () => {
    render(<MarkdownContent content="This is a paragraph.\n\nAnother paragraph." />)
    expect(screen.getByText('This is a paragraph.')).toBeInTheDocument()
    expect(screen.getByText('Another paragraph.')).toBeInTheDocument()
  })

  it('renders unordered lists', () => {
    render(
      <MarkdownContent content="- Item 1\n- Item 2\n- Item 3" />,
    )
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
    expect(screen.getByText('Item 3')).toBeInTheDocument()
  })

  it('renders ordered lists', () => {
    render(
      <MarkdownContent content="1. First item\n2. Second item\n3. Third item" />,
    )
    expect(screen.getByText('First item')).toBeInTheDocument()
    expect(screen.getByText('Second item')).toBeInTheDocument()
  })

  it('renders tables', () => {
    render(
      <MarkdownContent
        content={`| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`}
      />,
    )
    expect(screen.getByText('Header 1')).toBeInTheDocument()
    expect(screen.getByText('Cell 1')).toBeInTheDocument()
  })

  it('renders links with target=_blank', () => {
    render(<MarkdownContent content="[Open Google](https://google.com)" />)
    const link = screen.getByRole('link', { name: 'Open Google' })
    expect(link).toHaveAttribute('href', 'https://google.com')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('renders code blocks', () => {
    render(<MarkdownContent content="`const x = 1;`" />)
    expect(screen.getByText('const x = 1;')).toBeInTheDocument()
  })

  it('renders blockquotes', () => {
    render(<MarkdownContent content="> This is a quote" />)
    expect(screen.getByText('This is a quote')).toBeInTheDocument()
  })

  it('renders horizontal rules', () => {
    render(<MarkdownContent content="---\nSome content" />)
    expect(document.querySelector('hr')).toBeInTheDocument()
  })
})