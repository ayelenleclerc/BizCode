import { test, expect } from '@playwright/test'

test.describe('smoke', () => {
  test('SPA shell loads after navigation from root', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('#root')).toBeVisible()
    await expect(page).toHaveTitle(/BizCode/i)
  })
})
