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
    paramEmpresa: { findUnique: vi.fn().mockResolvedValue(null), findMany: vi.fn().mockResolvedValue([]) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    proveedor: {
      findFirst: vi.fn().mockResolvedValue({ id: 3 }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    comprobanteCompra: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 9,
          fecha: new Date('2026-06-01'),
          tipo: 'B',
          prefijo: '0001',
          numero: 7,
          total: new Decimal(300),
          ordenCompraId: null,
        },
      ]),
    },
    ordenCompra: { findMany: vi.fn().mockResolvedValue([]) },
    reciboPagoFactura: { groupBy: vi.fn().mockResolvedValue([]) },
    alertaProveedorConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    $transaction: vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') return fn(prisma)
      return fn
    }),
  }
  return prisma as unknown as PrismaClient
}

describe('GET /api/proveedores/:id/historial (#272)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns historial summary for owner', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores/3/historial?dias=90').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.periodoDias).toBe(90)
    expect(res.body.data.totalComprado).toBe('300.00')
    expect(res.body.data.compras).toHaveLength(1)
  })

  it('returns 400 for invalid dias', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores/3/historial?dias=45').expect(400)
    expect(res.body.success).toBe(false)
  })

  it('returns 404 when proveedor missing', async () => {
    const prisma = buildPrismaMock()
    ;(prisma.proveedor.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null)
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores/3/historial').expect(404)
    expect(res.body.success).toBe(false)
  })

  it('GET articulos returns PPP rows', async () => {
    const prisma = buildPrismaMock()
    ;(prisma.ordenCompra.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([
      {
        updatedAt: new Date('2026-06-05'),
        items: [
          {
            cantidadRecibida: 4,
            costoUnitario: new Decimal(50),
            articulo: { id: 2, codigo: 'X', descripcion: 'Prod X' },
          },
        ],
      },
    ])
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores/3/articulos?dias=30').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.articulos[0]?.precioPromedioPonderado).toBe('50.00')
  })
})
