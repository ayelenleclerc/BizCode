import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { getDefaultModulesForJurisdiction } from '../../apps/web/src/lib/modules'
import { assertMatchesOpenApi } from './validate-openapi-response'

const tenantRow = { id: 1, name: 'Demo', slug: 'demo', active: true }

function buildPrismaMock(): PrismaClient {
  const configRow = {
    id: 1,
    tenantId: 1,
    businessType: 'ambos',
    rubros: [] as string[],
    plan: 'pro',
    modules: [...getDefaultModulesForJurisdiction('AR')],
    integrations: [] as string[],
    updatedById: 1,
    updatedAt: new Date(),
    createdAt: new Date(),
  }

  const trialRow = {
    id: 1,
    tenantId: 1,
    moduleKey: 'billing.orders',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    active: true,
    createdAt: new Date(),
  }

  return {
    tenant: {
      findUnique: vi.fn().mockResolvedValue(tenantRow),
    },
    tenantConfig: {
      findUnique: vi.fn().mockResolvedValue(configRow),
      upsert: vi.fn().mockImplementation(async ({ create, update }) => {
        if (create) {
          return { ...configRow, ...create, modules: create.modules ?? configRow.modules }
        }
        return { ...configRow, ...update }
      }),
      create: vi.fn().mockResolvedValue(configRow),
    },
    tenantConfigHistory: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    tenantModuleTrial: {
      findMany: vi.fn().mockResolvedValue([trialRow]),
      findUnique: vi.fn().mockResolvedValue(trialRow),
      upsert: vi.fn().mockResolvedValue(trialRow),
      update: vi.fn().mockResolvedValue({ ...trialRow, active: false }),
    },
    appUser: {
      findMany: vi.fn().mockResolvedValue([{ id: 2 }]),
    },
    notification: {
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    appSession: { findFirst: vi.fn().mockResolvedValue(null) },
  } as unknown as PrismaClient
}

describe('Superadmin tenant pricing and trials API (#226)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'super_admin'
    process.env.BIZCODE_TEST_USER_ID = '1'
  })

  it('GET pricing returns estimate', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/superadmin/tenants/1/pricing')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.plan).toBe('pro')
    expect(typeof res.body.data.totalMonthly).toBe('number')
    await assertMatchesOpenApi('/api/superadmin/tenants/{tenantId}/pricing', 'get', '200', res.body)
  })

  it('GET trials lists active trials', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/superadmin/tenants/1/trials')
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    await assertMatchesOpenApi('/api/superadmin/tenants/{tenantId}/trials', 'get', '200', res.body)
  })

  it('POST trial activates module', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/superadmin/tenants/1/trials')
      .send({ moduleKey: 'billing.orders', days: 14, reason: 'trial test' })
    expect(res.status).toBe(201)
    expect(res.body.data.moduleKey).toBe('billing.orders')
    await assertMatchesOpenApi('/api/superadmin/tenants/{tenantId}/trials', 'post', '201', res.body)
  })

  it('DELETE trial deactivates', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).delete('/api/superadmin/tenants/1/trials/billing.orders')
    expect(res.status).toBe(200)
    expect(res.body.data.active).toBe(false)
    await assertMatchesOpenApi(
      '/api/superadmin/tenants/{tenantId}/trials/{moduleKey}',
      'delete',
      '200',
      res.body,
    )
  })
})
