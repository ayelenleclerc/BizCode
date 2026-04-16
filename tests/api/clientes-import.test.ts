import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

const IMPORT_HEADER =
  'codigo,rsocial,condIva,activo,fantasia,cuit,domicilio,localidad,cpost,telef,email,creditLimit,creditDays,suspended,deliveryZoneId'

function csvBody(...rows: string[]): Buffer {
  return Buffer.from([IMPORT_HEADER, ...rows].join('\n') + '\n', 'utf8')
}

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  const clienteTxCreate = vi.fn().mockResolvedValue({ id: 1, codigo: 3001 })
  const findMany = vi.fn((args?: unknown) => {
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
    cliente: {
      findMany,
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
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
        const tx = { cliente: { create: clienteTxCreate } }
        return (arg as (t: typeof tx) => Promise<unknown>)(tx)
      }
      return arg
    }),
    ...overrides,
  } as unknown as PrismaClient
}

describe('Clientes CSV import', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })

  it('GET /api/clientes/import/template returns CSV', async () => {
    const app = createApp(buildPrisma())
    const res = await request(app).get('/api/clientes/import/template').expect(200)
    expect(res.headers['content-type']).toMatch(/text\/csv/)
    expect(res.text).toContain(IMPORT_HEADER)
    expect(res.text).toContain('Ejemplo SA')
  })

  it('POST /api/clientes/import creates rows for valid CSV', async () => {
    const prisma = buildPrisma()
    const app = createApp(prisma)
    const row = '3001,Valid SA,RI,true,,,,,,,,,0,false,'
    const res = await request(app)
      .post('/api/clientes/import')
      .attach('file', csvBody(row), 'x.csv')
      .expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.created).toBe(1)
    expect(res.body.data.skipped).toBe(0)
    expect(res.body.data.errors).toEqual([])
    expect((prisma.$transaction as ReturnType<typeof vi.fn>)).toHaveBeenCalled()
  })

  it('POST /api/clientes/import returns row errors for invalid data', async () => {
    const app = createApp(buildPrisma())
    const row = '3002,No,RI,true,,,,,,,,,0,false,'
    const res = await request(app).post('/api/clientes/import').attach('file', csvBody(row), 'x.csv').expect(200)
    expect(res.body.data.created).toBe(0)
    expect(res.body.data.skipped).toBe(1)
    expect(res.body.data.errors[0].row).toBe(2)
    expect(String(res.body.data.errors[0].message)).toMatch(/rsocial/i)
  })

  it('POST /api/clientes/import rejects duplicate codigo in file', async () => {
    const app = createApp(buildPrisma())
    const r = '3003,Dup One SA,RI,true,,,,,,,,,0,false,'
    const res = await request(app)
      .post('/api/clientes/import')
      .attach('file', csvBody(r, r), 'x.csv')
      .expect(200)
    expect(res.body.data.created).toBe(1)
    expect(res.body.data.skipped).toBe(1)
    expect(res.body.data.errors[0].message).toMatch(/Duplicate codigo/)
  })

  it('POST /api/clientes/import rejects codigo already in DB', async () => {
    const app = createApp(buildPrisma())
    const row = '9001,Existing SA,RI,true,,,,,,,,,0,false,'
    const res = await request(app).post('/api/clientes/import').attach('file', csvBody(row), 'x.csv').expect(200)
    expect(res.body.data.created).toBe(0)
    expect(res.body.data.skipped).toBe(1)
    expect(res.body.data.errors[0].message).toMatch(/already exists/)
  })

  it('POST /api/clientes/import returns 400 for wrong headers', async () => {
    const app = createApp(buildPrisma())
    const bad = Buffer.from('wrong,header\n1,2\n', 'utf8')
    const res = await request(app).post('/api/clientes/import').attach('file', bad, 'x.csv').expect(400)
    expect(res.body.success).toBe(false)
    expect(String(res.body.error)).toMatch(/header/i)
  })

  it('POST /api/clientes/import returns 400 without file', async () => {
    const app = createApp(buildPrisma())
    const res = await request(app).post('/api/clientes/import').expect(400)
    expect(res.body.success).toBe(false)
  })
})

describe('Clientes CSV import — authorization', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'driver'
  })

  it('denies GET template without customers.manage', async () => {
    const app = createApp(buildPrisma())
    await request(app).get('/api/clientes/import/template').expect(403)
  })

  it('denies POST import without customers.manage', async () => {
    const app = createApp(buildPrisma())
    const row = '3001,X SA,RI,true,,,,,,,,,0,false,'
    await request(app).post('/api/clientes/import').attach('file', csvBody(row), 'x.csv').expect(403)
  })
})
