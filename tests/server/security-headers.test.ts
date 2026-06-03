import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

function buildPrismaMock(): PrismaClient {
  return {
    cliente: { findMany: vi.fn().mockResolvedValue([]) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: { findMany: vi.fn().mockResolvedValue([]) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: { count: vi.fn().mockResolvedValue(0) },
    tenant: { findUnique: vi.fn() },
    appSession: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
    $queryRaw: vi.fn().mockResolvedValue([{ ok: 1 }]),
  } as unknown as PrismaClient
}

describe('security headers (#214)', () => {
  let prevNodeEnv: string | undefined

  beforeEach(() => {
    prevNodeEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })

  afterEach(() => {
    if (prevNodeEnv === undefined) {
      delete process.env.NODE_ENV
    } else {
      process.env.NODE_ENV = prevNodeEnv
    }
  })

  it('sets baseline HTTP security headers on API responses', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/health')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
    expect(res.headers['x-frame-options']).toBe('DENY')
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(res.headers['content-security-policy']).toBeDefined()
  })

  it('does not send HSTS outside production', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/health')
    expect(res.headers['strict-transport-security']).toBeUndefined()
  })

  it('sends HSTS in production', async () => {
    process.env.NODE_ENV = 'production'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/health')
    expect(res.headers['strict-transport-security']).toMatch(/max-age=31536000/)
  })
})
