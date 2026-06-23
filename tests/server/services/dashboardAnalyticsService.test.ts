import { describe, expect, it, vi } from 'vitest'
import { Prisma } from '@prisma/client'
import {
  DashboardAnalyticsService,
  dashboardVentasSeriesToCsv,
} from '../../../apps/server/services/DashboardAnalyticsService'

function buildPrismaMock(seriesRows: unknown[], topRows: unknown[], sellerRows: unknown[]) {
  const queryRaw = vi
    .fn()
    .mockResolvedValueOnce(seriesRows)
    .mockResolvedValueOnce(topRows)
    .mockResolvedValueOnce(sellerRows)
  return { $queryRaw: queryRaw } as unknown as import('@prisma/client').PrismaClient
}

describe('DashboardAnalyticsService', () => {
  it('aggregates series, top articles, and by seller via SQL', async () => {
    const prisma = buildPrismaMock(
      [{ period: '2026-05-01', count: BigInt(2), total: new Prisma.Decimal(100) }],
      [
        {
          articuloId: 1,
          codigo: 10,
          descripcion: 'Prod',
          quantity: BigInt(5),
          total: new Prisma.Decimal(50),
        },
      ],
      [{ vendedorId: 3, username: 'seller1', count: BigInt(1), total: new Prisma.Decimal(100) }],
    )
    const svc = new DashboardAnalyticsService(prisma)
    const result = await svc.getVentasHistorico({
      tenantId: 1,
      from: new Date('2026-05-01'),
      to: new Date('2026-05-20'),
      groupBy: 'day',
      vendedorId: 3,
      deliveryZoneId: 2,
    })
    expect(result.series).toEqual([{ period: '2026-05-01', count: 2, total: '100' }])
    expect(result.topArticles[0]?.articuloId).toBe(1)
    expect(result.bySeller[0]?.username).toBe('seller1')
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(3)
  })

  it('dashboardVentasSeriesToCsv formats header and rows', () => {
    const csv = dashboardVentasSeriesToCsv([
      { period: '2026-05', count: 1, total: '99.50' },
    ])
    expect(csv).toContain('period,count,total')
    expect(csv).toContain('2026-05,1,99.50')
  })
})
