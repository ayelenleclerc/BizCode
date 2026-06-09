import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../server/createApp'

function buildOrdenRow(estado: string, cantidadRecibida = 0) {
  return {
    id: 1,
    tenantId: 1,
    proveedorId: 2,
    estado,
    total: new Decimal(50),
    fechaEstimada: null,
    nota: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    proveedor: { id: 2, codigo: 1, rsocial: 'Prov SA' },
    items: [
      {
        id: 10,
        ordenCompraId: 1,
        articuloId: 3,
        codigoProveedor: null,
        descripcionProveedor: null,
        cantidad: 5,
        cantidadRecibida,
        costoUnitario: new Decimal(10),
        subtotal: new Decimal(50),
        articulo: { id: 3, codigo: 100, descripcion: 'Prod' },
      },
    ],
  }
}

const ordenIncludeRow = buildOrdenRow('draft')

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    deliveryZone: { findFirst: vi.fn().mockResolvedValue(null) },
    cliente: { findMany: vi.fn(), findFirst: vi.fn(), count: vi.fn() },
    articulo: {
      findMany: vi.fn(),
      count: vi.fn().mockResolvedValue(1),
      findFirst: vi.fn().mockResolvedValue({ id: 3, stock: 1 }),
      update: vi.fn().mockResolvedValue({ id: 3, stock: 6 }),
    },
    rubro: { findMany: vi.fn() },
    formaPago: { findMany: vi.fn() },
    proveedor: { findFirst: vi.fn().mockResolvedValue({ id: 2 }) },
    proveedorArticulo: { findFirst: vi.fn().mockResolvedValue(null) },
    factura: { findMany: vi.fn(), findFirst: vi.fn(), aggregate: vi.fn() },
    cobro: { count: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), aggregate: vi.fn() },
    ordenCompra: {
      count: vi.fn().mockResolvedValue(1),
      findMany: vi.fn().mockResolvedValue([ordenIncludeRow]),
      findFirst: vi.fn().mockResolvedValue(ordenIncludeRow),
      create: vi.fn().mockResolvedValue(ordenIncludeRow),
      update: vi.fn().mockResolvedValue({ ...ordenIncludeRow, estado: 'sent' }),
    },
    ordenCompraItem: { deleteMany: vi.fn(), update: vi.fn().mockResolvedValue({}) },
    stockAjuste: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    recuento: { findFirst: vi.fn().mockResolvedValue(null) },
    notification: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    appUser: { count: vi.fn().mockResolvedValue(1), findMany: vi.fn(), findFirst: vi.fn() },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    appSession: {
      create: vi.fn(),
      findFirst: vi.fn(),
      updateMany: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') return arg(buildPrismaMock())
      return arg
    }),
    ...overrides,
  } as unknown as PrismaClient
}

function setupComprasAuth(role = 'warehouse_lead') {
  process.env.NODE_ENV = 'test'
  process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
  process.env.BIZCODE_TEST_ROLE = role
}

describe('GET /api/compras', () => {
  beforeEach(() => {
    setupComprasAuth()
  })

  it('returns paginated purchase orders', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/compras').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
  })

  it('returns 403 without suppliers.read', async () => {
    setupComprasAuth('driver')
    const app = createApp(buildPrismaMock())
    await request(app).get('/api/compras').expect(403)
  })
})

describe('GET /api/compras/:id', () => {
  beforeEach(() => {
    setupComprasAuth()
  })

  it('returns purchase order detail', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/compras/1').expect(200)
    expect(res.body.data.id).toBe(1)
  })

  it('returns 404 when not found', async () => {
    const prisma = buildPrismaMock({
      ordenCompra: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const app = createApp(prisma)
    await request(app).get('/api/compras/99').expect(404)
  })
})

describe('POST /api/compras', () => {
  beforeEach(() => {
    setupComprasAuth()
  })

  it('creates draft purchase order', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/compras')
      .send({
        proveedorId: 2,
        items: [{ articuloId: 3, cantidad: 5, costoUnitario: 10 }],
      })
      .expect(201)
    expect(res.body.data.estado).toBe('draft')
  })

  it('returns 403 without suppliers.manage', async () => {
    setupComprasAuth('driver')
    const app = createApp(buildPrismaMock())
    await request(app)
      .post('/api/compras')
      .send({
        proveedorId: 2,
        items: [{ articuloId: 3, cantidad: 1, costoUnitario: 10 }],
      })
      .expect(403)
  })
})

