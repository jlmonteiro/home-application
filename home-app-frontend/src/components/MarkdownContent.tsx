import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Title, Text, List, Table, Anchor, Divider, Box, Code } from '@mantine/core'
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript'
import ts from 'react-syntax-highlighter/dist/esm/languages/hljs/typescript'
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java'
import sql from 'react-syntax-highlighter/dist/esm/languages/hljs/sql'
import bash from 'react-syntax-highlighter/dist/esm/languages/hljs/bash'
import xml from 'react-syntax-highlighter/dist/esm/languages/hljs/xml'
import css from 'react-syntax-highlighter/dist/esm/languages/hljs/css'
import json from 'react-syntax-highlighter/dist/esm/languages/hljs/json'
import markdown from 'react-syntax-highlighter/dist/esm/languages/hljs/markdown'
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs'

// Register common languages
SyntaxHighlighter.registerLanguage('javascript', js)
SyntaxHighlighter.registerLanguage('typescript', ts)
SyntaxHighlighter.registerLanguage('java', java)
SyntaxHighlighter.registerLanguage('sql', sql)
SyntaxHighlighter.registerLanguage('bash', bash)
SyntaxHighlighter.registerLanguage('xml', xml)
SyntaxHighlighter.registerLanguage('css', css)
SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('markdown', markdown)

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
          code: ({ className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : ''
            const isInline = !className

            if (isInline) {
              return (
                <Code color="gray.7" variant="light" {...props}>
                  {children}
                </Code>
              )
            }

            return (
              <SyntaxHighlighter
                style={atomOneDark}
                language={language}
                PreTag="div"
                {...props}
                customStyle={{
                  borderRadius: 'var(--mantine-radius-md)',
                  margin: '1.5rem 0',
                  padding: '1rem',
                  fontSize: '0.85rem',
                }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            )
          },
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
