/**
 * @en API tests for GET /api/notas-credito and GET /api/notas-credito/:id (#146).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

const ROW = {
  id: 1,
  tenantId: 1,
  facturaOrigenId: 7,
  motivo: 'Nota motivo texto',
  monto: 100,
  estadoCae: 'not_required',
  cae: null,
  caeVto: null,
  createdById: null,
  createdAt: new Date('2026-05-20T12:00:00.000Z'),
  facturaOrigen: {
    id: 7,
    tipo: 'B',
    prefijo: '0001',
    numero: 1,
    clienteId: 1,
    fecha: new Date(),
    total: 100,
    estado: 'N',
  },
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  const base = {
    deliveryZone: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue(null),
    },
    cliente: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue({ id: 1, suspended: false }),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue({ id: 1, rsocial: 'C', balance: 0, creditLimit: null }),
    },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue(null),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
    },
    notaCredito: {
      findMany: vi.fn().mockResolvedValue([ROW]),
      findFirst: vi.fn().mockResolvedValue(ROW),
      count: vi.fn().mockResolvedValue(1),
      create: vi.fn().mockResolvedValue(ROW),
      update: vi.fn().mockResolvedValue(ROW),
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
      create: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue(null),
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
    ...overrides,
  }
  const prisma = { ...base, ...overrides } as unknown as PrismaClient
  prisma.$transaction = vi.fn(async (fn: unknown) => {
    if (typeof fn === 'function') return (fn as (p: PrismaClient) => Promise<unknown>)(prisma)
    return fn
  }) as PrismaClient['$transaction']
  return prisma
}

const MODULES_WITH_NC =
  'core.auth,billing.credit_notes,billing.afip_cae,billing.orders,logistics.dispatches,logistics.picking,logistics.gps'

describe('GET /api/notas-credito', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'finance'
    process.env.BIZCODE_TEST_MODULES = MODULES_WITH_NC
  })

  it('returns 400 when from is missing', async () => {
    const app = createApp(buildPrismaMock())
    await request(app).get('/api/notas-credito').query({ to: '2026-05-31' }).expect(400)
  })

  it('returns 200 with paginated envelope', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .get('/api/notas-credito')
      .query({ from: '2026-05-01', to: '2026-05-31' })
      .expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data[0].id).toBe(1)
  })

  it('returns 403 when module billing.credit_notes is disabled', async () => {
    process.env.BIZCODE_TEST_MODULES = 'core.auth'
    const app = createApp(buildPrismaMock())
    await request(app).get('/api/notas-credito').query({ from: '2026-05-01', to: '2026-05-31' }).expect(403)
  })
})

describe('GET /api/notas-credito/:id', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'finance'
    process.env.BIZCODE_TEST_MODULES = MODULES_WITH_NC
  })

  it('returns 404 when not found', async () => {
    const prisma = buildPrismaMock({
      notaCredito: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null),
        count: vi.fn().mockResolvedValue(0),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const app = createApp(prisma)
    await request(app).get('/api/notas-credito/999').expect(404)
  })

  it('returns 200 with row', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/notas-credito/1').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBe(1)
  })
})
