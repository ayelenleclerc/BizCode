import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../apps/server/createApp'

const devolucionRow = {
  id: 1,
  tenantId: 1,
  repartoId: 1,
  repartoItemId: 10,
  motivo: 'rechazo',
  motivoDetalle: null,
  fotoBase64: null,
  estado: 'registered',
  registeredById: 2,
  remittedAt: null,
  remittedById: null,
  notaCreditoId: null,
  createdAt: new Date('2026-08-19T12:00:00.000Z'),
  updatedAt: new Date('2026-08-19T12:00:00.000Z'),
  lineas: [{ id: 1, articuloId: 8, facturaItemId: 3, cantidad: new Decimal(1) }],
}

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  const prisma = {
    deliveryZone: { findFirst: vi.fn().mockResolvedValue(null) },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    tenantConfig: {
      findUnique: vi.fn().mockResolvedValue({
        tenantId: 1,
        modules: [],
        integrations: [],
        plan: 'pro',
        businessType: 'mayorista',
        rubros: [],
        updatedAt: new Date(),
      }),
    },
    recuento: { count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn().mockResolvedValue(null) },
    articulo: {
      findFirst: vi.fn().mockResolvedValue({ id: 8, tipo: 'producto' }),
      findMany: vi.fn().mockResolvedValue([]),
      findFirstOrThrow: vi.fn().mockResolvedValue({ id: 8, stock: 4 }),
      update: vi.fn(),
    },
    stockAjuste: { create: vi.fn() },
    devolucionEntrega: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue(devolucionRow),
      update: vi.fn(),
    },
    factura: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn() },
    facturaItem: { findMany: vi.fn().mockResolvedValue([]) },
    notaCredito: { aggregate: vi.fn(), create: vi.fn() },
    cobro: { count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), aggregate: vi.fn() },
    ordenCompra: { count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn() },
    deposito: { findFirst: vi.fn().mockResolvedValue(null) },
    reparto: {
      count: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn().mockResolvedValue({ id: 1, estado: 'on_route', choferId: 2, tenantId: 1 }),
      create: vi.fn(),
      update: vi.fn(),
    },
    repartoUbicacion: {
      create: vi.fn(),
      deleteMany: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
    repartoItem: {
      findFirst: vi.fn().mockResolvedValue({
        id: 10,
        estado: 'pending',
        devolucionEntrega: null,
        ordenEntrega: {
          id: 5,
          facturaId: 9,
          factura: { id: 9, items: [{ id: 3, articuloId: 8, cantidad: new Decimal(2) }] },
        },
      }),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    ordenEntrega: { count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), updateMany: vi.fn(), update: vi.fn() },
    notification: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn(), create: vi.fn(), createMany: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: { count: vi.fn().mockResolvedValue(1), findMany: vi.fn(), findFirst: vi.fn().mockResolvedValue({ id: 2, role: 'driver', active: true }) },
    appSession: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') return arg(prisma)
      return arg
    }),
    ...overrides,
  }
  return prisma as unknown as PrismaClient
}

describe('API devolucion entrega (#163)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'driver'
    process.env.BIZCODE_TEST_USER_ID = '2'
  })

  it('POST devolucion returns 403 without field channel', async () => {
    const app = createApp(buildPrisma())
    const res = await request(app)
      .post('/api/repartos/1/items/10/devolucion')
      .send({ motivo: 'rechazo', lineas: [{ articuloId: 8, facturaItemId: 3, cantidad: 1 }] })
      .expect(403)
    expect(res.body.error).toBe('FIELD_CHANNEL_REQUIRED')
  })

  it('POST devolucion registers without calling stock-ajuste HTTP', async () => {
    const prisma = buildPrisma()
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/repartos/1/items/10/devolucion')
      .set('x-bizcode-channel', 'field')
      .send({ motivo: 'rechazo', lineas: [{ articuloId: 8, facturaItemId: 3, cantidad: 1 }] })
      .expect(201)
    expect(res.body.data.estado).toBe('registered')
    expect(prisma.stockAjuste.create).not.toHaveBeenCalled()
  })

  it('GET devoluciones lists registered rows', async () => {
    const prisma = buildPrisma({
      devolucionEntrega: {
        findMany: vi.fn().mockResolvedValue([devolucionRow]),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/repartos/1/devoluciones')
      .set('x-bizcode-channel', 'field')
      .expect(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].hasFoto).toBe(false)
  })
})
