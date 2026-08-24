import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { resetSharedRedisClientForTests } from '../../apps/server/lib/sharedRedis'
import { assertMatchesOpenApi } from './validate-openapi-response'

function buildPrisma(overrides?: {
  saasStatus?: string
  subscribeExisting?: boolean
}): PrismaClient {
  const tenant = {
    id: 1,
    contactEmail: 'a@b.com',
    slug: 'demo',
    name: 'Demo',
    saasStatus: overrides?.saasStatus ?? 'trial',
  }
  const sub = {
    id: 3,
    tenantId: 1,
    planKey: 'starter',
    status: 'authorized',
    mock: true,
    initPoint: '/configuracion/billing?mock=authorized',
    paymentRetryCount: 0,
  }
  const invoice = {
    id: 1,
    planKey: 'starter',
    periodStart: new Date('2026-08-01T00:00:00.000Z'),
    periodEnd: new Date('2026-09-01T00:00:00.000Z'),
    amount: new Prisma.Decimal('0.00'),
    currency: 'ARS',
    status: 'paid',
    createdAt: new Date('2026-08-01T00:00:00.000Z'),
  }

  const tx = {
    saasSubscription: {
      findUnique: vi.fn().mockResolvedValue(overrides?.subscribeExisting ? sub : null),
      create: vi.fn().mockResolvedValue(sub),
      update: vi.fn().mockResolvedValue(sub),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    saasInvoice: {
      create: vi.fn().mockResolvedValue(invoice),
      findFirst: vi.fn().mockResolvedValue(invoice),
      update: vi.fn().mockResolvedValue(invoice),
    },
    tenant: { update: vi.fn().mockResolvedValue(tenant) },
    tenantConfig: { update: vi.fn().mockResolvedValue({}) },
  }

  return {
    tenant: {
      findUnique: vi.fn().mockResolvedValue(tenant),
      update: vi.fn().mockResolvedValue(tenant),
    },
    tenantConfig: {
      findUnique: vi.fn().mockResolvedValue({ plan: 'starter' }),
    },
    saasSubscription: {
      findUnique: vi.fn().mockResolvedValue(sub),
    },
    saasInvoice: {
      findMany: vi.fn().mockResolvedValue([invoice]),
    },
    saasWebhookEvent: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    $transaction: vi.fn(async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
    tenantModule: { findMany: vi.fn().mockResolvedValue([]) },
    tenantPlan: { findUnique: vi.fn().mockResolvedValue(null) },
    plan: { findUnique: vi.fn().mockResolvedValue(null) },
  } as unknown as PrismaClient
}

describe('SaaS billing API (#182)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    process.env.BIZCODE_TEST_USER_ID = '1'
    process.env.BIZCODE_TEST_TENANT_ID = '1'
    delete process.env.REDIS_URL
    resetSharedRedisClientForTests()
    delete process.env.BIZCODE_SAAS_MP_ACCESS_TOKEN
    delete process.env.BIZCODE_SAAS_MP_WEBHOOK_SECRET
  })

  it('GET /api/tenant/billing returns history', async () => {
    const app = createApp(buildPrisma())
    const res = await request(app).get('/api/tenant/billing')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.invoices).toHaveLength(1)
    await assertMatchesOpenApi('/api/tenant/billing', 'get', '200', res.body)
  })

  it('POST /api/tenant/billing/subscribe mock-activates starter', async () => {
    const res = await request(createApp(buildPrisma()))
      .post('/api/tenant/billing/subscribe')
      .send({ planKey: 'starter' })
    expect(res.status).toBe(200)
    expect(res.body.data.mock).toBe(true)
    expect(res.body.data.saasStatus).toBe('active')
    await assertMatchesOpenApi('/api/tenant/billing/subscribe', 'post', '200', res.body)
  })

  it('POST /api/tenant/billing/subscribe rejects invalid plan', async () => {
    const res = await request(createApp(buildPrisma()))
      .post('/api/tenant/billing/subscribe')
      .send({ planKey: 'gold' })
    expect(res.status).toBe(400)
    expect(res.body.code).toBe('INVALID_PLAN')
  })

  it('POST /api/saas/billing/webhook is idempotent-capable', async () => {
    const prisma = buildPrisma()
    const res = await request(createApp(prisma)).post('/api/saas/billing/webhook').send({
      type: 'payment.paid',
      tenantId: 1,
      outcome: 'paid',
      id: 'evt-1',
    })
    expect(res.status).toBe(200)
    expect(res.body.data.duplicate).toBe(false)
    await assertMatchesOpenApi('/api/saas/billing/webhook', 'post', '200', res.body)
  })
})
