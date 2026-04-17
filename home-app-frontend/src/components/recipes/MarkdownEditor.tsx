import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism-tomorrow.css';
import { Box, useMantineColorScheme, useMantineTheme } from '@mantine/core';

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
  const theme = useMantineTheme();
  
  return (
    <Box
      p="xs"
      style={{
        border: `1px solid ${
          colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4]
        }`,
        borderRadius: theme.radius.sm,
        backgroundColor: colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
        fontFamily: theme.fontFamilyMonospace,
        fontSize: theme.fontSizes.sm,
        minHeight,
        overflow: 'hidden',
        transition: 'border-color 100ms ease',
      }}
      // Use a simple focus-within class hack via data attributes or global styles if needed, 
      // but for now let's just make it valid. Mantine 7 style prop doesn't support nested selectors.
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
