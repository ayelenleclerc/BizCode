import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

const AUDIT_ROW = {
  id: 1,
  tenantId: 1,
  userId: 2,
  user: { username: 'alice' },
  action: 'cliente_create',
  resource: 'cliente',
  resourceId: '5',
  ipAddress: '127.0.0.1',
  metadata: { foo: 'bar' },
  createdAt: new Date('2026-01-15T10:30:00.000Z'),
}

function buildPrismaMock(): PrismaClient {
  return {
    cliente: { findMany: vi.fn().mockResolvedValue([]) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
    },
    notification: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    auditEvent: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
    },
    appUser: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue(null),
    },
    tenant: {
      findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }),
    },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') return arg(buildPrismaMock())
      return arg
    }),
  } as unknown as PrismaClient
}

describe('GET /api/audit-events', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
  })

  it('returns 401 without session', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    delete process.env.BIZCODE_TEST_ROLE
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/audit-events').expect(401)
    expect(res.body).toEqual({ success: false, error: 'Authentication required' })
  })

  it('returns 403 when role lacks audit.read', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/audit-events').expect(403)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toContain('Missing permission')
    expect(res.body.error).toContain('audit.read')
  })

  it('returns empty paginated list for auditor role', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'auditor'
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app).get('/api/audit-events').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toEqual([])
    expect(res.body.total).toBe(0)
    expect(res.body.limit).toBe(50)
    expect(res.body.offset).toBe(0)
    await assertMatchesOpenApi('/api/audit-events', 'get', '200', res.body)
    expect(prisma.auditEvent.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: 1 },
      }),
    )
  })

  it('maps rows and enforces action filter', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const prisma = buildPrismaMock()
    ;(prisma.auditEvent.count as ReturnType<typeof vi.fn>).mockResolvedValue(1)
    ;(prisma.auditEvent.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([AUDIT_ROW])
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/audit-events')
      .query({ action: 'cliente_create', limit: '10', offset: '0' })
      .expect(200)

    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0]).toEqual({
      id: 1,
      tenantId: 1,
      userId: 2,
      username: 'alice',
      action: 'cliente_create',
      resource: 'cliente',
      resourceId: '5',
      ipAddress: '127.0.0.1',
      metadata: { foo: 'bar' },
      createdAt: '2026-01-15T10:30:00.000Z',
    })
    expect(res.body.total).toBe(1)
    expect(res.body.limit).toBe(10)
    await assertMatchesOpenApi('/api/audit-events', 'get', '200', res.body)

    expect(prisma.auditEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 1,
          action: 'cliente_create',
        }),
        orderBy: { createdAt: 'desc' },
        take: 10,
        skip: 0,
      }),
    )
  })

  it('returns 500 on database error', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const prisma = buildPrismaMock()
    ;(prisma.auditEvent.count as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('audit-db'))
    const app = createApp(prisma)
    const res = await request(app).get('/api/audit-events').expect(500)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toContain('audit-db')
  })
})
