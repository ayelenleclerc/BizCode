/**
 * @en Mercado Libre webhook API tests (#185).
 * @es Tests API webhook Mercado Libre (#185).
 */

import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { encryptFiscalSecret } from '../../apps/server/fiscal/ar/fiscalSecrets'
import {
  buildMeliSignatureManifest,
  computeMeliSignatureHmac,
} from '../../apps/server/lib/meliWebhookSignature'

vi.mock('../../apps/server/integrations/meli/meliItemsClient', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('../../apps/server/integrations/meli/meliItemsClient')
  >()
  return {
    ...actual,
    getMeliOrder: vi.fn(),
    getMeliItem: vi.fn(),
    updateMeliItem: vi.fn(),
  }
})

import { getMeliOrder } from '../../apps/server/integrations/meli/meliItemsClient'

const WEBHOOK_SECRET = 'meli-whsec-api-test'
const ORDER_ID = '2000003509'
const REQUEST_ID = 'req-meli-webhook-1'
const TS = '1704908010'

const fixtureDir = dirname(fileURLToPath(import.meta.url))
const webhookFixture = JSON.parse(
  readFileSync(join(fixtureDir, '../fixtures/meli-webhook-orders-v2.json'), 'utf8'),
) as Record<string, unknown>

function buildHeaders(dataId: string, secret: string): Record<string, string> {
  const manifest = buildMeliSignatureManifest(dataId, REQUEST_ID, TS)
  const v1 = computeMeliSignatureHmac(secret, manifest)
  return {
    'x-signature': `ts=${TS},v1=${v1}`,
    'x-request-id': REQUEST_ID,
  }
}

function buildPrismaMock(): PrismaClient {
  const eventStore = new Set<string>()
  let meliOrden: {
    id: number
    tenantId: number
    meliOrderId: string
    status: string
    shippingId: string | null
    isFulfillment: boolean
    buyerNickname: string | null
    cuitPending: boolean
    stockAppliedAt: Date | null
    lastSyncedAt: Date
    pedidoId: number | null
  } | null = null

  return {
    deliveryZone: { findMany: vi.fn().mockResolvedValue([]) },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: {
      findMany: vi.fn().mockResolvedValue([{ id: 1 }]),
      count: vi.fn().mockResolvedValue(1),
    },
    notification: { createMany: vi.fn().mockResolvedValue({ count: 1 }) },
    meliConfig: {
      findFirst: vi.fn().mockResolvedValue({ tenantId: 1 }),
      findUnique: vi.fn().mockResolvedValue({
        tenantId: 1,
        accessTokenEncrypted: encryptFiscalSecret('access-token'),
        refreshTokenEncrypted: encryptFiscalSecret('refresh-token'),
        meliUserId: '468834342',
        activo: true,
      }),
    },
    meliWebhookEvent: {
      create: vi.fn().mockImplementation(async ({ data }: { data: { topic: string; resource: string } }) => {
        const key = `${data.topic}|${data.resource}`
        if (eventStore.has(key)) {
          throw Object.assign(new Error('Unique'), { code: 'P2002' })
        }
        eventStore.add(key)
        return { id: 1 }
      }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    meliOrden: {
      findUnique: vi.fn().mockImplementation(async () => meliOrden),
      findUniqueOrThrow: vi.fn().mockImplementation(async () => {
        if (!meliOrden) throw new Error('missing')
        return meliOrden
      }),
      create: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
        meliOrden = {
          id: 1,
          tenantId: data.tenantId as number,
          meliOrderId: data.meliOrderId as string,
          status: data.status as string,
          shippingId: (data.shippingId as string | null) ?? null,
          isFulfillment: Boolean(data.isFulfillment),
          buyerNickname: (data.buyerNickname as string | null) ?? null,
          cuitPending: false,
          stockAppliedAt: null,
          lastSyncedAt: new Date(),
          pedidoId: null,
        }
        return meliOrden
      }),
      update: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
        if (!meliOrden) throw new Error('missing')
        meliOrden = { ...meliOrden, ...data } as typeof meliOrden
        return meliOrden
      }),
    },
    meliPublicacion: {
      findFirst: vi.fn().mockResolvedValue({ id: 1, articuloId: 10, meliItemId: 'MLA100' }),
      update: vi.fn().mockResolvedValue({}),
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
        activo: true,
        esPadre: false,
        condIva: '1',
        unidadServicio: null,
      }),
    },
    cliente: {
      findFirst: vi.fn().mockResolvedValue(null),
      aggregate: vi.fn().mockResolvedValue({ _max: { codigo: 1 } }),
      create: vi.fn().mockResolvedValue({ id: 20, rsocial: 'Comprador' }),
    },
    pedido: {
      create: vi.fn().mockResolvedValue({ id: 50 }),
    },
    deposito: { findFirst: vi.fn().mockResolvedValue(null) },
    stockAjuste: {
      create: vi.fn().mockResolvedValue({
        id: 1,
        user: { id: 1, username: 'system' },
      }),
    },
    stockDeposito: { findFirst: vi.fn().mockResolvedValue(null) },
    recuento: { findFirst: vi.fn().mockResolvedValue(null) },
    tenantConfig: { findUnique: vi.fn().mockResolvedValue({ modules: [], integrations: ['meli'] }) },
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
  } as unknown as PrismaClient
}

describe('POST /api/webhooks/meli', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.MELI_WEBHOOK_SECRET = WEBHOOK_SECRET
    process.env.BIZCODE_SYSTEM_USER_ID = '1'
    vi.mocked(getMeliOrder).mockResolvedValue({
      id: Number(ORDER_ID),
      status: 'paid',
      buyer: { nickname: 'BUYER', email: 'buyer@example.com' },
      order_items: [{ item: { id: 'MLA100', title: 'Demo' }, quantity: 1, unit_price: 100 }],
    })
  })

  it('returns 400 when signature is invalid', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/webhooks/meli')
      .set('x-signature', 'ts=1,v1=bad')
      .set('x-request-id', REQUEST_ID)
      .query({ 'data.id': ORDER_ID })
      .send(webhookFixture)
      .expect(400)
    expect(res.body.success).toBe(false)
  })

  it('returns 200 and processes orders_v2 with realistic payload', async () => {
    const app = createApp(buildPrismaMock())
    const headers = buildHeaders(ORDER_ID, WEBHOOK_SECRET)
    const res = await request(app)
      .post('/api/webhooks/meli')
      .set(headers)
      .query({ 'data.id': ORDER_ID })
      .send(webhookFixture)
      .expect(200)
    expect(res.body).toEqual({ success: true })

    await vi.waitFor(() => {
      expect(getMeliOrder).toHaveBeenCalledWith('access-token', ORDER_ID)
    })
  })
})
