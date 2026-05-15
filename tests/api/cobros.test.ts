import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'
import { computeScoreAfterCobro } from '../../server/services/CobroService'

const CLIENTE_BASE = {
  id: 1,
  codigo: 1001,
  rsocial: 'ACME SA',
  fantasia: null,
  cuit: '20-12345678-9',
  condIva: 'RI',
  domicilio: null,
  localidad: null,
  cpost: null,
  telef: null,
  email: null,
  formaPago: null,
  activo: true,
  creditLimit: null,
  creditDays: 30,
  balance: '1000.00',
  balanceInicial: '0.00',
  score: 50,
  suspended: false,
  deliveryZoneId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const COBRO_BODY = {
  clienteId: 1,
  fecha: '2026-05-15',
  monto: 250.5,
  formaPagoId: null,
  referencia: 'REC-001',
  nota: 'Pago parcial',
}

const COBRO_RESULT = {
  id: 10,
  tenantId: 1,
  ...COBRO_BODY,
  fecha: new Date('2026-05-15T12:00:00.000Z'),
  monto: '250.50',
  referencia: 'REC-001',
  nota: 'Pago parcial',
  createdAt: new Date(),
  updatedAt: new Date(),
  cliente: { id: 1, codigo: 1001, rsocial: 'ACME SA' },
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    deliveryZone: { findFirst: vi.fn().mockResolvedValue({ id: 1, tenantId: 1 }) },
    cliente: {
      findMany: vi.fn().mockResolvedValue([CLIENTE_BASE]),
      findFirst: vi.fn().mockResolvedValue(CLIENTE_BASE),
      findUnique: vi.fn().mockResolvedValue(CLIENTE_BASE),
      create: vi.fn().mockResolvedValue(CLIENTE_BASE),
      update: vi.fn().mockResolvedValue(CLIENTE_BASE),
    },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn().mockResolvedValue({ id: 1 }) },
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
      create: vi.fn().mockResolvedValue(COBRO_RESULT),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { monto: null } }),
    },
    notification: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
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
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') return arg(buildPrismaMock())
      return arg
    }),
    ...overrides,
  } as unknown as PrismaClient
}

describe('computeScoreAfterCobro', () => {
  it('adds 5 when no open invoices', () => {
    expect(computeScoreAfterCobro(50, new Date('2026-05-15'), 30, null)).toBe(55)
  })

  it('adds 5 when payment is on time', () => {
    const facturaFecha = new Date('2026-04-01')
    const cobroFecha = new Date('2026-04-20')
    expect(computeScoreAfterCobro(50, cobroFecha, 30, facturaFecha)).toBe(55)
  })

  it('subtracts 10 when payment is late', () => {
    const facturaFecha = new Date('2026-01-01')
    const cobroFecha = new Date('2026-05-15')
    expect(computeScoreAfterCobro(50, cobroFecha, 30, facturaFecha)).toBe(40)
  })

  it('clamps score at 100', () => {
    expect(computeScoreAfterCobro(98, new Date('2026-05-15'), 0, null)).toBe(100)
  })

  it('clamps score at 0', () => {
    const facturaFecha = new Date('2020-01-01')
    expect(computeScoreAfterCobro(5, new Date('2026-05-15'), 0, facturaFecha)).toBe(0)
  })
})

describe('POST /api/cobros', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'billing'
  })

  it('returns 422 CLIENT_SUSPENDED when cliente is suspended', async () => {
    const suspended = { ...CLIENTE_BASE, suspended: true }
    const prisma = buildPrismaMock({
      cliente: {
        findFirst: vi.fn().mockResolvedValue(suspended),
        findMany: vi.fn(),
        update: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).post('/api/cobros').send(COBRO_BODY).expect(422)
    expect(res.body).toEqual({ success: false, error: 'CLIENT_SUSPENDED' })
    expect((prisma.cobro.create as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid monto', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/cobros').send({ ...COBRO_BODY, monto: 0 }).expect(400)
    expect(res.body.success).toBe(false)
  })

  it('registers cobro and writes audit', async () => {
    const clienteUpdate = vi.fn().mockResolvedValue({
      id: 1,
      rsocial: 'ACME SA',
      balance: '749.50',
      creditLimit: null,
      score: 55,
    })
    const cobroCreate = vi.fn().mockResolvedValue(COBRO_RESULT)
    const txPrisma = buildPrismaMock({
      cliente: {
        findFirst: vi.fn().mockResolvedValue(CLIENTE_BASE),
        update: clienteUpdate,
      },
      cobro: { create: cobroCreate },
    })
    const prisma = buildPrismaMock({
      $transaction: vi.fn(async (fn: unknown) => {
        if (typeof fn === 'function') return fn(txPrisma)
        return fn
      }),
    })
    const app = createApp(prisma)
    const res = await request(app).post('/api/cobros').send(COBRO_BODY).expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBe(10)
    expect(prisma.auditEvent.create).toHaveBeenCalled()
    expect(clienteUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          balance: { decrement: 250.5 },
          score: 55,
        }),
      }),
    )
  })

  it('returns 403 for collections role without sales.create', async () => {
    process.env.BIZCODE_TEST_ROLE = 'collections'
    const app = createApp(buildPrismaMock())
    await request(app).post('/api/cobros').send(COBRO_BODY).expect(403)
  })
})

describe('GET /api/cobros', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'collections'
  })

  it('returns paginated list', async () => {
    const prisma = buildPrismaMock({
      cobro: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([COBRO_RESULT]),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/cobros?clienteId=1').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.total).toBe(1)
  })
})

describe('GET /api/cobros/:id', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'collections'
  })

  it('returns 404 when not found', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/cobros/999').expect(404)
    expect(res.body.error).toBe('Cobro not found')
  })

  it('returns cobro detail', async () => {
    const prisma = buildPrismaMock({
      cobro: { findFirst: vi.fn().mockResolvedValue(COBRO_RESULT) },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/cobros/10').expect(200)
    expect(res.body.data.id).toBe(10)
  })
})
