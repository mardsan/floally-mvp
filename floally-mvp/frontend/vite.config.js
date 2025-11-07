import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build timestamp: 2025-11-07T16:40:00Z - Force rebuild with TrustedContactsManager
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
