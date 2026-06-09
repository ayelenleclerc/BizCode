import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

function buildPrismaMock(): PrismaClient {
  return {
    cliente: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue({ id: 1, suspended: false }),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    articulo: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue({ id: 1 }),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    rubro: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    formaPago: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({ id: 1, total: 100, items: [] }),
      aggregate: vi.fn().mockResolvedValue({ _count: { id: 0 }, _sum: { total: null } }),
    },
    notification: {
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    auditEvent: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    appUser: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue(null),
    },
    tenant: {
      findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }),
    },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    deliveryZone: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') {
        return arg(buildPrismaMock())
      }
      return arg
    }),
  } as unknown as PrismaClient
}

describe('API payload validation on POST/PUT business routes', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })

  it('returns 400 for invalid POST /api/clientes payload', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app).post('/api/clientes').send({}).expect(400)
    expect(res.body.success).toBe(false)
    expect(vi.mocked(prisma.cliente.create)).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid PUT /api/articulos/:id payload', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app).put('/api/articulos/1').send({ codigo: 0 }).expect(400)
    expect(res.body.success).toBe(false)
    expect(vi.mocked(prisma.articulo.update)).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid POST /api/rubros payload', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app).post('/api/rubros').send({ codigo: 0, nombre: '' }).expect(400)
    expect(res.body.success).toBe(false)
    expect(vi.mocked(prisma.rubro.create)).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid POST /api/facturas payload', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app).post('/api/facturas').send({ clienteId: 1 }).expect(400)
    expect(res.body.success).toBe(false)
    expect(vi.mocked(prisma.factura.create)).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid POST /api/zonas-entrega payload', async () => {
    const prisma = buildPrismaMock()
    const app = createApp(prisma)
    const res = await request(app).post('/api/zonas-entrega').send({ nombre: '', tipo: 'barrio' }).expect(400)
    expect(res.body.success).toBe(false)
    expect(vi.mocked(prisma.deliveryZone.create)).not.toHaveBeenCalled()
  })
})

