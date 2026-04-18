import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { loginAsTestUser } from './helpers/auth'

const TEST_PASSWORD = (process.env.BIZCODE_SEED_SUPERADMIN_PASSWORD ?? '').trim()

test.describe('Accessibility — axe (critical surfaces)', () => {
  test('login page has no axe violations', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible' })
    const { violations } = await new AxeBuilder({ page }).analyze()
    expect(violations, JSON.stringify(violations, null, 2)).toHaveLength(0)
  })

  test('inicio after login has no axe violations', async ({ page }) => {
    await loginAsTestUser(page, TEST_PASSWORD)
    await page.goto('/inicio', { waitUntil: 'networkidle' })
    const { violations } = await new AxeBuilder({ page }).analyze()
    expect(violations, JSON.stringify(violations, null, 2)).toHaveLength(0)
  })
})
