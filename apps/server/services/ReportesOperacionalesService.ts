import { Prisma, type PrismaClient } from '@prisma/client'
import { endOfDay, periodKeyForDate, type ReportesAgrupar } from '../reportesPeriodUtils'

export type ReporteVentasRow = {
  periodo: string
  count: number
  total: string
  neto1: string
  neto2: string
  iva1: string
  iva2: string
}

export type StockCriticoRow = {
  articulo: { id: number; codigo: number; descripcion: string }
  stock: number
  minimo: number
  deficit: number
}

/**
 * @en Operational reports (sales by period, critical stock).
 * @es Reportes operativos (ventas por período, stock crítico).
 * @pt-BR Relatórios operacionais (vendas por período, estoque crítico).
 */
export class ReportesOperacionalesService {
  constructor(private readonly prisma: PrismaClient) {}

  async getVentasPorPeriodo(
    tenantId: number,
    from: Date,
    to: Date,
    agrupar: ReportesAgrupar,
  ): Promise<ReporteVentasRow[]> {
    const facturas = await this.prisma.factura.findMany({
      where: {
        tenantId,
        estado: 'A',
        fecha: { gte: from, lte: to },
      },
      select: {
        fecha: true,
        total: true,
        neto1: true,
        neto2: true,
        iva1: true,
        iva2: true,
      },
    })

    const buckets = new Map<
      string,
      { count: number; total: number; neto1: number; neto2: number; iva1: number; iva2: number }
    >()

    for (const f of facturas) {
      const key = periodKeyForDate(f.fecha, agrupar)
      const row = buckets.get(key) ?? { count: 0, total: 0, neto1: 0, neto2: 0, iva1: 0, iva2: 0 }
      row.count += 1
      row.total += f.total.toNumber()
      row.neto1 += f.neto1.toNumber()
      row.neto2 += f.neto2.toNumber()
      row.iva1 += f.iva1.toNumber()
      row.iva2 += f.iva2.toNumber()
      buckets.set(key, row)
    }

    return [...buckets.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([periodo, row]) => ({
        periodo,
        count: row.count,
        total: row.total.toFixed(2),
        neto1: row.neto1.toFixed(2),
        neto2: row.neto2.toFixed(2),
        iva1: row.iva1.toFixed(2),
        iva2: row.iva2.toFixed(2),
      }))
  }

  async getStockCritico(tenantId: number): Promise<StockCriticoRow[]> {
    const articulos = await this.prisma.articulo.findMany({
      where: {
        tenantId,
        activo: true,
        tipo: 'articulo',
      },
      select: {
        id: true,
        codigo: true,
        descripcion: true,
        stock: true,
        minimo: true,
      },
    })

    const rows: StockCriticoRow[] = []
    for (const a of articulos) {
      if (a.stock > a.minimo) continue
      rows.push({
        articulo: { id: a.id, codigo: a.codigo, descripcion: a.descripcion },
        stock: a.stock,
        minimo: a.minimo,
        deficit: a.minimo - a.stock,
      })
    }

    rows.sort((x, y) => x.articulo.codigo - y.articulo.codigo)
    return rows
  }

  /**
   * @en Sales totals split by catalog tipo (physical vs service / ad-hoc) (#244).
   * @es Totales de ventas por tipo de ítem (físico vs servicio / ad-hoc) (#244).
   * @pt-BR Totais de vendas por tipo de item (físico vs serviço / ad-hoc) (#244).
   */
  async getVentasPorTipo(
    tenantId: number,
    from: Date,
    to: Date,
  ): Promise<{ productos: string; servicios: string }> {
    const range = ReportesOperacionalesService.buildDateRange(from, to)
    const rows = await this.prisma.$queryRaw<
      { kind: string; total: Prisma.Decimal }[]
    >(Prisma.sql`
      SELECT
        CASE
          WHEN fi."articuloId" IS NULL THEN 'servicio'
          WHEN a.tipo = 'servicio' THEN 'servicio'
          ELSE 'producto'
        END AS kind,
        COALESCE(SUM(fi.subtotal), 0) AS total
      FROM "FacturaItem" fi
      INNER JOIN "Factura" f ON f.id = fi."facturaId"
      LEFT JOIN "Articulo" a ON a.id = fi."articuloId"
      WHERE f."tenantId" = ${tenantId}
        AND f.estado = 'A'
        AND f.fecha >= ${range.from}
        AND f.fecha <= ${range.to}
      GROUP BY 1
    `)
    let productos = '0.00'
    let servicios = '0.00'
    for (const r of rows) {
      if (r.kind === 'producto') productos = r.total.toFixed(2)
      if (r.kind === 'servicio') servicios = r.total.toFixed(2)
    }
    return { productos, servicios }
  }

  /** @en Inclusive date range for report queries. */
  static buildDateRange(from: Date, to: Date): { from: Date; to: Date } {
    return { from, to: endOfDay(to) }
  }
}
