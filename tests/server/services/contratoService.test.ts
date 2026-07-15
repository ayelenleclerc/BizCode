import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { ContratoService } from '../../../apps/server/services/ContratoService'

const input = {
  clienteId: 3,
  nombre: 'Soporte',
  frecuencia: 'mensual' as const,
  diaDelMes: 15,
  fechaInicio: '2026-01-20',
  items: [
    {
      articuloId: 7,
      descripcion: 'Soporte mensual',
      condIva: '1' as const,
      cantidad: 2,
      precioUnit: 100,
      dscto: 10,
    },
  ],
}

describe('ContratoService', () => {
  let prisma: PrismaClient
  let service: ContratoService

  beforeEach(() => {
    prisma = {
      cliente: { findFirst: vi.fn().mockResolvedValue(null) },
      articulo: { findMany: vi.fn().mockResolvedValue([]) },
      contrato: {
        count: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
      },
      contratoItem: { deleteMany: vi.fn(), update: vi.fn() },
      contratoAjuste: { deleteMany: vi.fn() },
      $transaction: vi.fn(),
    } as unknown as PrismaClient
    service = new ContratoService(prisma)
  })

  it('rejects a cliente from another tenant', async () => {
    const result = await service.create(1, input)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(400)
      expect(result.error).toContain('clienteId')
    }
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })

  it('allocates the next tenant number and computes discounted montoBase', async () => {
    vi.mocked(prisma.cliente.findFirst).mockResolvedValue({ condIva: 'RI' } as never)
    vi.mocked(prisma.articulo.findMany).mockResolvedValue([{ id: 7 }] as never)
    const created = {
      id: 9,
      numero: 5,
      montoBase: new Decimal(180),
      proximaFact: new Date('2026-02-15T00:00:00.000Z'),
    }
    const tx = {
      contrato: {
        findFirst: vi.fn().mockResolvedValue({ numero: 4 }),
        create: vi.fn().mockResolvedValue(created),
      },
    }
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      if (typeof callback === 'function') return callback(tx as never)
      return callback
    })

    const result = await service.create(1, input)

    expect(result.ok).toBe(true)
    expect(tx.contrato.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 1,
          numero: 5,
          montoBase: new Decimal(180),
          proximaFact: new Date('2026-02-15T00:00:00.000Z'),
        }),
      }),
    )
  })

  it('only pauses active contracts', async () => {
    vi.mocked(prisma.contrato.findFirst).mockResolvedValue({ estado: 'pausado' } as never)

    const result = await service.pause(1, 4)

    expect(result).toEqual({ ok: false, status: 409, error: 'INVALID_STATE_TRANSITION' })
    expect(prisma.contrato.update).not.toHaveBeenCalled()
  })

  it('resumes and advances a past billing date without losing its cadence', async () => {
    vi.mocked(prisma.contrato.findFirst).mockResolvedValue({
      estado: 'pausado',
      proximaFact: new Date('2026-01-31T00:00:00.000Z'),
      diaDelMes: 31,
      frecuencia: 'mensual',
    } as never)
    vi.mocked(prisma.contrato.update).mockResolvedValue({ id: 4, estado: 'activo' } as never)

    const result = await service.resume(1, 4, new Date('2026-03-15T12:00:00.000Z'))

    expect(result.ok).toBe(true)
    expect(prisma.contrato.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          estado: 'activo',
          proximaFact: new Date('2026-03-31T00:00:00.000Z'),
        },
      }),
    )
  })

  it('lists contratos and returns not found for missing id', async () => {
    vi.mocked(prisma.contrato.count).mockResolvedValue(1)
    vi.mocked(prisma.contrato.findMany).mockResolvedValue([{ id: 1 }] as never)
    vi.mocked(prisma.contrato.findFirst).mockResolvedValue(null)

    await expect(service.list(1, 10, 0)).resolves.toEqual({ total: 1, contratos: [{ id: 1 }] })
    await expect(service.getById(1, 99)).resolves.toEqual({
      ok: false,
      status: 404,
      error: 'Contrato not found',
    })
  })

  it('applies a manual percentage adjustment to line prices', async () => {
    vi.mocked(prisma.contrato.findFirst).mockResolvedValue({
      id: 4,
      items: [{ id: 1, cantidad: 1, dscto: new Decimal(0), precioUnit: new Decimal(100) }],
    } as never)
    const tx = {
      contratoItem: { update: vi.fn() },
      contrato: { update: vi.fn().mockResolvedValue({ id: 4, montoBase: new Decimal(110) }) },
    }
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      if (typeof callback === 'function') return callback(tx as never)
      return callback
    })

    const result = await service.applyManualAdjustment(1, 4, { porcentaje: 10 })

    expect(result.ok).toBe(true)
    expect(tx.contratoItem.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { precioUnit: new Decimal(110) },
    })
  })

  it('pauses an active contract', async () => {
    vi.mocked(prisma.contrato.findFirst).mockResolvedValue({ estado: 'activo' } as never)
    vi.mocked(prisma.contrato.update).mockResolvedValue({ id: 4, estado: 'pausado' } as never)

    const result = await service.pause(1, 4)

    expect(result.ok).toBe(true)
    expect(prisma.contrato.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { estado: 'pausado' } }),
    )
  })
})
