import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../apps/server/createApp'

const articulo = { id: 10, codigo: 1001, descripcion: 'Aceite 1L' }

const catalogEntry = {
  id: 1,
  tenantId: 1,
  proveedorId: 5,
  articuloId: 10,
  codigoProveedor: 'AG-1000',
  descripcion: 'Aceite A',
  precioLista: new Decimal(1250),
  precioListaFecha: new Date('2026-06-01T00:00:00.000Z'),
  unidadCompra: null,
  multiplo: new Decimal(1),
  activo: true,
  proveedor: { id: 5, codigo: 4001, rsocial: 'Proveedor A SA' },
}

function buildPrismaMock(): PrismaClient {
  const prisma = {
    deliveryZone: { findFirst: vi.fn().mockResolvedValue(null) },
    cliente: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    articulo: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(articulo),
    },
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
      findFirst: vi.fn().mockResolvedValue({ id: 1, modules: ['logistics.purchases'] }),
    },
    tenantModule: {
      findMany: vi.fn().mockResolvedValue([{ moduleKey: 'logistics.purchases' }]),
    },
    appSession: { create: vi.fn(), findFirst: vi.fn().mockResolvedValue(null), updateMany: vi.fn(), update: vi.fn() },
    tenantFiscalConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    paramEmpresa: { findUnique: vi.fn().mockResolvedValue(null), findMany: vi.fn().mockResolvedValue([]) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    proveedor: {
      findFirst: vi.fn().mockResolvedValue({ id: 5 }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    proveedorArticulo: {
      findMany: vi.fn().mockResolvedValue([catalogEntry]),
    },
    ordenCompra: {
      findMany: vi.fn().mockResolvedValue([]),
      groupBy: vi.fn().mockResolvedValue([
        { proveedorId: 5, _max: { updatedAt: new Date('2026-05-20T00:00:00.000Z') } },
      ]),
    },
    comprobanteCompra: { findMany: vi.fn().mockResolvedValue([]) },
    reciboPagoFactura: { groupBy: vi.fn().mockResolvedValue([]) },
    alertaProveedorConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    $transaction: vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') return fn(prisma)
      return fn
    }),
  }
  return prisma as unknown as PrismaClient
}

describe('Articulo proveedores comparador API (#274)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('GET /api/articulos/:id/proveedores returns comparison rows', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app).get('/api/articulos/10/proveedores').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.articuloId).toBe(10)
    expect(res.body.data.proveedores).toHaveLength(1)
    expect(res.body.data.proveedores[0].codigoProveedor).toBe('AG-1000')
    expect(res.body.data.proveedorMasBaratoId).toBe(5)
  })

  it('GET /api/proveedores/comparar?articuloId= returns same shape', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores/comparar?articuloId=10').expect(200)
    expect(res.body.data.proveedores[0].esMasBarato).toBe(true)
  })

  it('returns 404 when articulo is missing', async () => {
    const prisma = buildPrismaMock()
    vi.mocked(prisma.articulo.findFirst).mockResolvedValue(null)
    const app = createApp(prisma)
    const res = await request(app).get('/api/articulos/99/proveedores').expect(404)
    expect(res.body.error).toMatch(/Articulo not found/i)
  })

  it('returns 400 for invalid sortBy', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/articulos/10/proveedores?sortBy=invalid')
      .expect(400)
    expect(res.body.success).toBe(false)
  })
})
