import { parseDbfLogical } from '@/lib/migration/legacyClienteDbf'

export type ArticuloCondIva = '1' | '2' | '3'

/**
 * @en Maps legacy `ARTICULOS.DBF` `COND_IVA` numeric codes to BizCode articulo `condIva`.
 * @es Mapea códigos numéricos `COND_IVA` de `ARTICULOS.DBF` a `condIva` de artículo en BizCode.
 * @pt-BR Mapeia códigos numéricos `COND_IVA` de `ARTICULOS.DBF` para `condIva` de artigo no BizCode.
 */
export function mapLegacyArticuloCondIva(value: unknown): ArticuloCondIva | null {
  const n = Math.round(Number(value))
  if (n === 1) return '1'
  if (n === 2) return '2'
  if (n === 3) return '3'
  return null
}

function trimOptionalString(value: unknown, maxLen: number): string | undefined {
  if (value == null) return undefined
  const trimmed = String(value).trim()
  if (trimmed === '') return undefined
  return trimmed.slice(0, maxLen)
}

function finiteNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

/**
 * @en Builds a plain object for articulo import from `ARTICULOS.DBF` (`rubroCodigo` for lookup, not `rubroId`).
 * @es Arma objeto plano para importar artículo desde `ARTICULOS.DBF` (`rubroCodigo` para lookup, no `rubroId`).
 * @pt-BR Monta objeto para importar artigo de `ARTICULOS.DBF` (`rubroCodigo` para lookup, não `rubroId`).
 */
export function dbfRowToRawArticulo(row: Record<string, unknown>): Record<string, unknown> {
  const raw: Record<string, unknown> = {}

  const codigo = Math.round(Number(row.COD_ART))
  if (Number.isFinite(codigo)) {
    raw.codigo = codigo
  }

  const descripcion = trimOptionalString(row.DESCRIP, 30)
  if (descripcion !== undefined) {
    raw.descripcion = descripcion
  }

  const rubroCodigo = Math.round(Number(row.COD_RUBRO))
  if (Number.isFinite(rubroCodigo)) {
    raw.rubroCodigo = rubroCodigo
  }

  const condIva = mapLegacyArticuloCondIva(row.COND_IVA)
  if (condIva !== null) {
    raw.condIva = condIva
  }

  const umedida = trimOptionalString(row.UMEDIDA, 6)
  if (umedida !== undefined) {
    raw.umedida = umedida
  }

  const precioLista1 = finiteNumber(row.PRECIO1)
  if (precioLista1 > 0) {
    raw.precioLista1 = precioLista1
  }

  const precioLista2 = finiteNumber(row.PRECIO2)
  if (precioLista2 > 0) {
    raw.precioLista2 = precioLista2
  }

  const costo = finiteNumber(row.COSTO)
  if (costo > 0) {
    raw.costo = costo
  }

  const stockRaw = row.STOCK
  if (stockRaw == null || stockRaw === '') {
    raw.stock = 0
  } else {
    const stock = Math.floor(finiteNumber(stockRaw, 0))
    raw.stock = Math.max(0, stock)
  }

  const minimo = Math.floor(finiteNumber(row.STOCK_MIN, 0))
  raw.minimo = Math.max(0, minimo)

  const activo = parseDbfLogical(row.ACTIVO)
  if (activo !== undefined) {
    raw.activo = activo
  }

  return raw
}
