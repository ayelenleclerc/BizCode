import type { Page } from '@playwright/test'

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
  await page.goto('/login')

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
