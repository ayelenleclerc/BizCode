import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

const proveedorRow = {
  id: 1,
  codigo: 4001,
  rsocial: 'Proveedor Test SA',
  fantasia: null as string | null,
  cuit: null as string | null,
  condIva: 'RI',
  telef: null as string | null,
  email: null as string | null,
  activo: true,
}

const proveedorInput = {
  codigo: 4001,
  rsocial: 'Proveedor Test SA',
  condIva: 'RI',
  activo: true,
}

const IMPORT_HEADER = 'codigo,rsocial,condIva,activo,fantasia,cuit,telef,email'

function csvBody(...rows: string[]): Buffer {
  return Buffer.from([IMPORT_HEADER, ...rows].join('\n') + '\n', 'utf8')
}

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  const proveedorTxCreate = vi.fn().mockResolvedValue(proveedorRow)
  const proveedorFindMany = vi.fn((args?: unknown) => {
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
    return Promise.resolve([proveedorRow])
  })
  return {
    cliente: { findMany: vi.fn().mockResolvedValue([]), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]), create: vi.fn() },
    proveedor: {
      count: vi.fn().mockResolvedValue(1),
      findMany: proveedorFindMany,
      findFirst: vi.fn().mockResolvedValue(proveedorRow),
      findUnique: vi.fn().mockResolvedValue(proveedorRow),
      create: vi.fn().mockResolvedValue(proveedorRow),
      update: vi.fn().mockResolvedValue(proveedorRow),
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
        const tx = { proveedor: { create: proveedorTxCreate } }
        return (arg as (t: typeof tx) => Promise<unknown>)(tx)
      }
      return arg
    }),
    ...overrides,
  } as unknown as PrismaClient
}

describe('Proveedores API', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })

  it('GET /api/proveedores', async () => {
    const app = createApp(buildPrisma())
    const res = await request(app).get('/api/proveedores').expect(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data)).toBe(true)
    expect(res.body.data[0].codigo).toBe(4001)
    expect(res.body).toMatchObject({ total: 1, limit: 100, offset: 0 })
  })

  it('GET /api/proveedores/:id', async () => {
    const app = createApp(buildPrisma())
    const res = await request(app).get('/api/proveedores/1').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.id).toBe(1)
  })

  it('POST /api/proveedores', async () => {
    const app = createApp(buildPrisma())
    const res = await request(app).post('/api/proveedores').send(proveedorInput).expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.codigo).toBe(4001)
  })

  it('PUT /api/proveedores/:id', async () => {
    const app = createApp(buildPrisma())
    const res = await request(app).put('/api/proveedores/1').send(proveedorInput).expect(200)
    expect(res.body.success).toBe(true)
  })

  it('GET /api/proveedores/import/template returns CSV', async () => {
    const app = createApp(buildPrisma())
    const res = await request(app).get('/api/proveedores/import/template').expect(200)
    expect(res.headers['content-type']).toMatch(/text\/csv/)
    expect(res.text).toContain(IMPORT_HEADER)
  })

  it('POST /api/proveedores/import creates rows for valid CSV', async () => {
    const prisma = buildPrisma()
    const app = createApp(prisma)
    const row = '4100,Nuevo Prov SA,RI,true,,,,'
    const res = await request(app).post('/api/proveedores/import').attach('file', csvBody(row), 'x.csv').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.created).toBe(1)
    expect(res.body.data.errors).toEqual([])
    expect((prisma.$transaction as ReturnType<typeof vi.fn>)).toHaveBeenCalled()
  })

  it('POST /api/proveedores/import returns row errors for invalid rsocial', async () => {
    const app = createApp(buildPrisma())
    const row = '4101,No,RI,true,,,,'
    const res = await request(app).post('/api/proveedores/import').attach('file', csvBody(row), 'x.csv').expect(200)
    expect(res.body.data.created).toBe(0)
    expect(res.body.data.skipped).toBe(1)
    expect(String(res.body.data.errors[0].message)).toMatch(/rsocial/i)
  })

  it('POST /api/proveedores/import rejects duplicate codigo in file', async () => {
    const app = createApp(buildPrisma())
    const r = '4102,Dup Prov SA,RI,true,,,,'
    const res = await request(app).post('/api/proveedores/import').attach('file', csvBody(r, r), 'x.csv').expect(200)
    expect(res.body.data.created).toBe(1)
    expect(res.body.data.skipped).toBe(1)
    expect(res.body.data.errors[0].message).toMatch(/Duplicate codigo/)
  })

  it('POST /api/proveedores/import rejects codigo already in DB', async () => {
    const app = createApp(buildPrisma())
    const row = '9001,Existing SA,RI,true,,,,'
    const res = await request(app).post('/api/proveedores/import').attach('file', csvBody(row), 'x.csv').expect(200)
    expect(res.body.data.created).toBe(0)
    expect(res.body.data.skipped).toBe(1)
    expect(res.body.data.errors[0].message).toMatch(/already exists/)
  })

  it('POST /api/proveedores/import returns 400 for wrong headers', async () => {
    const app = createApp(buildPrisma())
    const bad = Buffer.from('wrong,header\n1,2\n', 'utf8')
    const res = await request(app).post('/api/proveedores/import').attach('file', bad, 'x.csv').expect(400)
    expect(res.body.success).toBe(false)
  })
})

describe('Proveedores API — authorization', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'driver'
  })

  it('denies GET list without suppliers.read', async () => {
    const app = createApp(buildPrisma())
    await request(app).get('/api/proveedores').expect(403)
  })

  it('denies import template without suppliers.manage', async () => {
    const app = createApp(buildPrisma())
    await request(app).get('/api/proveedores/import/template').expect(403)
  })

  it('denies POST import without suppliers.manage', async () => {
    const app = createApp(buildPrisma())
    const row = '4103,X SA,RI,true,,,,'
    await request(app).post('/api/proveedores/import').attach('file', csvBody(row), 'x.csv').expect(403)
  })
})
