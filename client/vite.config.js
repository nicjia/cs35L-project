import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // This is the magic part
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Your backend
        changeOrigin: true,
      },
    },
  },
})