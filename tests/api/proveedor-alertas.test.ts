import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../apps/server/createApp'

function buildPrismaMock(): PrismaClient {
  const prisma = {
    deliveryZone: { findFirst: vi.fn().mockResolvedValue(null) },
    cliente: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
    },
    cobro: { aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { monto: null } }) },
    notaCredito: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
    notification: { findMany: vi.fn().mockResolvedValue([]), createMany: vi.fn().mockResolvedValue({ count: 0 }) },
    recuento: { findFirst: vi.fn().mockResolvedValue(null) },
    ordenEntrega: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
    cobroRecordatorio: { count: vi.fn().mockResolvedValue(0) },
    appUser: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([{ id: 1 }]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    tenant: {
      findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }),
      findFirst: vi.fn().mockResolvedValue({ id: 1, modules: ['finance.ledger'] }),
    },
    tenantModule: {
      findMany: vi.fn().mockResolvedValue([{ moduleKey: 'finance.ledger' }]),
    },
    appSession: { create: vi.fn(), findFirst: vi.fn().mockResolvedValue(null), updateMany: vi.fn(), update: vi.fn() },
    tenantFiscalConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    paramEmpresa: {
      findUnique: vi.fn().mockResolvedValue({ timezone: 'America/Argentina/Buenos_Aires' }),
      findMany: vi.fn().mockResolvedValue([{ tenantId: 1 }]),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    alertaProveedorConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({
        diasPrevioAviso: 5,
        diasCritico: 10,
        notifEmail: true,
        notifInApp: true,
      }),
    },
    comprobanteCompra: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 9,
          proveedorId: 3,
          fecha: new Date('2026-06-01'),
          vencimiento: new Date('2026-06-08'),
          tipo: 'B',
          prefijo: '0001',
          numero: 7,
          total: new Decimal(300),
          proveedor: {
            id: 3,
            codigo: 10,
            rsocial: 'Proveedor Test',
            plazoHabitual: 7,
            condicionPago: '15dias',
          },
        },
      ]),
    },
    reciboPagoFactura: { groupBy: vi.fn().mockResolvedValue([]) },
    alertaProveedorLog: { count: vi.fn().mockResolvedValue(0), create: vi.fn() },
    proveedor: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    $transaction: vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') return fn(prisma)
      return fn
    }),
  } as unknown as PrismaClient
  return prisma
}

const MODULES =
  'core.auth,billing.credit_notes,billing.arca_cae,finance.ledger,billing.orders,logistics.dispatches,logistics.picking,logistics.gps'

describe('Proveedor alertas API (#275)', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'test')
    vi.stubEnv('BIZCODE_TEST_AUTH_BYPASS', 'true')
    vi.stubEnv('BIZCODE_TEST_ROLE', 'owner')
    vi.stubEnv('BIZCODE_TEST_MODULES', MODULES)
  })

  it('GET /api/proveedores/facturas-pendientes returns pending rows', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/proveedores/facturas-pendientes').expect(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data[0]?.comprobanteCompraId).toBe(9)
  })

  it('GET /api/configuracion/alertas-proveedores returns defaults', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/configuracion/alertas-proveedores').expect(200)
    expect(res.body.data).toMatchObject({
      diasPrevioAviso: 3,
      diasCritico: 7,
      notifEmail: true,
      notifInApp: true,
    })
  })

  it('PATCH /api/configuracion/alertas-proveedores upserts config', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .patch('/api/configuracion/alertas-proveedores')
      .send({ diasPrevioAviso: 5, diasCritico: 10 })
      .expect(200)
    expect(res.body.data.diasPrevioAviso).toBe(5)
    expect(res.body.data.diasCritico).toBe(10)
  })
})
