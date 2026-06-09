import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { ArticuloProveedoresComparadorService } from '../../../server/services/ArticuloProveedoresComparadorService'

const articulo = { id: 10, codigo: 1001, descripcion: 'Aceite 1L' }

const entryA = {
  id: 1,
  tenantId: 1,
  proveedorId: 5,
  articuloId: 10,
  codigoProveedor: 'AG-1000',
  descripcion: 'Aceite A',
  precioLista: new Decimal(1250),
  precioListaFecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  unidadCompra: null,
  multiplo: new Decimal(1),
  activo: true,
  proveedor: { id: 5, codigo: 4001, rsocial: 'Proveedor A SA' },
}

const entryB = {
  ...entryA,
  id: 2,
  proveedorId: 6,
  codigoProveedor: 'GR1LT',
  descripcion: 'Aceite B',
  precioLista: new Decimal(1340),
  precioListaFecha: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
  proveedor: { id: 6, codigo: 4002, rsocial: 'Proveedor B SA' },
}

const entrySinPrecio = {
  ...entryA,
  id: 3,
  proveedorId: 7,
  codigoProveedor: '—',
  descripcion: null,
  precioLista: null,
  precioListaFecha: null,
  proveedor: { id: 7, codigo: 4003, rsocial: 'Proveedor C SA' },
}

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    articulo: {
      findFirst: vi.fn().mockResolvedValue(articulo),
    },
    proveedorArticulo: {
      findMany: vi.fn().mockResolvedValue([entryB, entrySinPrecio, entryA]),
    },
    ordenCompra: {
      groupBy: vi.fn().mockResolvedValue([
        { proveedorId: 5, _max: { updatedAt: new Date('2026-05-20T00:00:00.000Z') } },
        { proveedorId: 6, _max: { updatedAt: new Date('2026-04-01T00:00:00.000Z') } },
      ]),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('ArticuloProveedoresComparadorService (#274)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when articulo is missing', async () => {
    const prisma = buildPrisma({
      articulo: { findFirst: vi.fn().mockResolvedValue(null) },
    })
    const svc = new ArticuloProveedoresComparadorService(prisma)
    const result = await svc.listProveedoresForArticulo(1, 99)
    expect(result).toBeNull()
  })

  it('lists active suppliers with catalog entry and last purchase date', async () => {
    const prisma = buildPrisma()
    const svc = new ArticuloProveedoresComparadorService(prisma)
    const result = await svc.listProveedoresForArticulo(1, 10)
    expect(result).not.toBeNull()
    expect(result!.articuloCodigo).toBe(1001)
    expect(result!.proveedores).toHaveLength(3)
    const provA = result!.proveedores.find((r) => r.proveedorId === 5)
    expect(provA?.ultimaCompraFecha).toBe('2026-05-20T00:00:00.000Z')
    expect(provA?.precioLista).toBe('1250.00')
  })

  it('marks cheapest supplier and outdated price badge', async () => {
    const prisma = buildPrisma()
    const svc = new ArticuloProveedoresComparadorService(prisma)
    const result = (await svc.listProveedoresForArticulo(1, 10))!
    expect(result.proveedorMasBaratoId).toBe(5)
    const cheapest = result.proveedores.find((r) => r.proveedorId === 5)
    const stale = result.proveedores.find((r) => r.proveedorId === 6)
    const sinPrecio = result.proveedores.find((r) => r.proveedorId === 7)
    expect(cheapest?.esMasBarato).toBe(true)
    expect(stale?.precioDesactualizado).toBe(true)
    expect(cheapest?.precioDesactualizado).toBe(false)
    expect(sinPrecio?.precioLista).toBeNull()
  })

  it('sorts by precio ascending with null prices last', async () => {
    const prisma = buildPrisma()
    const svc = new ArticuloProveedoresComparadorService(prisma)
    const result = (await svc.listProveedoresForArticulo(1, 10, {
      sortBy: 'precio',
      sortDir: 'asc',
    }))!
    const prices = result.proveedores.map((r) => r.precioLista)
    expect(prices[0]).toBe('1250.00')
    expect(prices[1]).toBe('1340.00')
    expect(prices[2]).toBeNull()
  })

  it('sorts by ultimaCompra descending', async () => {
    const prisma = buildPrisma()
    const svc = new ArticuloProveedoresComparadorService(prisma)
    const result = (await svc.listProveedoresForArticulo(1, 10, {
      sortBy: 'ultimaCompra',
      sortDir: 'desc',
    }))!
    expect(result.proveedores[0]?.proveedorId).toBe(5)
    expect(result.proveedores[1]?.proveedorId).toBe(6)
  })

  it('queries only active catalog entries for active suppliers', async () => {
    const prisma = buildPrisma()
    const svc = new ArticuloProveedoresComparadorService(prisma)
    await svc.listProveedoresForArticulo(1, 10)
    expect(prisma.proveedorArticulo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          tenantId: 1,
          articuloId: 10,
          activo: true,
          proveedor: { activo: true, tenantId: 1 },
        }),
      }),
    )
  })
})
