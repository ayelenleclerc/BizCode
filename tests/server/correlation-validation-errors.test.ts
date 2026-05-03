/**
 * Correlation ID (#78) + Zod-driven validation envelope via error handler.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

function buildPrismaMock(): PrismaClient {
  return {
    deliveryZone: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      update: vi.fn(),
    },
    cliente: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: { findMany: vi.fn().mockResolvedValue([]), create: vi.fn(), aggregate: vi.fn() },
    proveedor: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    appSession: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    notification: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    $transaction: vi.fn(),
  } as unknown as PrismaClient
}

describe('X-Request-Id (correlation)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })

  it('responds with X-Request-Id when none sent', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/health').expect(200)

    expect(res.headers['x-request-id']).toBeDefined()
    expect(String(res.headers['x-request-id'])).toMatch(
      /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i,
    )
  })

  it('echoes incoming X-Request-Id normalized', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/health').set('X-Request-Id', '  trace-demo-001  ').expect(200)

    expect(res.headers['x-request-id']).toBe('trace-demo-001')
  })
})

describe('ValidationAppError envelope', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'logistics_planner'
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('returns { success:false, error } when body fails Zod on POST /api/zonas-entrega', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/zonas-entrega').send({}).expect(400)

    expect(res.body).toEqual({ success: false, error: expect.stringContaining('nombre') })
  })
})
