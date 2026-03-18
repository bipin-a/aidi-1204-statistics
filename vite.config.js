import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['tests/**', 'node_modules/**'],
    passWithNoTests: true,
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.js',
  },
})
