import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

const IMPORT_HEADER =
  'codigo,descripcion,rubroCodigo,condIva,umedida,precioLista1,precioLista2,costo,stock,minimo,activo'

function csvBody(...rows: string[]): Buffer {
  return Buffer.from([IMPORT_HEADER, ...rows].join('\n') + '\n', 'utf8')
}

const validRow =
  '501,Producto import UNO,1,1,UN,10.50,9.50,5.00,0,0,true'

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  const articuloTxCreate = vi.fn().mockResolvedValue({ id: 1, codigo: 501 })
  const articuloFindMany = vi.fn((args?: unknown) => {
    const w =
      args && typeof args === 'object' && args !== null && 'where' in args
        ? (args as { where?: { codigo?: { in?: number[] } } }).where
        : undefined
    if (w?.codigo && typeof w.codigo === 'object' && Array.isArray(w.codigo.in)) {
      if (w.codigo.in.includes(9001)) {
        return Promise.resolve([{ codigo: 9001 }])
      }
      return Promise.resolve([])
    }
    return Promise.resolve([])
  })
  return {
    cliente: { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    rubro: {
      findMany: vi.fn().mockResolvedValue([{ id: 1, codigo: 1 }]),
      create: vi.fn(),
    },
    articulo: {
      findMany: articuloFindMany,
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    proveedor: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
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
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') {
        const tx = { articulo: { create: articuloTxCreate } }
        return (arg as (t: typeof tx) => Promise<unknown>)(tx)
      }
      return arg
    }),
    ...overrides,
  } as unknown as PrismaClient
}

describe('Artículos CSV import', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })

  it('GET /api/articulos/import/template returns CSV', async () => {
    const app = createApp(buildPrisma())
    const res = await request(app).get('/api/articulos/import/template').expect(200)
    expect(res.headers['content-type']).toMatch(/text\/csv/)
    expect(res.text).toContain(IMPORT_HEADER)
    expect(res.text).toContain('Producto demo')
  })

  it('POST /api/articulos/import creates rows for valid CSV', async () => {
    const prisma = buildPrisma()
    const app = createApp(prisma)
    const res = await request(app).post('/api/articulos/import').attach('file', csvBody(validRow), 'x.csv').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.created).toBe(1)
    expect(res.body.data.skipped).toBe(0)
    expect(res.body.data.errors).toEqual([])
    expect((prisma.$transaction as ReturnType<typeof vi.fn>)).toHaveBeenCalled()
  })

  it('POST /api/articulos/import errors for unknown rubroCodigo', async () => {
    const app = createApp(buildPrisma())
    const row = '502,Otro,99,1,UN,10,10,5,0,0,true'
    const res = await request(app).post('/api/articulos/import').attach('file', csvBody(row), 'x.csv').expect(200)
    expect(res.body.data.created).toBe(0)
    expect(res.body.data.skipped).toBe(1)
    expect(String(res.body.data.errors[0].message)).toMatch(/Unknown rubroCodigo/)
  })

  it('POST /api/articulos/import rejects duplicate codigo in file', async () => {
    const app = createApp(buildPrisma())
    const res = await request(app)
      .post('/api/articulos/import')
      .attach('file', csvBody(validRow, validRow), 'x.csv')
      .expect(200)
    expect(res.body.data.created).toBe(1)
    expect(res.body.data.skipped).toBe(1)
    expect(res.body.data.errors[0].message).toMatch(/Duplicate codigo/)
  })

  it('POST /api/articulos/import rejects codigo already in DB', async () => {
    const app = createApp(buildPrisma())
    const row = '9001,Existente,1,1,UN,10,10,5,0,0,true'
    const res = await request(app).post('/api/articulos/import').attach('file', csvBody(row), 'x.csv').expect(200)
    expect(res.body.data.created).toBe(0)
    expect(res.body.data.skipped).toBe(1)
    expect(res.body.data.errors[0].message).toMatch(/already exists/)
  })

  it('POST /api/articulos/import returns 400 for wrong headers', async () => {
    const app = createApp(buildPrisma())
    const bad = Buffer.from('wrong,header\n1,2\n', 'utf8')
    const res = await request(app).post('/api/articulos/import').attach('file', bad, 'x.csv').expect(400)
    expect(res.body.success).toBe(false)
    expect(String(res.body.error)).toMatch(/header/i)
  })

  it('POST /api/articulos/import returns 400 without file', async () => {
    const app = createApp(buildPrisma())
    const res = await request(app).post('/api/articulos/import').expect(400)
    expect(res.body.success).toBe(false)
  })
})

describe('Artículos CSV import — authorization', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'driver'
  })

  it('denies GET template without products.manage', async () => {
    const app = createApp(buildPrisma())
    await request(app).get('/api/articulos/import/template').expect(403)
  })

  it('denies POST import without products.manage', async () => {
    const app = createApp(buildPrisma())
    await request(app).post('/api/articulos/import').attach('file', csvBody(validRow), 'x.csv').expect(403)
  })
})
