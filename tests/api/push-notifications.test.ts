import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    cliente: { findMany: vi.fn().mockResolvedValue([]) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: { findMany: vi.fn().mockResolvedValue([]) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockResolvedValue(null),
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
    appRefreshToken: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      update: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    notification: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findMany: vi.fn().mockResolvedValue([]),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    devicePushToken: {
      upsert: vi.fn().mockResolvedValue({
        id: 1,
        token: 'ExponentPushToken[test-token-abc]',
        platform: 'android',
      }),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    pushNotificationPreference: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({ mutedTypes: ['chat_message'] }),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') return (arg as (tx: PrismaClient) => unknown)(buildPrismaMock())
      if (Array.isArray(arg)) return Promise.all(arg)
      return arg
    }),
    ...overrides,
  } as unknown as PrismaClient
}

describe('Push token and preferences API (#172)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    process.env.BIZCODE_TEST_USER_ID = '1'
  })

  it('POST /api/users/me/push-token registers token', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/users/me/push-token')
      .send({ token: 'ExponentPushToken[test-token-abc]', platform: 'android' })
      .expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.token).toBe('ExponentPushToken[test-token-abc]')
    expect(prisma.devicePushToken.upsert).toHaveBeenCalled()
  })

  it('POST /api/users/me/push-token rejects short token', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/users/me/push-token')
      .send({ token: 'short' })
      .expect(400)
    expect(res.body.success).toBe(false)
  })

  it('DELETE /api/users/me/push-token removes token', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app)
      .delete('/api/users/me/push-token')
      .send({ token: 'ExponentPushToken[test-token-abc]' })
      .expect(200)
    expect(res.body.data.deleted).toBe(1)
  })

  it('GET /api/users/me/push-preferences returns defaults', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/users/me/push-preferences').expect(200)
    expect(res.body.data.mutedTypes).toEqual([])
    expect(res.body.data.muteableTypes).toContain('pedido_confirmed')
  })

  it('PUT /api/users/me/push-preferences updates muted types', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app)
      .put('/api/users/me/push-preferences')
      .send({ mutedTypes: ['chat_message'] })
      .expect(200)
    expect(res.body.data.mutedTypes).toEqual(['chat_message'])
    expect(prisma.pushNotificationPreference.upsert).toHaveBeenCalled()
  })

  it('PUT /api/users/me/push-preferences rejects invalid type', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .put('/api/users/me/push-preferences')
      .send({ mutedTypes: ['not_a_real_type'] })
      .expect(400)
    expect(res.body.success).toBe(false)
  })

  it('requires authentication', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    delete process.env.BIZCODE_TEST_ROLE
    const app = createApp(buildPrismaMock())
    await request(app).get('/api/users/me/push-preferences').expect(401)
  })
})
