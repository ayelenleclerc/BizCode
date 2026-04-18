import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  test: {
    exclude: [...configDefaults.exclude, 'e2e/**', 'tests/integration/**'],
    environment: 'jsdom',
    environmentMatchGlobs: [
      ['tests/api/**', 'node'],
      ['tests/server/**', 'node'],
      ['tests/plan-sync/**', 'node'],
    ],
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      // Ratchet hacia 100% conforme crezca la suite; evita bloquear CI con objetivo irreal hoy.
      thresholds: {
        lines: 88,
        functions: 88,
        branches: 70,
        statements: 82,
      },
      include: ['src/lib/**/*.ts', 'server/createApp.ts', 'server.ts'],
      exclude: ['src/lib/**/*.test.ts', '**/*.d.ts', 'server/main.ts'],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
})
