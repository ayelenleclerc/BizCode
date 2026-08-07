import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../apps/server/createApp'
import {
  createMovimientoClienteCCPrismaMock,
  extendClientePrismaForCc,
} from '../helpers/movimientoClienteCcPrismaMock'

const clienteRow = {
  id: 1,
  tenantId: 1,
  codigo: 1001,
  rsocial: 'Cliente CC SA',
  fantasia: null as string | null,
  cuit: null as string | null,
  condIva: 'RI',
  activo: true,
  creditLimit: new Decimal(5000),
  balance: new Decimal(121),
}

function buildMovimiento(id: number, monto: number, saldoPost: number, tipo = 'factura') {
  return {
    id,
    tenantId: 1,
    clienteId: 1,
    tipo,
    referencia: 'B-0001-99',
    monto: new Decimal(monto),
    saldoPost: new Decimal(saldoPost),
    fecha: new Date('2026-05-10T12:00:00.000Z'),
    usuarioId: 1,
    notas: null,
    facturaId: tipo === 'factura' ? 10 : null,
    cobroId: null,
    notaCreditoId: null,
    chequeId: null,
    retencionAplicadaId: null,
    createdAt: new Date(),
  }
}

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  const movimientoCreate = vi.fn().mockImplementation(async (args: { data: Record<string, unknown> }) => {
    const data = args.data
    return {
      id: 99,
      createdAt: new Date(),
      referencia: data.referencia ?? null,
      notas: data.notas ?? null,
      facturaId: data.facturaId ?? null,
      cobroId: data.cobroId ?? null,
      notaCreditoId: data.notaCreditoId ?? null,
      chequeId: data.chequeId ?? null,
      retencionAplicadaId: data.retencionAplicadaId ?? null,
      ...data,
    }
  })

  const movimientoFindFirst = vi.fn().mockImplementation((args?: { where?: Record<string, unknown> }) => {
    if (args?.where && 'facturaId' in args.where) {
      return Promise.resolve(null)
    }
    return Promise.resolve(buildMovimiento(1, 121, 121))
  })

  const base = {
    deliveryZone: { findFirst: vi.fn().mockResolvedValue(null) },
    cliente: extendClientePrismaForCc({
      findFirst: vi.fn().mockResolvedValue(clienteRow),
      findMany: vi.fn().mockResolvedValue([clienteRow]),
      count: vi.fn().mockResolvedValue(1),
    }),
    movimientoClienteCC: {
      findFirst: movimientoFindFirst,
      findMany: vi.fn().mockResolvedValue([buildMovimiento(1, 121, 121)]),
      count: vi.fn().mockResolvedValue(1),
      create: movimientoCreate,
    },
    factura: { findMany: vi.fn().mockResolvedValue([]) },
    reciboCobroImputacion: { groupBy: vi.fn().mockResolvedValue([]) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
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
      updateMany: vi.fn(),
    },
    paramEmpresa: {
      findFirst: vi.fn().mockResolvedValue({ nombre: 'Demo', cuit: null, domicilio: null }),
    },
    ...overrides,
  }
  return base as unknown as PrismaClient
}

