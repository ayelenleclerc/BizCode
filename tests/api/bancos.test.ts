import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'
import { DEFAULT_BANCO_CSV_MAPPINGS } from '../../apps/server/services/bancos/defaultCsvMappings'

const MODULES =
  'core.auth,finance.ledger,finance.bank_reconcile,billing.arca_cae,billing.orders'

const cuenta = {
  id: 7,
  tenantId: 1,
  banco: 'galicia',
  tipoCuenta: 'corriente',
  cbu: '1234567890123456789012',
  alias: null as string | null,
  moneda: 'ARS',
  activo: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
}

function buildPrisma(): PrismaClient {
  const mappings = DEFAULT_BANCO_CSV_MAPPINGS.map((m, i) => ({
    id: i + 1,
    tenantId: 1,
    ...m,
    createdAt: new Date(),
    updatedAt: new Date(),
  }))
  const createdKeys = new Set<string>()
  return {
    cuentaBancaria: {
      findMany: vi.fn().mockResolvedValue([cuenta]),
      findFirst: vi.fn().mockResolvedValue(cuenta),
      create: vi.fn().mockResolvedValue(cuenta),
      update: vi.fn().mockResolvedValue({ ...cuenta, alias: 'Ops' }),
    },
    bancoCsvMapping: {
      upsert: vi.fn().mockResolvedValue({}),
      findMany: vi.fn().mockResolvedValue(mappings),
      findFirst: vi.fn().mockImplementation(async ({ where }: { where: Record<string, unknown> }) => {
        if (where.bancoCode) return mappings.find((m) => m.bancoCode === where.bancoCode) ?? null
        return mappings[0]
      }),
      create: vi.fn().mockResolvedValue(mappings[0]),
      update: vi.fn().mockResolvedValue(mappings[0]),
    },
    movimientoBancario: {
      findMany: vi.fn().mockImplementation(async ({ where }: { where?: { dedupeKey?: { in: string[] } } }) => {
        const keys = where?.dedupeKey?.in ?? []
        return keys.filter((k) => createdKeys.has(k)).map((dedupeKey) => ({ dedupeKey }))
      }),
      createMany: vi.fn().mockImplementation(async ({ data }: { data: Array<{ dedupeKey: string }> }) => {
        for (const row of data) createdKeys.add(row.dedupeKey)
        return { count: data.length }
      }),
      count: vi.fn().mockResolvedValue(0),
    },
  } as unknown as PrismaClient
}

describe('bancos API (#190)', () => {
  beforeEach(() => {
    process.env.BIZCODE_TEST_ROLE = 'owner'
    process.env.BIZCODE_TEST_MODULES = MODULES
  })

  it('lists accounts and matches OpenAPI', async () => {
    const app = createApp(buildPrisma())
    const res = await request(app).get('/api/bancos/cuentas').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
    await assertMatchesOpenApi('/api/bancos/cuentas', 'get', '200', res.body)
  })

  it('creates account', async () => {
    const app = createApp(buildPrisma())
    const res = await request(app)
      .post('/api/bancos/cuentas')
      .send({
        banco: 'galicia',
        tipoCuenta: 'corriente',
        cbu: '1234567890123456789012',
      })
      .expect(201)
    expect(res.body.data.cbu).toBe('1234567890123456789012')
  })

  it('imports Galicia CSV fixture', async () => {
    const app = createApp(buildPrisma())
    const file = readFileSync(join(process.cwd(), 'tests/fixtures/bancos/galicia-sample.csv'))
    const res = await request(app)
      .post('/api/bancos/cuentas/7/importar')
      .field('bancoCode', 'galicia')
      .attach('file', file, 'galicia.csv')
      .expect(200)
    expect(res.body.data.imported).toBe(3)
    expect(res.body.data.format).toBe('csv')
  })

  it('lists csv mappings (seeds defaults)', async () => {
    const app = createApp(buildPrisma())
    const res = await request(app).get('/api/bancos/csv-mappings').expect(200)
    expect(res.body.data.length).toBeGreaterThanOrEqual(5)
  })
})
