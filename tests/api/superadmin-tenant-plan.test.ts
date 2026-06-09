import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

function buildPrismaMock(): PrismaClient {
  const planRow = {
    id: 2,
    key: 'pro',
    name: 'Pro',
    monthlyPrice: 15000,
    currency: 'ARS',
    maxUsers: 10,
    maxInvoicesPerMonth: 500,
    features: ['apps.driver'],
  }
  return {
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, active: true }) },
    plan: {
      findUnique: vi.fn().mockImplementation(({ where }: { where: { key?: string } }) => {
        if (where.key === 'pro') return planRow
        if (where.key === 'starter') {
          return {
            id: 1,
            key: 'starter',
            name: 'Starter',
            monthlyPrice: 0,
            currency: 'ARS',
            maxUsers: 3,
            maxInvoicesPerMonth: 100,
            features: [],
          }
        }
        return null
      }),
    },
    tenantPlan: {
      findUnique: vi.fn().mockResolvedValue({
        status: 'active',
        plan: {
          key: 'starter',
          name: 'Starter',
          monthlyPrice: 0,
          currency: 'ARS',
          maxUsers: 3,
          maxInvoicesPerMonth: 100,
          features: [],
        },
      }),
      upsert: vi.fn().mockResolvedValue({ tenantId: 1, planId: 2 }),
    },
    tenantConfig: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
    appUser: { count: vi.fn().mockResolvedValue(1) },
    factura: { count: vi.fn().mockResolvedValue(0) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appSession: { findFirst: vi.fn().mockResolvedValue(null) },
    $transaction: vi.fn(async (fn: (tx: {
      plan: { findUnique: ReturnType<typeof vi.fn> }
      tenantPlan: { upsert: ReturnType<typeof vi.fn> }
      tenantConfig: { updateMany: ReturnType<typeof vi.fn> }
    }) => Promise<unknown>) =>
      fn({
        plan: {
          findUnique: vi.fn().mockResolvedValue(planRow),
        },
        tenantPlan: { upsert: vi.fn().mockResolvedValue({ tenantId: 1, planId: 2 }) },
        tenantConfig: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
      }),
    ),
  } as unknown as PrismaClient
}

describe('POST /api/superadmin/tenants/:tenantId/plan', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'super_admin'
  })

  it('requires reason', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/superadmin/tenants/1/plan')
      .send({ planKey: 'pro' })
    expect(res.status).toBe(400)
    expect(res.body.error).toContain('reason')
  })

  it('changes plan when reason provided', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/superadmin/tenants/1/plan')
      .send({ planKey: 'pro', reason: 'upgrade customer' })
    expect(res.status).toBe(200)
    expect(res.body.data.planKey).toBeDefined()
  })
})
