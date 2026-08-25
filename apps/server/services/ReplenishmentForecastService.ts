import { Prisma, type PrismaClient } from '@prisma/client'
import {
  computeReplenishmentForecast,
  selectReplenishmentWindow,
  type ReplenishmentForecastResult,
  type ReplenishmentWindowDays,
} from './replenishmentForecastMath'

export type ReplenishmentArticuloForecast = ReplenishmentForecastResult & {
  articuloId: number
  codigo: number
  descripcion: string
  stock: number
  minimo: number
  tipo: string
  proveedorId: number | null
  leadTimeDays: number | null
  costoUnitario: number | null
}

export type SuggestedOcLine = {
  articuloId: number
  cantidad: number
  costoUnitario: number
}

/**
 * @en Demand forecast / replenishment suggestions from FacturaItem moving averages (#198).
 * @es Predicción de demanda / sugerencias de reposición desde medias móviles de FacturaItem (#198).
 * @pt-BR Previsão de demanda / sugestões de reposição a partir de médias móveis de FacturaItem (#198).
 */
export class ReplenishmentForecastService {
  constructor(private readonly prisma: PrismaClient) {}

  async getArticuloForecast(
    tenantId: number,
    articuloId: number,
    horizonDays = 30,
  ): Promise<ReplenishmentArticuloForecast | null> {
    const articulo = await this.prisma.articulo.findFirst({
      where: { id: articuloId, tenantId },
      select: {
        id: true,
        codigo: true,
        descripcion: true,
        stock: true,
        minimo: true,
        tipo: true,
        esPadre: true,
      },
    })
    if (!articulo || articulo.esPadre || articulo.tipo === 'servicio') {
      return null
    }

    const unitsByWindow = await this.sumUnitsByWindows(tenantId, [articuloId])
    const units = unitsByWindow.get(articuloId) ?? { 90: 0, 60: 0, 30: 0 }
    const { windowDays, unitsSoldInWindow } = selectReplenishmentWindow(units)
    const supplier = await this.pickSupplier(tenantId, articuloId)
    const forecast = computeReplenishmentForecast({
      unitsSoldInWindow,
      windowDays,
      stock: Number(articulo.stock),
      minimo: Number(articulo.minimo),
      leadTimeDays: supplier?.leadTimeDays ?? 0,
      horizonDays,
    })

    return {
      articuloId: articulo.id,
      codigo: articulo.codigo,
      descripcion: articulo.descripcion,
      stock: Number(articulo.stock),
      minimo: Number(articulo.minimo),
      tipo: articulo.tipo,
      proveedorId: supplier?.proveedorId ?? null,
      leadTimeDays: supplier?.leadTimeDays ?? null,
      costoUnitario: supplier?.costoUnitario ?? null,
      ...forecast,
    }
  }

  async listReplenishment(
    tenantId: number,
    horizonDays = 30,
  ): Promise<ReplenishmentArticuloForecast[]> {
    const articulos = await this.prisma.articulo.findMany({
      where: {
        tenantId,
        tipo: 'articulo',
        esPadre: false,
      },
      select: {
        id: true,
        codigo: true,
        descripcion: true,
        stock: true,
        minimo: true,
        tipo: true,
      },
      orderBy: { codigo: 'asc' },
      take: 500,
    })
    if (articulos.length === 0) return []

    const ids = articulos.map((a) => a.id)
    const unitsByWindow = await this.sumUnitsByWindows(tenantId, ids)
    const suppliers = await this.pickSuppliersBatch(tenantId, ids)

    const rows: ReplenishmentArticuloForecast[] = []
    for (const articulo of articulos) {
      const units = unitsByWindow.get(articulo.id) ?? { 90: 0, 60: 0, 30: 0 }
      const { windowDays, unitsSoldInWindow } = selectReplenishmentWindow(units)
      const supplier = suppliers.get(articulo.id)
      const forecast = computeReplenishmentForecast({
        unitsSoldInWindow,
        windowDays,
        stock: Number(articulo.stock),
        minimo: Number(articulo.minimo),
        leadTimeDays: supplier?.leadTimeDays ?? 0,
        horizonDays,
      })
      if (!forecast.needsReplenishment && forecast.status === 'ok') {
        continue
      }
      if (!forecast.needsReplenishment && forecast.status === 'insufficient_data') {
        // Still list only if stock at/below minimum
        if (!(Number(articulo.stock) <= Number(articulo.minimo))) continue
      }
      rows.push({
        articuloId: articulo.id,
        codigo: articulo.codigo,
        descripcion: articulo.descripcion,
        stock: Number(articulo.stock),
        minimo: Number(articulo.minimo),
        tipo: articulo.tipo,
        proveedorId: supplier?.proveedorId ?? null,
        leadTimeDays: supplier?.leadTimeDays ?? null,
        costoUnitario: supplier?.costoUnitario ?? null,
        ...forecast,
      })
    }
    return rows
  }

