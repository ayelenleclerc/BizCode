import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { DEFAULT_MODULES } from '../../apps/web/src/lib/modules'

const tenantRow = { id: 1, name: 'Demo', slug: 'demo', active: true }

function buildPrismaMock(): PrismaClient {
  const configRow = {
    id: 1,
    tenantId: 1,
    businessType: 'ambos',
    rubros: [] as string[],
    plan: 'starter',
    modules: [...DEFAULT_MODULES],
    integrations: [] as string[],
    updatedById: 1,
    updatedAt: new Date(),
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
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
    },
    appSession: { findFirst: vi.fn().mockResolvedValue(null) },
  } as unknown as PrismaClient
}

describe('Superadmin tenant config API', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'super_admin'
    process.env.BIZCODE_TEST_USER_ID = '1'
  })

  it('GET config returns 403 for non super_admin', async () => {
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/superadmin/tenants/1/config')
    expect(res.status).toBe(403)
  })

  it('GET config for tenant', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/superadmin/tenants/1/config')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.tenantId).toBe(1)
  })

  it('PUT rejects invalid module set', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .put('/api/superadmin/tenants/1/config')
      .send({
        modules: ['core.auth'],
        reason: 'test invalid',
      })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('invalid_module_set')
  })

  it('PUT accepts valid modules with reason', async () => {
    const app = createApp(buildPrismaMock())
    const modules = [...DEFAULT_MODULES, 'billing.orders']
    const res = await request(app)
      .put('/api/superadmin/tenants/1/config')
      .send({
        modules,
        reason: 'enable orders',
      })
    expect(res.status).toBe(200)
    expect(res.body.data.modules).toEqual(modules)
  })
})
