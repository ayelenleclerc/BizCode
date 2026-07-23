import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { ListaPrecioService } from '../../../apps/server/services/ListaPrecioService'

const TENANT = 1

function articulo(precioLista1 = 100) {
  return { id: 5, precioLista1: new Decimal(precioLista1) }
}

function baseLista(overrides: Record<string, unknown> = {}) {
  return {
    id: 2,
    tenantId: TENANT,
    nombre: 'Mayorista',
    moneda: 'USD',
    activa: true,
    esDefault: false,
    vigenciaHasta: null as Date | null,
    items: [] as unknown[],
    ...overrides,
  }
}

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    articulo: { findFirst: vi.fn().mockResolvedValue(articulo()) },
    listaPrecio: { findFirst: vi.fn().mockResolvedValue(null) },
    listaPrecioItem: { update: vi.fn() },
    precioEscalonado: { update: vi.fn() },
    $transaction: vi.fn(async (arg: unknown) =>
      typeof arg === 'function' ? (arg as (t: unknown) => unknown)({}) : arg,
    ),
    ...overrides,
  } as unknown as PrismaClient
}

describe('ListaPrecioService.getPrecioEfectivo (#234)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('falls back to base price when no list is provided', async () => {
    const svc = new ListaPrecioService(buildPrisma())
    const res = await svc.getPrecioEfectivo(TENANT, 5, undefined, 1)
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.data.origen).toBe('base')
      expect(res.data.precio).toBe(100)
      expect(res.data.precioBase).toBe(100)
    }
  })

  it('returns 404 when the article does not belong to the tenant', async () => {
    const prisma = buildPrisma({ articulo: { findFirst: vi.fn().mockResolvedValue(null) } })
    const svc = new ListaPrecioService(prisma)
    const res = await svc.getPrecioEfectivo(TENANT, 999, 2, 1)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.status).toBe(404)
  })

  it('resolves a fixed list item price', async () => {
    const lista = baseLista({
      items: [{ tipoPrecio: 'fijo', precio: new Decimal(80), porcentaje: null, escalonados: [] }],
    })
    const prisma = buildPrisma({ listaPrecio: { findFirst: vi.fn().mockResolvedValue(lista) } })
    const svc = new ListaPrecioService(prisma)
    const res = await svc.getPrecioEfectivo(TENANT, 5, 2, 1)
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.data.origen).toBe('fijo')
      expect(res.data.precio).toBe(80)
      expect(res.data.moneda).toBe('USD')
    }
  })

  it('resolves a percentage-over-base list item', async () => {
    const lista = baseLista({
      items: [
        { tipoPrecio: 'porcentaje_sobre_base', precio: null, porcentaje: new Decimal(10), escalonados: [] },
      ],
    })
    const prisma = buildPrisma({ listaPrecio: { findFirst: vi.fn().mockResolvedValue(lista) } })
    const svc = new ListaPrecioService(prisma)
    const res = await svc.getPrecioEfectivo(TENANT, 5, 2, 1)
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.data.origen).toBe('porcentaje_sobre_base')
      expect(res.data.precio).toBe(110)
    }
  })

  it('prefers a matching quantity tier over the item price', async () => {
    const lista = baseLista({
      items: [
        {
          tipoPrecio: 'fijo',
          precio: new Decimal(80),
          porcentaje: null,
          escalonados: [
            { cantidadDesde: new Decimal(10), cantidadHasta: null, precio: new Decimal(60) },
            { cantidadDesde: new Decimal(1), cantidadHasta: new Decimal(9), precio: new Decimal(75) },
          ],
        },
      ],
    })
    const prisma = buildPrisma({ listaPrecio: { findFirst: vi.fn().mockResolvedValue(lista) } })
    const svc = new ListaPrecioService(prisma)
    const res = await svc.getPrecioEfectivo(TENANT, 5, 2, 12)
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.data.origen).toBe('escalonado')
      expect(res.data.precio).toBe(60)
    }
  })

  it('treats an expired list as base price', async () => {
    const lista = baseLista({
      vigenciaHasta: new Date('2020-01-01T00:00:00.000Z'),
      items: [{ tipoPrecio: 'fijo', precio: new Decimal(80), porcentaje: null, escalonados: [] }],
    })
    const prisma = buildPrisma({ listaPrecio: { findFirst: vi.fn().mockResolvedValue(lista) } })
    const svc = new ListaPrecioService(prisma)
    const res = await svc.getPrecioEfectivo(TENANT, 5, 2, 1)
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.data.origen).toBe('base')
  })
})

describe('ListaPrecioService.bulkUpdate (#234)', () => {
  beforeEach(() => vi.clearAllMocks())

  it('previews affected items without persisting', async () => {
    const lista = baseLista({
      items: [
        { id: 11, articuloId: 5, precio: new Decimal(100), escalonados: [], articulo: { descripcion: 'Item' } },
      ],
    })
    const itemUpdate = vi.fn()
    const prisma = buildPrisma({
      listaPrecio: { findFirst: vi.fn().mockResolvedValue(lista) },
      listaPrecioItem: { update: itemUpdate },
    })
    const svc = new ListaPrecioService(prisma)
    const res = await svc.bulkUpdate(TENANT, 2, 10, true)
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.data.preview).toBe(true)
      expect(res.data.afectados).toBe(1)
      expect(res.data.ejemplos[0]?.precioNuevo).toBe(110)
    }
    expect(itemUpdate).not.toHaveBeenCalled()
  })

  it('applies the percentage to items and tiers', async () => {
    const lista = baseLista({
      items: [
        {
          id: 11,
          articuloId: 5,
          precio: new Decimal(100),
          escalonados: [{ id: 91, precio: new Decimal(90) }],
          articulo: { descripcion: 'Item' },
        },
      ],
    })
    const itemUpdate = vi.fn().mockResolvedValue({})
    const escUpdate = vi.fn().mockResolvedValue({})
    const prisma = buildPrisma({
      listaPrecio: { findFirst: vi.fn().mockResolvedValue(lista) },
      $transaction: vi.fn(async (fn: unknown) =>
        (fn as (t: unknown) => unknown)({
          listaPrecioItem: { update: itemUpdate },
          precioEscalonado: { update: escUpdate },
        }),
      ),
    })
    const svc = new ListaPrecioService(prisma)
    const res = await svc.bulkUpdate(TENANT, 2, 10, false)
    expect(res.ok).toBe(true)
    expect(itemUpdate).toHaveBeenCalledTimes(1)
    expect(escUpdate).toHaveBeenCalledTimes(1)
  })

  it('returns 404 when the list is missing', async () => {
    const prisma = buildPrisma({ listaPrecio: { findFirst: vi.fn().mockResolvedValue(null) } })
    const svc = new ListaPrecioService(prisma)
    const res = await svc.bulkUpdate(TENANT, 999, 10, true)
    expect(res.ok).toBe(false)
    if (!res.ok) expect(res.status).toBe(404)
  })
})
