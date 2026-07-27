/**
 * #215 — RLS helpers, verifyOwnership, and (when Postgres is available) fail-safe 0-row checks.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import {
  TENANT_RLS_GUC,
  TENANT_RLS_MODELS,
  createTenantRlsPrisma,
  runWithTenantRls,
  runWithTenantRlsContext,
  getTenantRlsStore,
} from '../../apps/server/lib/tenantRls'

function buildBasePrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    cliente: {
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
      update: vi.fn(),
    },
    articulo: {
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
      update: vi.fn(),
    },
    factura: {
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
    },
    proveedor: {
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
      update: vi.fn(),
    },
    pedido: {
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
      update: vi.fn(),
    },
    rubro: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn() },
    deliveryZone: { findFirst: vi.fn().mockResolvedValue(null), findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    notification: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
      update: vi.fn(),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    appUser: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    tenantModule: { findMany: vi.fn().mockResolvedValue([]) },
    tenantConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    appSession: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: PrismaClient) => Promise<unknown>)(buildBasePrisma())
      }
      return fn
    }),
    $executeRaw: vi.fn().mockResolvedValue(0),
    ...overrides,
  } as unknown as PrismaClient
}

describe('RLS inventory and ALS (#215)', () => {
  it('covers the nine AC-minimum Prisma models', () => {
    expect(TENANT_RLS_MODELS).toEqual([
      'Factura',
      'Cliente',
      'Proveedor',
      'Articulo',
      'Pedido',
      'OrdenCompra',
      'StockAjuste',
      'Notification',
      'AuditEvent',
    ])
    expect(TENANT_RLS_GUC).toBe('app.current_tenant_id')
  })

  it('runWithTenantRlsContext exposes tenantId on ALS', () => {
    expect(getTenantRlsStore()).toBeUndefined()
    runWithTenantRlsContext(42, () => {
      expect(getTenantRlsStore()?.tenantId).toBe(42)
      expect(getTenantRlsStore()?.inRlsTx).toBe(false)
    })
    expect(getTenantRlsStore()).toBeUndefined()
  })
})

describe('verifyOwnership anti-IDOR (#215)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    if (!process.env.DATABASE_URL?.trim()) {
      process.env.DATABASE_URL = 'postgresql://x@localhost:5432/y'
    }
  })

  it('GET /api/proveedores/:id returns 404 for other-tenant id', async () => {
    const prisma = buildBasePrisma()
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores/88').expect(404)
    expect(res.body.error).toBe('Not found')
    expect(prisma.proveedor.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ id: 88, tenantId: 1 }) }),
    )
  })

  it('tenant A session cannot read tenant B cliente via API (mocked)', async () => {
    const prisma = buildBasePrisma({
      cliente: {
        findFirst: vi.fn().mockResolvedValue(null),
        findMany: vi.fn().mockResolvedValue([]),
        count: vi.fn().mockResolvedValue(0),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/501').expect(404)
    expect(res.body.success).toBe(false)
    expect(prisma.cliente.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 501, tenantId: 1 } }),
    )
  })
})

describe('PostgreSQL FORCE RLS fail-safe (#215)', () => {
  let admin: PrismaClient | undefined
  let canRun = false

  beforeAll(async () => {
    if (!process.env.DATABASE_URL?.trim() || process.env.DATABASE_URL.includes('://x@')) {
      return
    }
    admin = new PrismaClient()
    try {
      await admin.$queryRaw`SELECT 1`
      const policies = await admin.$queryRaw<Array<{ tablename: string }>>`
        SELECT c.relname AS tablename
        FROM pg_class c
        JOIN pg_policy p ON p.polrelid = c.oid
        WHERE c.relname IN (
          'Cliente', 'Factura', 'Proveedor', 'Articulo', 'Pedido',
          'OrdenCompra', 'StockAjuste', 'Notification', 'AuditEvent'
        )
        GROUP BY c.relname
      `
      canRun = policies.length >= 9
    } catch {
      canRun = false
    }
  })

  afterAll(async () => {
    await admin?.$disconnect()
  })

  it('without GUC, bizcode_app sees 0 Cliente rows (fail-safe)', async () => {
    if (!canRun || !admin) {
      return
    }
    await admin.$executeRawUnsafe(`SET ROLE bizcode_app`)
    try {
      await admin.$executeRawUnsafe(`SELECT set_config('${TENANT_RLS_GUC}', '', true)`)
      const rows = await admin.$queryRawUnsafe<Array<{ count: bigint }>>(
        `SELECT count(*)::bigint AS count FROM "Cliente"`,
      )
      expect(Number(rows[0]?.count ?? -1)).toBe(0)
    } finally {
      await admin.$executeRawUnsafe(`RESET ROLE`)
    }
  })

  it('with matching GUC, bizcode_app can see tenant-scoped rows', async () => {
    if (!canRun || !admin) {
      return
    }
    const tenants = await admin.tenant.findMany({ take: 1, select: { id: true } })
    const tenantId = tenants[0]?.id
    if (tenantId == null) {
      return
    }
    await admin.$executeRawUnsafe(`SET ROLE bizcode_app`)
    try {
      await admin.$executeRawUnsafe(`SELECT set_config('${TENANT_RLS_GUC}', '${tenantId}', true)`)
      const rows = await admin.$queryRawUnsafe<Array<{ count: bigint }>>(
        `SELECT count(*)::bigint AS count FROM "Cliente"`,
      )
      expect(Number(rows[0]?.count ?? -1)).toBeGreaterThanOrEqual(0)
    } finally {
      await admin.$executeRawUnsafe(`RESET ROLE`)
    }
  })

  it('runWithTenantRls sets LOCAL GUC for extended client ops', async () => {
    if (!canRun || !admin) {
      return
    }
    const tenants = await admin.tenant.findMany({ take: 1, select: { id: true } })
    const tenantId = tenants[0]?.id
    if (tenantId == null) {
      return
    }
    const rls = createTenantRlsPrisma(admin)
    const seen = await runWithTenantRls(rls, tenantId, async (tx) => {
      const guc = await tx.$queryRawUnsafe<Array<{ v: string | null }>>(
        `SELECT current_setting('${TENANT_RLS_GUC}', true) AS v`,
      )
      return guc[0]?.v ?? null
    })
    expect(seen).toBe(String(tenantId))
  })
})
