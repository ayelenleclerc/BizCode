import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

type NotificationRow = {
  id: number
  tenantId: number
  userId: number
  type: string
  payload: Record<string, unknown>
  readAt: Date | null
  createdAt: Date
}

const NOTIF_1: NotificationRow = {
  id: 1,
  tenantId: 1,
  userId: 1,
  type: 'credit_limit_exceeded',
  payload: { rsocial: 'ACME SA', amount: '50000.00', limit: '40000.00' },
  readAt: null,
  createdAt: new Date(),
}

const NOTIF_2: NotificationRow = {
  id: 2,
  tenantId: 1,
  userId: 1,
  type: 'invoice_overdue',
  payload: { facturaId: 99, rsocial: 'BETA SRL' },
  readAt: null,
  createdAt: new Date(),
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
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
      update: vi.fn().mockResolvedValue({ ...NOTIF_1, readAt: new Date() }),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
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
    ...overrides,
  } as unknown as PrismaClient
}

// ─── GET /api/notifications ──────────────────────────────────────────────────

describe('GET /api/notifications', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
  })

  it('returns 401 without session', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    delete process.env.BIZCODE_TEST_ROLE
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/notifications').expect(401)
    expect(res.body).toEqual({ success: false, error: 'Authentication required' })
  })

  it('returns empty array when no notifications', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/notifications').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toEqual([])
  })

  it('returns unread notifications for the authenticated user', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const prisma = buildPrismaMock()
    ;(prisma.notification.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([NOTIF_1, NOTIF_2])
    const app = createApp(prisma)
    const res = await request(app).get('/api/notifications').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(2)
    expect(res.body.data[0].type).toBe('credit_limit_exceeded')
  })

  it('queries with readAt null filter', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    await request(app).get('/api/notifications').expect(200)
    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ readAt: null }),
      }),
    )
  })

  it('returns 500 on database error', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const prisma = buildPrismaMock()
    ;(prisma.notification.findMany as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error('DB failure'),
    )
    const app = createApp(prisma)
    const res = await request(app).get('/api/notifications').expect(500)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toContain('DB failure')
  })
})

// ─── PUT /api/notifications/read-all ─────────────────────────────────────────

describe('PUT /api/notifications/read-all', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
  })

  it('returns 401 without session', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    delete process.env.BIZCODE_TEST_ROLE
    const app = createApp(buildPrismaMock())
    const res = await request(app).put('/api/notifications/read-all').expect(401)
    expect(res.body).toEqual({ success: false, error: 'Authentication required' })
  })

  it('marks all unread notifications and returns updated count', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const prisma = buildPrismaMock()
    ;(prisma.notification.updateMany as ReturnType<typeof vi.fn>).mockResolvedValue({ count: 5 })
    const app = createApp(prisma)
    const res = await request(app).put('/api/notifications/read-all').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.updated).toBe(5)
  })

  it('returns updated 0 when nothing was unread', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const app = createApp(buildPrismaMock())
    const res = await request(app).put('/api/notifications/read-all').expect(200)
    expect(res.body.data.updated).toBe(0)
  })

  it('calls updateMany with readAt null where clause', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    await request(app).put('/api/notifications/read-all').expect(200)
    expect(prisma.notification.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ readAt: null }),
        data: expect.objectContaining({ readAt: expect.any(Date) }),
      }),
    )
  })
})

// ─── PUT /api/notifications/:id/read ─────────────────────────────────────────

describe('PUT /api/notifications/:id/read', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
  })

  it('returns 401 without session', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    delete process.env.BIZCODE_TEST_ROLE
    const app = createApp(buildPrismaMock())
    const res = await request(app).put('/api/notifications/1/read').expect(401)
    expect(res.body).toEqual({ success: false, error: 'Authentication required' })
  })

  it('returns 400 for non-numeric id', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const app = createApp(buildPrismaMock())
    const res = await request(app).put('/api/notifications/abc/read').expect(400)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toBe('Invalid notification id')
  })

  it('returns 404 when notification not found or belongs to another user', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const prisma = buildPrismaMock()
    ;(prisma.notification.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    const app = createApp(prisma)
    const res = await request(app).put('/api/notifications/999/read').expect(404)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toBe('Notification not found')
  })

  it('marks notification as read and returns updated record', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const readAt = new Date()
    const updatedNotif = { ...NOTIF_1, readAt }
    const prisma = buildPrismaMock()
    ;(prisma.notification.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(NOTIF_1)
    ;(prisma.notification.update as ReturnType<typeof vi.fn>).mockResolvedValue(updatedNotif)
    const app = createApp(prisma)
    const res = await request(app).put('/api/notifications/1/read').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBe(1)
    expect(res.body.data.readAt).toBeTruthy()
  })

  it('calls update with where: { id } only (not tenant/user)', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const prisma = buildPrismaMock()
    ;(prisma.notification.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(NOTIF_1)
    const app = createApp(prisma)
    await request(app).put('/api/notifications/1/read').expect(200)
    expect(prisma.notification.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({ readAt: expect.any(Date) }),
      }),
    )
  })
})
