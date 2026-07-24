import type { Prisma, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type { ComisionTipo, ConfigComisionRow } from '@bizcode/types'

export type CalcLinea = {
  facturaId: number | null
  reciboCobroId: number | null
  imputacionId: number | null
  montoBase: number
  alicuota: number
  comision: number
  concepto: string
  clienteId: number | null
  categoriaIds: number[]
  eventDate: Date
}

export type CalcResult = {
  totalVentas: number
  totalComision: number
  lineas: CalcLinea[]
}

type ConfigLike = Pick<
  ConfigComisionRow,
  'id' | 'tipo' | 'alicuota' | 'vigenciaDesde' | 'vigenciaHasta' | 'articuloCategoriaId' | 'clienteId'
>

function dec(value: Decimal | number | string): number {
  return Number(value)
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

function inVigencia(cfg: ConfigLike, at: Date): boolean {
  const desde = new Date(cfg.vigenciaDesde)
  if (at < desde) return false
  if (cfg.vigenciaHasta != null && at > new Date(cfg.vigenciaHasta)) return false
  return true
}

/**
 * @en Picks the most specific commission config for a sales event (#237).
 * @es Elige la config de comisión más específica para un evento de venta (#237).
 * @pt-BR Escolhe a config de comissão mais específica para um evento de venda (#237).
 */
export function selectConfigForEvent(
  configs: ConfigLike[],
  at: Date,
  clienteId: number | null,
  categoriaIds: number[],
): ConfigLike | null {
  let best: ConfigLike | null = null
  let bestScore = -1
  for (const cfg of configs) {
    if (!inVigencia(cfg, at)) continue
    if (cfg.clienteId != null && cfg.clienteId !== clienteId) continue
    if (cfg.articuloCategoriaId != null && !categoriaIds.includes(cfg.articuloCategoriaId)) continue
    const score =
      (cfg.clienteId != null ? 4 : 0) + (cfg.articuloCategoriaId != null ? 2 : 0) + 1
    if (score > bestScore) {
      best = cfg
      bestScore = score
    }
  }
  return best
}

/**
 * @en Computes commission amount from base and config tipo (#237).
 * @es Calcula el importe de comisión desde la base y el tipo de config (#237).
 * @pt-BR Calcula o valor de comissão a partir da base e do tipo de config (#237).
 */
export function computeComision(tipo: ComisionTipo, alicuota: number, montoBase: number): number {
  if (tipo === 'importe_fijo_por_venta') return round2(alicuota)
  return round2((montoBase * alicuota) / 100)
}

function periodBounds(periodo: string): { start: Date; end: Date } | null {
  const m = /^(\d{4})-(\d{2})$/.exec(periodo)
  if (!m) return null
  const year = Number(m[1])
  const month = Number(m[2])
  if (month < 1 || month > 12) return null
  const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0))
  const end = new Date(Date.UTC(year, month, 1, 0, 0, 0))
  return { start, end }
}

/**
 * @en Builds commission lines for a seller in a YYYY-MM period (#237).
 * @es Construye líneas de comisión de un vendedor en un período YYYY-MM (#237).
 * @pt-BR Constrói linhas de comissão de um vendedor em um período YYYY-MM (#237).
 */
export class ComisionCalcService {
  constructor(private readonly prisma: PrismaClient) {}

