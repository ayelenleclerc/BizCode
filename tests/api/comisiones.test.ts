import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

const now = new Date('2026-07-23T12:00:00.000Z')

const CONFIG = {
  id: 1,
  tenantId: 1,
  vendedorId: 3,
  tipo: 'porcentaje_cobrado',
  alicuota: 3,
  vigenciaDesde: now,
  vigenciaHasta: null,
  articuloCategoriaId: null,
  clienteId: null,
  createdAt: now,
  updatedAt: now,
  vendedor: { username: 'seller1' },
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    cliente: { findFirst: vi.fn().mockResolvedValue({ id: 1, tenantId: 1 }) },
    articulo: { findFirst: vi.fn(), findMany: vi.fn(), update: vi.fn() },
    configComision: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([CONFIG]),
      findFirst: vi.fn().mockResolvedValue(CONFIG),
      create: vi.fn().mockResolvedValue(CONFIG),
      update: vi.fn().mockResolvedValue(CONFIG),
      delete: vi.fn(),
    },
    liquidacionComision: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn(),
      update: vi.fn(),
    },
    liquidacionComisionDetalle: { deleteMany: vi.fn(), createMany: vi.fn() },
    appUser: {
      findFirst: vi.fn().mockResolvedValue({ id: 3, tenantId: 1, active: true }),
      findMany: vi.fn().mockResolvedValue([{ id: 3 }]),
    },
    tenantConfig: {
      findUnique: vi.fn().mockResolvedValue({
        tenantId: 1,
        modules: ['finance.commissions', 'finance.collections', 'billing.orders', 'core.auth'],
        comisionesModoDevengo: 'porcentaje_cobrado',
      }),
      update: vi.fn().mockResolvedValue({}),
    },
    reciboCobroImputacion: { findMany: vi.fn().mockResolvedValue([]) },
    factura: { findMany: vi.fn().mockResolvedValue([]) },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    $transaction: vi.fn(async (fn: (tx: PrismaClient) => Promise<unknown>) =>
      fn(buildPrismaMock(overrides) as PrismaClient),
    ),
    ...overrides,
  } as unknown as PrismaClient
}

describe('Comisiones API (#237)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    process.env.BIZCODE_TEST_MODULES =
      'core.auth,core.catalog,core.clients,core.invoicing,billing.orders,finance.collections,finance.commissions'
  })

  it('GET /api/comisiones/configs returns paginated list', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/comisiones/configs')
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/comisiones/configs', 'get', '200', res.body)
    expect(res.body.data).toHaveLength(1)
  })

  it('POST /api/comisiones/configs creates config', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/comisiones/configs')
      .send({
        vendedorId: 3,
        tipo: 'porcentaje_cobrado',
        alicuota: 3,
        vigenciaDesde: '2026-07-01T00:00:00.000Z',
      })
    expect(res.status).toBe(201)
    await assertMatchesOpenApi('/api/comisiones/configs', 'post', '201', res.body)
  })

  it('returns 403 when finance.commissions is disabled', async () => {
    process.env.BIZCODE_TEST_MODULES = 'core.auth,core.catalog,finance.collections'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/comisiones/configs')
    expect(res.status).toBe(403)
  })

  it('GET /api/comisiones/mias returns seller estimation', async () => {
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/comisiones/mias').query({ periodo: '2026-07' })
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ success: true, periodo: '2026-07' })
    expect(res.body.estimacion).toBeDefined()
  })

  it('GET /api/comisiones/ranking requires periodo', async () => {
    const app = createApp(buildPrismaMock())
    const bad = await request(app).get('/api/comisiones/ranking')
    expect(bad.status).toBe(400)
    const ok = await request(app).get('/api/comisiones/ranking').query({ periodo: '2026-07' })
    expect(ok.status).toBe(200)
    expect(ok.body.success).toBe(true)
  })

  it('POST /api/comisiones/liquidaciones/generar creates drafts', async () => {
    const app = createApp(
      buildPrismaMock({
        liquidacionComision: {
          count: vi.fn().mockResolvedValue(0),
          findMany: vi.fn().mockResolvedValue([]),
          findFirst: vi.fn().mockResolvedValue(null),
          findUnique: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({
            id: 11,
            tenantId: 1,
            vendedorId: 3,
            periodo: '2026-07',
            totalVentas: 0,
            totalComision: 0,
            estado: 'borrador',
            aprobadoPorId: null,
            pagadoEn: null,
            createdAt: now,
            updatedAt: now,
            vendedor: { username: 'seller1' },
            detalles: [],
          }),
          update: vi.fn(),
        },
      }),
    )
    const res = await request(app)
      .post('/api/comisiones/liquidaciones/generar')
      .send({ periodo: '2026-07', vendedorId: 3 })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
  })
})
