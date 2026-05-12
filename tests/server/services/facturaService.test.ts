import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { FacturaService } from '../../../server/services/FacturaService'

const baseFacturaInput = {
  fecha: '2026-05-01',
  tipo: 'B' as const,
  prefijo: '0001',
  numero: 1,
  clienteId: 3,
  neto1: 0,
  neto2: 0,
  neto3: 0,
  iva1: 0,
  iva2: 0,
  total: 100,
  items: [{ articuloId: 7, cantidad: 1, precio: 100, dscto: 0, subtotal: 100 }],
}

describe('FacturaService', () => {
  let prisma: PrismaClient
  let service: FacturaService

  beforeEach(() => {
    prisma = {
      articulo: {
        findMany: vi.fn().mockResolvedValue([{ id: 7 }]),
      },
      cliente: {
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
      factura: {
        count: vi.fn().mockResolvedValue(0),
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      $transaction: vi.fn(),
    } as unknown as PrismaClient
    service = new FacturaService(prisma)
  })

  it('rejects create when clienteId is not in tenant', async () => {
    const result = await service.create(1, baseFacturaInput)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(400)
      expect(result.error).toContain('clienteId')
    }
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('rejects create when cliente is suspended', async () => {
    vi.mocked(prisma.cliente.findFirst).mockResolvedValue({ suspended: true } as never)

    const result = await service.create(1, baseFacturaInput)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(422)
      expect(result.error).toBe('CLIENT_SUSPENDED')
    }
  })
})
