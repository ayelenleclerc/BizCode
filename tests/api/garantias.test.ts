import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

const CLIENTE_REF = { id: 1, codigo: 1001, rsocial: 'ACME SA' }
const ARTICULO_REF = { id: 10, codigo: 100, descripcion: 'TV Samsung' }

const future = new Date()
future.setUTCFullYear(future.getUTCFullYear() + 1)

const GARANTIA_ROW = {
  id: 1,
  tenantId: 1,
  articuloId: 10,
  facturaId: null as number | null,
  facturaItemId: null as number | null,
  nroSerie: 'SN-99',
  nroImei: null as string | null,
  descripcionEquipo: 'TV Samsung',
  clienteId: 1,
  fechaVenta: new Date('2026-01-01T00:00:00.000Z'),
  mesesGarantia: 12,
  fechaVencimiento: future,
  estado: 'vigente',
  createdAt: new Date('2026-01-01T12:00:00.000Z'),
  updatedAt: new Date('2026-01-01T12:00:00.000Z'),
  cliente: CLIENTE_REF,
  articulo: ARTICULO_REF,
  factura: null,
  usos: [] as unknown[],
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
      findFirst: vi.fn().mockResolvedValue({
        id: 10,
        mesesGarantia: 12,
        descripcion: 'TV Samsung',
        tipo: 'articulo',
      }),
    },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue({ id: 5 }),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
    },
    ordenTrabajo: {
      findFirst: vi.fn().mockResolvedValue({ id: 7 }),
    },
    garantia: {
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([GARANTIA_ROW]),
      findFirst: vi.fn().mockResolvedValue(GARANTIA_ROW),
      findFirstOrThrow: vi.fn().mockResolvedValue(GARANTIA_ROW),
      create: vi.fn().mockResolvedValue(GARANTIA_ROW),
      update: vi.fn().mockResolvedValue({ ...GARANTIA_ROW, estado: 'anulada' }),
    },
    garantiaUso: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    appUser: { findFirst: vi.fn().mockResolvedValue(null), findMany: vi.fn().mockResolvedValue([]) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
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

describe('Garantias API (#251)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    delete process.env.BIZCODE_TEST_MODULES
  })

  it('GET /api/garantias returns paginated list with counts', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/garantias')
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/garantias', 'get', '200', res.body)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.counts).toBeDefined()
  })

  it('GET /api/garantias/lookup returns vigente', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/garantias/lookup').query({ serial: 'SN-99' })
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/garantias/lookup', 'get', '200', res.body)
    expect(res.body.data.status).toBe('vigente')
  })

  it('GET /api/garantias/lookup returns sin_registro', async () => {
    const prisma = buildPrismaMock({
      garantia: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        count: vi.fn().mockResolvedValue(0),
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/garantias/lookup').query({ serial: 'NONE' })
    expect(res.status).toBe(200)
    expect(res.body.data.status).toBe('sin_registro')
  })

  it('GET /api/garantias/lookup returns vencida', async () => {
    const past = new Date('2020-06-01T00:00:00.000Z')
    const prisma = buildPrismaMock({
      garantia: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue({
          ...GARANTIA_ROW,
          estado: 'vencida',
          fechaVencimiento: past,
        }),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/garantias/lookup').query({ serial: 'SN-OLD' })
    expect(res.status).toBe(200)
    expect(res.body.data.status).toBe('vencida')
  })

  it('GET /api/garantias/:id returns detail', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/garantias/1')
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/garantias/{id}', 'get', '200', res.body)
  })

  it('POST /api/garantias registers warranty', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/garantias').send({
      articuloId: 10,
      clienteId: 1,
      nroSerie: 'SN-NEW',
      mesesGarantia: 12,
    })
    expect(res.status).toBe(201)
    await assertMatchesOpenApi('/api/garantias', 'post', '201', res.body)
  })

  it('POST /api/garantias/:id/anular voids warranty', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/garantias/1/anular')
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/garantias/{id}/anular', 'post', '200', res.body)
  })

  it('POST /api/garantias/:id/usos records usage', async () => {
    const withUso = {
      ...GARANTIA_ROW,
      usos: [
        {
          id: 1,
          garantiaId: 1,
          otId: 7,
          descripcion: 'Reparación en garantía',
          fecha: new Date(),
          userId: 1,
          user: { id: 1, username: 'seller' },
        },
      ],
    }
    const prisma = buildPrismaMock({
      garantia: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([GARANTIA_ROW]),
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          estado: 'vigente',
          fechaVencimiento: future,
        }),
        findFirstOrThrow: vi.fn().mockResolvedValue(withUso),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/garantias/1/usos')
      .send({ descripcion: 'Reparación en garantía', otId: 7 })
    expect(res.status).toBe(201)
    await assertMatchesOpenApi('/api/garantias/{id}/usos', 'post', '201', res.body)
  })

  it('returns 403 when service.warranties module is disabled', async () => {
    process.env.BIZCODE_TEST_MODULES = 'core.auth,core.catalog,core.clients,core.invoicing'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/garantias')
    expect(res.status).toBe(403)
    expect(res.body.error).toBe('module_not_enabled')
    expect(res.body.module).toBe('service.warranties')
  })
})
