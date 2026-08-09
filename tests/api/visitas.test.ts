import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

const CLIENTE = {
  id: 2,
  codigo: 100,
  rsocial: 'Cliente SA',
  domicilio: 'Calle 1',
  localidad: 'CABA',
  deliveryZoneId: 1,
}

const VISITA_ROW = {
  id: 1,
  tenantId: 1,
  vendedorId: 1,
  clienteId: 2,
  fechaPlanificada: new Date('2026-08-09T00:00:00.000Z'),
  estadoPlan: 'pendiente',
  resultado: null,
  notasVisita: null,
  pedidoId: null,
  orden: 0,
  duracionMinutos: null,
  createdAt: new Date('2026-08-09T12:00:00.000Z'),
  updatedAt: new Date('2026-08-09T12:00:00.000Z'),
  cliente: CLIENTE,
  vendedor: { id: 1, username: 'seller1', role: 'seller' },
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    visitaVendedor: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([VISITA_ROW]),
      findFirst: vi.fn().mockResolvedValue(VISITA_ROW),
      create: vi.fn().mockResolvedValue(VISITA_ROW),
      update: vi.fn().mockResolvedValue({ ...VISITA_ROW, resultado: 'venta', estadoPlan: 'completada' }),
    },
    cliente: {
      findFirst: vi.fn().mockResolvedValue({ id: 2, tenantId: 1 }),
      findMany: vi.fn().mockResolvedValue([]),
    },
    appUser: {
      findFirst: vi.fn().mockResolvedValue({ id: 1, tenantId: 1, active: true }),
    },
    pedido: {
      groupBy: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') return arg(buildPrismaMock())
      return arg
    }),
    ...overrides,
  } as unknown as PrismaClient
}

describe('Visitas API (#170)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    delete process.env.BIZCODE_TEST_MODULES
  })

  it('GET /api/visitas returns list and kpi', async () => {
    process.env.BIZCODE_TEST_USER_ID = '1'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/visitas').query({ fecha: '2026-08-09' })
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/visitas', 'get', '200', res.body)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.kpi).toMatchObject({ planificadas: 1 })
  })

  it('POST /api/visitas creates visit', async () => {
    process.env.BIZCODE_TEST_USER_ID = '1'
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/visitas').send({
      vendedorId: 1,
      clienteId: 2,
      fechaPlanificada: '2026-08-09',
    })
    expect(res.status).toBe(201)
    await assertMatchesOpenApi('/api/visitas', 'post', '201', res.body)
  })

  it('PUT /api/visitas/:id requires notes for sin_pedido', async () => {
    process.env.BIZCODE_TEST_USER_ID = '1'
    const app = createApp(buildPrismaMock())
    const res = await request(app).put('/api/visitas/1').send({ resultado: 'sin_pedido' })
    expect(res.status).toBe(400)
  })

  it('PUT /api/visitas/:id completes with notes', async () => {
    process.env.BIZCODE_TEST_USER_ID = '1'
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .put('/api/visitas/1')
      .send({ resultado: 'sin_pedido', notasVisita: 'Cerrado' })
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/visitas/{id}', 'put', '200', res.body)
  })

  it('returns 403 without orders.create for POST', async () => {
    process.env.BIZCODE_TEST_ROLE = 'cashier'
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/visitas').send({
      vendedorId: 1,
      clienteId: 2,
      fechaPlanificada: '2026-08-09',
    })
    expect(res.status).toBe(403)
  })
})
