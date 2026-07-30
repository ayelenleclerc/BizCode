import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

function buildPrismaMock(): PrismaClient {
  return {
    cliente: { findMany: vi.fn().mockResolvedValue([]) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: { findMany: vi.fn().mockResolvedValue([]) },
    auditEvent: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([
        {
          id: 42,
          tenantId: 3,
          userId: 7,
          action: 'user_update',
          resource: 'user',
          resourceId: '9',
          ipAddress: '203.0.113.9',
          securityEventType: 'role_escalation',
          severity: 'critical',
          metadata: { role: 'owner' },
          createdAt: new Date('2026-07-30T10:00:00.000Z'),
          tenant: { slug: 'acme' },
        },
      ]),
      create: vi.fn(),
    },
    appUser: { count: vi.fn().mockResolvedValue(1) },
    tenant: { findUnique: vi.fn(), findMany: vi.fn().mockResolvedValue([]) },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') return (arg as (tx: PrismaClient) => unknown)(buildPrismaMock())
      return arg
    }),
  } as unknown as PrismaClient
}

describe('GET /api/superadmin/security-events (#221)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'super_admin'
  })

  it('returns classified security events for super_admin', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/superadmin/security-events?hours=24').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.total).toBe(1)
    expect(res.body.data[0]).toMatchObject({
      id: 42,
      securityEventType: 'role_escalation',
      severity: 'critical',
      tenantSlug: 'acme',
    })
    await assertMatchesOpenApi('/api/superadmin/security-events', 'get', '200', res.body)
  })

  it('rejects non-super_admin', async () => {
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const app = createApp(buildPrismaMock())
    await request(app).get('/api/superadmin/security-events').expect(403)
  })
})
