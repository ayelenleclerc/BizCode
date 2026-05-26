import type { PrismaClient } from '@prisma/client'
import { endOfDay } from '../reportesPeriodUtils'

export type LogisticaKpis = {
  dispatchedCount: number
  firstVisitDeliveredCount: number
  firstVisitRate: number | null
  avgDeliveryMinutes: number | null
  returnsByReason: { motivo: string; count: number }[]
  overdueCount: number
}

export type LogisticaChoferRow = {
  choferId: number
  choferUsername: string
  day: string
  dispatched: number
  delivered: number
  notDelivered: number
}

export type LogisticaZonaRow = {
  zonaId: number | null
  zonaNombre: string
  dispatched: number
  delivered: number
  notDelivered: number
}

type PeriodFilter = {
  tenantId: number
  from: Date
  to: Date
  choferId?: number
}

/**
 * @en Logistics KPIs and reports with DB-side aggregates (#145).
 * @es KPIs y reportes logísticos con agregados en DB (#145).
 * @pt-BR KPIs e relatórios logísticos com agregados no DB (#145).
 */
export class LogisticaReportesService {
  constructor(private readonly prisma: PrismaClient) {}

  static buildDateRange(from: Date, to: Date): { from: Date; to: Date } {
    return { from, to: endOfDay(to) }
  }

