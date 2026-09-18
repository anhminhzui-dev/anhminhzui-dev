import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/anhminhzui-dev/',
  appType: 'mpa', // Unknown prototype routes must 404, never become the portfolio at a nested base.
  plugins: [react()],
  build: {
    outDir: '../docs',
    emptyOutDir: true,
  },
})