  async calculateForVendedor(
    tenantId: number,
    vendedorId: number,
    periodo: string,
  ): Promise<CalcResult> {
    const bounds = periodBounds(periodo)
    if (!bounds) {
      return { totalVentas: 0, totalComision: 0, lineas: [] }
    }

    const configsRaw = await this.prisma.configComision.findMany({
      where: { tenantId, vendedorId },
      orderBy: { vigenciaDesde: 'desc' },
    })
    const configs: ConfigLike[] = configsRaw.map((c) => ({
      id: c.id,
      tipo: c.tipo as ComisionTipo,
      alicuota: dec(c.alicuota),
      vigenciaDesde: c.vigenciaDesde.toISOString(),
      vigenciaHasta: c.vigenciaHasta?.toISOString() ?? null,
      articuloCategoriaId: c.articuloCategoriaId,
      clienteId: c.clienteId,
    }))

    const hasCobrado = configs.some((c) => c.tipo === 'porcentaje_cobrado')
    const hasFacturado = configs.some(
      (c) => c.tipo === 'porcentaje_facturado' || c.tipo === 'importe_fijo_por_venta',
    )

    const lineas: CalcLinea[] = []

    if (hasCobrado) {
      const imputaciones = await this.prisma.reciboCobroImputacion.findMany({
        where: {
          reciboCobro: {
            tenantId,
            estado: 'emitido',
            fecha: { gte: bounds.start, lt: bounds.end },
          },
          factura: {
            tenantId,
            estado: 'A',
            pedido: { vendedorId },
          },
        },
        include: {
          reciboCobro: { select: { id: true, fecha: true, numero: true } },
          factura: {
            select: {
              id: true,
              clienteId: true,
              total: true,
              items: { select: { articulo: { select: { categoriaId: true } } } },
            },
          },
        },
      })

      for (const imp of imputaciones) {
        const eventDate = imp.reciboCobro.fecha
        const categoriaIds = [
          ...new Set(
            imp.factura.items
              .map((it) => it.articulo?.categoriaId)
              .filter((id): id is number => id != null),
          ),
        ]
        const cfg = selectConfigForEvent(configs, eventDate, imp.factura.clienteId, categoriaIds)
        if (!cfg || cfg.tipo !== 'porcentaje_cobrado') continue
        const montoBase = dec(imp.importe)
        const comision = computeComision(cfg.tipo, cfg.alicuota, montoBase)
        lineas.push({
          facturaId: imp.facturaId,
          reciboCobroId: imp.reciboCobroId,
          imputacionId: imp.id,
          montoBase,
          alicuota: cfg.alicuota,
          comision,
          concepto: `Cobro RC#${imp.reciboCobro.numero} / Factura #${imp.facturaId}`,
          clienteId: imp.factura.clienteId,
          categoriaIds,
          eventDate,
        })
      }
    }

    if (hasFacturado) {
      const facturas = await this.prisma.factura.findMany({
        where: {
          tenantId,
          estado: 'A',
          fecha: { gte: bounds.start, lt: bounds.end },
          pedido: { vendedorId },
        },
        include: {
          items: { select: { articulo: { select: { categoriaId: true } } } },
        },
      })

      for (const fac of facturas) {
        const categoriaIds = [
          ...new Set(
            fac.items
              .map((it) => it.articulo?.categoriaId)
              .filter((id): id is number => id != null),
          ),
        ]
        const cfg = selectConfigForEvent(configs, fac.fecha, fac.clienteId, categoriaIds)
        if (!cfg) continue
        if (cfg.tipo !== 'porcentaje_facturado' && cfg.tipo !== 'importe_fijo_por_venta') continue
        const montoBase = dec(fac.total)
        const comision = computeComision(cfg.tipo, cfg.alicuota, montoBase)
        lineas.push({
          facturaId: fac.id,
          reciboCobroId: null,
          imputacionId: null,
          montoBase,
          alicuota: cfg.alicuota,
          comision,
          concepto:
            cfg.tipo === 'importe_fijo_por_venta'
              ? `Importe fijo Factura #${fac.id}`
              : `Facturado Factura #${fac.id}`,
          clienteId: fac.clienteId,
          categoriaIds,
          eventDate: fac.fecha,
        })
      }
    }

    const totalVentas = round2(lineas.reduce((s, l) => s + l.montoBase, 0))
    const totalComision = round2(lineas.reduce((s, l) => s + l.comision, 0))
    return { totalVentas, totalComision, lineas }
  }
}

export type { Prisma }
