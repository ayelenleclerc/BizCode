import type { Browser, Page } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

/** @en Playwright storage state path (gitignored); shared session for E2E suites. */
export const E2E_AUTH_STATE_PATH = path.join('e2e', '.auth', 'state.json')

/**
 * @en Ensures a logged-in storage state exists (one login per suite run).
 * @es Garantiza un storage state autenticado (un login por ejecución de suite).
 * @pt-BR Garante storage state autenticado (um login por execução da suíte).
 */
export async function ensureE2EAuthState(browser: Browser, password: string): Promise<void> {
  fs.mkdirSync(path.dirname(E2E_AUTH_STATE_PATH), { recursive: true })
  const context = await browser.newContext()
  const page = await context.newPage()
  await loginAsTestUser(page, password)
  await context.storageState({ path: E2E_AUTH_STATE_PATH })
  await context.close()
}

/**
 * @en Login as superadmin (platform/ayelen) for E2E tests
 * @es Iniciar sesión como superadmin (platform/ayelen) para pruebas E2E
 * @pt-BR Fazer login como superadmin (platform/ayelen) para testes E2E
 */
export async function loginAsTestUser(page: Page, password: string) {
  if (!password.trim()) {
    throw new Error(
      'E2E login password missing: set BIZCODE_SEED_SUPERADMIN_PASSWORD (GitHub secret or local .env), same as prisma seed for superadmin.'
    )
  }
  await page.goto('/login', { waitUntil: 'load' })
  await page.getByTestId('login-tenant-slug').waitFor({ state: 'visible' })

  // Fill in login form with test credentials
  await page.fill('[data-testid="login-tenant-slug"]', 'platform')
  await page.fill('[data-testid="login-username"]', 'ayelen')
  await page.fill('[data-testid="login-password"]', password)

  // Submit login form
  await page.click('[data-testid="login-submit"]')

  // Wait for navigation to complete and session to be established.
  // Avoid `networkidle`: SPAs / APIs keep connections open and CI often times out.
  await page.waitForURL('**/inicio', { timeout: 15_000 })
  await page.waitForLoadState('load')
}
