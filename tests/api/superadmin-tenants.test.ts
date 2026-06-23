import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { DEFAULT_MODULES } from '../../apps/web/src/lib/modules'
import { assertMatchesOpenApi } from './validate-openapi-response'

const tenantRow = {
  id: 1,
  name: 'Demo',
  slug: 'demo',
  active: true,
  createdAt: new Date('2025-01-01T00:00:00.000Z'),
  updatedAt: new Date('2025-01-02T00:00:00.000Z'),
}

function buildPrismaMock(): PrismaClient {
  const configRow = {
    id: 1,
    tenantId: 1,
    businessType: 'ambos',
    rubros: [] as string[],
    plan: 'starter',
    modules: [...DEFAULT_MODULES],
    integrations: [] as string[],
    updatedById: null as number | null,
    updatedAt: new Date('2025-01-02T00:00:00.000Z'),
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
  }

  const listRow = {
    ...tenantRow,
    _count: { users: 2, facturas: 5 },
    tenantConfig: { plan: 'starter' },
  }

  const detailRow = {
    ...tenantRow,
    _count: { users: 2, facturas: 5, pedidos: 1, clientes: 10 },
    tenantConfig: { plan: 'starter', modules: [...DEFAULT_MODULES], updatedAt: configRow.updatedAt },
  }

  return {
    tenant: {
      findMany: vi.fn().mockResolvedValue([listRow]),
      findUnique: vi.fn().mockImplementation(async ({ where }: { where: { id?: number; slug?: string } }) => {
        if (where.slug === 'taken') {
          return { id: 99 }
        }
        if (where.id === 1 || where.slug === 'demo') {
          return detailRow
        }
        return null
      }),
      count: vi.fn().mockImplementation(async (args?: { where?: { active?: boolean } }) => {
        if (args?.where?.active === true) return 1
        return 1
      }),
      create: vi.fn().mockResolvedValue({ id: 2, name: 'New', slug: 'new', active: true }),
      update: vi.fn().mockResolvedValue(tenantRow),
    },
    tenantConfig: {
      create: vi.fn().mockResolvedValue(configRow),
    },
    factura: {
      count: vi.fn().mockResolvedValue(3),
    },
    appUser: {
      count: vi.fn().mockResolvedValue(4),
      create: vi.fn().mockResolvedValue({ id: 10 }),
    },
    auditEvent: {
      findFirst: vi.fn().mockResolvedValue({ createdAt: new Date('2025-01-03T00:00:00.000Z') }),
    },
    appSession: {
      findFirst: vi.fn().mockResolvedValue({ lastSeenAt: new Date('2025-01-04T00:00:00.000Z') }),
    },
    plan: {
      findUnique: vi.fn().mockResolvedValue({ id: 1, key: 'starter' }),
    },
    tenantPlan: {
      create: vi.fn().mockResolvedValue({ id: 1, tenantId: 2, planId: 1, status: 'active' }),
    },
    $transaction: vi.fn().mockImplementation(async (fn: (tx: PrismaClient) => Promise<unknown>) => {
      const tx = {
        tenant: {
          create: vi.fn().mockResolvedValue({ id: 2, name: 'New', slug: 'new' }),
        },
        tenantConfig: {
          create: vi.fn().mockResolvedValue(configRow),
        },
        plan: {
          findUnique: vi.fn().mockResolvedValue({ id: 1, key: 'starter' }),
        },
        tenantPlan: {
          create: vi.fn().mockResolvedValue({ id: 1, tenantId: 2, planId: 1, status: 'active' }),
        },
        appUser: {
          create: vi.fn().mockResolvedValue({ id: 10 }),
        },
      }
      return fn(tx as unknown as PrismaClient)
    }),
  } as unknown as PrismaClient
}

describe('Superadmin tenants API (#137)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'super_admin'
    process.env.BIZCODE_TEST_USER_ID = '1'
  })

  it('GET /api/superadmin/stats returns 403 for non super_admin', async () => {
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/superadmin/stats')
    expect(res.status).toBe(403)
  })

  it('GET /api/superadmin/stats', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/superadmin/stats')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toMatchObject({
      activeTenants: expect.any(Number),
      totalTenants: expect.any(Number),
      facturasToday: expect.any(Number),
    })
    await assertMatchesOpenApi('/api/superadmin/stats', 'get', '200', res.body)
  })

  it('GET /api/superadmin/tenants list', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/superadmin/tenants')
    expect(res.status).toBe(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].slug).toBe('demo')
    await assertMatchesOpenApi('/api/superadmin/tenants', 'get', '200', res.body)
  })

  it('GET /api/superadmin/tenants/:id detail', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/superadmin/tenants/1')
    expect(res.status).toBe(200)
    expect(res.body.data.stats.userCount).toBe(2)
    await assertMatchesOpenApi('/api/superadmin/tenants/{tenantId}', 'get', '200', res.body)
  })

  it('GET /api/superadmin/tenants/:id returns 404 when missing', async () => {
    const prisma = buildPrismaMock()
    vi.mocked(prisma.tenant.findUnique).mockResolvedValue(null)
    const app = createApp(prisma)
    const res = await request(app).get('/api/superadmin/tenants/999')
    expect(res.status).toBe(404)
  })

  it('POST /api/superadmin/tenants creates tenant', async () => {
    const prisma = buildPrismaMock()
    vi.mocked(prisma.tenant.findUnique).mockResolvedValue(null)
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/superadmin/tenants')
      .send({ name: 'New Co', slug: 'new-co' })
    expect(res.status).toBe(201)
    expect(res.body.data.tenantId).toBe(2)
    await assertMatchesOpenApi('/api/superadmin/tenants', 'post', '201', res.body)
  })

  it('POST returns 409 when slug exists', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/superadmin/tenants')
      .send({ name: 'Dup', slug: 'taken' })
    expect(res.status).toBe(409)
  })

  it('PATCH /api/superadmin/tenants/:id updates active flag', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .patch('/api/superadmin/tenants/1')
      .send({ active: false })
    expect(res.status).toBe(200)
    expect(res.body.data.id).toBe(1)
    await assertMatchesOpenApi('/api/superadmin/tenants/{tenantId}', 'patch', '200', res.body)
  })
})
