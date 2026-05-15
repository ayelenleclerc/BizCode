import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'

const CLIENTE_BASE = { id: 1, codigo: 1001, rsocial: 'ACME SA', suspended: false }

const ARTICULO_STOCK = {
  id: 1,
  codigo: 10,
  descripcion: 'Producto',
  stock: 10,
  minimo: 8,
}

const FACTURA_BODY = {
  fecha: new Date().toISOString(),
  tipo: 'B',
  prefijo: '0001',
  numero: 1,
  clienteId: 1,
  neto1: 826.45,
  neto2: 0,
  neto3: 0,
  iva1: 173.55,
  iva2: 0,
  total: 1000.0,
  formaPagoId: null,
  estado: 'A',
  items: [{ articuloId: 1, cantidad: 3, precio: 500.0, dscto: 0, subtotal: 1000.0 }],
}

const FACTURA_RESULT = {
  id: 99,
  ...FACTURA_BODY,
  items: FACTURA_BODY.items.map((i, idx) => ({ id: idx + 1, facturaId: 99, ...i })),
  cliente: CLIENTE_BASE,
}

describe('POST /api/facturas — stock', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
  })

  it('decrements articulo stock in transaction', async () => {
    const articuloUpdate = vi.fn().mockResolvedValue({ ...ARTICULO_STOCK, stock: 7 })
    const facturaCreate = vi.fn().mockResolvedValue(FACTURA_RESULT)
    const clienteUpdate = vi.fn().mockResolvedValue({
      id: 1,
      rsocial: 'ACME SA',
      balance: '1000.00',
      creditLimit: null,
    })

    const prisma = {
      deliveryZone: { findFirst: vi.fn().mockResolvedValue(null) },
      cliente: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(CLIENTE_BASE),
      },
      articulo: {
        findMany: vi.fn().mockResolvedValue([ARTICULO_STOCK]),
        update: articuloUpdate,
      },
      rubro: { findMany: vi.fn().mockResolvedValue([]) },
      formaPago: { findMany: vi.fn().mockResolvedValue([]) },
      factura: { findMany: vi.fn().mockResolvedValue([]) },
      cobro: { findMany: vi.fn().mockResolvedValue([]) },
      ordenEntrega: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
      paramEmpresa: { findUnique: vi.fn().mockResolvedValue(null) },
      notification: { findMany: vi.fn().mockResolvedValue([]), createMany: vi.fn().mockResolvedValue({ count: 0 }) },
      auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
      appUser: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
      tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, name: 'Demo', slug: 'demo', active: true }) },
      $transaction: vi.fn(async (fn: unknown) => {
        if (typeof fn === 'function') {
          return fn({
            factura: { create: facturaCreate },
            cliente: { update: clienteUpdate },
            articulo: { update: articuloUpdate },
          })
        }
        return fn
      }),
    } as unknown as PrismaClient

    const app = createApp(prisma)
    await request(app).post('/api/facturas').send(FACTURA_BODY).expect(200)

    expect(articuloUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 1 },
        data: { stock: { decrement: 3 } },
      }),
    )
  })

  it('returns 422 INSUFFICIENT_STOCK when quantity exceeds available stock', async () => {
    const prisma = {
      deliveryZone: { findFirst: vi.fn().mockResolvedValue(null) },
      cliente: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(CLIENTE_BASE),
      },
      articulo: { findMany: vi.fn().mockResolvedValue([{ ...ARTICULO_STOCK, stock: 1 }]) },
      rubro: { findMany: vi.fn().mockResolvedValue([]) },
      formaPago: { findMany: vi.fn().mockResolvedValue([]) },
      factura: { findMany: vi.fn().mockResolvedValue([]) },
      cobro: { findMany: vi.fn().mockResolvedValue([]) },
      ordenEntrega: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
      paramEmpresa: { findUnique: vi.fn().mockResolvedValue(null) },
      notification: { findMany: vi.fn().mockResolvedValue([]), createMany: vi.fn() },
      auditEvent: { create: vi.fn() },
      appUser: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
      tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, name: 'Demo', slug: 'demo', active: true }) },
      $transaction: vi.fn(),
    } as unknown as PrismaClient

    const res = await request(createApp(prisma))
      .post('/api/facturas')
      .send({ ...FACTURA_BODY, items: [{ ...FACTURA_BODY.items[0], cantidad: 5 }] })
      .expect(422)

    expect(res.body.error).toBe('INSUFFICIENT_STOCK')
  })
})
