import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // ⬅️ Add this line

export default defineConfig({
  plugins: [react()],
  root: '.',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // ⬅️ This makes @ point to /src
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  server: {
    port: 5173,
  },
})