describe('Cliente cuenta corriente API (#232)', () => {
  let prisma: PrismaClient

  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    prisma = buildPrisma()
  })

  it('GET /api/clientes/:id/cuenta-corriente returns statement', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/1/cuenta-corriente').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.clienteId).toBe(1)
    expect(res.body.data.saldo).toBe('121.00')
    expect(res.body.data.excedeLimite).toBe(false)
    expect(res.body.data.movimientos).toHaveLength(1)
    expect(res.body.data.serie).toHaveLength(6)
  })

  it('GET /api/clientes/:id/cuenta-corriente/saldo returns balance', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/1/cuenta-corriente/saldo').expect(200)
    expect(res.body.data.saldo).toBe('121.00')
    expect(res.body.data.creditLimit).toBe('5000.00')
  })

  it('GET saldo allows seller role with customers.read (#168)', async () => {
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const app = createApp(prisma)
    await request(app).get('/api/clientes/1/cuenta-corriente/saldo').expect(200)
  })

  it('GET saldo forbids driver without customers.read (#168)', async () => {
    process.env.BIZCODE_TEST_ROLE = 'driver'
    const app = createApp(prisma)
    await request(app).get('/api/clientes/1/cuenta-corriente/saldo').expect(403)
  })

  it('GET full cuenta-corriente still requires reports.financial.read (#168)', async () => {
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const app = createApp(prisma)
    await request(app).get('/api/clientes/1/cuenta-corriente').expect(403)
  })

  it('GET /api/clientes/:id/cuenta-corriente/antiguedad returns buckets', async () => {
    prisma = buildPrisma({
      factura: {
        findMany: vi.fn().mockResolvedValue([
          { id: 1, total: new Decimal(80), fecha: new Date('2026-05-01') },
          { id: 2, total: new Decimal(41), fecha: new Date('2026-03-01') },
        ]),
      },
      reciboCobroImputacion: { groupBy: vi.fn().mockResolvedValue([]) },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/1/cuenta-corriente/antiguedad').expect(200)
    expect(res.body.data.totalPendiente).toBe('121.00')
    expect(res.body.data.buckets).toHaveLength(4)
  })

  it('POST /api/clientes/:id/cuenta-corriente/ajuste creates movement and audit', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/clientes/1/cuenta-corriente/ajuste')
      .send({ monto: -21, motivo: 'Corrección manual' })
      .expect(201)
    expect(res.body.data.tipo).toBe('ajuste')
    expect(res.body.data.monto).toBe('-21.00')
    expect(prisma.auditEvent.create).toHaveBeenCalled()
  })

  it('saldo after factura + ajuste is correct', async () => {
    const movimientos = [
      buildMovimiento(1, 121, 121, 'factura'),
      buildMovimiento(2, -21, 100, 'ajuste'),
    ]
    prisma = buildPrisma({
      movimientoClienteCC: {
        findFirst: vi.fn().mockResolvedValue(movimientos[1]),
        findMany: vi.fn().mockResolvedValue(movimientos),
        count: vi.fn().mockResolvedValue(2),
        create: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/1/cuenta-corriente/saldo').expect(200)
    expect(res.body.data.saldo).toBe('100.00')
  })

  it('returns 404 when cliente missing', async () => {
    prisma = buildPrisma({
      cliente: extendClientePrismaForCc({
        findFirst: vi.fn().mockResolvedValue(null),
      }),
    })
    const app = createApp(prisma)
    await request(app).get('/api/clientes/99/cuenta-corriente').expect(404)
  })

  it('returns 400 for invalid id', async () => {
    const app = createApp(prisma)
    await request(app).get('/api/clientes/abc/cuenta-corriente').expect(400)
  })

  it('ajuste requires motivo', async () => {
    const app = createApp(prisma)
    await request(app)
      .post('/api/clientes/1/cuenta-corriente/ajuste')
      .send({ monto: 10, motivo: '   ' })
      .expect(400)
  })

  it('GET estado-de-cuenta/pdf returns application/pdf', async () => {
    prisma = buildPrisma({
      movimientoClienteCC: createMovimientoClienteCCPrismaMock(),
    })
    const app = createApp(prisma)
    const res = await request(app)
      .get('/api/clientes/1/cuenta-corriente/estado-de-cuenta/pdf')
      .expect(200)
    expect(res.headers['content-type']).toMatch(/application\/pdf/)
  })

  it('POST estado-de-cuenta/enviar returns success without SMTP', async () => {
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/clientes/1/cuenta-corriente/estado-de-cuenta/enviar')
      .send({ email: 'cliente@example.com' })
      .expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.sent).toBe(true)
    expect(res.body.data.email).toBe('cliente@example.com')
  })
})
