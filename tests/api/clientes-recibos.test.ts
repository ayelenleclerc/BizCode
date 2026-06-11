import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../server/createApp'

const clienteRow = {
  id: 1,
  tenantId: 1,
  codigo: 1001,
  rsocial: 'Cliente Recibo SA',
  fantasia: null as string | null,
  cuit: '20-12345678-9',
  condIva: 'RI',
  activo: true,
  creditLimit: new Decimal(5000),
  creditDays: 30,
  balance: new Decimal(242),
  score: 50,
  suspended: false,
}

const facturaRow = {
  id: 10,
  tenantId: 1,
  clienteId: 1,
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
  estado: 'A',
  estadoCae: 'not_required',
  createdAt: new Date(),
  updatedAt: new Date(),
}

function buildReciboRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    tenantId: 1,
    numero: 1,
    clienteId: 1,
    fecha: new Date('2026-06-01T12:00:00.000Z'),
    totalCobrado: new Decimal(100),
    concepto: null,
    estado: 'emitido',
    anulacionMotivo: null,
    usuarioId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    cliente: { id: 1, codigo: 1001, rsocial: 'Cliente Recibo SA', cuit: '20-12345678-9' },
    usuario: { id: 1, username: 'owner1' },
    formas: [
      {
        id: 1,
        reciboCobroId: 1,
        tipo: 'transferencia',
        importe: new Decimal(100),
        chequeId: null,
        referencia: 'TRX-001',
        banco: null,
        cheque: null,
      },
    ],
    imputaciones: [
      {
        id: 1,
        reciboCobroId: 1,
        facturaId: 10,
        importe: new Decimal(100),
        saldoPrevio: new Decimal(242),
        saldoPostPago: new Decimal(142),
        factura: { id: 10, tipo: 'B', prefijo: '0001', numero: 50 },
      },
    ],
    retencionesAplicadas: [],
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
    cliente: {
      findFirst: vi.fn().mockResolvedValue(clienteRow),
      findMany: vi.fn().mockResolvedValue([clienteRow]),
      findFirstOrThrow: vi.fn().mockResolvedValue(clienteRow),
      update: vi.fn().mockResolvedValue({ ...clienteRow, score: 55 }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    factura: {
      findMany: vi.fn().mockResolvedValue([facturaRow]),
      findFirst: vi.fn().mockResolvedValue(facturaRow),
    },
    reciboCobroImputacion: {
      groupBy: vi.fn().mockResolvedValue([]),
    },
    reciboCobro: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([buildReciboRow()]),
      findFirst: vi.fn().mockImplementation(async (args?: { where?: Record<string, unknown> }) => {
        if (args?.where && 'numero' in (args.where as object)) return null
        return buildReciboRow()
      }),
      findFirstOrThrow: vi.fn().mockResolvedValue(buildReciboRow()),
      create: reciboCreate,
      update: vi.fn().mockImplementation(async () => buildReciboRow({ estado: 'anulado' })),
    },
    movimientoClienteCC: {
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      create: movimientoCreate,
    },
    cheque: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
    },
    chequeMov: { create: vi.fn() },
    paramEmpresa: {
      findFirst: vi.fn().mockResolvedValue({
        nombre: 'Demo SA',
        cuit: '30-11111111-1',
        domicilio: 'Calle 1',
        logoUrl: null,
      }),
    },
    fiscalRetencionesConfig: {
      findUnique: vi.fn().mockResolvedValue({
        esAgenteRetencionGanancias: false,
        esAgenteRetencionIVA: false,
        esAgenteRetencionIIBB: false,
      }),
    },
    regimenRetencion: { findMany: vi.fn().mockResolvedValue([]) },
    retencionAplicada: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    retencionConstanciaSequence: {
      findUnique: vi.fn().mockResolvedValue(null),
      upsert: vi.fn().mockResolvedValue({ lastNum: 1 }),
    },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    proveedor: { findMany: vi.fn().mockResolvedValue([]) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    facturaItem: { findMany: vi.fn().mockResolvedValue([]) },
    cobro: { findMany: vi.fn().mockResolvedValue([]) },
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
          reciboCobro: {
            findFirst: vi.fn().mockResolvedValue(null),
            findFirstOrThrow: vi.fn().mockResolvedValue(buildReciboRow()),
            create: reciboCreate,
            update: vi.fn().mockImplementation(async () =>
              buildReciboRow({ estado: 'anulado', anulacionMotivo: 'Error de carga' }),
            ),
          },
          cheque: { create: vi.fn(), findFirst: vi.fn().mockResolvedValue(null) },
          chequeMov: { create: vi.fn() },
          retencionAplicada: { create: vi.fn().mockResolvedValue({ id: 1 }) },
          retencionConstanciaSequence: {
            findUnique: vi.fn().mockResolvedValue(null),
            upsert: vi.fn().mockResolvedValue({ lastNum: 1 }),
          },
          movimientoClienteCC: {
            findFirst: vi.fn().mockResolvedValue(null),
            create: movimientoCreate,
          },
          cliente: {
            findFirstOrThrow: vi.fn().mockResolvedValue(clienteRow),
            update: vi.fn().mockResolvedValue(clienteRow),
            updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          },
          factura: {
            findFirst: vi.fn().mockResolvedValue(facturaRow),
            findMany: vi.fn().mockResolvedValue([facturaRow]),
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

describe('Recibo cobro cliente API (#233)', () => {
  let prisma: PrismaClient

  beforeEach(() => {
    prisma = buildPrisma()
  })

  it('GET facturas-pendientes lists open balance', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/1/facturas-pendientes').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].facturaRef).toBe('B-0001-50')
    expect(res.body.data[0].pendiente).toBe('242.00')
  })

  it('GET recibos returns history', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/1/recibos').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].numero).toBe(1)
  })

  it('POST recibos creates receipt and ledger movement', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/clientes/1/recibos')
      .send({
        fecha: '2026-06-01',
        totalCobrado: 100,
        fifo: true,
        formas: [{ tipo: 'transferencia', importe: 100, referencia: 'TRX-001' }],
      })
      .expect(201)
    expect(res.body.data.numero).toBe(1)
    expect(res.body.data.totalCobrado).toBe('100.00')
    expect(prisma.$transaction).toHaveBeenCalled()
    expect(prisma.auditEvent.create).toHaveBeenCalled()
  })

  it('POST recibos partial payment is accepted', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/clientes/1/recibos')
      .send({
        fecha: '2026-06-02',
        totalCobrado: 50,
        fifo: true,
        formas: [{ tipo: 'efectivo', importe: 50 }],
      })
      .expect(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.estado).toBe('emitido')
  })

  it('POST recibos rejects formas sum mismatch', async () => {
    const app = createApp(prisma)
    await request(app)
      .post('/api/clientes/1/recibos')
      .send({
        fecha: '2026-06-01',
        totalCobrado: 100,
        formas: [{ tipo: 'efectivo', importe: 80 }],
      })
      .expect(400)
  })

  it('POST recibos/:id/anular voids receipt', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/clientes/1/recibos/1/anular')
      .send({ anulacionMotivo: 'Error de carga' })
      .expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.estado).toBe('anulado')
  })

  it('GET recibos/:id/pdf returns application/pdf', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/1/recibos/1/pdf').expect(200)
    expect(res.headers['content-type']).toMatch(/application\/pdf/)
    expect(Buffer.isBuffer(res.body) || res.body.length > 100).toBe(true)
  })
})
