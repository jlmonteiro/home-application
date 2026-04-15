import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: process.env.E2E_MOCK
      ? undefined
      : {
          '/api': {
            target: 'http://localhost:8080',
            changeOrigin: true,
          },
          '/oauth2': {
            target: 'http://localhost:8080',
            changeOrigin: true,
          },
          '/login/oauth2': {
            target: 'http://localhost:8080',
            changeOrigin: true,
          },
          '/logout': {
            target: 'http://localhost:8080',
            changeOrigin: true,
          },
        },
  },
})
