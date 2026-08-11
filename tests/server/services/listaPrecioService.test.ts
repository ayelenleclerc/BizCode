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

describe('ListaPrecioService CRUD (#234)', () => {
  const now = new Date('2026-07-21T12:00:00.000Z')

  function fullLista(overrides: Record<string, unknown> = {}) {
    return {
      ...baseLista({
        createdAt: now,
        updatedAt: now,
        items: [],
        ...overrides,
      }),
    }
  }

  beforeEach(() => vi.clearAllMocks())

  it('lists rows with item and customer counts', async () => {
    const prisma = buildPrisma({
      listaPrecio: {
        count: vi.fn().mockResolvedValue(1),
        findMany: vi.fn().mockResolvedValue([
          {
            ...fullLista(),
            items: [{ id: 1 }],
            clientes: [{ id: 9 }],
          },
        ]),
      },
    })
    const svc = new ListaPrecioService(prisma)
    const res = await svc.list(TENANT, 50, 0, { activa: true })
    expect(res.total).toBe(1)
    expect(res.rows[0]?._count).toEqual({ items: 1, clientes: 1 })
  })

  it('gets by id and returns 404 when missing', async () => {
    const prisma = buildPrisma({
      listaPrecio: { findFirst: vi.fn().mockResolvedValue(fullLista()) },
    })
    const svc = new ListaPrecioService(prisma)
    const ok = await svc.getById(TENANT, 2)
    expect(ok.ok).toBe(true)

    const missing = buildPrisma({ listaPrecio: { findFirst: vi.fn().mockResolvedValue(null) } })
    const notFound = await new ListaPrecioService(missing).getById(TENANT, 99)
    expect(notFound.ok).toBe(false)
    if (!notFound.ok) expect(notFound.status).toBe(404)
  })

  it('creates a default list clearing previous defaults', async () => {
    const updateMany = vi.fn().mockResolvedValue({ count: 1 })
    const create = vi.fn().mockResolvedValue(fullLista({ esDefault: true, items: [] }))
    const prisma = buildPrisma({
      $transaction: vi.fn(async (fn: unknown) =>
        (fn as (t: unknown) => unknown)({
          listaPrecio: { updateMany, create },
        }),
      ),
    })
    const svc = new ListaPrecioService(prisma)
    const res = await svc.create(TENANT, {
      nombre: 'Default',
      moneda: 'ARS',
      activa: true,
      esDefault: true,
      vigenciaHasta: null,
    })
    expect(res.ok).toBe(true)
    expect(updateMany).toHaveBeenCalled()
    expect(create).toHaveBeenCalled()
  })

  it('updates a list and rejects delete when customers are assigned', async () => {
    const prisma = buildPrisma({
      listaPrecio: {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce(fullLista())
          .mockResolvedValueOnce({ ...fullLista(), clientes: [{ id: 1 }] }),
        update: vi.fn().mockResolvedValue(fullLista({ activa: false, items: [] })),
        delete: vi.fn(),
      },
      $transaction: vi.fn(async (fn: unknown) =>
        (fn as (t: unknown) => unknown)({
          listaPrecio: {
            updateMany: vi.fn(),
            update: vi.fn().mockResolvedValue(fullLista({ activa: false, items: [] })),
          },
        }),
      ),
    })
    const svc = new ListaPrecioService(prisma)
    const updated = await svc.update(TENANT, 2, { activa: false })
    expect(updated.ok).toBe(true)

    const blocked = await svc.remove(TENANT, 2)
    expect(blocked.ok).toBe(false)
    if (!blocked.ok) expect(blocked.status).toBe(409)
  })

  it('removes an empty list and upserts then removes an item', async () => {
    const deleteLista = vi.fn().mockResolvedValue({})
    const deleteItem = vi.fn().mockResolvedValue({})
    const createdItem = {
      id: 11,
      tenantId: TENANT,
      listaPrecioId: 2,
      articuloId: 5,
      tipoPrecio: 'fijo',
      precio: new Decimal(80),
      porcentaje: null,
      createdAt: now,
      updatedAt: now,
      escalonados: [],
      articulo: { id: 5, codigo: 100, descripcion: 'A' },
    }
    const prisma = buildPrisma({
      listaPrecio: {
        findFirst: vi
          .fn()
          .mockResolvedValueOnce({ ...fullLista(), clientes: [] })
          .mockResolvedValueOnce(fullLista()),
        delete: deleteLista,
      },
      articulo: { findFirst: vi.fn().mockResolvedValue({ id: 5 }) },
      listaPrecioItem: {
        findFirst: vi.fn().mockResolvedValue({ id: 11 }),
        delete: deleteItem,
        findUnique: vi.fn().mockResolvedValue(null),
        create: vi.fn(),
        update: vi.fn(),
        findUniqueOrThrow: vi.fn(),
      },
      $transaction: vi.fn(async (fn: unknown) =>
        (fn as (t: unknown) => unknown)({
          listaPrecioItem: {
            findUnique: vi.fn().mockResolvedValue(null),
            create: vi.fn().mockResolvedValue({ id: 11 }),
            update: vi.fn(),
            findUniqueOrThrow: vi.fn().mockResolvedValue(createdItem),
          },
          precioEscalonado: {
            deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
            createMany: vi.fn().mockResolvedValue({ count: 0 }),
          },
        }),
      ),
    })
    const svc = new ListaPrecioService(prisma)

    const removed = await svc.remove(TENANT, 2)
    expect(removed.ok).toBe(true)
    expect(deleteLista).toHaveBeenCalled()

    const upserted = await svc.upsertItem(TENANT, 2, {
      articuloId: 5,
      tipoPrecio: 'fijo',
      precio: 80,
      porcentaje: null,
      escalonados: [],
    })
    expect(upserted.ok).toBe(true)

    const itemGone = await svc.removeItem(TENANT, 2, 11)
    expect(itemGone.ok).toBe(true)
    expect(deleteItem).toHaveBeenCalled()
  })
})
