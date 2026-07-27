import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import {
  historialPeriodStart,
  type ProveedorHistorialPeriodoDias,
} from '../lib/proveedorHistorialPeriodo'

export type ProveedorCompraEstadoPago = 'pendiente' | 'parcial' | 'pagada' | 'n_a'

export type ProveedorCompraRow = {
  tipo: 'orden_compra' | 'comprobante'
  id: number
  fecha: string
  referencia: string
  total: string
  estadoPago: ProveedorCompraEstadoPago
  ordenCompraId?: number
  estado?: string
}

export type ProveedorHistorialTopArticulo = {
  articuloId: number
  codigo: string
  descripcion: string
  cantidadTotal: number
  montoTotal: string
}

export type ProveedorHistorialResumen = {
  periodoDias: ProveedorHistorialPeriodoDias
  totalComprado: string
  frecuenciaCompraDias: number | null
  cantidadCompras: number
  topArticulos: ProveedorHistorialTopArticulo[]
  compras: ProveedorCompraRow[]
}

export type ProveedorArticuloPrecioPunto = {
  fecha: string
  precioUnitario: string
  cantidad: number
}

export type ProveedorArticuloHistorialRow = {
  articuloId: number
  codigo: string
  descripcion: string
  cantidadTotal: number
  precioPromedioPonderado: string
  montoTotal: string
  evolucionPrecios: ProveedorArticuloPrecioPunto[]
}

const COMPRAS_LIST_LIMIT = 100
const TOP_ARTICULOS_LIMIT = 10
const EVOLUCION_MAX_PUNTOS = 12

function decimalToMoneyString(value: Decimal | number): string {
  const n = typeof value === 'number' ? value : value.toNumber()
  return n.toFixed(2)
}

function formatComprobanteRef(tipo: string, prefijo: string, numero: number): string {
  return `${tipo}-${prefijo}-${numero}`
}

function formatOcRef(id: number): string {
  return `OC-${String(id).padStart(6, '0')}`
}

function computeEstadoPago(total: Decimal, paid: Decimal): ProveedorCompraEstadoPago {
  if (paid.lte(0)) return 'pendiente'
  if (paid.gte(total)) return 'pagada'
  return 'parcial'
}

function averagePurchaseIntervalDays(dates: Date[]): number | null {
  if (dates.length < 2) return null
  const sorted = [...dates].sort((a, b) => a.getTime() - b.getTime())
  let sum = 0
  for (let i = 1; i < sorted.length; i += 1) {
    sum += (sorted[i]!.getTime() - sorted[i - 1]!.getTime()) / (1000 * 60 * 60 * 24)
  }
  return Math.round(sum / (sorted.length - 1))
}

type ItemLine = {
  articuloId: number
  codigo: string
  descripcion: string
  cantidad: number
  costoUnitario: Decimal
  fecha: Date
}

/**
 * @en Supplier purchase history and weighted average price (#272).
 * @es Historial de compras y precio promedio ponderado por proveedor (#272).
 * @pt-BR Histórico de compras e preço médio ponderado por fornecedor (#272).
 */
export class ProveedorHistorialService {
  constructor(private readonly prisma: PrismaClient) {}

  private async assertProveedor(tenantId: number, proveedorId: number): Promise<boolean> {
    const row = await this.prisma.proveedor.findFirst({
      where: { id: proveedorId, tenantId },
      select: { id: true },
    })
    return row != null
  }

  private async loadPaidMap(tenantId: number, comprobanteIds: number[]): Promise<Map<number, Decimal>> {
    if (comprobanteIds.length === 0) return new Map()
    const allocations = await this.prisma.reciboPagoFactura.groupBy({
      by: ['comprobanteCompraId'],
      where: {
        comprobanteCompraId: { in: comprobanteIds },
        reciboPago: { tenantId, estado: 'emitido' },
      },
      _sum: { monto: true },
    })
    const paidMap = new Map<number, Decimal>()
    for (const row of allocations) {
      if (row.comprobanteCompraId != null && row._sum.monto != null) {
        paidMap.set(row.comprobanteCompraId, row._sum.monto)
      }
    }
    return paidMap
  }

