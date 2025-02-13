import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    assetsDir: '.',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'src/index.html')
      }
    }
  }
})
