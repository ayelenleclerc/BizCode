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
      ['packages/api-client/**', 'jsdom'],
      ['packages/ui/src/**/*.test.ts', 'node'],
    ],
    globals: true,
    setupFiles: ['./apps/web/src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      // Tier 2 CI floor (see docs/en/quality/testing-strategy.md — three-tier coverage policy).
      // Global include: apps/server/** + apps/web/src/** + packages/api-client (~66% lines baseline).
      // Tier 1 normative 100%: createApp.ts, server.ts, pure src/lib/** (not enforced per-file here).
      thresholds: {
        lines: 66,
        functions: 55,
        branches: 44,
        statements: 64,
      },
      include: [
        'apps/server/**/*.ts',
        'apps/web/src/**/*.{ts,tsx}',
        'packages/api-client/src/**/*.ts',
      ],
      exclude: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.d.ts',
        'apps/server/main.ts',
        'packages/types/src/server-inputs.ts',
        'apps/web/src/types.ts',
        'apps/web/src/lib/plan-sync/index.ts',
        'apps/web/src/lib/api.ts',
        'apps/web/src/lib/api-config.ts',
        'apps/web/src/lib/rbac.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'apps/web/src'),
      '@bizcode/types': path.resolve(__dirname, 'packages/types/src/index.ts'),
      '@bizcode/api-client': path.resolve(__dirname, 'packages/api-client/src/index.ts'),
      // Subpaths before bare `@bizcode/ui` so `@bizcode/ui/web` is not rewritten to index.ts/web.
      '@bizcode/ui/web': path.resolve(__dirname, 'packages/ui/src/web/index.ts'),
      '@bizcode/ui/native': path.resolve(__dirname, 'packages/ui/src/native/index.ts'),
      '@bizcode/ui': path.resolve(__dirname, 'packages/ui/src/index.ts'),
    },
    dedupe: ['react', 'react-dom'],
  },
})