  /**
   * @en Build OC line suggestions for articulos that have forecast qty and a supplier cost.
   * @es Arma líneas de OC sugeridas para artículos con qty y costo de proveedor.
   * @pt-BR Monta linhas de OC sugeridas para artigos com qty e custo de fornecedor.
   */
  async buildSuggestedOcLines(
    tenantId: number,
    articuloIds: number[],
    proveedorId: number,
    horizonDays = 30,
  ): Promise<{ lines: SuggestedOcLine[]; skipped: number[] }> {
    const lines: SuggestedOcLine[] = []
    const skipped: number[] = []
    for (const articuloId of articuloIds) {
      const forecast = await this.getArticuloForecast(tenantId, articuloId, horizonDays)
      if (!forecast || forecast.status !== 'ok' || forecast.suggestedOrderQty == null || forecast.suggestedOrderQty < 1) {
        skipped.push(articuloId)
        continue
      }
      const link = await this.prisma.proveedorArticulo.findFirst({
        where: {
          tenantId,
          proveedorId,
          articuloId,
          activo: true,
          proveedor: { activo: true },
        },
        select: { precioLista: true },
      })
      const costo = link?.precioLista != null ? Number(link.precioLista) : forecast.costoUnitario
      if (costo == null || !(costo >= 0)) {
        skipped.push(articuloId)
        continue
      }
      lines.push({
        articuloId,
        cantidad: forecast.suggestedOrderQty,
        costoUnitario: costo,
      })
    }
    return { lines, skipped }
  }

  private async sumUnitsByWindows(
    tenantId: number,
    articuloIds: number[],
  ): Promise<Map<number, Record<ReplenishmentWindowDays, number>>> {
    const map = new Map<number, Record<ReplenishmentWindowDays, number>>()
    for (const id of articuloIds) {
      map.set(id, { 90: 0, 60: 0, 30: 0 })
    }
    if (articuloIds.length === 0) return map

    const now = new Date()
    const from90 = new Date(now)
    from90.setUTCDate(from90.getUTCDate() - 90)
    const from60 = new Date(now)
    from60.setUTCDate(from60.getUTCDate() - 60)
    const from30 = new Date(now)
    from30.setUTCDate(from30.getUTCDate() - 30)

    const rows = await this.prisma.$queryRaw<
      Array<{ articuloId: number; units90: bigint; units60: bigint; units30: bigint }>
    >`
      SELECT
        fi."articuloId" AS "articuloId",
        COALESCE(SUM(fi.cantidad) FILTER (WHERE f.fecha >= ${from90}), 0)::bigint AS "units90",
        COALESCE(SUM(fi.cantidad) FILTER (WHERE f.fecha >= ${from60}), 0)::bigint AS "units60",
        COALESCE(SUM(fi.cantidad) FILTER (WHERE f.fecha >= ${from30}), 0)::bigint AS "units30"
      FROM "FacturaItem" fi
      INNER JOIN "Factura" f ON f.id = fi."facturaId"
      WHERE f."tenantId" = ${tenantId}
        AND f.estado = 'A'
        AND fi."articuloId" IN (${Prisma.join(articuloIds)})
        AND f.fecha >= ${from90}
      GROUP BY fi."articuloId"
    `

    for (const row of rows) {
      map.set(row.articuloId, {
        90: Number(row.units90),
        60: Number(row.units60),
        30: Number(row.units30),
      })
    }
    return map
  }

  private async pickSupplier(
    tenantId: number,
    articuloId: number,
  ): Promise<{ proveedorId: number; leadTimeDays: number | null; costoUnitario: number | null } | null> {
    const batch = await this.pickSuppliersBatch(tenantId, [articuloId])
    return batch.get(articuloId) ?? null
  }

  private async pickSuppliersBatch(
    tenantId: number,
    articuloIds: number[],
  ): Promise<
    Map<number, { proveedorId: number; leadTimeDays: number | null; costoUnitario: number | null }>
  > {
    const out = new Map<
      number,
      { proveedorId: number; leadTimeDays: number | null; costoUnitario: number | null }
    >()
    if (articuloIds.length === 0) return out

    const links = await this.prisma.proveedorArticulo.findMany({
      where: {
        tenantId,
        articuloId: { in: articuloIds },
        activo: true,
        proveedor: { activo: true },
      },
      select: {
        articuloId: true,
        proveedorId: true,
        precioLista: true,
        proveedor: { select: { plazoHabitual: true } },
      },
      orderBy: [{ articuloId: 'asc' }, { precioLista: 'asc' }],
    })

    for (const link of links) {
      if (out.has(link.articuloId)) continue
      out.set(link.articuloId, {
        proveedorId: link.proveedorId,
        leadTimeDays: link.proveedor.plazoHabitual,
        costoUnitario: link.precioLista != null ? Number(link.precioLista) : null,
      })
    }
    return out
  }
}
