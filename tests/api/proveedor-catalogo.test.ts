import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../apps/server/createApp'

const catalogDbRow = {
  id: 7,
  tenantId: 1,
  proveedorId: 3,
  articuloId: 10,
  codigoProveedor: 'AG-1000',
  descripcion: 'Aceite girasol',
  precioLista: new Decimal(1250),
  precioListaFecha: new Date('2026-06-01T00:00:00.000Z'),
  unidadCompra: 'caja x12',
  multiplo: new Decimal(6),
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  articulo: { id: 10, codigo: 1001, descripcion: 'Aceite 1L' },
}

function buildPrismaMock(): PrismaClient {
  const prisma = {
    deliveryZone: { findFirst: vi.fn().mockResolvedValue(null) },
    cliente: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    articulo: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue({ id: 10 }),
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
      findFirst: vi.fn().mockResolvedValue({ id: 3 }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    proveedorArticulo: {
      findMany: vi.fn().mockResolvedValue([catalogDbRow]),
      findFirst: vi.fn().mockResolvedValue(catalogDbRow),
      create: vi.fn().mockResolvedValue(catalogDbRow),
      update: vi.fn().mockResolvedValue(catalogDbRow),
    },
    comprobanteCompra: { findMany: vi.fn().mockResolvedValue([]) },
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

describe('Proveedor catalog API (#273)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('GET /api/proveedores/:id/catalogo returns items', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores/3/catalogo').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.items).toHaveLength(1)
    expect(res.body.data.items[0].codigoProveedor).toBe('AG-1000')
  })

  it('POST /api/proveedores/:id/catalogo creates entry', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/proveedores/3/catalogo')
      .send({
        articuloId: 10,
        codigoProveedor: 'AG-1000',
        precioLista: 1250,
        multiplo: 6,
      })
      .expect(201)
    expect(res.body.data.articuloId).toBe(10)
    expect(prisma.auditEvent.create).toHaveBeenCalled()
  })

  it('PUT /api/proveedores/:id/catalogo/:articuloId updates entry', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app)
      .put('/api/proveedores/3/catalogo/10')
      .send({ precioLista: 1300 })
      .expect(200)
    expect(res.body.success).toBe(true)
    expect(prisma.auditEvent.create).toHaveBeenCalled()
  })

  it('returns 404 when proveedor missing on GET', async () => {
    const prisma = buildPrismaMock()
    vi.mocked(prisma.proveedor.findFirst).mockResolvedValue(null)
    const app = createApp(prisma)
    await request(app).get('/api/proveedores/99/catalogo').expect(404)
  })
})
