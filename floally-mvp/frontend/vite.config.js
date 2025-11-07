import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Build timestamp: 2025-11-07T19:20:00Z - FINAL FIX for TrustedContactsManager
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
        // Force new hash by adding build timestamp
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
