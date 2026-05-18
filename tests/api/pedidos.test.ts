import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

const CLIENTE_REF = { id: 1, codigo: 1001, rsocial: 'ACME SA', condIva: 'RI' }

const PEDIDO_ROW = {
  id: 1,
  tenantId: 1,
  clienteId: 1,
  vendedorId: null,
  estado: 'draft',
  total: 100,
  validUntil: null,
  facturaId: null,
  createdAt: new Date('2026-05-18T12:00:00.000Z'),
  updatedAt: new Date('2026-05-18T12:00:00.000Z'),
  cliente: CLIENTE_REF,
  vendedor: null,
  items: [
    {
      id: 1,
      articuloId: 2,
      cantidad: 1,
      precio: 100,
      dscto: 0,
      subtotal: 100,
      articulo: { id: 2, codigo: 10, descripcion: 'Item', condIva: '1' },
    },
  ],
  factura: null,
}

const PEDIDO_BODY = {
  clienteId: 1,
  items: [{ articuloId: 2, cantidad: 1, precio: 100, dscto: 0 }],
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    cliente: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue({ id: 1, tenantId: 1, condIva: 'RI', suspended: false }),
      findUnique: vi.fn().mockResolvedValue(null),
    },
    articulo: {
      findMany: vi.fn().mockResolvedValue([{ id: 2 }]),
      findFirst: vi.fn().mockResolvedValue({ id: 2, condIva: '1', stock: 10, minimo: 0 }),
    },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn(),
    },
    pedido: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([PEDIDO_ROW]),
      findFirst: vi.fn().mockResolvedValue(PEDIDO_ROW),
      create: vi.fn().mockResolvedValue(PEDIDO_ROW),
      update: vi.fn().mockResolvedValue({ ...PEDIDO_ROW, estado: 'confirmed' }),
    },
    pedidoItem: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    appUser: { findFirst: vi.fn().mockResolvedValue(null) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') return arg(buildPrismaMock())
      return arg
    }),
    ...overrides,
  } as unknown as PrismaClient
}

describe('Pedidos API', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
  })

  it('GET /api/pedidos returns paginated list', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/pedidos')
    expect(res.status).toBe(200)
    await assertMatchesOpenApi('/api/pedidos', 'get', '200', res.body)
    expect(res.body.data).toHaveLength(1)
  })

  it('POST /api/pedidos creates draft pedido', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/pedidos').send(PEDIDO_BODY)
    expect(res.status).toBe(201)
    await assertMatchesOpenApi('/api/pedidos', 'post', '201', res.body)
  })

  it('returns 403 without orders.create', async () => {
    process.env.BIZCODE_TEST_ROLE = 'cashier'
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/pedidos').send(PEDIDO_BODY)
    expect(res.status).toBe(403)
  })

  it('returns 403 when billing.orders module is disabled', async () => {
    process.env.BIZCODE_TEST_MODULES = 'core.auth,core.catalog,core.clients,core.invoicing'
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/pedidos').send(PEDIDO_BODY)
    expect(res.status).toBe(403)
    expect(res.body.error).toBe('module_not_enabled')
    expect(res.body.module).toBe('billing.orders')
  })
})
