import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { CompraService } from '../../../apps/server/services/CompraService'
import type { ProveedorCatalogoService } from '../../../apps/server/services/ProveedorCatalogoService'

function buildPrisma(): PrismaClient {
  const createdItems: Array<Record<string, unknown>> = []
  return {
    proveedor: { findFirst: vi.fn().mockResolvedValue({ id: 2 }) },
    articulo: { count: vi.fn().mockResolvedValue(1) },
    ordenCompra: {
      create: vi.fn().mockImplementation(({ data }) => {
        if (data.items?.create) {
          createdItems.push(...data.items.create)
        }
        return Promise.resolve({
          id: 1,
          tenantId: 1,
          proveedorId: data.proveedorId,
          estado: 'draft',
          total: data.total,
          fechaEstimada: null,
          nota: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          proveedor: { id: 2, codigo: 1, rsocial: 'P' },
          items: createdItems.map((item, idx) => ({
            id: idx + 1,
            ordenCompraId: 1,
            ...item,
            cantidadRecibida: 0,
            articulo: { id: item.articuloId, codigo: 100, descripcion: 'X' },
          })),
        })
      }),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    ordenCompraItem: { deleteMany: vi.fn() },
    $transaction: vi.fn(async (fn: (tx: PrismaClient) => Promise<unknown>) => fn(buildPrisma())),
  } as unknown as PrismaClient
}

describe('CompraService catalog snapshot', () => {
  let catalogo: Pick<ProveedorCatalogoService, 'findByArticuloId'>

  beforeEach(() => {
    catalogo = {
      findByArticuloId: vi.fn().mockResolvedValue({
        id: 1,
        articuloId: 5,
        codigoProveedor: 'PROV-001',
        descripcion: 'Descripción proveedor',
        precioLista: '12.50',
        precioListaFecha: null,
        unidadCompra: null,
        multiplo: '1.00',
        activo: true,
        articulo: { id: 5, codigo: 100, descripcion: 'Interno' },
      }),
    }
  })

  it('create snapshots catalog fields on line items', async () => {
    const prisma = buildPrisma()
    const svc = new CompraService(prisma, catalogo as ProveedorCatalogoService)
    const result = await svc.create(1, {
      proveedorId: 2,
      items: [{ articuloId: 5, cantidad: 2, costoUnitario: 12.5 }],
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.items[0]?.codigoProveedor).toBe('PROV-001')
      expect(result.data.items[0]?.descripcionProveedor).toBe('Descripción proveedor')
    }
    expect(catalogo.findByArticuloId).toHaveBeenCalledWith(1, 2, 5)
  })

  it('create leaves snapshot null when catalog entry missing', async () => {
    catalogo.findByArticuloId = vi.fn().mockResolvedValue(null)
    const prisma = buildPrisma()
    const svc = new CompraService(prisma, catalogo as ProveedorCatalogoService)
    const result = await svc.create(1, {
      proveedorId: 2,
      items: [{ articuloId: 5, cantidad: 1, costoUnitario: 10 }],
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.items[0]?.codigoProveedor).toBeNull()
      expect(result.data.items[0]?.descripcionProveedor).toBeNull()
    }
  })
})
