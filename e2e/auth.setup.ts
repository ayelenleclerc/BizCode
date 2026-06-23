import { test as setup } from '@playwright/test'
import { E2E_AUTH_STATE_PATH, loginAsTestUser } from './helpers/auth'

/**
 * @en One login per E2E run; downstream projects reuse `e2e/.auth/state.json`.
 * @es Un login por ejecución E2E; los proyectos siguientes reutilizan `e2e/.auth/state.json`.
 * @pt-BR Um login por execução E2E; projetos seguintes reutilizam `e2e/.auth/state.json`.
 */
setup('authenticate superadmin', async ({ page }) => {
  const password = (process.env.BIZCODE_SEED_SUPERADMIN_PASSWORD ?? '').trim()
  if (!password) {
    throw new Error(
      'E2E auth setup: set BIZCODE_SEED_SUPERADMIN_PASSWORD (CI secret or local .env), same as prisma seed.',
    )
  }
  await loginAsTestUser(page, password)
  await page.context().storageState({ path: E2E_AUTH_STATE_PATH })
})
