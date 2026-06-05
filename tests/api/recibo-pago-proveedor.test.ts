import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../server/createApp'

const proveedorRow = {
  id: 1,
  tenantId: 1,
  codigo: 4001,
  rsocial: 'Proveedor Pago SA',
  fantasia: null as string | null,
  cuit: '30-12345678-9',
  condIva: 'RI',
  telef: null as string | null,
  email: null as string | null,
  activo: true,
  limiteCredito: new Decimal(5000),
}

const comprobanteRow = {
  id: 10,
  tenantId: 1,
  proveedorId: 1,
  ordenCompraId: null,
  fecha: new Date('2026-05-01T12:00:00.000Z'),
  tipo: 'B',
  prefijo: '0001',
  numero: 50,
  neto1: new Decimal(200),
  neto2: new Decimal(0),
  neto3: new Decimal(0),
  iva1: new Decimal(42),
  iva2: new Decimal(0),
  total: new Decimal(242),
  cae: null,
  caeVto: null,
  estado: 'A',
  createdAt: new Date(),
  updatedAt: new Date(),
}

function buildReciboRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    tenantId: 1,
    numero: 1,
    proveedorId: 1,
    fecha: new Date('2026-06-01T12:00:00.000Z'),
    total: new Decimal(100),
    metodoPago: 'transferencia',
    cbu: null,
    referencia: 'TRX-001',
    estado: 'emitido',
    notas: null,
    usuarioId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    proveedor: { id: 1, codigo: 4001, rsocial: 'Proveedor Pago SA', cuit: '30-12345678-9' },
    usuario: { id: 1, username: 'owner1' },
    facturas: [
      {
        id: 1,
        reciboPagoId: 1,
        comprobanteCompraId: 10,
        facturaRef: 'B-0001-50',
        monto: new Decimal(100),
      },
    ],
    ...overrides,
  }
}

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  const movimientoCreate = vi.fn().mockImplementation(async (args: { data: Record<string, unknown> }) => ({
    id: 2,
    ...args.data,
    createdAt: new Date(),
  }))

  const reciboCreate = vi.fn().mockImplementation(async () => buildReciboRow())

  const base = {
    cliente: { findMany: vi.fn().mockResolvedValue([]) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    proveedor: {
      findFirst: vi.fn().mockResolvedValue(proveedorRow),
      findMany: vi.fn().mockResolvedValue([proveedorRow]),
      count: vi.fn().mockResolvedValue(1),
    },
    comprobanteCompra: {
      findMany: vi.fn().mockResolvedValue([comprobanteRow]),
      findFirst: vi.fn().mockResolvedValue(comprobanteRow),
    },
    reciboPagoFactura: {
      groupBy: vi.fn().mockResolvedValue([]),
    },
    reciboPago: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([buildReciboRow()]),
      findFirst: vi.fn().mockImplementation(async (args?: { where?: { numero?: string } }) => {
        if (args?.where && 'numero' in (args.where as object)) return null
        return buildReciboRow()
      }),
      create: reciboCreate,
      update: vi.fn().mockImplementation(async () => buildReciboRow({ estado: 'anulado' })),
    },
    movimientoProveedorCC: {
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      create: movimientoCreate,
    },
    paramEmpresa: {
      findFirst: vi.fn().mockResolvedValue({
        nombre: 'Demo SA',
        cuit: '30-11111111-1',
        domicilio: 'Calle 1',
        logoUrl: null,
      }),
    },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: { findMany: vi.fn().mockResolvedValue([]) },
    notification: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    appUser: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      update: vi.fn(),
    },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    appSession: {
      create: vi.fn(),
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') {
        const tx = {
          reciboPago: {
            findFirst: vi.fn().mockResolvedValue(null),
            create: reciboCreate,
            update: vi.fn().mockImplementation(async () => buildReciboRow({ estado: 'anulado' })),
          },
          movimientoProveedorCC: {
            findFirst: vi.fn().mockResolvedValue(null),
            create: movimientoCreate,
          },
        }
        return arg(tx)
      }
      return arg
    }),
    ...overrides,
  }
  return base as unknown as PrismaClient
}

describe('Recibo pago proveedor API (#271)', () => {
  let prisma: PrismaClient

  beforeEach(() => {
    prisma = buildPrisma()
  })

  it('GET comprobantes-pendientes lists open balance', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/proveedores/1/pagos/comprobantes-pendientes')
      .expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].facturaRef).toBe('B-0001-50')
    expect(res.body.data[0].pendiente).toBe('242.00')
  })

  it('GET pagos returns history', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores/1/pagos').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].numero).toBe(1)
  })

  it('POST pagos creates receipt and ledger movement', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/proveedores/1/pagos')
      .send({
        fecha: '2026-06-01',
        total: 100,
        metodoPago: 'transferencia',
        referencia: 'TRX-001',
        facturas: [{ comprobanteCompraId: 10, facturaRef: 'B-0001-50', monto: 100 }],
      })
      .expect(201)
    expect(res.body.data.numero).toBe(1)
    expect(res.body.data.total).toBe('100.00')
    expect(prisma.$transaction).toHaveBeenCalled()
    expect(prisma.auditEvent.create).toHaveBeenCalled()
  })

  it('POST pagos partial payment is accepted', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/proveedores/1/pagos')
      .send({
        fecha: '2026-06-02',
        total: 50,
        metodoPago: 'efectivo',
        facturas: [{ comprobanteCompraId: 10, facturaRef: 'B-0001-50', monto: 50 }],
      })
      .expect(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.estado).toBe('emitido')
  })

  it('POST pagos rejects total mismatch', async () => {
    const app = createApp(prisma)
    await request(app)
      .post('/api/proveedores/1/pagos')
      .send({
        fecha: '2026-06-01',
        total: 100,
        metodoPago: 'cheque',
        facturas: [{ comprobanteCompraId: 10, facturaRef: 'B-0001-50', monto: 80 }],
      })
      .expect(400)
  })

  it('POST anular voids receipt and posts compensating movement', async () => {
    const app = createApp(prisma)
    const res = await request(app).post('/api/proveedores/1/pagos/1/anular').expect(200)
    expect(res.body.data.estado).toBe('anulado')
    expect(prisma.$transaction).toHaveBeenCalled()
    expect(prisma.auditEvent.create).toHaveBeenCalled()
  })

  it('GET pdf returns application/pdf', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores/1/pagos/1/pdf').expect(200)
    expect(res.headers['content-type']).toMatch(/application\/pdf/)
    expect(res.body.length).toBeGreaterThan(100)
  })

  it('returns 404 when proveedor missing', async () => {
    prisma = buildPrisma({
      proveedor: { findFirst: vi.fn().mockResolvedValue(null) },
    })
    const app = createApp(prisma)
    await request(app).get('/api/proveedores/99/pagos').expect(404)
  })
})
