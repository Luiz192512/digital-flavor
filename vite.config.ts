import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? 'rapidinha'
const base = process.env.GITHUB_PAGES === 'true' ? `/${repositoryName}/` : '/'

export default defineConfig({
  base,
  plugins: [react()],
  test: {
    css: true,
    environment: 'jsdom',
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
    globals: true,
    setupFiles: './src/test/setup.ts'
  }
})
