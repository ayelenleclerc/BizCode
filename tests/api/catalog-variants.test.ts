import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

const now = new Date('2026-07-23T12:00:00.000Z')

const CATEGORIA_ROW = {
  id: 1,
  tenantId: 1,
  nombre: 'Indumentaria',
  codigo: 'IND',
  padreId: null as number | null,
  precioDefault: null as Decimal | null,
  activo: true,
  createdAt: now,
  updatedAt: now,
  atributos: [] as unknown[],
  hijos: [] as unknown[],
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    cliente: { findFirst: vi.fn().mockResolvedValue({ id: 1, tenantId: 1 }) },
    articulo: {
      findFirst: vi.fn().mockResolvedValue({
        id: 5,
        precioLista1: new Decimal(100),
        heredaPrecio: true,
        precioOverride: null,
        categoria: null,
        padre: null,
        ofertas: [],
        esPadre: false,
      }),
      findMany: vi.fn().mockResolvedValue([]),
      update: vi.fn(),
      create: vi.fn(),
      aggregate: vi.fn().mockResolvedValue({ _max: { codigo: 1 } }),
    },
    categoriaArticulo: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([CATEGORIA_ROW]),
      findFirst: vi.fn().mockResolvedValue(CATEGORIA_ROW),
      create: vi.fn().mockResolvedValue(CATEGORIA_ROW),
      update: vi.fn().mockResolvedValue(CATEGORIA_ROW),
      delete: vi.fn().mockResolvedValue(CATEGORIA_ROW),
    },
    categoriaAtributo: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    categoriaAtributoValor: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
    articuloOferta: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    articuloImagen: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
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
    ...overrides,
  } as unknown as PrismaClient
}

describe('Catalog variants API (#235)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    delete process.env.BIZCODE_TEST_MODULES
  })

  it('GET /api/categorias-articulo returns paginated list', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/categorias-articulo')
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/categorias-articulo', 'get', '200', res.body)
    expect(res.body.data).toHaveLength(1)
  })

  it('POST /api/categorias-articulo creates a category', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/categorias-articulo')
      .send({ nombre: 'Calzado' })
    expect(res.status).toBe(201)
    await assertMatchesOpenApi('/api/categorias-articulo', 'post', '201', res.body)
  })

  it('GET /api/articulos/precio-catalogo-efectivo resolves precioLista1', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .get('/api/articulos/precio-catalogo-efectivo')
      .query({ articuloId: 5 })
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/articulos/precio-catalogo-efectivo', 'get', '200', res.body)
    expect(res.body.origen).toBe('precio_lista1')
    expect(res.body.precio).toBe(100)
  })

  it('returns 403 when catalog.variants module is disabled', async () => {
    process.env.BIZCODE_TEST_MODULES = 'core.auth,core.catalog,core.clients,core.invoicing'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/categorias-articulo')
    expect(res.status).toBe(403)
  })

  it('GET /api/articulos/:id/variantes and stock-familia', async () => {
    const prisma = buildPrismaMock({
      articulo: {
        findFirst: vi.fn().mockResolvedValue({
          id: 5,
          esPadre: true,
          precioLista1: new Decimal(100),
          heredaPrecio: true,
          precioOverride: null,
          categoria: null,
          padre: null,
          ofertas: [],
        }),
        findMany: vi.fn().mockResolvedValue([
          {
            id: 11,
            codigo: 11,
            descripcion: 'Remera - Roja',
            padreId: 5,
            esPadre: false,
            categoriaId: 1,
            heredaPrecio: true,
            precioOverride: null,
            costoOverride: null,
            precioLista1: new Decimal(100),
            costo: new Decimal(40),
            stock: 2,
            activo: true,
            atributoValores: [],
          },
        ]),
      },
    })
    const app = createApp(prisma)
    const variantes = await request(app).get('/api/articulos/5/variantes')
    expect(variantes.status).toBe(200)
    const stock = await request(app).get('/api/articulos/5/stock-familia')
    expect(stock.status).toBe(200)
    expect(stock.body.stockFamilia).toBe(2)
  })
})
