import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

const clienteRow = {
  id: 7,
  tenantId: 1,
  codigo: 700,
  rsocial: 'Privacy Co',
  fantasia: 'Priv',
  cuit: '20-99999999-9',
  condIva: 'RI',
  domicilio: 'Av Test 1',
  localidad: 'CABA',
  cpost: '1000',
  telef: '1111',
  email: 'privacy@example.com',
  formaPago: null,
  activo: true,
  creditLimit: null,
  creditDays: 0,
  balance: 0,
  balanceInicial: 0,
  score: 50,
  suspended: false,
  deliveryZoneId: null,
  listaPrecioId: null,
  anonymizedAt: null as Date | null,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
}

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  const base = {
    cliente: {
      findFirst: vi.fn().mockResolvedValue(clienteRow),
      findMany: vi.fn().mockResolvedValue([clienteRow]),
      update: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
        ...clienteRow,
        ...data,
        rsocial: data.rsocial ?? clienteRow.rsocial,
        activo: data.activo ?? clienteRow.activo,
        anonymizedAt: data.anonymizedAt ?? null,
      })),
    },
    factura: { findMany: vi.fn().mockResolvedValue([]) },
    cobro: { findMany: vi.fn().mockResolvedValue([]) },
    pedido: { findMany: vi.fn().mockResolvedValue([]) },
    reciboCobro: { findMany: vi.fn().mockResolvedValue([]) },
    portalSession: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
    portalMagicLink: { updateMany: vi.fn().mockResolvedValue({ count: 0 }) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    notification: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    auditEvent: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
    },
    appUser: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    tenant: {
      findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }),
    },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') {
        return (arg as (tx: PrismaClient) => Promise<unknown>)(base as unknown as PrismaClient)
      }
      return arg
    }),
    ...overrides,
  }
  return base as unknown as PrismaClient
}

describe('cliente privacy endpoints (#195)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })

  it('exports JSON package for owner', async () => {
    const prisma = buildPrisma()
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/7/exportar-datos').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.cliente.id).toBe(7)
    expect(res.body.data.facturas).toEqual([])
    await assertMatchesOpenApi('/api/clientes/{id}/exportar-datos', 'get', '200', res.body)
  })

  it('forbids manager from export', async () => {
    process.env.BIZCODE_TEST_ROLE = 'manager'
    const app = createApp(buildPrisma())
    const res = await request(app).get('/api/clientes/7/exportar-datos').expect(403)
    expect(res.body.success).toBe(false)
  })

  it('anonymizes with confirm token', async () => {
    const prisma = buildPrisma()
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/clientes/7/anonimizar')
      .send({ confirm: 'ANONYMIZE' })
      .expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.rsocial).toBe('ANON-7')
    expect(res.body.data.activo).toBe(false)
    expect(prisma.portalSession.updateMany).toHaveBeenCalled()
    await assertMatchesOpenApi('/api/clientes/{id}/anonimizar', 'post', '200', res.body)
  })

  it('rejects anonymize without confirm token', async () => {
    const app = createApp(buildPrisma())
    const res = await request(app).post('/api/clientes/7/anonimizar').send({ confirm: 'yes' }).expect(400)
    expect(res.body.error).toMatch(/ANONYMIZE/)
  })

  it('returns 409 when already anonymized', async () => {
    const prisma = buildPrisma()
    ;(prisma.cliente.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...clienteRow,
      anonymizedAt: new Date(),
    })
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/clientes/7/anonimizar')
      .send({ confirm: 'ANONYMIZE' })
      .expect(409)
    expect(res.body.error).toMatch(/already anonymized/i)
  })

  it('exports CSV when format=csv', async () => {
    const prisma = buildPrisma()
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/7/exportar-datos?format=csv').expect(200)
    expect(res.headers['content-type']).toMatch(/text\/csv/)
    expect(res.text).toContain('cliente,')
  })

  it('forbids manager from anonymize', async () => {
    process.env.BIZCODE_TEST_ROLE = 'manager'
    const app = createApp(buildPrisma())
    const res = await request(app)
      .post('/api/clientes/7/anonimizar')
      .send({ confirm: 'ANONYMIZE' })
      .expect(403)
    expect(res.body.success).toBe(false)
  })
})
