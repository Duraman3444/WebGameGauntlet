import { defineConfig } from 'vite'

export default defineConfig({
  root: 'src/client',
  publicDir: '../../public', // Point to the public folder in project root
  server: {
    port: 3002,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true
      }
    }
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: true
  },
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.fbx', '**/*.obj']
}) 