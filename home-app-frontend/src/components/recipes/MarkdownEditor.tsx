import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-tomorrow.css';
import { Box, useMantineColorScheme } from '@mantine/core';

// Handle potential ESM/CJS interop for the Editor component
const CodeEditor = (Editor as any).default || Editor;

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string | number;
}

export function MarkdownEditor({ value, onChange, placeholder, minHeight = 300 }: MarkdownEditorProps) {
  const { colorScheme } = useMantineColorScheme();
  
  return (
    <Box
      p="xs"
      style={(theme) => ({
        border: `1px solid ${
          colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4]
        }`,
        borderRadius: theme.radius.sm,
        backgroundColor: colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        fontFamily: theme.fontFamilyMonospace,
        fontSize: theme.fontSizes.sm,
        minHeight,
        overflow: 'hidden',
        '&:focus-within': {
          borderColor: theme.colors.indigo[6],
        },
      })}
    >
      <CodeEditor
        value={value}
        onValueChange={onChange}
        highlight={(code: string) => highlight(code, languages.markdown, 'markdown')}
        padding={15}
        placeholder={placeholder}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 14,
          outline: 'none',
          minHeight,
        }}
      />
    </Box>
  );
}
