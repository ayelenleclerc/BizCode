import { describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { LogisticaReportesService } from '../../../server/services/LogisticaReportesService'

function buildPrisma(): PrismaClient {
  return {
    $queryRaw: vi
      .fn()
      .mockResolvedValueOnce([{ count: BigInt(4) }])
      .mockResolvedValueOnce([{ count: BigInt(3) }])
      .mockResolvedValueOnce([{ avg_seconds: 120 }])
      .mockResolvedValueOnce([{ motivo: 'rechazo', count: BigInt(1) }])
      .mockResolvedValueOnce([{ count: BigInt(2) }]),
  } as unknown as PrismaClient
}

describe('LogisticaReportesService', () => {
  it('getKpis computes firstVisitRate from query results', async () => {
    const prisma = buildPrisma()
    const service = new LogisticaReportesService(prisma)
    const from = new Date('2026-05-01')
    const to = new Date('2026-05-31T23:59:59.999Z')

    const result = await service.getKpis({ tenantId: 1, from, to })

    expect(result.dispatchedCount).toBe(4)
    expect(result.firstVisitDeliveredCount).toBe(3)
    expect(result.firstVisitRate).toBe(0.75)
    expect(result.avgDeliveryMinutes).toBe(2)
    expect(result.returnsByReason).toEqual([{ motivo: 'rechazo', count: 1 }])
    expect(result.overdueCount).toBe(2)
  })

  it('getKpis returns null firstVisitRate when no dispatches', async () => {
    const prisma = {
      $queryRaw: vi
        .fn()
        .mockResolvedValueOnce([{ count: BigInt(0) }])
        .mockResolvedValueOnce([{ count: BigInt(0) }])
        .mockResolvedValueOnce([{ avg_seconds: null }])
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([{ count: BigInt(0) }]),
    } as unknown as PrismaClient
    const service = new LogisticaReportesService(prisma)
    const result = await service.getKpis({
      tenantId: 1,
      from: new Date('2026-05-01'),
      to: new Date('2026-05-31'),
    })
    expect(result.firstVisitRate).toBeNull()
    expect(result.avgDeliveryMinutes).toBeNull()
  })

  it('getReporteChoferes maps query rows', async () => {
    const prisma = {
      $queryRaw: vi.fn().mockResolvedValueOnce([
        {
          chofer_id: 3,
          chofer_username: 'driver3',
          day: new Date('2026-05-10'),
          dispatched: BigInt(2),
          delivered: BigInt(1),
          not_delivered: BigInt(1),
        },
      ]),
    } as unknown as PrismaClient
    const service = new LogisticaReportesService(prisma)
    const rows = await service.getReporteChoferes({
      tenantId: 1,
      from: new Date('2026-05-01'),
      to: new Date('2026-05-31'),
      choferId: 3,
    })
    expect(rows[0]?.choferUsername).toBe('driver3')
    expect(rows[0]?.day).toBe('2026-05-10')
  })

  it('getReporteZonas applies choferId filter in query', async () => {
    const prisma = {
      $queryRaw: vi.fn().mockResolvedValueOnce([
        {
          zona_id: 1,
          zona_nombre: 'Norte',
          dispatched: BigInt(2),
          delivered: BigInt(1),
          not_delivered: BigInt(1),
        },
      ]),
    } as unknown as PrismaClient
    const service = new LogisticaReportesService(prisma)
    const rows = await service.getReporteZonas({
      tenantId: 1,
      from: new Date('2026-05-01'),
      to: new Date('2026-05-31'),
      choferId: 7,
    })
    expect(rows).toHaveLength(1)
    expect(rows[0].zonaNombre).toBe('Norte')
    expect(prisma.$queryRaw).toHaveBeenCalled()
  })

  it('getReporteZonas uses em dash when zone name is null', async () => {
    const prisma = {
      $queryRaw: vi.fn().mockResolvedValueOnce([
        {
          zona_id: null,
          zona_nombre: null,
          dispatched: BigInt(1),
          delivered: BigInt(0),
          not_delivered: BigInt(1),
        },
      ]),
    } as unknown as PrismaClient
    const service = new LogisticaReportesService(prisma)
    const rows = await service.getReporteZonas({
      tenantId: 1,
      from: new Date('2026-05-01'),
      to: new Date('2026-05-31'),
    })
    expect(rows[0]?.zonaNombre).toBe('—')
  })
})
