import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Title, Text, List, Table, Anchor, Divider, Box, Code } from '@mantine/core'

interface MarkdownContentProps {
  content: string
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <Box className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <Title order={1} mb="sm" mt="md">
              {children}
            </Title>
          ),
          h2: ({ children }) => (
            <Title order={2} mb="sm" mt="md">
              {children}
            </Title>
          ),
          h3: ({ children }) => (
            <Title order={3} mb="xs" mt="sm">
              {children}
            </Title>
          ),
          h4: ({ children }) => (
            <Title order={4} mb="xs" mt="sm">
              {children}
            </Title>
          ),
          p: ({ children }) => (
            <Text mb="sm" size="sm" style={{ lineHeight: 1.6 }}>
              {children}
            </Text>
          ),
          ul: ({ children }) => (
            <List withPadding mb="sm" size="sm">
              {children}
            </List>
          ),
          ol: ({ children }) => (
            <List type="ordered" withPadding mb="sm" size="sm">
              {children}
            </List>
          ),
          li: ({ children }) => <List.Item>{children}</List.Item>,
          table: ({ children }) => (
            <Box mb="md" style={{ overflowX: 'auto' }}>
              <Table withTableBorder withColumnBorders verticalSpacing="xs">
                {children}
              </Table>
            </Box>
          ),
          thead: ({ children }) => <Table.Thead bg="gray.0">{children}</Table.Thead>,
          tbody: ({ children }) => <Table.Tbody>{children}</Table.Tbody>,
          tr: ({ children }) => <Table.Tr>{children}</Table.Tr>,
          th: ({ children }) => <Table.Th>{children}</Table.Th>,
          td: ({ children }) => <Table.Td>{children}</Table.Td>,
          a: ({ href, children }) => (
            <Anchor href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </Anchor>
          ),
          hr: () => <Divider my="md" />,
          code: ({ children }) => <Code>{children}</Code>,
          blockquote: ({ children }) => (
            <Box
              pl="md"
              py="xs"
              mb="sm"
              style={{ borderLeft: '4px solid var(--mantine-color-gray-3)', fontStyle: 'italic' }}
            >
              {children}
            </Box>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  )
}
