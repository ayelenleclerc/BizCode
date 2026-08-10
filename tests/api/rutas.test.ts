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
  latitud: null,
  longitud: null,
}

const FERIADO_ROW = {
  id: 1,
  tenantId: 1,
  fecha: new Date('2026-05-25T00:00:00.000Z'),
  nombre: 'Revolución de Mayo',
  tipo: 'nacional',
  provincia: null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
}

const ZONA_ROW = {
  id: 1,
  tenantId: 1,
  vendedorId: 1,
  deliveryZoneId: 1,
  createdAt: new Date('2026-08-10T12:00:00.000Z'),
  deliveryZone: { id: 1, nombre: 'Centro', activo: true },
  vendedor: { id: 1, username: 'seller1', role: 'seller' },
}

const PARADA_ROW = {
  id: 10,
  rutaId: 5,
  clienteId: 2,
  orden: 0,
  estado: 'pendiente',
  motivo: null,
  visitaId: null,
  createdAt: new Date('2026-08-10T12:00:00.000Z'),
  updatedAt: new Date('2026-08-10T12:00:00.000Z'),
  cliente: CLIENTE,
}

const RUTA_ROW = {
  id: 5,
  tenantId: 1,
  vendedorId: 1,
  fecha: new Date('2026-08-10T00:00:00.000Z'),
  createdAt: new Date('2026-08-10T12:00:00.000Z'),
  updatedAt: new Date('2026-08-10T12:00:00.000Z'),
  paradas: [PARADA_ROW],
  vendedor: { id: 1, username: 'seller1', role: 'seller' },
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    feriado: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([FERIADO_ROW]),
      create: vi.fn().mockResolvedValue(FERIADO_ROW),
    },
    vendedorZona: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([ZONA_ROW]),
      findFirst: vi.fn().mockResolvedValue(ZONA_ROW),
      create: vi.fn().mockResolvedValue(ZONA_ROW),
      delete: vi.fn().mockResolvedValue(ZONA_ROW),
    },
    rutaVendedor: {
      findFirst: vi.fn().mockResolvedValue(RUTA_ROW),
      create: vi.fn().mockResolvedValue(RUTA_ROW),
    },
    rutaParada: {
      findFirst: vi.fn().mockResolvedValue(PARADA_ROW),
      findMany: vi.fn().mockResolvedValue([PARADA_ROW]),
      update: vi.fn().mockResolvedValue({ ...PARADA_ROW, estado: 'visitado' }),
      deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
      create: vi.fn().mockResolvedValue(PARADA_ROW),
    },
    visitaVendedor: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({ id: 99 }),
      update: vi.fn().mockResolvedValue({ id: 99 }),
    },
    cliente: {
      findFirst: vi.fn().mockResolvedValue({ id: 2, tenantId: 1 }),
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([]),
    },
    deliveryZone: {
      findFirst: vi.fn().mockResolvedValue({ id: 1, tenantId: 1 }),
    },
    appUser: {
      findFirst: vi.fn().mockResolvedValue({ id: 1, tenantId: 1, active: true }),
      findMany: vi.fn().mockResolvedValue([{ id: 2 }]),
    },
    notification: {
      createMany: vi.fn().mockResolvedValue({ count: 1 }),
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

describe('Feriados / VendedorZonas / Rutas API (#267)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    process.env.BIZCODE_TEST_USER_ID = '1'
    delete process.env.BIZCODE_TEST_MODULES
  })

  it('GET /api/feriados lists by year', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/feriados').query({ year: 2026 })
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/feriados', 'get', '200', res.body)
    expect(res.body.data).toHaveLength(1)
  })

  it('POST /api/feriados requires customers.manage', async () => {
    process.env.BIZCODE_TEST_ROLE = 'cashier'
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/feriados').send({
      fecha: '2026-05-25',
      nombre: 'Revolución de Mayo',
    })
    expect(res.status).toBe(403)
  })

  it('POST /api/feriados creates as manager', async () => {
    process.env.BIZCODE_TEST_ROLE = 'manager'
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/feriados').send({
      fecha: '2026-05-25',
      nombre: 'Revolución de Mayo',
    })
    expect(res.status).toBe(201)
    await assertMatchesOpenApi('/api/feriados', 'post', '201', res.body)
  })

  it('GET /api/vendedor-zonas lists own zones', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/vendedor-zonas')
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/vendedor-zonas', 'get', '200', res.body)
  })

  it('POST /api/vendedor-zonas creates as manager', async () => {
    process.env.BIZCODE_TEST_ROLE = 'manager'
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/vendedor-zonas').send({
      vendedorId: 1,
      deliveryZoneId: 1,
    })
    expect(res.status).toBe(201)
    await assertMatchesOpenApi('/api/vendedor-zonas', 'post', '201', res.body)
  })

  it('GET /api/rutas returns day route', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/rutas').query({ fecha: '2026-08-10' })
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/rutas', 'get', '200', res.body)
    expect(res.body.data.id).toBe(5)
  })

  it('POST /api/rutas creates route', async () => {
    const prisma = buildPrismaMock({
      rutaVendedor: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue(RUTA_ROW),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).post('/api/rutas').send({
      vendedorId: 1,
      fecha: '2026-08-10',
      clienteIds: [2],
    })
    expect(res.status).toBe(201)
    await assertMatchesOpenApi('/api/rutas', 'post', '201', res.body)
  })

  it('PUT /api/rutas/:id/paradas replaces stops', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .put('/api/rutas/5/paradas')
      .send({ paradas: [{ clienteId: 2, orden: 0 }] })
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/rutas/{id}/paradas', 'put', '200', res.body)
  })

  it('PATCH /api/rutas/:id/paradas/:paradaId marks visitado', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .patch('/api/rutas/5/paradas/10')
      .send({ estado: 'visitado' })
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/rutas/{id}/paradas/{paradaId}', 'patch', '200', res.body)
  })

  it('GET /api/rutas/:id/stats returns progress', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/rutas/5/stats')
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/rutas/{id}/stats', 'get', '200', res.body)
    expect(res.body.data.total).toBe(1)
  })
})
