/**
 * @en Mercado Libre webhook service tests — orders_v2 → venta_meli (#185).
 * @es Tests del servicio webhook ML — orders_v2 → venta_meli (#185).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { MeliWebhookService } from '../../../apps/server/services/MeliWebhookService'
import { encryptFiscalSecret } from '../../../apps/server/fiscal/ar/fiscalSecrets'

vi.mock('../../../apps/server/integrations/meli/meliItemsClient', () => ({
  getMeliOrder: vi.fn(),
  getMeliItem: vi.fn(),
  updateMeliItem: vi.fn(),
}))

vi.mock('../../../apps/server/services/MeliStockSyncService', () => ({
  MeliStockSyncService: class {
    syncStockToMeli = vi.fn().mockResolvedValue({ ok: true, data: { synced: true } })
  },
}))

import { getMeliOrder } from '../../../apps/server/integrations/meli/meliItemsClient'

const fixtureDir = dirname(fileURLToPath(import.meta.url))
const webhookFixture = JSON.parse(
  readFileSync(join(fixtureDir, '../../fixtures/meli-webhook-orders-v2.json'), 'utf8'),
) as { resource: string; topic: string; user_id: number }

function buildPrisma(): PrismaClient {
  const eventStore = new Set<string>()
  return {
    meliWebhookEvent: {
      create: vi.fn().mockImplementation(async ({ data }: { data: { topic: string; resource: string } }) => {
        const key = `${data.topic}|${data.resource}`
        if (eventStore.has(key)) {
          const err = new Error('Unique constraint') as Error & { code: string }
          err.code = 'P2002'
          throw err
        }
        eventStore.add(key)
        return { id: eventStore.size }
      }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    meliConfig: {
      findFirst: vi.fn().mockResolvedValue({ tenantId: 1 }),
      findUnique: vi.fn().mockResolvedValue({
        tenantId: 1,
        accessTokenEncrypted: encryptFiscalSecret('access-token'),
        refreshTokenEncrypted: encryptFiscalSecret('refresh-token'),
        meliUserId: String(webhookFixture.user_id),
      }),
    },
    meliPublicacion: {
      findFirst: vi.fn().mockResolvedValue({ articuloId: 10 }),
    },
    articulo: {
      findFirst: vi.fn().mockResolvedValue({
        id: 10,
        codigo: 100,
        descripcion: 'Demo',
        stock: 5,
        minimo: 0,
        tipo: 'articulo',
        controlLote: false,
        unidadBase: 'unidad',
        multiploVenta: null,
      }),
    },
    deposito: { findFirst: vi.fn().mockResolvedValue(null) },
    stockAjuste: {
      create: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        articuloId: 10,
        cantidad: -1,
        motivo: 'venta_meli',
        userId: 1,
        user: { id: 1, username: 'system' },
      }),
    },
    stockDeposito: { findFirst: vi.fn().mockResolvedValue(null) },
    recuento: { findFirst: vi.fn().mockResolvedValue(null) },
    tenantConfig: { findUnique: vi.fn().mockResolvedValue({ modules: [] }) },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        articulo: {
          update: vi.fn().mockResolvedValue({
            id: 10,
            codigo: 100,
            descripcion: 'Demo',
            stock: 4,
            minimo: 0,
          }),
          findFirstOrThrow: vi.fn().mockResolvedValue({
            id: 10,
            codigo: 100,
            descripcion: 'Demo',
            stock: 4,
            minimo: 0,
          }),
        },
        stockAjuste: {
          create: vi.fn().mockResolvedValue({
            id: 1,
            tenantId: 1,
            articuloId: 10,
            cantidad: -1,
            motivo: 'venta_meli',
            userId: 1,
            user: { id: 1, username: 'system' },
          }),
        },
        stockDeposito: { upsert: vi.fn(), update: vi.fn(), findFirst: vi.fn() },
      }
      return fn(tx)
    }),
    notification: { createMany: vi.fn().mockResolvedValue({ count: 0 }) },
    appUser: { findMany: vi.fn().mockResolvedValue([]) },
  } as unknown as PrismaClient
}

describe('MeliWebhookService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.BIZCODE_SYSTEM_USER_ID = '1'
  })

  it('orders_v2 creates StockAjuste venta_meli once (idempotent)', async () => {
    vi.mocked(getMeliOrder).mockResolvedValue({
      id: 2000003509,
      status: 'paid',
      order_items: [{ item: { id: 'MLA100' }, quantity: 1, unit_price: 1500 }],
    })
    const prisma = buildPrisma()
    const service = new MeliWebhookService(prisma)

    await service.processNotification(webhookFixture)
    await service.processNotification(webhookFixture)

    expect(getMeliOrder).toHaveBeenCalledTimes(1)
    expect(getMeliOrder).toHaveBeenCalledWith('access-token', '2000003509')
    expect(prisma.$transaction).toHaveBeenCalledTimes(1)
  })
})
