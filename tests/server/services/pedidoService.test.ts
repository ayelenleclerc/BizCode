import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { PedidoService } from '../../../apps/server/services/PedidoService'

const basePedidoInput = {
  clienteId: 3,
  items: [{ articuloId: 7, cantidad: 2, precio: 50, dscto: 0, subtotal: 100 }],
}

describe('PedidoService', () => {
  let prisma: PrismaClient
  let service: PedidoService

  beforeEach(() => {
    prisma = {
      cliente: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
      articulo: {
        findMany: vi.fn().mockResolvedValue([]),
      },
      appUser: { findFirst: vi.fn() },
      pedido: {
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        count: vi.fn(),
        findMany: vi.fn(),
      },
      pedidoItem: { deleteMany: vi.fn() },
      $transaction: vi.fn(),
    } as unknown as PrismaClient
    service = new PedidoService(prisma)
  })

  it('rejects create when clienteId is not in tenant', async () => {
    const result = await service.create(1, basePedidoInput)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(400)
      expect(result.error).toContain('clienteId')
    }
    expect(prisma.pedido.create).not.toHaveBeenCalled()
  })

  it('rejects confirm when pedido is not draft', async () => {
    vi.mocked(prisma.pedido.findFirst).mockResolvedValue({ id: 1, estado: 'confirmed' } as never)

    const result = await service.confirm(1, 1)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(409)
      expect(result.error).toBe('INVALID_STATE_TRANSITION')
    }
  })

  it('rejects cancel when pedido is invoiced', async () => {
    vi.mocked(prisma.pedido.findFirst).mockResolvedValue({ id: 1, estado: 'invoiced' } as never)

    const result = await service.cancel(1, 1)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(409)
      expect(result.error).toBe('INVOICED_PEDIDO_CANNOT_CANCEL')
    }
  })

  it('packs from confirmed', async () => {
    vi.mocked(prisma.pedido.findFirst).mockResolvedValue({ id: 1, estado: 'confirmed' } as never)
    vi.mocked(prisma.pedido.update).mockResolvedValue({ id: 1, estado: 'packed' } as never)

    const result = await service.pack(1, 1)

    expect(result.ok).toBe(true)
    expect(prisma.pedido.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { estado: 'packed' } }),
    )
  })

  it('rejects collect when factura is not fully paid', async () => {
    const prismaExtended = {
      ...prisma,
      factura: {
        findFirst: vi.fn().mockResolvedValue({
          id: 9,
          clienteId: 3,
          total: { minus: () => ({ lessThanOrEqualTo: () => false }) },
        }),
      },
      reciboCobroImputacion: {
        aggregate: vi.fn().mockResolvedValue({ _sum: { importe: null } }),
      },
      pedido: {
        ...prisma.pedido,
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          estado: 'invoiced',
          facturaId: 9,
        }),
      },
    } as unknown as PrismaClient
    const svc = new PedidoService(prismaExtended)

    const result = await svc.collect(1, 1)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('FACTURA_NOT_FULLY_PAID')
    }
  })
})
