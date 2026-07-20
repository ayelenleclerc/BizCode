import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

const CLIENTE_REF = { id: 1, codigo: 1001, rsocial: 'ACME SA', condIva: 'RI' }

const OT_ROW = {
  id: 1,
  tenantId: 1,
  numero: 42,
  clienteId: 1,
  tecnicoId: null,
  estado: 'recibido',
  prioridad: 'normal',
  equipoMarca: null,
  equipoModelo: null,
  equipoNroSerie: null,
  equipoDescripcion: 'iPhone 12',
  sintomaReportado: 'Pantalla rota',
  diagnostico: null,
  trabajoRealizado: null,
  enGarantia: false,
  garantiaVence: null,
  otGarantiaId: null,
  presupuesto: new Decimal(25000),
  fechaIngreso: new Date('2026-07-20T12:00:00.000Z'),
  fechaPromesa: null,
  fechaEntrega: null,
  facturaId: null,
  observaciones: null,
  createdAt: new Date('2026-07-20T12:00:00.000Z'),
  updatedAt: new Date('2026-07-20T12:00:00.000Z'),
  cliente: CLIENTE_REF,
  tecnico: null,
  items: [
    {
      id: 1,
      tipo: 'mano_de_obra',
      descripcion: 'Cambio pantalla',
      articuloId: null,
      cantidad: new Decimal(1),
      precioUnit: new Decimal(25000),
      subtotal: new Decimal(25000),
      condIva: '1',
      articulo: null,
    },
  ],
  factura: null,
}

const OT_BODY = {
  clienteId: 1,
  equipoDescripcion: 'iPhone 12',
  sintomaReportado: 'Pantalla rota',
  items: [
    {
      tipo: 'mano_de_obra',
      descripcion: 'Cambio pantalla',
      cantidad: 1,
      precioUnit: 25000,
      condIva: '1',
    },
  ],
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    cliente: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue({ id: 1, tenantId: 1, condIva: 'RI', suspended: false }),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    articulo: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
    },
    ordenTrabajo: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([OT_ROW]),
      groupBy: vi.fn().mockResolvedValue([{ estado: 'recibido', _count: { _all: 1 } }]),
      findFirst: vi.fn().mockResolvedValue(OT_ROW),
      create: vi.fn().mockResolvedValue(OT_ROW),
      update: vi.fn().mockResolvedValue({ ...OT_ROW, estado: 'diagnosticado' }),
    },
    ordenTrabajoItem: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    appUser: { findFirst: vi.fn().mockResolvedValue(null), findMany: vi.fn().mockResolvedValue([]) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    notification: { createMany: vi.fn().mockResolvedValue({ count: 0 }) },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') {
        return (arg as (tx: PrismaClient) => unknown)(buildPrismaMock())
      }
      return arg
    }),
    ...overrides,
  } as unknown as PrismaClient
}

describe('Ordenes de trabajo API (#246)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    delete process.env.BIZCODE_TEST_MODULES
  })

  it('GET /api/ordenes-trabajo returns paginated list with counts', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/ordenes-trabajo')
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/ordenes-trabajo', 'get', '200', res.body)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.counts).toBeDefined()
  })

  it('GET /api/ordenes-trabajo/:id returns detail', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/ordenes-trabajo/1')
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/ordenes-trabajo/{id}', 'get', '200', res.body)
  })

  it('POST /api/ordenes-trabajo creates work order', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/ordenes-trabajo').send(OT_BODY)
    expect(res.status).toBe(201)
    await assertMatchesOpenApi('/api/ordenes-trabajo', 'post', '201', res.body)
  })

  it('POST /api/ordenes-trabajo/:id/transicion advances estado', async () => {
    const updated = { ...OT_ROW, estado: 'diagnosticado', diagnostico: 'LCD dañado' }
    const prisma = buildPrismaMock({
      ordenTrabajo: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([OT_ROW]),
        groupBy: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue({ ...OT_ROW, items: OT_ROW.items }),
        create: vi.fn(),
        update: vi.fn().mockResolvedValue(updated),
      },
      $transaction: vi.fn(async (fn: (tx: unknown) => unknown) =>
        fn({
          ordenTrabajoItem: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
          ordenTrabajo: { update: vi.fn().mockResolvedValue(updated) },
        }),
      ),
    })
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/ordenes-trabajo/1/transicion')
      .send({ estado: 'diagnosticado', diagnostico: 'LCD dañado' })
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/ordenes-trabajo/{id}/transicion', 'post', '200', res.body)
  })

  it('returns 403 when service.orders module is disabled', async () => {
    process.env.BIZCODE_TEST_MODULES = 'core.auth,core.catalog,core.clients,core.invoicing'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/ordenes-trabajo')
    expect(res.status).toBe(403)
    expect(res.body.error).toBe('module_not_enabled')
    expect(res.body.module).toBe('service.orders')
  })
})
