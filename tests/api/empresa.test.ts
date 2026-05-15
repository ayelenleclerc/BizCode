import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

const VALID_CUIT = '20-12345678-6'

const EMPRESA_ROW = {
  id: 1,
  tenantId: 1,
  nombre: 'Mi Empresa SA',
  cuit: VALID_CUIT,
  domicilio: 'Av. Siempre Viva 742',
  puntoVenta: 3,
  tipoFactura: 'B',
  logoUrl: null,
}

const EMPRESA_BODY = {
  nombre: 'Mi Empresa SA',
  cuit: VALID_CUIT,
  domicilio: 'Av. Siempre Viva 742',
  puntoVenta: 3,
  tipoFactura: 'B',
  logoUrl: null,
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    deliveryZone: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    cliente: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
    },
    cobro: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { monto: null } }),
    },
    ordenEntrega: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    paramEmpresa: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue(EMPRESA_ROW),
    },
    notification: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
      update: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    tenant: {
      findUnique: vi.fn().mockResolvedValue({ id: 1, name: 'Demo Tenant', slug: 'demo', active: true }),
    },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') return arg(buildPrismaMock())
      return arg
    }),
    ...overrides,
  } as unknown as PrismaClient
}

describe('/api/empresa', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })

  afterEach(() => {
    delete process.env.BIZCODE_TEST_ROLE
  })

  it('GET returns defaults when no row exists', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)

    const res = await request(app).get('/api/empresa').expect(200)

    expect(res.body.success).toBe(true)
    expect(res.body.data.nombre).toBe('Demo Tenant')
    expect(res.body.data.prefijoFactura).toBe('0001')
    expect(res.body.data.id).toBeNull()
  })

  it('GET returns persisted settings', async () => {
    const prisma = buildPrismaMock({
      paramEmpresa: {
        findUnique: vi.fn().mockResolvedValue(EMPRESA_ROW),
        upsert: vi.fn(),
      },
    })
    const app = createApp(prisma)

    const res = await request(app).get('/api/empresa').expect(200)

    expect(res.body.data.nombre).toBe('Mi Empresa SA')
    expect(res.body.data.prefijoFactura).toBe('0003')
    expect(res.body.data.id).toBe(1)
  })

  it('GET returns 401 without auth', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    const app = createApp(buildPrismaMock())

    const res = await request(app).get('/api/empresa').expect(401)

    expect(res.body.success).toBe(false)
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
  })

  it('PUT updates settings for owner', async () => {
    const upsert = vi.fn().mockResolvedValue(EMPRESA_ROW)
    const prisma = buildPrismaMock({
      paramEmpresa: {
        findUnique: vi.fn().mockResolvedValue(null),
        upsert,
      },
    })
    const app = createApp(prisma)

    const res = await request(app).put('/api/empresa').send(EMPRESA_BODY).expect(200)

    expect(res.body.data.prefijoFactura).toBe('0003')
    expect(upsert).toHaveBeenCalled()
  })

  it('PUT returns 403 for seller without settings.business.manage', async () => {
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const app = createApp(buildPrismaMock())

    const res = await request(app).put('/api/empresa').send(EMPRESA_BODY).expect(403)

    expect(res.body.error).toContain('settings.business.manage')
  })

  it('PUT returns 400 for invalid CUIT', async () => {
    const app = createApp(buildPrismaMock())

    const res = await request(app)
      .put('/api/empresa')
      .send({ ...EMPRESA_BODY, cuit: '20-00000000-0' })
      .expect(400)

    expect(res.body.success).toBe(false)
  })

  it('PUT returns 400 for puntoVenta out of range', async () => {
    const app = createApp(buildPrismaMock())

    const res = await request(app)
      .put('/api/empresa')
      .send({ ...EMPRESA_BODY, puntoVenta: 10000 })
      .expect(400)

    expect(res.body.success).toBe(false)
  })
})
