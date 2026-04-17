import type { Page } from '@playwright/test'

/**
 * @en Login as superadmin (platform/ayelen) for E2E tests
 * @es Iniciar sesión como superadmin (platform/ayelen) para pruebas E2E
 * @pt-BR Fazer login como superadmin (platform/ayelen) para testes E2E
 */
export async function loginAsTestUser(page: Page, password: string) {
  await page.goto('/login')

  // Fill in login form with test credentials
  await page.fill('[data-testid="login-tenant-slug"]', 'platform')
  await page.fill('[data-testid="login-username"]', 'ayelen')
  await page.fill('[data-testid="login-password"]', password)

  // Submit login form
  await page.click('[data-testid="login-submit"]')

  // Wait for navigation to complete and session to be established
  await page.waitForURL('**/inicio', { timeout: 10000 })
  await page.waitForLoadState('networkidle')
}