  async getKpis(filter: PeriodFilter): Promise<LogisticaKpis> {
    const { tenantId, from, to, choferId } = filter
    const choferFilter = choferId ?? null

    const dispatchedRows = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      FROM "OrdenEntrega" oe
      WHERE oe."tenantId" = ${tenantId}
        AND oe."dispatchedAt" >= ${from}
        AND oe."dispatchedAt" <= ${to}
        AND (${choferFilter}::int IS NULL OR oe."driverId" = ${choferFilter})
    `
    const dispatchedCount = Number(dispatchedRows[0]?.count ?? 0)

    const firstVisitRows = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      FROM "OrdenEntrega" oe
      WHERE oe."tenantId" = ${tenantId}
        AND oe."dispatchedAt" >= ${from}
        AND oe."dispatchedAt" <= ${to}
        AND (${choferFilter}::int IS NULL OR oe."driverId" = ${choferFilter})
        AND (
          SELECT ri.estado
          FROM "RepartoItem" ri
          WHERE ri."ordenEntregaId" = oe.id
            AND ri.estado IN ('delivered', 'not_delivered')
            AND ri."entregadoAt" IS NOT NULL
          ORDER BY ri."entregadoAt" ASC
          LIMIT 1
        ) = 'delivered'
    `
    const firstVisitDeliveredCount = Number(firstVisitRows[0]?.count ?? 0)

    const avgRows = await this.prisma.$queryRaw<{ avg_seconds: number | null }[]>`
      SELECT AVG(EXTRACT(EPOCH FROM (ri."entregadoAt" - oe."dispatchedAt"))) AS avg_seconds
      FROM "RepartoItem" ri
      INNER JOIN "OrdenEntrega" oe ON oe.id = ri."ordenEntregaId"
      WHERE oe."tenantId" = ${tenantId}
        AND ri.estado = 'delivered'
        AND ri."entregadoAt" IS NOT NULL
        AND oe."dispatchedAt" IS NOT NULL
        AND ri."entregadoAt" >= ${from}
        AND ri."entregadoAt" <= ${to}
        AND (${choferFilter}::int IS NULL OR oe."driverId" = ${choferFilter})
    `
    const avgSeconds = avgRows[0]?.avg_seconds
    const avgDeliveryMinutes =
      avgSeconds != null && Number.isFinite(avgSeconds)
        ? Math.round((avgSeconds / 60) * 10) / 10
        : null

    const returnsRows = await this.prisma.$queryRaw<{ motivo: string | null; count: bigint }[]>`
      SELECT COALESCE(ri."motivoNoEntrega", 'otro') AS motivo, COUNT(*)::bigint AS count
      FROM "RepartoItem" ri
      INNER JOIN "Reparto" r ON r.id = ri."repartoId"
      INNER JOIN "OrdenEntrega" oe ON oe.id = ri."ordenEntregaId"
      WHERE r."tenantId" = ${tenantId}
        AND ri.estado = 'not_delivered'
        AND ri."entregadoAt" IS NOT NULL
        AND ri."entregadoAt" >= ${from}
        AND ri."entregadoAt" <= ${to}
        AND (${choferFilter}::int IS NULL OR oe."driverId" = ${choferFilter})
      GROUP BY COALESCE(ri."motivoNoEntrega", 'otro')
      ORDER BY count DESC
    `

    const overdueRows = await this.prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      FROM "OrdenEntrega" oe
      WHERE oe."tenantId" = ${tenantId}
        AND oe.fecha < ${to}
        AND oe.estado NOT IN ('delivered', 'cancelled')
        AND (${choferFilter}::int IS NULL OR oe."driverId" = ${choferFilter})
    `
    const overdueCount = Number(overdueRows[0]?.count ?? 0)

    const firstVisitRate =
      dispatchedCount > 0 ? Math.round((firstVisitDeliveredCount / dispatchedCount) * 1000) / 1000 : null

    return {
      dispatchedCount,
      firstVisitDeliveredCount,
      firstVisitRate,
      avgDeliveryMinutes,
      returnsByReason: returnsRows.map((r) => ({
        motivo: r.motivo ?? 'otro',
        count: Number(r.count),
      })),
      overdueCount,
    }
  }

  async getReporteChoferes(filter: PeriodFilter): Promise<LogisticaChoferRow[]> {
    const { tenantId, from, to, choferId } = filter
    const choferFilter = choferId ?? null

    const rows = await this.prisma.$queryRaw<
      {
        chofer_id: number
        chofer_username: string
        day: Date
        dispatched: bigint
        delivered: bigint
        not_delivered: bigint
      }[]
    >`
      SELECT
        oe."driverId" AS chofer_id,
        u.username AS chofer_username,
        DATE(oe."dispatchedAt") AS day,
        COUNT(*)::bigint AS dispatched,
        COUNT(*) FILTER (WHERE oe.estado = 'delivered')::bigint AS delivered,
        COUNT(*) FILTER (WHERE oe.estado = 'failed')::bigint AS not_delivered
      FROM "OrdenEntrega" oe
      INNER JOIN "AppUser" u ON u.id = oe."driverId"
      WHERE oe."tenantId" = ${tenantId}
        AND oe."dispatchedAt" >= ${from}
        AND oe."dispatchedAt" <= ${to}
        AND oe."driverId" IS NOT NULL
        AND (${choferFilter}::int IS NULL OR oe."driverId" = ${choferFilter})
      GROUP BY oe."driverId", u.username, DATE(oe."dispatchedAt")
      ORDER BY day DESC, delivered DESC
    `

    return rows.map((r) => ({
      choferId: r.chofer_id,
      choferUsername: r.chofer_username,
      day: r.day.toISOString().slice(0, 10),
      dispatched: Number(r.dispatched),
      delivered: Number(r.delivered),
      notDelivered: Number(r.not_delivered),
    }))
  }

  async getReporteZonas(filter: PeriodFilter): Promise<LogisticaZonaRow[]> {
    const { tenantId, from, to, choferId } = filter
    const choferFilter = choferId ?? null

    const rows = await this.prisma.$queryRaw<
      {
        zona_id: number | null
        zona_nombre: string | null
        dispatched: bigint
        delivered: bigint
        not_delivered: bigint
      }[]
    >`
      SELECT
        z.id AS zona_id,
        z.nombre AS zona_nombre,
        COUNT(*)::bigint AS dispatched,
        COUNT(*) FILTER (WHERE oe.estado = 'delivered')::bigint AS delivered,
        COUNT(*) FILTER (WHERE oe.estado = 'failed')::bigint AS not_delivered
      FROM "OrdenEntrega" oe
      LEFT JOIN "DeliveryZone" z ON z.id = oe."zonaId"
      WHERE oe."tenantId" = ${tenantId}
        AND oe."dispatchedAt" >= ${from}
        AND oe."dispatchedAt" <= ${to}
        AND (${choferFilter}::int IS NULL OR oe."driverId" = ${choferFilter})
      GROUP BY z.id, z.nombre
      ORDER BY dispatched DESC
    `

    return rows.map((r) => ({
      zonaId: r.zona_id,
      zonaNombre: r.zona_nombre ?? '—',
      dispatched: Number(r.dispatched),
      delivered: Number(r.delivered),
      notDelivered: Number(r.not_delivered),
    }))
  }
}