describe('PUT /api/compras/:id', () => {
  beforeEach(() => {
    setupComprasAuth()
  })

  it('updates draft purchase order', async () => {
    const prisma = buildPrismaMock({
      ordenCompra: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({ id: 1, estado: 'draft' }),
        create: vi.fn(),
        update: vi.fn().mockResolvedValue({ ...ordenIncludeRow, nota: 'Updated' }),
      },
    })
    prisma.$transaction = vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: PrismaClient) => Promise<unknown>)(prisma)
      }
      return fn
    }) as PrismaClient['$transaction']
    const app = createApp(prisma)
    const res = await request(app).put('/api/compras/1').send({ nota: 'Updated' }).expect(200)
    expect(res.body.data.nota).toBe('Updated')
  })

  it('returns 422 when order is not draft', async () => {
    const prisma = buildPrismaMock({
      ordenCompra: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({ id: 1, estado: 'sent' }),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).put('/api/compras/1').send({ nota: 'X' }).expect(422)
    expect(res.body.error).toBe('ORDER_NOT_EDITABLE')
  })
})

describe('POST /api/compras/:id/send', () => {
  beforeEach(() => {
    setupComprasAuth()
  })

  it('marks draft order as sent', async () => {
    const prisma = buildPrismaMock({
      ordenCompra: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(ordenIncludeRow),
        create: vi.fn(),
        update: vi.fn().mockResolvedValue({ ...ordenIncludeRow, estado: 'sent' }),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).post('/api/compras/1/send').expect(200)
    expect(res.body.data.estado).toBe('sent')
  })
})

describe('POST /api/compras/:id/cancel', () => {
  beforeEach(() => {
    setupComprasAuth()
  })

  it('cancels sent order', async () => {
    const sentOrder = buildOrdenRow('sent')
    const prisma = buildPrismaMock({
      ordenCompra: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue({ id: 1, estado: 'sent' }),
        create: vi.fn(),
        update: vi.fn().mockResolvedValue({ ...sentOrder, estado: 'cancelled' }),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).post('/api/compras/1/cancel').expect(200)
    expect(res.body.data.estado).toBe('cancelled')
  })
})

describe('POST /api/compras/:id/receive', () => {
  beforeEach(() => {
    setupComprasAuth()
  })

  it('returns 403 without inventory.adjust', async () => {
    setupComprasAuth('seller')
    const app = createApp(buildPrismaMock())
    await request(app)
      .post('/api/compras/1/receive')
      .send({ lines: [{ itemId: 10, cantidad: 1 }] })
      .expect(403)
  })

  it('receives stock with audit when fully received', async () => {
    const sentOrder = buildOrdenRow('sent')
    const auditCreate = vi.fn().mockResolvedValue({ id: 1 })
    const prisma = buildPrismaMock({
      auditEvent: { create: auditCreate },
      ordenCompra: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(sentOrder),
        update: vi.fn().mockResolvedValue({
          ...sentOrder,
          estado: 'received',
          items: [{ ...sentOrder.items[0], cantidadRecibida: 5 }],
        }),
      },
    })
    prisma.$transaction = vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: PrismaClient) => Promise<unknown>)(prisma)
      }
      return fn
    }) as PrismaClient['$transaction']
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/compras/1/receive')
      .send({ lines: [{ itemId: 10, cantidad: 5 }] })
      .expect(200)
    expect(res.body.data.estado).toBe('received')
    expect(auditCreate).toHaveBeenCalled()
  })

  it('keeps estado sent on partial receive', async () => {
    const sentOrder = buildOrdenRow('sent')
    const prisma = buildPrismaMock({
      ordenCompra: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(sentOrder),
        update: vi.fn().mockResolvedValue({
          ...sentOrder,
          estado: 'sent',
          items: [{ ...sentOrder.items[0], cantidadRecibida: 2 }],
        }),
      },
    })
    prisma.$transaction = vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: PrismaClient) => Promise<unknown>)(prisma)
      }
      return fn
    }) as PrismaClient['$transaction']
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/compras/1/receive')
      .send({ lines: [{ itemId: 10, cantidad: 2 }] })
      .expect(200)
    expect(res.body.data.estado).toBe('sent')
    expect(prisma.stockAjuste.create).toHaveBeenCalled()
  })
})

describe('GET /api/compras/:id/pdf', () => {
  beforeEach(() => {
    setupComprasAuth()
  })

  it('returns application/pdf', async () => {
    const prisma = buildPrismaMock({
      proveedor: {
        findFirst: vi.fn().mockResolvedValue({
          id: 2,
          codigo: 1,
          rsocial: 'Prov SA',
          cuit: '30-71234567-8',
        }),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/compras/1/pdf').expect(200)
    expect(res.headers['content-type']).toMatch(/application\/pdf/)
    expect(res.body.subarray(0, 4).toString()).toBe('%PDF')
  })
})
