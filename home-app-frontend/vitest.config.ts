/// <reference types="vitest" />
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        reportOnFailure: true,
        reportsDirectory: './build/test-reports/unit',
        exclude: [
          'src/test/**',
          '**/*.config.*',
          'src/components/Layout.tsx',
          'src/App.tsx',
          'src/main.tsx',
        ],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
      },
      reporters: ['default', 'junit'],
      outputFile: './build/test-reports/unit/results.xml',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
    },
  }),
)
