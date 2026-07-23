import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

const now = new Date('2026-07-21T12:00:00.000Z')

const LISTA_ROW = {
  id: 2,
  tenantId: 1,
  nombre: 'Mayorista',
  moneda: 'ARS',
  activa: true,
  esDefault: false,
  vigenciaHasta: null as Date | null,
  createdAt: now,
  updatedAt: now,
  items: [] as unknown[],
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    cliente: { findFirst: vi.fn().mockResolvedValue({ id: 1, tenantId: 1 }) },
    articulo: {
      findFirst: vi.fn().mockResolvedValue({ id: 5, precioLista1: new Decimal(100) }),
    },
    listaPrecio: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([
        { ...LISTA_ROW, items: [{ id: 1 }], clientes: [] },
      ]),
      findFirst: vi.fn().mockResolvedValue({ ...LISTA_ROW, items: [] }),
      create: vi.fn().mockResolvedValue({ ...LISTA_ROW, items: [] }),
      update: vi.fn().mockResolvedValue({ ...LISTA_ROW, items: [] }),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      delete: vi.fn().mockResolvedValue(LISTA_ROW),
    },
    listaPrecioItem: {
      findUnique: vi.fn().mockResolvedValue(null),
      findFirst: vi.fn().mockResolvedValue(null),
      findUniqueOrThrow: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    precioEscalonado: {
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
      update: vi.fn(),
    },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    appUser: { findFirst: vi.fn().mockResolvedValue(null), findMany: vi.fn().mockResolvedValue([]) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') {
        const tx = {
          listaPrecio: {
            updateMany: vi.fn().mockResolvedValue({ count: 0 }),
            create: vi.fn().mockResolvedValue({ ...LISTA_ROW, items: [] }),
            update: vi.fn().mockResolvedValue({ ...LISTA_ROW, items: [] }),
          },
        }
        return (arg as (t: typeof tx) => unknown)(tx)
      }
      return arg
    }),
    ...overrides,
  } as unknown as PrismaClient
}

describe('Listas de precios API (#234)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    delete process.env.BIZCODE_TEST_MODULES
  })

  it('GET /api/listas-precios returns paginated list', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/listas-precios')
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/listas-precios', 'get', '200', res.body)
    expect(res.body.data).toHaveLength(1)
  })

  it('POST /api/listas-precios creates a list', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/listas-precios')
      .send({ nombre: 'Nueva', moneda: 'ARS' })
    expect(res.status).toBe(201)
    await assertMatchesOpenApi('/api/listas-precios', 'post', '201', res.body)
  })

  it('GET /api/listas-precios/precio-efectivo resolves base price without list', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .get('/api/listas-precios/precio-efectivo')
      .query({ articuloId: 5, cantidad: 1 })
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/listas-precios/precio-efectivo', 'get', '200', res.body)
    expect(res.body.origen).toBe('base')
    expect(res.body.precio).toBe(100)
  })

  it('rejects create without name (400)', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/listas-precios').send({})
    expect(res.status).toBe(400)
  })

  it('returns 403 when catalog.pricelists module is disabled', async () => {
    process.env.BIZCODE_TEST_MODULES = 'core.auth,core.catalog,core.clients,core.invoicing'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/listas-precios')
    expect(res.status).toBe(403)
  })
})
