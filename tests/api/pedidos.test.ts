import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
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
  observaciones: null,
  condicionCobro: null,
  plazoDias: null,
  createdAt: new Date('2026-05-18T12:00:00.000Z'),
  updatedAt: new Date('2026-05-18T12:00:00.000Z'),
  cliente: CLIENTE_REF,
  vendedor: null,
  items: [
    {
      id: 1,
      articuloId: 2,
      descripcion: 'Item',
      condIva: '1',
      unidadServicio: null,
      cantidad: 1,
      precio: 100,
      dscto: 0,
      subtotal: 100,
      articulo: { id: 2, codigo: 10, descripcion: 'Item', condIva: '1', tipo: 'articulo' },
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
      findMany: vi.fn().mockResolvedValue([
        {
          id: 2,
          descripcion: 'Item',
          condIva: '1',
          tipo: 'articulo',
          unidadServicio: null,
          esPadre: false,
        },
      ]),
      findFirst: vi.fn().mockResolvedValue({
        id: 2,
        condIva: '1',
        stock: 10,
        minimo: 0,
        tipo: 'articulo',
        descripcion: 'Item',
        unidadServicio: null,
      }),
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
    delete process.env.BIZCODE_TEST_MODULES
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

  it('POST /api/pedidos accepts observaciones and condicionCobro plazo (#169)', async () => {
    const create = vi.fn().mockResolvedValue({
      ...PEDIDO_ROW,
      observaciones: 'Entregar por fondo',
      condicionCobro: 'plazo',
      plazoDias: 30,
    })
    const base = buildPrismaMock()
    const app = createApp(
      buildPrismaMock({
        pedido: {
          count: base.pedido.count,
          findMany: base.pedido.findMany,
          findFirst: base.pedido.findFirst,
          create,
          update: base.pedido.update,
        },
      }),
    )
    const res = await request(app)
      .post('/api/pedidos')
      .send({
        ...PEDIDO_BODY,
        observaciones: 'Entregar por fondo',
        condicionCobro: 'plazo',
        plazoDias: 30,
      })
    expect(res.status).toBe(201)
    expect(create).toHaveBeenCalled()
    const data = create.mock.calls[0]?.[0]?.data as {
      observaciones?: string
      condicionCobro?: string
      plazoDias?: number
    }
    expect(data.observaciones).toBe('Entregar por fondo')
    expect(data.condicionCobro).toBe('plazo')
    expect(data.plazoDias).toBe(30)
    await assertMatchesOpenApi('/api/pedidos', 'post', '201', res.body)
  })

  it('POST /api/pedidos rejects plazo without plazoDias (#169)', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/pedidos')
      .send({
        ...PEDIDO_BODY,
        condicionCobro: 'plazo',
      })
    expect(res.status).toBe(400)
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

  it('POST /api/pedidos/:id/pack ships logistics happy path pack→ship→deliver (#450)', async () => {
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const packed = { ...PEDIDO_ROW, estado: 'packed' }
    const shipped = { ...PEDIDO_ROW, estado: 'shipped' }
    const delivered = { ...PEDIDO_ROW, estado: 'delivered' }
    const findFirst = vi
      .fn()
      // pack: ownership + applySimpleTransition
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce({ id: 1, estado: 'confirmed' })
      // ship
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce({ id: 1, estado: 'packed' })
      // deliver
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce({ id: 1, estado: 'shipped' })
    const update = vi
      .fn()
      .mockResolvedValueOnce(packed)
      .mockResolvedValueOnce(shipped)
      .mockResolvedValueOnce(delivered)
    const base = buildPrismaMock()
    const app = createApp(
      buildPrismaMock({
        pedido: {
          count: base.pedido.count,
          findMany: base.pedido.findMany,
          findFirst,
          create: base.pedido.create,
          update,
        },
      }),
    )

    const packRes = await request(app).post('/api/pedidos/1/pack')
    expect(packRes.status).toBe(200)
    expect(packRes.body.data.estado).toBe('packed')
    await assertMatchesOpenApi('/api/pedidos/{id}/pack', 'post', '200', packRes.body)

    const shipRes = await request(app).post('/api/pedidos/1/ship')
    expect(shipRes.status).toBe(200)
    expect(shipRes.body.data.estado).toBe('shipped')
    await assertMatchesOpenApi('/api/pedidos/{id}/ship', 'post', '200', shipRes.body)

    const deliverRes = await request(app).post('/api/pedidos/1/deliver')
    expect(deliverRes.status).toBe(200)
    expect(deliverRes.body.data.estado).toBe('delivered')
    await assertMatchesOpenApi('/api/pedidos/{id}/deliver', 'post', '200', deliverRes.body)
  })

  it('POST /api/pedidos/:id/ship rejects illegal transition from draft (#450)', async () => {
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const findFirst = vi
      .fn()
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce({ id: 1, estado: 'draft' })
    const base = buildPrismaMock()
    const app = createApp(
      buildPrismaMock({
        pedido: {
          count: base.pedido.count,
          findMany: base.pedido.findMany,
          findFirst,
          create: base.pedido.create,
          update: base.pedido.update,
        },
      }),
    )
    const res = await request(app).post('/api/pedidos/1/ship')
    expect(res.status).toBe(409)
    expect(res.body.error).toBe('INVALID_STATE_TRANSITION')
    await assertMatchesOpenApi('/api/pedidos/{id}/ship', 'post', '409', res.body)
  })

  it('POST /api/pedidos/:id/collect marks collected when factura is fully paid (#450)', async () => {
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const collected = {
      ...PEDIDO_ROW,
      estado: 'collected',
      facturaId: 9,
      factura: { id: 9, tipo: 'A', prefijo: 1, numero: 1, total: 100 },
    }
    const findFirst = vi
      .fn()
      // ownership → collect gate → applySimpleTransition
      .mockResolvedValueOnce({ id: 1 })
      .mockResolvedValueOnce({ id: 1, estado: 'delivered', facturaId: 9 })
      .mockResolvedValueOnce({ id: 1, estado: 'delivered', facturaId: 9 })
    const update = vi.fn().mockResolvedValue(collected)
    const base = buildPrismaMock()
    const app = createApp(
      buildPrismaMock({
        pedido: {
          count: base.pedido.count,
          findMany: base.pedido.findMany,
          findFirst,
          create: base.pedido.create,
          update,
        },
        factura: {
          findMany: base.factura.findMany,
          findFirst: vi.fn().mockResolvedValue({
            id: 9,
            clienteId: 1,
            total: { minus: () => ({ lessThanOrEqualTo: () => true }) },
          }),
          count: base.factura.count,
          create: base.factura.create,
        },
        reciboCobroImputacion: {
          aggregate: vi.fn().mockResolvedValue({ _sum: { importe: 100 } }),
        },
      }),
    )
    const res = await request(app).post('/api/pedidos/1/collect')
    expect(res.status).toBe(200)
    expect(res.body.data.estado).toBe('collected')
    await assertMatchesOpenApi('/api/pedidos/{id}/collect', 'post', '200', res.body)
  })

  it('returns 403 on pack without orders.pick (#450)', async () => {
    process.env.BIZCODE_TEST_ROLE = 'seller'
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/pedidos/1/pack')
    expect(res.status).toBe(403)
  })
})