  private async loadItemLines(
    tenantId: number,
    proveedorId: number,
    from: Date,
  ): Promise<ItemLine[]> {
    const ordenes = await this.prisma.ordenCompra.findMany({
      where: {
        tenantId,
        proveedorId,
        estado: 'received',
        updatedAt: { gte: from },
      },
      select: {
        updatedAt: true,
        items: {
          where: { cantidadRecibida: { gt: 0 } },
          select: {
            cantidadRecibida: true,
            costoUnitario: true,
            articulo: { select: { id: true, codigo: true, descripcion: true } },
          },
        },
      },
    })

    const lines: ItemLine[] = []
    for (const oc of ordenes) {
      for (const item of oc.items) {
        lines.push({
          articuloId: item.articulo.id,
          codigo: String(item.articulo.codigo),
          descripcion: item.articulo.descripcion,
          cantidad: Number(item.cantidadRecibida),
          costoUnitario: item.costoUnitario,
          fecha: oc.updatedAt,
        })
      }
    }
    return lines
  }

  private buildTopArticulos(lines: ItemLine[]): ProveedorHistorialTopArticulo[] {
    const byArticulo = new Map<
      number,
      { codigo: string; descripcion: string; cantidad: number; monto: Decimal }
    >()
    for (const line of lines) {
      const prev = byArticulo.get(line.articuloId)
      const montoLine = line.costoUnitario.mul(line.cantidad)
      if (prev) {
        prev.cantidad += line.cantidad
        prev.monto = prev.monto.add(montoLine)
      } else {
        byArticulo.set(line.articuloId, {
          codigo: line.codigo,
          descripcion: line.descripcion,
          cantidad: line.cantidad,
          monto: montoLine,
        })
      }
    }
    return [...byArticulo.entries()]
      .map(([articuloId, agg]) => ({
        articuloId,
        codigo: agg.codigo,
        descripcion: agg.descripcion,
        cantidadTotal: agg.cantidad,
        montoTotal: decimalToMoneyString(agg.monto),
      }))
      .sort((a, b) => Number.parseFloat(b.montoTotal) - Number.parseFloat(a.montoTotal))
      .slice(0, TOP_ARTICULOS_LIMIT)
  }

  private buildArticulosRows(lines: ItemLine[]): ProveedorArticuloHistorialRow[] {
    const byArticulo = new Map<
      number,
      {
        codigo: string
        descripcion: string
        cantidad: number
        monto: Decimal
        weightedSum: Decimal
        puntos: ProveedorArticuloPrecioPunto[]
      }
    >()

    for (const line of lines) {
      const montoLine = line.costoUnitario.mul(line.cantidad)
      const punto: ProveedorArticuloPrecioPunto = {
        fecha: line.fecha.toISOString(),
        precioUnitario: decimalToMoneyString(line.costoUnitario),
        cantidad: line.cantidad,
      }
      const prev = byArticulo.get(line.articuloId)
      if (prev) {
        prev.cantidad += line.cantidad
        prev.monto = prev.monto.add(montoLine)
        prev.weightedSum = prev.weightedSum.add(montoLine)
        prev.puntos.push(punto)
      } else {
        byArticulo.set(line.articuloId, {
          codigo: line.codigo,
          descripcion: line.descripcion,
          cantidad: line.cantidad,
          monto: montoLine,
          weightedSum: montoLine,
          puntos: [punto],
        })
      }
    }

    return [...byArticulo.entries()]
      .map(([articuloId, agg]) => {
        const ppp =
          agg.cantidad > 0 ? agg.weightedSum.div(agg.cantidad) : new Decimal(0)
        const evolucionPrecios = [...agg.puntos]
          .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
          .slice(0, EVOLUCION_MAX_PUNTOS)
          .reverse()
        return {
          articuloId,
          codigo: agg.codigo,
          descripcion: agg.descripcion,
          cantidadTotal: agg.cantidad,
          precioPromedioPonderado: decimalToMoneyString(ppp),
          montoTotal: decimalToMoneyString(agg.monto),
          evolucionPrecios,
        }
      })
      .sort((a, b) => Number.parseFloat(b.montoTotal) - Number.parseFloat(a.montoTotal))
  }

