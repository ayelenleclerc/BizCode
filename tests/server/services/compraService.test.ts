import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { CompraService } from '../../../server/services/CompraService'

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  const ordenRow = {
    id: 1,
    tenantId: 1,
    proveedorId: 2,
    estado: 'sent',
    total: new Decimal(100),
    fechaEstimada: null,
    nota: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: [
      {
        id: 10,
        ordenCompraId: 1,
        articuloId: 5,
        cantidad: 10,
        cantidadRecibida: 0,
        costoUnitario: new Decimal(10),
        subtotal: new Decimal(100),
      },
    ],
  }

  return {
    proveedor: { findFirst: vi.fn().mockResolvedValue({ id: 2 }) },
    articulo: {
      count: vi.fn().mockResolvedValue(1),
      findFirst: vi.fn().mockResolvedValue({ id: 5, stock: 3 }),
      update: vi.fn().mockResolvedValue({ id: 5, stock: 8 }),
    },
    ordenCompra: {
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(ordenRow),
      create: vi.fn(),
      update: vi.fn().mockResolvedValue({
        ...ordenRow,
        estado: 'received',
        items: [{ ...ordenRow.items[0], cantidadRecibida: 10 }],
      }),
    },
    ordenCompraItem: {
      deleteMany: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
    },
    stockAjuste: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    $transaction: vi.fn(async (fn: (tx: PrismaClient) => Promise<unknown>) => fn(buildPrisma() as PrismaClient)),
    ...overrides,
  } as unknown as PrismaClient
}

describe('CompraService.receive', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejects quantity above pending', async () => {
    const prisma = buildPrisma()
    const svc = new CompraService(prisma)
    const result = await svc.receive(1, 1, 99, [{ itemId: 10, cantidad: 11 }])
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('RECEIVE_QUANTITY_EXCEEDS_PENDING')
  })

  it('applies partial receive and keeps estado sent', async () => {
    const orden = {
      id: 1,
      tenantId: 1,
      proveedorId: 2,
      estado: 'sent',
      items: [
        {
          id: 10,
          ordenCompraId: 1,
          articuloId: 5,
          cantidad: 10,
          cantidadRecibida: 0,
          costoUnitario: new Decimal(10),
          subtotal: new Decimal(100),
        },
      ],
    }
    const prisma = buildPrisma({
      ordenCompra: {
        findFirst: vi.fn().mockResolvedValue(orden),
        update: vi.fn().mockResolvedValue({
          ...orden,
          estado: 'sent',
          proveedor: { id: 2, codigo: 1, rsocial: 'P' },
          items: [
            {
              ...orden.items[0],
              cantidadRecibida: 4,
              articulo: { id: 5, codigo: 1, descripcion: 'X' },
            },
          ],
        }),
      },
    })
    prisma.$transaction = vi.fn(async (fn: unknown) => {
      if (typeof fn === 'function') {
        return (fn as (tx: PrismaClient) => Promise<unknown>)(prisma)
      }
      return fn
    }) as PrismaClient['$transaction']
    const svc = new CompraService(prisma)
    const result = await svc.receive(1, 1, 99, [{ itemId: 10, cantidad: 4 }])
    expect(result.ok).toBe(true)
    expect(prisma.stockAjuste.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ motivo: 'compra', cantidad: 4 }),
      }),
    )
  })
})
