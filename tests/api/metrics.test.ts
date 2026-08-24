import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { resetObservabilityStateForTests } from '../../apps/server/middleware/observability'

function buildPrismaMock(): PrismaClient {
  return {
    cliente: { findMany: vi.fn().mockResolvedValue([]) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: { findMany: vi.fn().mockResolvedValue([]), aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }) },
    notification: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null), update: vi.fn().mockResolvedValue(null), updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }), count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
    appUser: { count: vi.fn().mockResolvedValue(1), findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null), findUnique: vi.fn().mockResolvedValue(null), create: vi.fn().mockResolvedValue(null), update: vi.fn().mockResolvedValue(null) },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    appSession: { create: vi.fn().mockResolvedValue({ id: 1 }), findFirst: vi.fn().mockResolvedValue(null), updateMany: vi.fn().mockResolvedValue({ count: 1 }), update: vi.fn().mockResolvedValue({ id: 1 }) },
    $queryRaw: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    $queryRawUnsafe: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') return arg(buildPrismaMock())
      return arg
    }),
  } as unknown as PrismaClient
}

describe('GET /api/metrics', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    process.env.METRICS_ENABLED = 'true'
    resetObservabilityStateForTests()
  })

  it('returns 401 without session', async () => {
    const app = createApp(buildPrismaMock())
    await request(app).get('/api/metrics').expect(401)
  })

  it('returns 403 when role lacks audit.read', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const app = createApp(buildPrismaMock())
    await request(app).get('/api/metrics').expect(403)
  })

  it('returns aggregated metrics for auditor role without exposing identities', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'auditor'
    const app = createApp(buildPrismaMock())
    await request(app).get('/api/health').expect(200)

    const res = await request(app).get('/api/metrics').expect(200)

    expect(res.body.success).toBe(true)
    expect(res.body.data.totals.requests).toBeGreaterThanOrEqual(1)
    expect(res.body.data.requestsByMethod).toHaveProperty('GET')
    expect(res.body.data.responsesByStatus).toHaveProperty('200')
    expect(res.body.data).not.toHaveProperty('tenantId')
    expect(res.body.data).not.toHaveProperty('userId')
    expect(JSON.stringify(res.body.data)).not.toContain('x-request-id')
  })

  it('returns 404 when METRICS_ENABLED is false', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'auditor'
    process.env.METRICS_ENABLED = 'false'
    const app = createApp(buildPrismaMock())

    await request(app).get('/api/metrics').expect(404)
  })

  it('increments 5xx counter when a route fails', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'auditor'
    const prisma = buildPrismaMock()
    ;(prisma.auditEvent.count as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('db failed'))
    const app = createApp(prisma)

    await request(app).get('/api/audit-events').expect(500)
    const metrics = await request(app).get('/api/metrics').expect(200)
    expect(metrics.body.data.totals.errors5xx).toBeGreaterThanOrEqual(1)
  })
})