  async getHistorial(
    tenantId: number,
    proveedorId: number,
    periodoDias: ProveedorHistorialPeriodoDias,
    asOf = new Date(),
  ): Promise<ProveedorHistorialResumen | null> {
    const exists = await this.assertProveedor(tenantId, proveedorId)
    if (!exists) return null

    const from = historialPeriodStart(asOf, periodoDias)

    const [comprobantes, ordenes, itemLines] = await Promise.all([
      this.prisma.comprobanteCompra.findMany({
        where: {
          tenantId,
          proveedorId,
          estado: 'A',
          fecha: { gte: from },
        },
        orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
        take: COMPRAS_LIST_LIMIT,
        select: {
          id: true,
          fecha: true,
          tipo: true,
          prefijo: true,
          numero: true,
          total: true,
          ordenCompraId: true,
        },
      }),
      this.prisma.ordenCompra.findMany({
        where: {
          tenantId,
          proveedorId,
          estado: { not: 'cancelled' },
          createdAt: { gte: from },
        },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: COMPRAS_LIST_LIMIT,
        select: {
          id: true,
          createdAt: true,
          total: true,
          estado: true,
          comprobantesCompra: { select: { id: true }, take: 1 },
        },
      }),
      this.loadItemLines(tenantId, proveedorId, from),
    ])

    const comprobanteIds = comprobantes.map((c) => c.id)
    const paidMap = await this.loadPaidMap(tenantId, comprobanteIds)

    const comprobanteOcIds = new Set(
      comprobantes
        .map((c) => c.ordenCompraId)
        .filter((id): id is number => id != null),
    )

    let totalComprado = new Decimal(0)
    const purchaseDates: Date[] = []
    const compras: ProveedorCompraRow[] = []

    for (const c of comprobantes) {
      totalComprado = totalComprado.add(c.total)
      purchaseDates.push(c.fecha)
      const paid = paidMap.get(c.id) ?? new Decimal(0)
      compras.push({
        tipo: 'comprobante',
        id: c.id,
        fecha: c.fecha.toISOString(),
        referencia: formatComprobanteRef(c.tipo, c.prefijo, c.numero),
        total: decimalToMoneyString(c.total),
        estadoPago: computeEstadoPago(c.total, paid),
        ordenCompraId: c.ordenCompraId ?? undefined,
      })
    }

    for (const oc of ordenes) {
      if (oc.comprobantesCompra.length > 0 || comprobanteOcIds.has(oc.id)) {
        continue
      }
      if (oc.estado === 'received') {
        totalComprado = totalComprado.add(oc.total)
        purchaseDates.push(oc.createdAt)
      }
      compras.push({
        tipo: 'orden_compra',
        id: oc.id,
        fecha: oc.createdAt.toISOString(),
        referencia: formatOcRef(oc.id),
        total: decimalToMoneyString(oc.total),
        estadoPago: 'n_a',
        estado: oc.estado,
      })
    }

    compras.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

    return {
      periodoDias,
      totalComprado: decimalToMoneyString(totalComprado),
      frecuenciaCompraDias: averagePurchaseIntervalDays(purchaseDates),
      cantidadCompras: purchaseDates.length,
      topArticulos: this.buildTopArticulos(itemLines),
      compras: compras.slice(0, COMPRAS_LIST_LIMIT),
    }
  }

  async getArticulos(
    tenantId: number,
    proveedorId: number,
    periodoDias: ProveedorHistorialPeriodoDias,
    asOf = new Date(),
  ): Promise<{ articulos: ProveedorArticuloHistorialRow[] } | null> {
    const exists = await this.assertProveedor(tenantId, proveedorId)
    if (!exists) return null

    const from = historialPeriodStart(asOf, periodoDias)
    const itemLines = await this.loadItemLines(tenantId, proveedorId, from)
    return { articulos: this.buildArticulosRows(itemLines) }
  }
}
