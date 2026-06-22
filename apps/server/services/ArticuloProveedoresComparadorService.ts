import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

const PRECIO_DESACTUALIZADO_DIAS = 30

export type ArticuloProveedoresSortField = 'precio' | 'precioListaFecha' | 'ultimaCompra'

export type ArticuloProveedoresSortDirection = 'asc' | 'desc'

export type ArticuloProveedorComparadorRow = {
  proveedorId: number
  proveedorCodigo: number
  proveedorRsocial: string
  codigoProveedor: string
  descripcionProveedor: string | null
  precioLista: string | null
  precioListaFecha: string | null
  precioDesactualizado: boolean
  ultimaCompraFecha: string | null
  esMasBarato: boolean
}

export type ArticuloProveedoresComparadorData = {
  articuloId: number
  articuloCodigo: number
  articuloDescripcion: string
  proveedorMasBaratoId: number | null
  proveedores: ArticuloProveedorComparadorRow[]
}

function decimalToMoneyString(value: Decimal | null): string | null {
  if (value == null) return null
  return value.toFixed(2)
}

function isPrecioDesactualizado(fecha: Date | null, hasPrecio: boolean): boolean {
  if (!hasPrecio || fecha == null) return false
  const days = Math.floor((Date.now() - fecha.getTime()) / (24 * 60 * 60 * 1000))
  return days > PRECIO_DESACTUALIZADO_DIAS
}

function compareNullableNumber(
  a: string | null,
  b: string | null,
  dir: ArticuloProveedoresSortDirection,
): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  const na = Number.parseFloat(a)
  const nb = Number.parseFloat(b)
  if (!Number.isFinite(na) && !Number.isFinite(nb)) return 0
  if (!Number.isFinite(na)) return 1
  if (!Number.isFinite(nb)) return -1
  const diff = na - nb
  return dir === 'asc' ? diff : -diff
}

function compareNullableIsoDate(
  a: string | null,
  b: string | null,
  dir: ArticuloProveedoresSortDirection,
): number {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  const ta = new Date(a).getTime()
  const tb = new Date(b).getTime()
  if (Number.isNaN(ta) && Number.isNaN(tb)) return 0
  if (Number.isNaN(ta)) return 1
  if (Number.isNaN(tb)) return -1
  const diff = ta - tb
  return dir === 'asc' ? diff : -diff
}

function sortRows(
  rows: ArticuloProveedorComparadorRow[],
  sortBy: ArticuloProveedoresSortField,
  sortDir: ArticuloProveedoresSortDirection,
): ArticuloProveedorComparadorRow[] {
  const sorted = [...rows]
  sorted.sort((a, b) => {
    if (sortBy === 'precio') {
      return compareNullableNumber(a.precioLista, b.precioLista, sortDir)
    }
    if (sortBy === 'precioListaFecha') {
      return compareNullableIsoDate(a.precioListaFecha, b.precioListaFecha, sortDir)
    }
    return compareNullableIsoDate(a.ultimaCompraFecha, b.ultimaCompraFecha, sortDir)
  })
  return sorted
}

function resolveMasBaratoId(rows: ArticuloProveedorComparadorRow[]): number | null {
  let bestId: number | null = null
  let bestPrice: number | null = null
  for (const row of rows) {
    if (row.precioLista == null) continue
    const price = Number.parseFloat(row.precioLista)
    if (!Number.isFinite(price)) continue
    if (bestPrice == null || price < bestPrice) {
      bestPrice = price
      bestId = row.proveedorId
    }
  }
  return bestId
}

/**
 * @en Compare supplier catalog prices for one internal article (#274).
 * @es Comparador de precios de proveedores para un artículo (#274).
 * @pt-BR Comparador de preços de fornecedores para um artigo (#274).
 */
export class ArticuloProveedoresComparadorService {
  constructor(private readonly prisma: PrismaClient) {}

  async listProveedoresForArticulo(
    tenantId: number,
    articuloId: number,
    options?: {
      sortBy?: ArticuloProveedoresSortField
      sortDir?: ArticuloProveedoresSortDirection
    },
  ): Promise<ArticuloProveedoresComparadorData | null> {
    const articulo = await this.prisma.articulo.findFirst({
      where: { id: articuloId, tenantId },
      select: { id: true, codigo: true, descripcion: true },
    })
    if (!articulo) {
      return null
    }

    const catalogEntries = await this.prisma.proveedorArticulo.findMany({
      where: {
        tenantId,
        articuloId,
        activo: true,
        proveedor: { activo: true, tenantId },
      },
      include: {
        proveedor: {
          select: { id: true, codigo: true, rsocial: true },
        },
      },
    })

    const lastPurchaseRows = await this.prisma.ordenCompra.groupBy({
      by: ['proveedorId'],
      where: {
        tenantId,
        estado: 'received',
        items: {
          some: {
            articuloId,
            cantidadRecibida: { gt: 0 },
          },
        },
      },
      _max: { updatedAt: true },
    })

    const lastPurchaseByProveedor = new Map<number, Date>()
    for (const row of lastPurchaseRows) {
      if (row._max.updatedAt != null) {
        lastPurchaseByProveedor.set(row.proveedorId, row._max.updatedAt)
      }
    }

    const proveedores: ArticuloProveedorComparadorRow[] = catalogEntries.map((entry) => {
      const hasPrecio = entry.precioLista != null
      const ultima = lastPurchaseByProveedor.get(entry.proveedorId)
      return {
        proveedorId: entry.proveedor.id,
        proveedorCodigo: entry.proveedor.codigo,
        proveedorRsocial: entry.proveedor.rsocial,
        codigoProveedor: entry.codigoProveedor,
        descripcionProveedor: entry.descripcion,
        precioLista: decimalToMoneyString(entry.precioLista),
        precioListaFecha: entry.precioListaFecha?.toISOString() ?? null,
        precioDesactualizado: isPrecioDesactualizado(entry.precioListaFecha, hasPrecio),
        ultimaCompraFecha: ultima?.toISOString() ?? null,
        esMasBarato: false,
      }
    })

    const sortBy = options?.sortBy ?? 'precio'
    const sortDir = options?.sortDir ?? 'asc'
    const sorted = sortRows(proveedores, sortBy, sortDir)
    const masBaratoId = resolveMasBaratoId(sorted)

    return {
      articuloId: articulo.id,
      articuloCodigo: articulo.codigo,
      articuloDescripcion: articulo.descripcion,
      proveedorMasBaratoId: masBaratoId,
      proveedores: sorted.map((row) => ({
        ...row,
        esMasBarato: masBaratoId != null && row.proveedorId === masBaratoId,
      })),
    }
  }
}
