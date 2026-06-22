import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../apps/server/createApp'

const chequeRow = {
  id: 1,
  tenantId: 1,
  tipo: 'recibido',
  modalidad: 'fisico',
  numero: '12345678',
  banco: 'Galicia',
  sucursal: null,
  cbuOrigen: null,
  libradorNombre: 'Cliente SA',
  libradorCuit: null,
  monto: new Decimal(15000),
  moneda: 'ARS',
  fechaEmision: new Date('2026-06-01T12:00:00.000Z'),
  fechaVencimiento: new Date('2026-06-15T12:00:00.000Z'),
  estado: 'en_cartera',
  clienteId: 1,
  proveedorId: null,
  observaciones: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  cliente: { id: 1, codigo: 1, rsocial: 'Cliente SA', cuit: '20123456789' },
  proveedor: null,
  movimientos: [],
}

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    cheque: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([chequeRow]),
      findFirst: vi.fn().mockResolvedValue(chequeRow),
      findFirstOrThrow: vi.fn().mockResolvedValue(chequeRow),
      aggregate: vi.fn().mockImplementation(async ({ where }: { where?: { estado?: string } } = {}) => {
        if (where?.estado === 'rechazado') {
          return { _count: { id: 0 }, _sum: { monto: null } }
        }
        return { _count: { id: 1 }, _sum: { monto: new Decimal(15000) } }
      }),
      create: vi.fn().mockResolvedValue(chequeRow),
      update: vi.fn().mockResolvedValue({ ...chequeRow, estado: 'depositado' }),
    },
    chequeMov: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    proveedor: { findFirst: vi.fn().mockResolvedValue({ id: 2 }) },
    notification: { findMany: vi.fn().mockResolvedValue([]), createMany: vi.fn() },
    appUser: { findMany: vi.fn().mockResolvedValue([{ id: 1 }]) },
    auditEvent: { create: vi.fn().mockResolvedValue({}) },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => {
      const tx = buildPrisma()
      return fn(tx)
    }),
    ...overrides,
  }
}

describe('cheques API (#231)', () => {
  let prisma: ReturnType<typeof buildPrisma>

  beforeEach(() => {
    prisma = buildPrisma()
  })

  it('GET /api/cheques lists portfolio', async () => {
    const app = createApp(prisma as never)
    const res = await request(app).get('/api/cheques').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].numero).toBe('12345678')
  })

  it('GET /api/cheques/resumen returns aggregates', async () => {
    const app = createApp(prisma as never)
    const res = await request(app).get('/api/cheques/resumen').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.enCartera.count).toBe(1)
  })

  it('POST /api/cheques creates cheque', async () => {
    const app = createApp(prisma as never)
    const res = await request(app)
      .post('/api/cheques')
      .send({
        tipo: 'recibido',
        modalidad: 'fisico',
        numero: '999',
        banco: 'Santander',
        libradorNombre: 'ACME',
        monto: 1000,
        fechaEmision: '2026-06-01',
        fechaVencimiento: '2026-06-30',
        clienteId: 1,
      })
      .expect(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.estado).toBe('en_cartera')
  })

  it('POST /api/cheques/:id/depositar transitions state', async () => {
    const app = createApp(prisma as never)
    const res = await request(app).post('/api/cheques/1/depositar').send({ destino: 'Cuenta CC' }).expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.estado).toBe('depositado')
  })

  it('POST /api/cheques/alertas/run triggers due-soon job', async () => {
    const app = createApp(prisma as never)
    const res = await request(app).post('/api/cheques/alertas/run').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('sent')
  })
})
