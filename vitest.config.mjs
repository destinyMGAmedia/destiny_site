import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  esbuild: {
    jsx: 'automatic',
    // src/app/layout.js contains JSX in a .js file (Next.js allows this). Tell esbuild's
    // transform pass to parse .js/.mjs/.cjs as JSX so vitest can import it.
    include: /\.([mc]?[jt]sx?)$/,
    loader: 'jsx',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    css: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
