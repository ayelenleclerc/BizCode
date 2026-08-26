import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { ContratoBillingService } from '../../../apps/server/services/ContratoBillingService'
import type { FacturaService } from '../../../apps/server/services/FacturaService'

const contract = {
  id: 8,
  tenantId: 1,
  numero: 12,
  clienteId: 3,
  nombre: 'Soporte',
  descripcion: null,
  estado: 'activo',
  frecuencia: 'mensual',
  diaDelMes: 15,
  fechaInicio: new Date('2026-01-01T00:00:00.000Z'),
  fechaFin: null,
  proximaFact: new Date('2026-01-15T00:00:00.000Z'),
  montoBase: new Decimal(100),
  moneda: 'ARS',
  incluyeIVA: false,
  ivaAlicuota: new Decimal(21),
  modoEmision: 'revision',
  tipoFactura: 'B',
  prefijo: '0001',
  createdAt: new Date(),
  updatedAt: new Date(),
  cliente: { condIva: 'RI' },
  items: [
    {
      id: 20,
      contratoId: 8,
      articuloId: null,
      descripcion: 'Soporte',
      condIva: '1',
      unidadServicio: null,
      cantidad: 1,
      precioUnit: new Decimal(100),
      dscto: new Decimal(0),
      createdAt: new Date(),
    },
  ],
  ajuste: null,
}

describe('ContratoBillingService', () => {
  let prisma: PrismaClient
  let facturaCreate: ReturnType<typeof vi.fn>
  let service: ContratoBillingService

  beforeEach(() => {
    facturaCreate = vi.fn().mockResolvedValue({
      ok: true,
      data: { factura: { id: 50 }, updatedCliente: {}, stockBelowMinimum: [], warnings: [] },
    })
    prisma = {
      paramEmpresa: { findMany: vi.fn() },
      contrato: {
        findMany: vi.fn().mockResolvedValue([]),
        update: vi.fn().mockResolvedValue({}),
      },
      contratoItem: { update: vi.fn() },
      contratoAjuste: { update: vi.fn() },
      factura: { findFirst: vi.fn() },
      appUser: { findMany: vi.fn().mockResolvedValue([]) },
      notification: { createMany: vi.fn() },
      $transaction: vi.fn(),
    } as unknown as PrismaClient
    service = new ContratoBillingService(
      prisma,
      { create: facturaCreate } as unknown as FacturaService,
    )
  })

  it('creates every missed period and requests revision invoices without CAE', async () => {
    vi.mocked(prisma.contrato.findMany).mockResolvedValue([contract] as never)
    vi.mocked(prisma.factura.findFirst).mockImplementation(
      (async (args: unknown) => {
        const where = (args as { where?: { contratoId?: number } } | undefined)?.where
        return (where?.contratoId ? null : { numero: 40 }) as never
      }) as unknown as typeof prisma.factura.findFirst,
    )

    const summary = await service.runDailyJob(1, new Date('2026-03-15T10:00:00.000Z'))

    expect(summary).toEqual({
      processed: 1,
      invoicesCreated: 3,
      adjustmentsApplied: 0,
      skipped: 0,
      errors: 0,
    })
    expect(facturaCreate).toHaveBeenCalledTimes(3)
    expect(facturaCreate).toHaveBeenNthCalledWith(
      1,
      1,
      expect.objectContaining({ fecha: '2026-01-15', numero: 41 }),
      expect.any(Number),
      { contratoId: 8, skipArcaCae: true },
    )
    expect(prisma.contrato.update).toHaveBeenLastCalledWith({
      where: { id: 8 },
      data: { proximaFact: new Date('2026-04-15T00:00:00.000Z') },
    })
  })

  it('does not process paused contracts', async () => {
    await service.runDailyJob(1, new Date('2026-03-15T10:00:00.000Z'))

    expect(prisma.contrato.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ estado: 'activo' }) }),
    )
    expect(facturaCreate).not.toHaveBeenCalled()
  })

  it('skips an existing period invoice but still advances the contract', async () => {
    const dueContract = {
      ...contract,
      proximaFact: new Date('2026-03-15T00:00:00.000Z'),
    }
    vi.mocked(prisma.contrato.findMany).mockResolvedValue([dueContract] as never)
    vi.mocked(prisma.factura.findFirst).mockResolvedValue({ id: 99 } as never)

    const summary = await service.runDailyJob(1, new Date('2026-03-15T10:00:00.000Z'))

    expect(summary.skipped).toBe(1)
    expect(summary.invoicesCreated).toBe(0)
    expect(facturaCreate).not.toHaveBeenCalled()
    expect(prisma.contrato.update).toHaveBeenCalledWith({
      where: { id: 8 },
      data: { proximaFact: new Date('2026-04-15T00:00:00.000Z') },
    })
  })

  it('applies porcentaje_fijo when proximoAjuste is due', async () => {
    const dueContract = {
      ...contract,
      proximaFact: new Date('2026-03-15T00:00:00.000Z'),
      ajuste: {
        id: 1,
        contratoId: 8,
        tipo: 'porcentaje_fijo',
        porcentaje: new Decimal(10),
        frecuenciaAjuste: 'mensual',
        proximoAjuste: new Date('2026-03-01T00:00:00.000Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    }
    vi.mocked(prisma.contrato.findMany).mockResolvedValue([dueContract] as never)
    vi.mocked(prisma.factura.findFirst).mockResolvedValue({ id: 99 } as never)
    const tx = {
      contratoItem: { update: vi.fn() },
      contrato: { update: vi.fn() },
      contratoAjuste: { update: vi.fn() },
    }
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => {
      if (typeof callback === 'function') return callback(tx as never)
      return callback
    })

    const summary = await service.runDailyJob(1, new Date('2026-03-15T10:00:00.000Z'))

    expect(summary.processed).toBe(1)
    expect(summary.adjustmentsApplied).toBe(1)
    expect(tx.contratoItem.update).toHaveBeenCalled()
    expect(tx.contratoAjuste.update).toHaveBeenCalledWith({
      where: { contratoId: 8 },
      data: { proximoAjuste: new Date('2026-04-01T00:00:00.000Z') },
    })
  })

  it('runs for all paramEmpresa tenants when tenantId is omitted', async () => {
    vi.mocked(prisma.paramEmpresa.findMany).mockResolvedValue([{ tenantId: 1 }, { tenantId: 2 }] as never)
    vi.mocked(prisma.contrato.findMany).mockResolvedValue([])

    const summary = await service.runDailyJob(undefined, new Date('2026-03-15T10:00:00.000Z'))

    expect(prisma.paramEmpresa.findMany).toHaveBeenCalled()
    expect(prisma.contrato.findMany).toHaveBeenCalledTimes(2)
    expect(summary.processed).toBe(0)
  })
})
