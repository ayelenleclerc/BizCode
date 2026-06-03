import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../server/createApp'

const proveedorRow = {
  id: 1,
  tenantId: 1,
  codigo: 4001,
  rsocial: 'Proveedor CC SA',
  fantasia: null as string | null,
  cuit: null as string | null,
  condIva: 'RI',
  telef: null as string | null,
  email: null as string | null,
  activo: true,
  limiteCredito: new Decimal(500),
}

const comprobanteRow = {
  id: 10,
  tenantId: 1,
  proveedorId: 1,
  ordenCompraId: null,
  fecha: new Date('2026-05-10T12:00:00.000Z'),
  tipo: 'B',
  prefijo: '0001',
  numero: 99,
  neto1: new Decimal(100),
  neto2: new Decimal(0),
  neto3: new Decimal(0),
  iva1: new Decimal(21),
  iva2: new Decimal(0),
  total: new Decimal(121),
  cae: null,
  caeVto: null,
  estado: 'A',
  createdAt: new Date(),
  updatedAt: new Date(),
}

function buildMovimiento(id: number, monto: number, saldoPost: number, tipo = 'factura_compra') {
  return {
    id,
    tenantId: 1,
    proveedorId: 1,
    tipo,
    referencia: 'B-0001-99',
    monto: new Decimal(monto),
    saldoPost: new Decimal(saldoPost),
    fecha: new Date('2026-05-10T12:00:00.000Z'),
    usuarioId: 1,
    notas: null,
    comprobanteCompraId: tipo === 'factura_compra' ? 10 : null,
    createdAt: new Date(),
  }
}

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  const movimientoCreate = vi.fn().mockImplementation(async (args: { data: Record<string, unknown> }) => {
    const data = args.data
    return {
      id: 1,
      tenantId: data.tenantId,
      proveedorId: data.proveedorId,
      tipo: data.tipo,
      referencia: data.referencia ?? null,
      monto: data.monto,
      saldoPost: data.saldoPost,
      fecha: data.fecha,
      usuarioId: data.usuarioId,
      notas: data.notas ?? null,
      comprobanteCompraId: data.comprobanteCompraId ?? null,
      createdAt: new Date(),
    }
  })

  const movimientoFindFirst = vi.fn().mockImplementation((args?: { where?: { comprobanteCompraId?: number } }) => {
    if (args?.where && 'comprobanteCompraId' in args.where) {
      return Promise.resolve(null)
    }
    return Promise.resolve(buildMovimiento(1, 121, 121))
  })

  const comprobanteCreate = vi.fn().mockResolvedValue(comprobanteRow)

  const base = {
    cliente: { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]), create: vi.fn() },
    proveedor: {
      findFirst: vi.fn().mockResolvedValue(proveedorRow),
      findMany: vi.fn().mockResolvedValue([proveedorRow]),
      count: vi.fn().mockResolvedValue(1),
    },
    comprobanteCompra: {
      create: comprobanteCreate,
      findMany: vi.fn().mockResolvedValue([]),
    },
    movimientoProveedorCC: {
      findFirst: movimientoFindFirst,
      findMany: vi.fn().mockResolvedValue([buildMovimiento(1, 121, 121)]),
      create: movimientoCreate,
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
          comprobanteCompra: { create: comprobanteCreate },
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

describe('Proveedor cuenta corriente API (#270)', () => {
  let prisma: PrismaClient

  beforeEach(() => {
    prisma = buildPrisma()
  })

  it('GET /api/proveedores/:id/cuenta-corriente returns statement', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores/1/cuenta-corriente').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.proveedorId).toBe(1)
    expect(res.body.data.saldo).toBe('121.00')
    expect(res.body.data.excedeLimite).toBe(false)
    expect(res.body.data.movimientos).toHaveLength(1)
    expect(res.body.data.serie).toHaveLength(6)
  })

  it('GET /api/proveedores/:id/cuenta-corriente/saldo returns balance', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores/1/cuenta-corriente/saldo').expect(200)
    expect(res.body.data.saldo).toBe('121.00')
    expect(res.body.data.limiteCredito).toBe('500.00')
  })

  it('POST /api/proveedores/:id/cuenta-corriente/ajuste creates movement and audit', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/proveedores/1/cuenta-corriente/ajuste')
      .send({ monto: -21, motivo: 'Corrección manual' })
      .expect(201)
    expect(res.body.data.tipo).toBe('ajuste')
    expect(res.body.data.monto).toBe('-21.00')
    expect(prisma.auditEvent.create).toHaveBeenCalled()
  })

  it('POST comprobante compra posts ledger movement in transaction', async () => {
    const app = createApp(prisma)
    await request(app)
      .post('/api/comprobantes-compra')
      .send({
        fecha: '2026-05-10T12:00:00.000Z',
        tipo: 'B',
        prefijo: '0001',
        numero: 99,
        proveedorId: 1,
        neto1: 100,
        neto2: 0,
        neto3: 0,
        iva1: 21,
        iva2: 0,
        total: 121,
      })
      .expect(201)
    expect(prisma.$transaction).toHaveBeenCalled()
  })

  it('saldo after factura + ajuste is correct', async () => {
    const movimientos = [
      buildMovimiento(1, 121, 121, 'factura_compra'),
      buildMovimiento(2, -21, 100, 'ajuste'),
    ]
    prisma = buildPrisma({
      movimientoProveedorCC: {
        findFirst: vi.fn().mockResolvedValue(movimientos[1]),
        findMany: vi.fn().mockResolvedValue(movimientos),
        create: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/proveedores/1/cuenta-corriente/saldo').expect(200)
    expect(res.body.data.saldo).toBe('100.00')
  })

  it('returns 404 when proveedor missing', async () => {
    prisma = buildPrisma({
      proveedor: { findFirst: vi.fn().mockResolvedValue(null) },
    })
    const app = createApp(prisma)
    await request(app).get('/api/proveedores/99/cuenta-corriente').expect(404)
  })

  it('returns 400 for invalid id', async () => {
    const app = createApp(prisma)
    await request(app).get('/api/proveedores/abc/cuenta-corriente').expect(400)
  })

  it('ajuste requires motivo', async () => {
    const app = createApp(prisma)
    await request(app)
      .post('/api/proveedores/1/cuenta-corriente/ajuste')
      .send({ monto: 10, motivo: '   ' })
      .expect(400)
  })
})
