import { defineConfig } from 'vite'

export default defineConfig({
  base: '/simulador/', // importante para GitHub Pages
  build: { outDir: 'dist' },
  server: { open: true }
})
