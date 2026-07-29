import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@bizcode/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      '@bizcode/api-client': path.resolve(__dirname, '../../packages/api-client/src/index.ts'),
    },
  },
  /**
   * @en esbuild ≥0.28 (pnpm override for CVE-2025-68121) cannot downlevel some
   *     destructuring for Vite’s default safari14 target; keep native destructuring.
   * @es esbuild ≥0.28 (override pnpm por CVE-2025-68121) no puede bajar cierto
   *     destructuring al target safari14 por defecto de Vite; conservar nativo.
   * @pt-BR esbuild ≥0.28 (override pnpm para CVE-2025-68121) não consegue baixar
   *     certos destructuring ao target safari14 padrão do Vite; manter nativo.
   */
  esbuild: {
    supported: {
      destructuring: true,
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      supported: {
        destructuring: true,
      },
    },
  },
  build: {
    target: 'es2022',
  },
  server: {
    port: 5173,
    strictPort: true,
  },
})
