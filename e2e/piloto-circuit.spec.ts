import { test, expect } from '@playwright/test'
import { E2E_AUTH_STATE_PATH } from './helpers/auth'

/**
 * @en Distributor pilot UI circuit (#450): pedidos/cobros/facturación with real postconditions.
 * @es Circuito UI piloto distribuidora (#450): pedidos/cobros/facturación con postcondiciones reales.
 * @pt-BR Circuito UI piloto distribuidora (#450): pedidos/cobros/faturamento com pós-condições reais.
 */
test.describe('Piloto circuit — pedidos / cobros / facturación (#450)', () => {
  test.describe.configure({ mode: 'serial' })
  test.use({ storageState: E2E_AUTH_STATE_PATH })

  const generateId = () => Math.random().toString(36).substring(7).toUpperCase()
  const generateNumericCodigo = () => Math.floor(10_000_000 + Math.random() * 89_999_999)

  let clienteId: string
  let clienteRazon: string

  test('Create cliente usable for pedido', async ({ page }) => {
    const codigo = generateNumericCodigo()
    clienteRazon = `E2E Piloto ${generateId()}`

    await page.goto('/clientes', { waitUntil: 'load' })
    await page.getByTestId('btn-nuevo-cliente').click()
    await expect(page.getByTestId('cliente-form-dialog')).toBeVisible()

    await page.getByTestId('cliente-form-codigo').fill(String(codigo))
    await page.getByTestId('cliente-form-rsocial').fill(clienteRazon)
    await page.getByTestId('cliente-privacy-consent-input').check()

    const createWait = page.waitForResponse(
      (r) => r.url().includes('/api/clientes') && r.request().method() === 'POST',
    )
    await page.getByTestId('btn-save-cliente').click()
    const createResp = await createWait
    expect(createResp.ok(), `POST /api/clientes → ${createResp.status()}`).toBeTruthy()
    const created = (await createResp.json()) as { data?: { id?: number } }
    expect(created.data?.id, 'cliente id from create response').toBeTruthy()
    clienteId = String(created.data!.id)

    await expect(page.getByTestId('cliente-form-dialog')).toBeHidden({ timeout: 20_000 })
    const row = page.locator('[data-testid="clientes-table"] tbody tr').filter({ hasText: clienteRazon })
    await expect(row).toBeVisible()
  })

  test('Navigate pedidos / cobros / facturación surfaces', async ({ page }) => {
    await page.goto('/inicio', { waitUntil: 'load' })
    await expect(page).toHaveURL(/\/inicio/, { timeout: 15_000 })

    await page.goto('/pedidos', { waitUntil: 'load' })
    await expect(page.getByTestId('pedidos-page')).toBeVisible({ timeout: 15_000 })

    await page.goto('/cobros', { waitUntil: 'load' })
    await expect(page.getByTestId('cobros-page')).toBeVisible({ timeout: 15_000 })

    await page.goto('/facturacion', { waitUntil: 'load' })
    await expect(page).toHaveURL(/\/facturacion/, { timeout: 15_000 })
    await expect(page.getByTestId('btn-nueva-factura')).toBeVisible({ timeout: 20_000 })
  })

  test('Create draft pedido and confirm it', async ({ page }) => {
    expect(clienteId, 'depends on cliente created in prior test').toBeTruthy()

    // Rate-limit window may still be hot after prior API traffic in this serial suite.
    await page.waitForTimeout(2_000)

    await page.goto('/pedidos', { waitUntil: 'load' })
    await expect(page.getByTestId('pedidos-page')).toBeVisible({ timeout: 15_000 })

    await page.getByTestId('pedidos-new-btn').click()
    await expect(page.getByTestId('pedidos-create-dialog')).toBeVisible()

    const desc = `Linea piloto ${generateId()}`
    await page.getByTestId('pedidos-create-cliente').fill(clienteId)
    await page.getByTestId('pedidos-create-descripcion').fill(desc)
    await page.getByTestId('pedidos-create-cantidad').fill('2')
    await page.getByTestId('pedidos-create-precio').fill('100')

    let createResp = null as Awaited<ReturnType<typeof page.waitForResponse>> | null
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const createWait = page.waitForResponse(
        (r) =>
          r.url().includes('/api/pedidos') &&
          r.request().method() === 'POST' &&
          !r.url().includes('/confirm'),
      )
      await page.getByTestId('pedidos-create-submit').click()
      createResp = await createWait
      if (createResp.ok()) break
      if (createResp.status() === 429) {
        await page.waitForTimeout(3_000)
        continue
      }
      break
    }
    expect(createResp?.ok(), `POST /api/pedidos → ${createResp?.status()}`).toBeTruthy()
    await expect(page.getByTestId('pedidos-create-dialog')).toBeHidden({ timeout: 15_000 })

    const row = page.locator('[data-testid="pedidos-table"] tbody tr').filter({ hasText: clienteRazon }).first()
    await expect(row).toBeVisible({ timeout: 15_000 })

    const confirmBtn = row.locator('[data-testid^="pedido-confirm-"]').first()
    await expect(confirmBtn).toBeVisible({ timeout: 10_000 })

    const confirmWait = page.waitForResponse(
      (r) => r.url().includes('/confirm') && r.request().method() === 'POST',
    )
    await confirmBtn.click()
    const confirmResp = await confirmWait
    expect(confirmResp.ok(), `POST confirm → ${confirmResp.status()}`).toBeTruthy()

    await expect(row.locator('[data-testid^="pedido-confirm-"]')).toHaveCount(0, { timeout: 15_000 })
  })

  test('Open cobro form dialog', async ({ page }) => {
    await page.goto('/cobros', { waitUntil: 'load' })
    await expect(page.getByTestId('cobros-page')).toBeVisible({ timeout: 15_000 })
    await page.getByTestId('cobros-new-btn').click()
    await expect(page.getByTestId('dialog-cobro-form')).toBeVisible({ timeout: 10_000 })
    await expect(page.getByTestId('cobro-form')).toBeVisible()
  })
})
