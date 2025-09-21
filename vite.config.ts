import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['lucide-react'], // bundle once as /node_modules/.vite/deps/lucide-react.js
  },
})
