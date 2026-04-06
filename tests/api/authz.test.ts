import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

function buildPrismaMock(): PrismaClient {
  return {
    cliente: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    articulo: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    rubro: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    formaPago: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    auditEvent: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    appUser: {
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue({
        id: 1,
        tenantId: 1,
        username: 'owner',
        role: 'owner',
      }),
    },
    tenant: {
      create: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', name: 'Demo' }),
      findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }),
    },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') {
        return arg(buildPrismaMock())
      }
      return Promise.resolve(arg)
    }),
  } as unknown as PrismaClient
}

describe('API authorization middleware', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    delete process.env.BIZCODE_TEST_ROLE
  })

  it('denies protected route without session', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/clientes').expect(401)
    expect(res.body).toEqual({ success: false, error: 'Authentication required' })
  })

  it('allows protected route with test bypass role owner', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/clientes').expect(200)
    expect(res.body.success).toBe(true)
  })

  it('rejects when bypass role misses permission', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'driver'
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/clientes').send({}).expect(403)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toContain('Missing permission')
  })
})
