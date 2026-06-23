import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { ConflictAppError, NotFoundAppError } from '../../../apps/server/errors/AppError'
import { ProveedorCatalogoService } from '../../../apps/server/services/ProveedorCatalogoService'

const articuloRef = { id: 10, codigo: 1001, descripcion: 'Aceite 1L' }

const catalogRow = {
  id: 1,
  tenantId: 1,
  proveedorId: 5,
  articuloId: 10,
  codigoProveedor: 'AG-1000',
  descripcion: 'Aceite girasol',
  precioLista: new Decimal(1250),
  precioListaFecha: new Date('2026-06-01T00:00:00.000Z'),
  unidadCompra: 'caja x12',
  multiplo: new Decimal(6),
  activo: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  articulo: articuloRef,
}

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    proveedor: {
      findFirst: vi.fn().mockResolvedValue({ id: 5 }),
    },
    articulo: {
      findFirst: vi.fn().mockResolvedValue({ id: 10 }),
    },
    proveedorArticulo: {
      findMany: vi.fn().mockResolvedValue([catalogRow]),
      findFirst: vi.fn().mockResolvedValue(catalogRow),
      create: vi.fn().mockResolvedValue(catalogRow),
      update: vi.fn().mockResolvedValue({ ...catalogRow, precioLista: new Decimal(1300) }),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('ProveedorCatalogoService (#273)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when listing catalog for missing proveedor', async () => {
    const prisma = buildPrisma({
      proveedor: { findFirst: vi.fn().mockResolvedValue(null) },
    })
    const svc = new ProveedorCatalogoService(prisma)
    const result = await svc.listCatalogo(1, 99)
    expect(result).toBeNull()
  })

  it('lists catalog entries for proveedor', async () => {
    const prisma = buildPrisma()
    const svc = new ProveedorCatalogoService(prisma)
    const rows = (await svc.listCatalogo(1, 5))!
    expect(rows).toHaveLength(1)
    expect(rows[0]?.codigoProveedor).toBe('AG-1000')
    expect(rows[0]?.precioLista).toBe('1250.00')
    expect(rows[0]?.articulo.codigo).toBe(1001)
  })

  it('finds entry by supplier code', async () => {
    const prisma = buildPrisma()
    const svc = new ProveedorCatalogoService(prisma)
    const row = await svc.findByCodigoProveedor(1, 5, 'AG-1000')
    expect(row?.articuloId).toBe(10)
  })

  it('finds entry by articuloId', async () => {
    const prisma = buildPrisma()
    const svc = new ProveedorCatalogoService(prisma)
    const row = await svc.findByArticuloId(1, 5, 10)
    expect(row?.codigoProveedor).toBe('AG-1000')
  })

  it('creates catalog entry with price date when precioLista is set', async () => {
    const create = vi.fn().mockResolvedValue(catalogRow)
    const prisma = buildPrisma({
      proveedorArticulo: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create,
        update: vi.fn(),
      },
    })
    const svc = new ProveedorCatalogoService(prisma)
    await svc.createEntry(1, 5, {
      articuloId: 10,
      codigoProveedor: 'AG-1000',
      precioLista: 1250,
      multiplo: 6,
    })
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 1,
          proveedorId: 5,
          articuloId: 10,
          precioLista: expect.any(Decimal),
          precioListaFecha: expect.any(Date),
        }),
      }),
    )
  })

  it('throws NotFound when articulo does not exist on create', async () => {
    const prisma = buildPrisma({
      articulo: { findFirst: vi.fn().mockResolvedValue(null) },
    })
    const svc = new ProveedorCatalogoService(prisma)
    await expect(
      svc.createEntry(1, 5, { articuloId: 99, codigoProveedor: 'X' }),
    ).rejects.toBeInstanceOf(NotFoundAppError)
  })

  it('throws Conflict on duplicate unique key', async () => {
    const prisma = buildPrisma({
      proveedorArticulo: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn().mockRejectedValue({ code: 'P2002' }),
        update: vi.fn(),
      },
    })
    const svc = new ProveedorCatalogoService(prisma)
    await expect(
      svc.createEntry(1, 5, { articuloId: 10, codigoProveedor: 'AG-1000' }),
    ).rejects.toBeInstanceOf(ConflictAppError)
  })

  it('updates precioLista and refreshes precioListaFecha', async () => {
    const update = vi.fn().mockResolvedValue({
      ...catalogRow,
      precioLista: new Decimal(1300),
      precioListaFecha: new Date('2026-06-08T00:00:00.000Z'),
    })
    const prisma = buildPrisma({
      proveedorArticulo: {
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(catalogRow),
        create: vi.fn(),
        update,
      },
    })
    const svc = new ProveedorCatalogoService(prisma)
    const row = await svc.updateEntry(1, 5, 10, { precioLista: 1300 })
    expect(row.precioLista).toBe('1300.00')
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          precioLista: expect.any(Decimal),
          precioListaFecha: expect.any(Date),
        }),
      }),
    )
  })

  it('throws NotFound when updating missing catalog entry', async () => {
    const prisma = buildPrisma({
      proveedorArticulo: {
        findMany: vi.fn(),
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    const svc = new ProveedorCatalogoService(prisma)
    await expect(svc.updateEntry(1, 5, 10, { precioLista: 100 })).rejects.toBeInstanceOf(
      NotFoundAppError,
    )
  })
})
