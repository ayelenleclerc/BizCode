/**
 * @en Tiendanube webhook API tests (#187).
 * @es Tests API webhook Tiendanube (#187).
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { computeTiendanubeWebhookHmac } from '../../apps/server/lib/tiendanubeWebhookSignature'

vi.mock('../../apps/server/integrations/tiendanube/tiendanubeApiClient', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('../../apps/server/integrations/tiendanube/tiendanubeApiClient')
    >()
  return {
    ...actual,
    getTiendanubeOrder: vi.fn(),
  }
})

import { getTiendanubeOrder } from '../../apps/server/integrations/tiendanube/tiendanubeApiClient'
import { encryptFiscalSecret } from '../../apps/server/fiscal/ar/fiscalSecrets'

const WEBHOOK_SECRET = 'tn-whsec-api-test'
const fixtureDir = dirname(fileURLToPath(import.meta.url))
const webhookFixture = JSON.parse(
  readFileSync(join(fixtureDir, '../fixtures/tiendanube-webhook-order-paid.json'), 'utf8'),
) as Record<string, unknown>

function buildPrismaMock(): PrismaClient {
  const eventStore = new Set<string>()
  return {
    deliveryZone: { findMany: vi.fn().mockResolvedValue([]) },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: {
      findMany: vi.fn().mockResolvedValue([{ id: 1 }]),
      count: vi.fn().mockResolvedValue(1),
    },
    notification: { createMany: vi.fn().mockResolvedValue({ count: 1 }) },
    tiendanubeConfig: {
      findFirst: vi.fn().mockResolvedValue({ tenantId: 1 }),
      findUnique: vi.fn().mockResolvedValue({
        tenantId: 1,
        storeId: '817495',
        accessTokenEncrypted: encryptFiscalSecret('tn-token'),
        activo: true,
      }),
    },
    tiendanubeWebhookEvent: {
      create: vi.fn().mockImplementation(async ({ data }: { data: { topic: string; resource: string } }) => {
        const key = `${data.topic}|${data.resource}`
        if (eventStore.has(key)) {
          const err = new Error('Unique constraint') as Error & { code: string }
          err.code = 'P2002'
          throw err
        }
        eventStore.add(key)
        return { id: 1, ...data }
      }),
    },
    tiendanubeOrden: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        tnOrderId: '871254203',
        status: 'paid',
        pedidoId: 10,
        stockAppliedAt: new Date(),
        buyerNickname: 'Maria',
        cuitPending: false,
        lastSyncedAt: new Date(),
      }),
      update: vi.fn().mockResolvedValue({}),
      findUniqueOrThrow: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        tnOrderId: '871254203',
        status: 'paid',
        pedidoId: 10,
        stockAppliedAt: new Date(),
        buyerNickname: 'Maria',
        cuitPending: false,
      }),
    },
    tiendanubePublicacion: { findFirst: vi.fn().mockResolvedValue(null) },
    cliente: { findFirst: vi.fn().mockResolvedValue(null), create: vi.fn(), aggregate: vi.fn() },
    pedido: { create: vi.fn() },
    ecommerceSyncJob: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      findMany: vi.fn().mockResolvedValue([]),
    },
    syncLog: { create: vi.fn() },
  } as unknown as PrismaClient
}

describe('Tiendanube webhook API (#187)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.TIENDANUBE_CLIENT_ID = 'tn-app-id'
    process.env.TIENDANUBE_CLIENT_SECRET = WEBHOOK_SECRET
    process.env.TIENDANUBE_WEBHOOK_SECRET = WEBHOOK_SECRET
    vi.mocked(getTiendanubeOrder).mockReset()
    vi.mocked(getTiendanubeOrder).mockResolvedValue({
      id: 871254203,
      payment_status: 'paid',
      contact_name: 'Maria Silva',
      contact_email: 'buyer@example.com',
      products: [],
      total: '100.00',
      currency: 'ARS',
    })
  })

  it('rejects missing signature header', async () => {
    const app = createApp(buildPrismaMock())
    await request(app).post('/api/webhooks/tiendanube').send(webhookFixture).expect(400)
  })

  it('acks valid signed order/paid webhook', async () => {
    const app = createApp(buildPrismaMock())
    const raw = JSON.stringify(webhookFixture)
    const hmac = computeTiendanubeWebhookHmac(WEBHOOK_SECRET, raw)
    const res = await request(app)
      .post('/api/webhooks/tiendanube')
      .set('Content-Type', 'application/json')
      .set('x-linkedstore-hmac-sha256', hmac)
      .send(webhookFixture)
      .expect(200)
    expect(res.body.success).toBe(true)
  })
})
