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
      // Tier 2 CI floor (see docs/en/quality/testing-strategy.md — three-tier coverage policy).
      // Global include: server/** + src/** (~66% lines baseline; realistic ceiling ~80–88%).
      // Tier 1 normative 100%: createApp.ts, server.ts, pure src/lib/** (not enforced per-file here).
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
