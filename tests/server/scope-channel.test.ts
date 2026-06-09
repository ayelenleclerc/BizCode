import { describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

function buildPrismaMock(channelScopes: string[]): PrismaClient {
  return {
    cliente: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
    },
    articulo: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
    },
    rubro: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
    },
    formaPago: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    factura: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
    },
    auditEvent: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    appUser: {
      count: vi.fn().mockResolvedValue(1),
    },
    tenant: {
      findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }),
    },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue({
        id: 7,
        user: {
          id: 11,
          tenantId: 1,
          username: 'owner',
          role: 'owner',
          active: true,
          scopeBranchIds: [],
          scopeWarehouseIds: [],
          scopeRouteIds: [],
          scopeChannels: channelScopes,
        },
      }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ id: 7 }),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') {
        return arg(buildPrismaMock(channelScopes))
      }
      return Promise.resolve(arg)
    }),
  } as unknown as PrismaClient
}

describe('channel scope enforcement', () => {
  it('allows protected route when x-bizcode-channel belongs to claims scope', async () => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    const app = createApp(buildPrismaMock(['counter']))
    const res = await request(app)
      .get('/api/clientes')
      .set('Cookie', 'bizcode_session=test-token')
      .set('x-bizcode-channel', 'counter')
      .expect(200)
    expect(res.body.success).toBe(true)
  })

  it('rejects protected route when x-bizcode-channel is outside claims scope', async () => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    const app = createApp(buildPrismaMock(['counter']))
    const res = await request(app)
      .get('/api/clientes')
      .set('Cookie', 'bizcode_session=test-token')
      .set('x-bizcode-channel', 'warehouse')
      .expect(403)
    expect(res.body).toEqual({ success: false, error: 'Missing channel scope: warehouse' })
  })

  it('rejects invalid x-bizcode-channel values', async () => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    const app = createApp(buildPrismaMock(['counter']))
    const res = await request(app)
      .get('/api/clientes')
      .set('Cookie', 'bizcode_session=test-token')
      .set('x-bizcode-channel', 'invalid-channel')
      .expect(400)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toContain('Invalid x-bizcode-channel')
  })
})

