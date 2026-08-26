import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { createCcTxLayer } from '../helpers/movimientoClienteCcPrismaMock'

const CLIENTE_BASE = {
  id: 1,
  codigo: 1001,
  rsocial: 'ACME SA',
  suspended: false,
  creditLimit: null,
  balance: 0,
}

const ARTICULO_STOCK = {
  id: 1,
  codigo: 10,
  descripcion: 'Producto',
  stock: 100,
  minimo: 8,
  tipo: 'articulo',
  condIva: '1',
  unidadServicio: null,
}

const FACTURA_BODY = {
  fecha: '2026-08-26',
  tipo: 'B' as const,
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
  items: [{ articuloId: 1, cantidad: 1, precio: 1000.0, dscto: 0, subtotal: 1000.0 }],
}

describe('POST /api/facturas — anomaly detection (#200)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
  })

  it('returns 422 DUPLICATE_INVOICE_CONFIRM_REQUIRED with warnings when duplicate exists', async () => {
    const prisma = {
      deliveryZone: { findFirst: vi.fn().mockResolvedValue(null) },
      cliente: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(CLIENTE_BASE),
      },
      articulo: { findMany: vi.fn().mockResolvedValue([ARTICULO_STOCK]) },
      rubro: { findMany: vi.fn().mockResolvedValue([]) },
      formaPago: { findMany: vi.fn().mockResolvedValue([]) },
      factura: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue({ id: 55 }),
        count: vi.fn().mockResolvedValue(2),
        create: vi.fn(),
      },
      anomaliaDetectada: { createMany: vi.fn() },
      cobro: { findMany: vi.fn().mockResolvedValue([]) },
      ordenEntrega: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
      paramEmpresa: { findUnique: vi.fn().mockResolvedValue(null) },
      notification: { findMany: vi.fn().mockResolvedValue([]), createMany: vi.fn() },
      auditEvent: { create: vi.fn() },
      recuento: { findFirst: vi.fn().mockResolvedValue(null) },
      appUser: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
      tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, name: 'Demo', slug: 'demo', active: true }) },
      $transaction: vi.fn(),
    } as unknown as PrismaClient

    const res = await request(createApp(prisma)).post('/api/facturas').send(FACTURA_BODY).expect(422)
    expect(res.body.error).toBe('DUPLICATE_INVOICE_CONFIRM_REQUIRED')
    expect(res.body.warnings?.some((w: { tipo: string }) => w.tipo === 'factura_duplicada')).toBe(true)
    expect(vi.mocked(prisma.factura.create)).not.toHaveBeenCalled()
  })

  it('creates invoice with soft descuento_excesivo warning and persists anomaly', async () => {
    const facturaCreate = vi.fn().mockResolvedValue({
      id: 99,
      ...FACTURA_BODY,
      estado: 'A',
      clienteId: 1,
      items: [{ id: 1, facturaId: 99, articuloId: 1, cantidad: 1, precio: 1000, dscto: 40, subtotal: 600 }],
      cliente: CLIENTE_BASE,
      total: 600,
    })
    const createMany = vi.fn().mockResolvedValue({ count: 1 })
    const auditCreate = vi.fn().mockResolvedValue({ id: 1 })
    const articuloUpdate = vi.fn().mockResolvedValue({ ...ARTICULO_STOCK, stock: 99 })

    const body = {
      ...FACTURA_BODY,
      numero: 2,
      items: [{ articuloId: 1, cantidad: 1, precio: 1000.0, dscto: 40, subtotal: 600.0 }],
      total: 600,
      neto1: 495.87,
      iva1: 104.13,
    }

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
      factura: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue(null),
        count: vi.fn().mockResolvedValue(0),
      },
      anomaliaDetectada: { createMany },
      cobro: { findMany: vi.fn().mockResolvedValue([]) },
      ordenEntrega: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
      paramEmpresa: { findUnique: vi.fn().mockResolvedValue(null) },
      notification: { findMany: vi.fn().mockResolvedValue([]), createMany: vi.fn().mockResolvedValue({ count: 0 }) },
      auditEvent: { create: auditCreate },
      recuento: { findFirst: vi.fn().mockResolvedValue(null) },
      appUser: { count: vi.fn().mockResolvedValue(0), findMany: vi.fn().mockResolvedValue([]) },
      tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, name: 'Demo', slug: 'demo', active: true }) },
      $transaction: vi.fn(async (fn: unknown) => {
        if (typeof fn === 'function') {
          return fn(
            createCcTxLayer({
              factura: { create: facturaCreate },
              articulo: { update: articuloUpdate },
            }),
          )
        }
        return fn
      }),
    } as unknown as PrismaClient

    const res = await request(createApp(prisma)).post('/api/facturas').send(body).expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.warnings?.some((w: { tipo: string }) => w.tipo === 'descuento_excesivo')).toBe(true)
    expect(createMany).toHaveBeenCalled()
    expect(auditCreate.mock.calls.some((c) => c[0]?.data?.action === 'factura_anomaly_detected')).toBe(
      true,
    )
  })
})
