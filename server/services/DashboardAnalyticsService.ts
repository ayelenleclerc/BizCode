import { Prisma, type PrismaClient } from '@prisma/client'

export type DashboardVentasGroupBy = 'day' | 'week' | 'month'

export type DashboardVentasHistoricoFilters = {
  tenantId: number
  from: Date
  to: Date
  groupBy: DashboardVentasGroupBy
  vendedorId?: number
  deliveryZoneId?: number
}

export type DashboardVentasSeriesRow = {
  period: string
  count: number
  total: string
}

export type DashboardTopArticuloRow = {
  articuloId: number
  codigo: number
  descripcion: string
  quantity: number
  total: string
}

export type DashboardVentasBySellerRow = {
  vendedorId: number | null
  username: string | null
  count: number
  total: string
}

export type DashboardVentasHistoricoData = {
  series: DashboardVentasSeriesRow[]
  topArticles: DashboardTopArticuloRow[]
  bySeller: DashboardVentasBySellerRow[]
}

function periodBucketSql(groupBy: DashboardVentasGroupBy): Prisma.Sql {
  if (groupBy === 'week') {
    return Prisma.sql`date_trunc('week', f.fecha)`
  }
  if (groupBy === 'month') {
    return Prisma.sql`date_trunc('month', f.fecha)`
  }
  return Prisma.sql`date_trunc('day', f.fecha)`
}

function periodLabelSql(groupBy: DashboardVentasGroupBy, bucket: Prisma.Sql): Prisma.Sql {
  if (groupBy === 'month') {
    return Prisma.sql`to_char(${bucket}, 'YYYY-MM')`
  }
  return Prisma.sql`to_char(${bucket}, 'YYYY-MM-DD')`
}

/**
 * @en Historical sales analytics with PostgreSQL aggregation (#138).
 * @es Analítica de ventas históricas con agregación en PostgreSQL (#138).
 * @pt-BR Análise de vendas históricas com agregação no PostgreSQL (#138).
 */
export class DashboardAnalyticsService {
  constructor(private readonly prisma: PrismaClient) {}

  async getVentasHistorico(filters: DashboardVentasHistoricoFilters): Promise<DashboardVentasHistoricoData> {
    const [series, topArticles, bySeller] = await Promise.all([
      this.querySeries(filters),
      this.queryTopArticles(filters),
      this.queryBySeller(filters),
    ])
    return { series, topArticles, bySeller }
  }

  private buildOptionalFilters(filters: DashboardVentasHistoricoFilters): Prisma.Sql {
    const parts: Prisma.Sql[] = []
    if (filters.vendedorId != null) {
      parts.push(Prisma.sql`AND p."vendedorId" = ${filters.vendedorId}`)
    }
    if (filters.deliveryZoneId != null) {
      parts.push(Prisma.sql`AND c."deliveryZoneId" = ${filters.deliveryZoneId}`)
    }
    if (parts.length === 0) {
      return Prisma.empty
    }
    return Prisma.join(parts, ' ')
  }

  private async querySeries(filters: DashboardVentasHistoricoFilters): Promise<DashboardVentasSeriesRow[]> {
    const bucket = periodBucketSql(filters.groupBy)
    const periodLabel = periodLabelSql(filters.groupBy, bucket)
    const optional = this.buildOptionalFilters(filters)
    const rows = await this.prisma.$queryRaw<
      { period: string; count: bigint; total: Prisma.Decimal }[]
    >(Prisma.sql`
      SELECT
        ${periodLabel} AS period,
        COUNT(*)::bigint AS count,
        COALESCE(SUM(f.total), 0) AS total
      FROM "Factura" f
      INNER JOIN "Cliente" c ON c.id = f."clienteId"
      LEFT JOIN "Pedido" p ON p."facturaId" = f.id
      WHERE f."tenantId" = ${filters.tenantId}
        AND f.estado = 'A'
        AND f.fecha >= ${filters.from}
        AND f.fecha <= ${filters.to}
        ${optional}
      GROUP BY ${bucket}
      ORDER BY ${bucket} ASC
    `)
    return rows.map((r) => ({
      period: r.period,
      count: Number(r.count),
      total: r.total.toString(),
    }))
  }

  private async queryTopArticles(filters: DashboardVentasHistoricoFilters): Promise<DashboardTopArticuloRow[]> {
    const optional = this.buildOptionalFilters(filters)
    const rows = await this.prisma.$queryRaw<
      {
        articuloId: number
        codigo: number
        descripcion: string
        quantity: bigint
        total: Prisma.Decimal
      }[]
    >(Prisma.sql`
      SELECT
        a.id AS "articuloId",
        a.codigo,
        a.descripcion,
        SUM(fi.cantidad)::bigint AS quantity,
        COALESCE(SUM(fi.subtotal), 0) AS total
      FROM "FacturaItem" fi
      INNER JOIN "Factura" f ON f.id = fi."facturaId"
      INNER JOIN "Articulo" a ON a.id = fi."articuloId"
      INNER JOIN "Cliente" c ON c.id = f."clienteId"
      LEFT JOIN "Pedido" p ON p."facturaId" = f.id
      WHERE f."tenantId" = ${filters.tenantId}
        AND f.estado = 'A'
        AND f.fecha >= ${filters.from}
        AND f.fecha <= ${filters.to}
        ${optional}
      GROUP BY a.id, a.codigo, a.descripcion
      ORDER BY SUM(fi.subtotal) DESC
      LIMIT 10
    `)
    return rows.map((r) => ({
      articuloId: r.articuloId,
      codigo: r.codigo,
      descripcion: r.descripcion,
      quantity: Number(r.quantity),
      total: r.total.toString(),
    }))
  }

  private async queryBySeller(filters: DashboardVentasHistoricoFilters): Promise<DashboardVentasBySellerRow[]> {
    const optional = this.buildOptionalFilters(filters)
    const rows = await this.prisma.$queryRaw<
      {
        vendedorId: number | null
        username: string | null
        count: bigint
        total: Prisma.Decimal
      }[]
    >(Prisma.sql`
      SELECT
        p."vendedorId" AS "vendedorId",
        u.username,
        COUNT(*)::bigint AS count,
        COALESCE(SUM(f.total), 0) AS total
      FROM "Factura" f
      INNER JOIN "Cliente" c ON c.id = f."clienteId"
      LEFT JOIN "Pedido" p ON p."facturaId" = f.id
      LEFT JOIN "AppUser" u ON u.id = p."vendedorId"
      WHERE f."tenantId" = ${filters.tenantId}
        AND f.estado = 'A'
        AND f.fecha >= ${filters.from}
        AND f.fecha <= ${filters.to}
        ${optional}
      GROUP BY p."vendedorId", u.username
      ORDER BY SUM(f.total) DESC
    `)
    return rows.map((r) => ({
      vendedorId: r.vendedorId,
      username: r.username,
      count: Number(r.count),
      total: r.total.toString(),
    }))
  }
}

/**
 * @en CSV rows for historical sales series export.
 * @es Filas CSV para exportación de series de ventas históricas.
 * @pt-BR Linhas CSV para exportação da série de vendas históricas.
 */
export function dashboardVentasSeriesToCsv(rows: DashboardVentasSeriesRow[]): string {
  const header = 'period,count,total'
  const body = rows.map((r) => `${escapeCsv(r.period)},${r.count},${escapeCsv(r.total)}`).join('\n')
  return `${header}\n${body}\n`
}

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
