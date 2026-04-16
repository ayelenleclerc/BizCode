import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

function buildPrismaMock(): PrismaClient {
  return {
    cliente: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue({ id: 1, suspended: false }),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1, rsocial: 'ACME', balance: 0, creditLimit: null }),
    },
    articulo: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue({ id: 1 }),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    rubro: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: 1, total: 0, items: [] }),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([
        { id: 2, username: 'manager', role: 'manager' },
      ]),
      findFirst: vi.fn().mockResolvedValue({ id: 2 }),
      findUnique: vi.fn().mockResolvedValue({ id: 1, tenantId: 1, username: 'owner', role: 'owner', active: true }),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    tenant: {
      findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }),
      create: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', name: 'Demo' }),
    },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue({
        id: 7,
        user: {
          id: 1,
          tenantId: 1,
          username: 'owner',
          role: 'owner',
          active: true,
          scopeBranchIds: [],
          scopeWarehouseIds: [],
          scopeRouteIds: [],
          scopeChannels: ['counter'],
        },
      }),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      update: vi.fn().mockResolvedValue({ id: 7 }),
    },
    notification: {
      findMany: vi.fn().mockResolvedValue([
        { payload: { fromUserId: 2 } },
        { payload: { fromUserId: 2 } },
      ]),
      findFirst: vi.fn().mockResolvedValue({ id: 1 }),
      create: vi.fn().mockResolvedValue({ id: 10 }),
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
      updateMany: vi.fn().mockResolvedValue({ count: 2 }),
    },
    chatMessage: {
      findFirst: vi.fn().mockResolvedValue({
        id: 11,
        fromUserId: 2,
        toUserId: 1,
        content: 'hola',
        createdAt: new Date('2026-01-01T00:00:00Z'),
      }),
      findMany: vi.fn().mockResolvedValue([
        {
          id: 10,
          tenantId: 1,
          fromUserId: 2,
          toUserId: 1,
          content: 'hola',
          createdAt: new Date('2026-01-01T00:00:00Z'),
        },
      ]),
      create: vi.fn().mockResolvedValue({
        id: 12,
        tenantId: 1,
        fromUserId: 1,
        toUserId: 2,
        content: 'mensaje nuevo',
        createdAt: new Date('2026-01-01T00:01:00Z'),
      }),
    },
    deliveryZone: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue({ id: 1, tenantId: 1 }),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') {
        return arg(buildPrismaMock())
      }
      return arg
    }),
  } as unknown as PrismaClient
}

describe('chat API', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
  })

  it('lists conversations with unread count', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .get('/api/chat/conversations')
      .set('Cookie', 'bizcode_session=test-token')
      .expect(200)

    expect(res.body.success).toBe(true)
    expect(res.body.data[0].unreadCount).toBe(2)
    expect(res.body.data[0].user.username).toBe('manager')
  })

  it('returns message history and marks chat notifications read', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/chat/messages/2')
      .set('Cookie', 'bizcode_session=test-token')
      .expect(200)

    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(vi.mocked(prisma.notification.updateMany)).toHaveBeenCalled()
  })

  it('creates a message and notification for recipient', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/chat/messages')
      .set('Cookie', 'bizcode_session=test-token')
      .send({ toUserId: 2, content: 'mensaje nuevo' })
      .expect(201)

    expect(res.body.success).toBe(true)
    expect(vi.mocked(prisma.chatMessage.create)).toHaveBeenCalled()
    expect(vi.mocked(prisma.notification.create)).toHaveBeenCalled()
  })
})

