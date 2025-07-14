import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  base: '/',
  publicDir: 'assets',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/assets': resolve(__dirname, './assets')
    }
  },
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  optimizeDeps: {
    include: ['phaser']
  }
}) 