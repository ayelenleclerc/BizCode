/**
 * @en WooCommerce webhook API tests (#188).
 * @es Tests API webhook WooCommerce (#188).
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { computeWooCommerceWebhookHmac } from '../../apps/server/lib/woocommerceWebhookSignature'
import { encryptFiscalSecret } from '../../apps/server/fiscal/ar/fiscalSecrets'

const WEBHOOK_SECRET = 'wc-whsec-api-test'
const fixtureDir = dirname(fileURLToPath(import.meta.url))
const webhookFixture = JSON.parse(
  readFileSync(join(fixtureDir, '../fixtures/woocommerce-webhook-order-processing.json'), 'utf8'),
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
    wooCommerceConfig: {
      findFirst: vi.fn().mockResolvedValue({ tenantId: 1 }),
      findUnique: vi.fn().mockResolvedValue({
        tenantId: 1,
        storeUrl: 'https://mitienda.com',
        consumerKeyEncrypted: encryptFiscalSecret('ck_123'),
        consumerSecretEncrypted: encryptFiscalSecret('cs_123'),
        webhookSecretEncrypted: encryptFiscalSecret(WEBHOOK_SECRET),
        activo: true,
      }),
    },
    wooCommerceWebhookEvent: {
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
    wooCommerceOrden: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        wcOrderId: '4001',
        status: 'processing',
        pedidoId: null,
        stockAppliedAt: null,
        buyerNickname: 'Maria Silva',
        cuitPending: false,
        lastSyncedAt: new Date(),
      }),
      update: vi.fn().mockResolvedValue({}),
      findUniqueOrThrow: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        wcOrderId: '4001',
        status: 'processing',
        pedidoId: null,
        stockAppliedAt: null,
        buyerNickname: 'Maria Silva',
        cuitPending: false,
      }),
    },
    wooCommercePublicacion: { findFirst: vi.fn().mockResolvedValue(null) },
    cliente: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 5, rsocial: 'Maria Silva' }),
      aggregate: vi.fn().mockResolvedValue({ _max: { codigo: 10 } }),
    },
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

describe('WooCommerce webhook API (#188)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
  })

  it('rejects missing signature header', async () => {
    const app = createApp(buildPrismaMock())
    await request(app)
      .post('/api/webhooks/woocommerce/1')
      .send(webhookFixture)
      .expect(400)
  })

  it('rejects an invalid tenantId in the URL', async () => {
    const app = createApp(buildPrismaMock())
    const raw = JSON.stringify(webhookFixture)
    const hmac = computeWooCommerceWebhookHmac(WEBHOOK_SECRET, raw)
    await request(app)
      .post('/api/webhooks/woocommerce/not-a-number')
      .set('Content-Type', 'application/json')
      .set('x-wc-webhook-signature', hmac)
      .send(webhookFixture)
      .expect(400)
  })

  it('rejects an invalid signature', async () => {
    const app = createApp(buildPrismaMock())
    await request(app)
      .post('/api/webhooks/woocommerce/1')
      .set('Content-Type', 'application/json')
      .set('x-wc-webhook-signature', 'invalid-signature')
      .send(webhookFixture)
      .expect(400)
  })

  it('acks a validly signed order.updated webhook', async () => {
    const app = createApp(buildPrismaMock())
    const raw = JSON.stringify(webhookFixture)
    const hmac = computeWooCommerceWebhookHmac(WEBHOOK_SECRET, raw)
    const res = await request(app)
      .post('/api/webhooks/woocommerce/1')
      .set('Content-Type', 'application/json')
      .set('x-wc-webhook-signature', hmac)
      .set('x-wc-webhook-topic', 'order.updated')
      .send(webhookFixture)
      .expect(200)
    expect(res.body.success).toBe(true)
  })
})
