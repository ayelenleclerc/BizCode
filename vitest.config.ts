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
      // Umbrales globales tras ampliar `include` a `server/**` y `src/**` (antes ~88% sólo sobre `src/lib` + entry server). Ratchet ascendente cuando suba la cobertura de páginas React.
      thresholds: {
        lines: 66,
        functions: 55,
        branches: 44,
        statements: 64,
      },
      include: ['server/**/*.ts', 'server.ts', 'src/**/*.{ts,tsx}'],
      exclude: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.d.ts',
        'server/main.ts',
        'server/createApp.types.ts',
        'src/types.ts',
        'src/lib/plan-sync/index.ts',
      ],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
})
