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

  it('GET /api/depositos/:id returns deposit', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/depositos/1')
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/depositos/{id}', 'get', '200', res.body)
    expect(res.body.data.codigo).toBe('DEFAULT')
  })

  it('PATCH /api/depositos/:id updates deposit', async () => {
    const updated = { ...DEPOSITO, nombre: 'Central Renombrado' }
    const prisma = buildPrismaMock({
      deposito: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(DEPOSITO),
        create: vi.fn(),
        update: vi.fn().mockResolvedValue(updated),
        updateMany: vi.fn(),
        delete: vi.fn(),
      },
      $transaction: vi.fn(async (fn: (tx: PrismaClient) => Promise<unknown>) =>
        fn(
          buildPrismaMock({
            deposito: {
              update: vi.fn().mockResolvedValue(updated),
              updateMany: vi.fn(),
            },
          }),
        ),
      ),
    })
    const app = createApp(prisma)
    const res = await request(app).patch('/api/depositos/1').send({ nombre: 'Central Renombrado' })
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/depositos/{id}', 'patch', '200', res.body)
    expect(res.body.data.nombre).toBe('Central Renombrado')
  })

  it('DELETE /api/depositos/:id removes non-default deposit', async () => {
    const secondary = { ...DEPOSITO, id: 2, codigo: 'SP', esDefault: false }
    const prisma = buildPrismaMock({
      deposito: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(secondary),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn().mockResolvedValue(secondary),
      },
      stockDeposito: {
        findMany: vi.fn(),
        findUnique: vi.fn(),
        aggregate: vi.fn().mockResolvedValue({ _sum: { cantidad: 0 } }),
        create: vi.fn(),
        update: vi.fn(),
      },
      transferenciaDeposito: {
        count: vi.fn().mockResolvedValue(0),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        aggregate: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).delete('/api/depositos/2')
    expect(res.status).toBe(204)
  })

  it('GET /api/articulos/:id/stock-depositos returns breakdown', async () => {
    const prisma = buildPrismaMock({
      stockDeposito: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 1,
            tenantId: 1,
            articuloId: 5,
            depositoId: 1,
            cantidad: 10,
            stockMin: 0,
            stockMax: null,
            createdAt: now,
            updatedAt: now,
            deposito: { codigo: 'DEFAULT', nombre: 'Depósito Central' },
          },
        ]),
        findUnique: vi.fn(),
        aggregate: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      transferenciaDepositoItem: {
        findMany: vi.fn().mockResolvedValue([{ cantidadEnviada: 2 }]),
        update: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/articulos/5/stock-depositos')
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/articulos/{id}/stock-depositos', 'get', '200', res.body)
    expect(res.body.stockTotal).toBe(10)
    expect(res.body.enTransito).toBe(2)
  })

  it('transferencias list/create/en-transito/anular happy paths', async () => {
    const transf = {
      id: 9,
      tenantId: 1,
      numero: 1,
      origenId: 1,
      destinoId: 2,
      estado: 'pendiente',
      solicitadoPorId: 1,
      aprobadoPorId: null,
      fechaEnvio: null,
      fechaRecepcion: null,
      nota: null,
      createdAt: now,
      updatedAt: now,
      origen: { codigo: 'DEFAULT' },
      destino: { codigo: 'SP' },
      items: [
        {
          id: 1,
          transferenciaId: 9,
          articuloId: 5,
          cantidadEnviada: 3,
          cantidadRecibida: null,
          articulo: { codigo: 5, descripcion: 'Remera' },
        },
      ],
    }
    const enTransito = {
      ...transf,
      estado: 'en_transito',
      aprobadoPorId: 1,
      fechaEnvio: now,
    }
    const anulada = { ...enTransito, estado: 'anulada' }
    const prisma = buildPrismaMock({
      deposito: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({ id: 1, activo: true })
          .mockResolvedValueOnce({ id: 2, activo: true })
          .mockResolvedValue(DEPOSITO),
        create: vi.fn(),
        update: vi.fn(),
        updateMany: vi.fn(),
        delete: vi.fn(),
      },
      transferenciaDeposito: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([transf]),
        findFirst: vi
          .fn()
          .mockResolvedValueOnce(transf)
          .mockResolvedValueOnce(enTransito)
          .mockResolvedValueOnce({ ...enTransito, items: transf.items })
          .mockResolvedValueOnce(anulada),
        create: vi.fn().mockResolvedValue(transf),
        update: vi.fn().mockResolvedValue(enTransito),
        aggregate: vi.fn().mockResolvedValue({ _max: { numero: 0 } }),
      },
      stockDeposito: {
        findMany: vi.fn(),
        findUnique: vi.fn().mockResolvedValue({ id: 1, cantidad: 10 }),
        aggregate: vi.fn().mockResolvedValue({ _sum: { cantidad: 7 } }),
        create: vi.fn(),
        update: vi.fn().mockResolvedValue({ id: 1, cantidad: 7 }),
      },
    })
    ;(prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (fn) => fn(prisma))

    const app = createApp(prisma)

    const listRes = await request(app).get('/api/transferencias-deposito')
    expect(listRes.status).toBe(200)
    await assertMatchesOpenApi('/api/transferencias-deposito', 'get', '200', listRes.body)

    const createRes = await request(app)
      .post('/api/transferencias-deposito')
      .send({
        origenId: 1,
        destinoId: 2,
        items: [{ articuloId: 5, cantidadEnviada: 3 }],
      })
    expect(createRes.status).toBe(201)
    await assertMatchesOpenApi('/api/transferencias-deposito', 'post', '201', createRes.body)

    const transitRes = await request(app).post('/api/transferencias-deposito/9/en-transito')
    expect(transitRes.status).toBe(200)
    await assertMatchesOpenApi(
      '/api/transferencias-deposito/{id}/en-transito',
      'post',
      '200',
      transitRes.body,
    )

    const anularRes = await request(app).post('/api/transferencias-deposito/9/anular')
    expect(anularRes.status).toBe(200)
    await assertMatchesOpenApi(
      '/api/transferencias-deposito/{id}/anular',
      'post',
      '200',
      anularRes.body,
    )
  })
})
