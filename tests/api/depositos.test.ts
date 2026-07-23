import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

const now = new Date('2026-07-23T12:00:00.000Z')

const DEPOSITO = {
  id: 1,
  tenantId: 1,
  nombre: 'Depósito Central',
  codigo: 'DEFAULT',
  tipo: 'central',
  direccion: null,
  responsableId: null,
  activo: true,
  esDefault: true,
  createdAt: now,
  updatedAt: now,
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    cliente: { findFirst: vi.fn().mockResolvedValue({ id: 1, tenantId: 1 }) },
    articulo: {
      findFirst: vi.fn().mockResolvedValue({ id: 5, stock: 10, tipo: 'articulo', esPadre: false }),
      findMany: vi.fn().mockResolvedValue([{ id: 5, esPadre: false }]),
      update: vi.fn(),
    },
    deposito: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([DEPOSITO]),
      findFirst: vi.fn().mockResolvedValue(DEPOSITO),
      create: vi.fn().mockResolvedValue({ ...DEPOSITO, id: 2, codigo: 'SP', esDefault: false }),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    stockDeposito: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn(),
      aggregate: vi.fn().mockResolvedValue({ _sum: { cantidad: 10 } }),
      create: vi.fn(),
      update: vi.fn(),
    },
    transferenciaDeposito: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn().mockResolvedValue({ _max: { numero: 0 } }),
    },
    transferenciaDepositoItem: { findMany: vi.fn().mockResolvedValue([]), update: vi.fn() },
    stockAjuste: { create: vi.fn() },
    recuento: { findFirst: vi.fn().mockResolvedValue(null) },
    $transaction: vi.fn(async (fn: (tx: PrismaClient) => Promise<unknown>) => fn(buildPrismaMock(overrides) as PrismaClient)),
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

describe('Depositos API (#236)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    delete process.env.BIZCODE_TEST_MODULES
  })

  it('GET /api/depositos returns paginated list', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/depositos')
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/depositos', 'get', '200', res.body)
    expect(res.body.data).toHaveLength(1)
  })

  it('POST /api/depositos creates a deposit', async () => {
    const prisma = buildPrismaMock({
      deposito: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({
          ...DEPOSITO,
          id: 2,
          codigo: 'SP',
          nombre: 'Sucursal',
          tipo: 'sucursal',
          esDefault: false,
        }),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn(),
      },
      $transaction: vi.fn(async (fn: (tx: PrismaClient) => Promise<unknown>) =>
        fn(
          buildPrismaMock({
            deposito: {
              findFirst: vi.fn().mockResolvedValue(null),
              create: vi.fn().mockResolvedValue({
                ...DEPOSITO,
                id: 2,
                codigo: 'SP',
                nombre: 'Sucursal',
                tipo: 'sucursal',
                esDefault: false,
              }),
              updateMany: vi.fn(),
            },
          }),
        ),
      ),
    })
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/depositos')
      .send({ nombre: 'Sucursal', codigo: 'SP', tipo: 'sucursal' })
    expect(res.status).toBe(201)
    await assertMatchesOpenApi('/api/depositos', 'post', '201', res.body)
  })

  it('returns 403 when inventory.warehouses is disabled', async () => {
    process.env.BIZCODE_TEST_MODULES = 'core.auth,core.catalog,inventory.stock'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/depositos')
    expect(res.status).toBe(403)
  })
})
