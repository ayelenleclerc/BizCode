import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { E2E_AUTH_STATE_PATH } from './helpers/auth'

test.describe('Accessibility — axe (critical surfaces)', () => {
  test('login page has no axe violations', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'load' })
    await page.getByTestId('login-tenant-slug').waitFor({ state: 'visible' })
    const { violations } = await new AxeBuilder({ page }).analyze()
    expect(violations, JSON.stringify(violations, null, 2)).toHaveLength(0)
  })

  test.describe('authenticated surfaces', () => {
    test.use({ storageState: E2E_AUTH_STATE_PATH })

    test('inicio after login has no axe violations', async ({ page }) => {
      await page.goto('/inicio', { waitUntil: 'load' })
    await page.getByTestId('inicio-tabs').waitFor({ state: 'visible' })
    await page.locator('main').waitFor({ state: 'visible' })
    const { violations } = await new AxeBuilder({ page }).analyze()
    expect(violations, JSON.stringify(violations, null, 2)).toHaveLength(0)
    })
  })
})
