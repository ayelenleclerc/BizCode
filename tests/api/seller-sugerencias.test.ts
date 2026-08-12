import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'
import { clearSugerenciasMemoryCache } from '../../apps/server/lib/sugerenciasPedidoCache'
import {
  averagePedidoIntervalDays,
  daysBetween,
  discountPct,
  isFrequencyAnomaly,
  rankHabitualPurchases,
  roundSuggestedQty,
} from '../../apps/server/services/sugerenciasPedidoAlgo'

const NOW = new Date('2026-08-12T12:00:00.000Z')
const D14 = new Date('2026-07-29T12:00:00.000Z')
const D28 = new Date('2026-07-15T12:00:00.000Z')

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    cliente: {
      findFirst: vi.fn().mockResolvedValue({ id: 2 }),
    },
    pedido: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 3,
          createdAt: NOW,
          items: [
            { articuloId: 10, cantidad: { toString: () => '12' } },
            { articuloId: 11, cantidad: { toString: () => '6' } },
            { articuloId: null, cantidad: { toString: () => '1' } },
          ],
        },
        {
          id: 2,
          createdAt: D14,
          items: [
            { articuloId: 10, cantidad: { toString: () => '10' } },
            { articuloId: 12, cantidad: { toString: () => '4' } },
          ],
        },
        {
          id: 1,
          createdAt: D28,
          items: [{ articuloId: 10, cantidad: { toString: () => '8' } }],
        },
      ]),
    },
    articulo: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 10,
          descripcion: 'Leche',
          condIva: '1',
          activo: true,
          esPadre: false,
          tipo: 'articulo',
          precioLista1: { toString: () => '100.00' },
          stock: { toString: () => '50' },
          multiploVenta: { toString: () => '6' },
        },
        {
          id: 11,
          descripcion: 'Azucar',
          condIva: '1',
          activo: false,
          esPadre: false,
          tipo: 'articulo',
          precioLista1: { toString: () => '80.00' },
          stock: { toString: () => '10' },
          multiploVenta: null,
        },
        {
          id: 12,
          descripcion: 'Padre',
          condIva: '1',
          activo: true,
          esPadre: true,
          tipo: 'articulo',
          precioLista1: { toString: () => '50.00' },
          stock: { toString: () => '0' },
          multiploVenta: null,
        },
        {
          id: 20,
          descripcion: 'Yerba oferta',
          condIva: '1',
          activo: true,
          esPadre: false,
          tipo: 'articulo',
          precioLista1: { toString: () => '200.00' },
          stock: { toString: () => '30' },
          multiploVenta: null,
        },
      ]),
    },
    articuloOferta: {
      findMany: vi.fn().mockResolvedValue([
        {
          articuloId: 20,
          precioOferta: { toString: () => '170.00' },
          vigenciaHasta: new Date('2026-08-31T00:00:00.000Z'),
          articulo: {
            id: 20,
            descripcion: 'Yerba oferta',
            condIva: '1',
            activo: true,
            esPadre: false,
            tipo: 'articulo',
            precioLista1: { toString: () => '200.00' },
            stock: { toString: () => '30' },
            multiploVenta: null,
          },
        },
        {
          articuloId: 10,
          precioOferta: { toString: () => '90.00' },
          vigenciaHasta: new Date('2026-08-31T00:00:00.000Z'),
          articulo: {
            id: 10,
            descripcion: 'Leche',
            condIva: '1',
            activo: true,
            esPadre: false,
            tipo: 'articulo',
            precioLista1: { toString: () => '100.00' },
            stock: { toString: () => '50' },
            multiploVenta: { toString: () => '6' },
          },
        },
      ]),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('sugerenciasPedidoAlgo (#254)', () => {
  it('computes whole days between dates', () => {
    const a = new Date('2026-08-12T12:00:00.000Z')
    const b = new Date('2026-08-01T12:00:00.000Z')
    expect(daysBetween(a, b)).toBe(11)
    expect(daysBetween(b, a)).toBe(0)
  })

  it('averages pedido intervals and detects anomaly at 1.4×', () => {
    const dates = [
      new Date('2026-08-12T00:00:00.000Z'),
      new Date('2026-07-29T00:00:00.000Z'),
      new Date('2026-07-15T00:00:00.000Z'),
    ]
    expect(averagePedidoIntervalDays(dates)).toBe(14)
    expect(isFrequencyAnomaly(20, 14)).toBe(true)
    expect(isFrequencyAnomaly(14, 14)).toBe(false)
    expect(isFrequencyAnomaly(10, null)).toBe(false)
  })

  it('ranks by distinct pedido count then recency', () => {
    const ranked = rankHabitualPurchases([
      { articuloId: 1, pedidoId: 1, cantidad: 10, createdAt: new Date('2026-08-01') },
      { articuloId: 1, pedidoId: 2, cantidad: 12, createdAt: new Date('2026-08-10') },
      { articuloId: 2, pedidoId: 2, cantidad: 5, createdAt: new Date('2026-08-10') },
      { articuloId: 3, pedidoId: 3, cantidad: 1, createdAt: new Date('2026-08-11') },
      { articuloId: 3, pedidoId: 2, cantidad: 1, createdAt: new Date('2026-08-10') },
      { articuloId: 3, pedidoId: 1, cantidad: 1, createdAt: new Date('2026-08-01') },
    ])
    expect(ranked[0].articuloId).toBe(3)
    expect(ranked[1].articuloId).toBe(1)
    expect(ranked[2].articuloId).toBe(2)
    expect(ranked[0].recentCantidades).toEqual([1, 1, 1])
  })

  it('rounds suggested qty to multiploVenta', () => {
    expect(roundSuggestedQty(11.4, 6)).toBe(12)
    expect(roundSuggestedQty(2.4, null)).toBe(2)
    expect(roundSuggestedQty(0, 1)).toBe(1)
  })

  it('computes discount percent', () => {
    expect(discountPct(100, 85)).toBe(15)
    expect(discountPct(0, 10)).toBe(0)
  })
})

describe('GET sugerencias-pedido (#254)', () => {
  beforeEach(() => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    process.env.BIZCODE_TEST_USER_ID = '1'
    process.env.BIZCODE_TEST_TENANT_ID = '1'
    clearSugerenciasMemoryCache()
  })

  it('returns habituales omitting inactive/parent and offers excluding habituals', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/clientes/2/sugerencias-pedido')
    expect(res.status).toBe(200)
    expect(res.body.data.source).toBe('historial')
    expect(res.body.data.habituales.map((h: { articuloId: number }) => h.articuloId)).toEqual([10])
    expect(res.body.data.habituales[0].cantidadSugerida).toBe(12)
    expect(res.body.data.habituales[0].origenPrecio).toBe('oferta')
    expect(res.body.data.ofertas.map((o: { articuloId: number }) => o.articuloId)).toEqual([20])
    expect(res.body.data.ofertas[0].descuentoPct).toBe(15)
    assertMatchesOpenApi('/api/clientes/{id}/sugerencias-pedido', 'get', '200', res.body)
  })

  it('falls back to last pedido items when history has a single pedido', async () => {
    const prisma = buildPrismaMock({
      pedido: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 9,
            createdAt: NOW,
            items: [
              { articuloId: 10, cantidad: { toString: () => '12' } },
              { articuloId: 11, cantidad: { toString: () => '6' } },
            ],
          },
        ]),
      },
      articuloOferta: { findMany: vi.fn().mockResolvedValue([]) },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/2/sugerencias-pedido')
    expect(res.status).toBe(200)
    expect(res.body.data.source).toBe('ultimo_pedido')
    expect(res.body.data.habituales).toHaveLength(1)
    expect(res.body.data.habituales[0].frecuenciaDias).toBeNull()
    expect(res.body.data.habituales[0].anomalia).toBe(false)
  })

  it('returns vacio when there is no history', async () => {
    const prisma = buildPrismaMock({
      pedido: { findMany: vi.fn().mockResolvedValue([]) },
      articuloOferta: { findMany: vi.fn().mockResolvedValue([]) },
      articulo: { findMany: vi.fn().mockResolvedValue([]) },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/2/sugerencias-pedido')
    expect(res.status).toBe(200)
    expect(res.body.data).toEqual({ source: 'vacio', habituales: [], ofertas: [] })
    assertMatchesOpenApi('/api/clientes/{id}/sugerencias-pedido', 'get', '200', res.body)
  })

  it('returns 404 when cliente is missing', async () => {
    const prisma = buildPrismaMock({
      cliente: { findFirst: vi.fn().mockResolvedValue(null) },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/clientes/99/sugerencias-pedido')
    expect(res.status).toBe(404)
  })
})
