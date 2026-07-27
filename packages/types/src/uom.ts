/**
 * @en Units of measure (UoM) shared types and pure helpers for catalog items (#203).
 * @es Tipos y helpers puros compartidos de unidades de medida (UoM) para artículos (#203).
 * @pt-BR Tipos e helpers puros compartilhados de unidades de medida (UoM) para artigos (#203).
 */

/** Base units supported for stock/quantity handling across the catalog (#203). */
export const UNIDAD_BASE_VALUES = ['unidad', 'kg', 'gramo', 'litro', 'metro', 'm2', 'm3', 'rollo', 'caja'] as const

export type UnidadBase = (typeof UNIDAD_BASE_VALUES)[number]

/** AFIP WSFE UniMedida codes (documented map; mock CAE has no line XML yet). */
export const AFIP_UNIDAD_CODES: Record<UnidadBase, string> = {
  unidad: '07',
  kg: '01',
  gramo: '14',
  litro: '05',
  metro: '02',
  m2: '03',
  m3: '04',
  rollo: '07',
  caja: '07',
}

/** Legacy 2-6 char `umedida` code derived from each unidadBase, for DBF/import compat (#203). */
const UMEDIDA_LEGACY_CODES: Record<UnidadBase, string> = {
  unidad: 'UN',
  kg: 'KG',
  gramo: 'GR',
  litro: 'LT',
  metro: 'MT',
  m2: 'M2',
  m3: 'M3',
  rollo: 'ROLLO',
  caja: 'CAJA',
}

/**
 * @en Derives the short legacy `umedida` (2-6 chars) from a unidadBase, for DBF/import compatibility.
 * @es Deriva el `umedida` legacy corto (2-6 caracteres) a partir de unidadBase, para compatibilidad DBF/importación.
 * @pt-BR Deriva o `umedida` legado curto (2-6 caracteres) a partir de unidadBase, para compatibilidade DBF/importação.
 */
export function umedidaFromUnidadBase(unidadBase: UnidadBase): string {
  return UMEDIDA_LEGACY_CODES[unidadBase]
}

/**
 * @en Type guard checking whether a string is a valid UnidadBase.
 * @es Type guard que verifica si un string es un UnidadBase válido.
 * @pt-BR Type guard que verifica se uma string é um UnidadBase válido.
 */
export function isUnidadBase(value: string): value is UnidadBase {
  return (UNIDAD_BASE_VALUES as readonly string[]).includes(value)
}

/**
 * @en Returns the AFIP WSFE UniMedida code for a given unidadBase.
 * @es Devuelve el código AFIP WSFE UniMedida para un unidadBase dado.
 * @pt-BR Retorna o código AFIP WSFE UniMedida para um unidadBase informado.
 */
export function afipCodigoForUnidad(unidadBase: UnidadBase): string {
  return AFIP_UNIDAD_CODES[unidadBase]
}

/**
 * @en True when quantities may be non-integer (corte a medida). `unidad` is always integer unless multiploVenta has a fraction.
 * @es True cuando las cantidades pueden ser no enteras (corte a medida). `unidad` siempre es entero salvo que multiploVenta tenga fracción.
 * @pt-BR True quando as quantidades podem ser não inteiras (corte sob medida). `unidad` é sempre inteiro salvo que multiploVenta tenha fração.
 */
export function allowsDecimalQuantity(unidadBase: UnidadBase, multiploVenta?: number | null): boolean {
  if (unidadBase !== 'unidad') return true
  if (multiploVenta === null || multiploVenta === undefined) return false
  return !Number.isInteger(multiploVenta)
}

/**
 * @en Convert a purchase quantity to base stock units: purchaseQty * factorConversion.
 * @es Convierte una cantidad de compra a unidades base de stock: cantidadCompra * factorConversion.
 * @pt-BR Converte uma quantidade de compra para unidades base de estoque: quantidadeCompra * fatorConversao.
 */
export function toBaseQuantity(purchaseQty: number, factorConversion: number): number {
  return purchaseQty * factorConversion
}

/**
 * @en Inverse of toBaseQuantity: base / factor (guards factor > 0, returns 0 otherwise).
 * @es Inversa de toBaseQuantity: base / factor (protege factor > 0, devuelve 0 en caso contrario).
 * @pt-BR Inversa de toBaseQuantity: base / fator (protege fator > 0, retorna 0 caso contrário).
 */
export function fromBaseQuantity(baseQty: number, factorConversion: number): number {
  if (!Number.isFinite(factorConversion) || factorConversion <= 0) return 0
  return baseQty / factorConversion
}

/** Rounds a number to 4 decimal places, matching Decimal(14,4) storage precision (#203). */
export function roundQty(n: number): number {
  return Math.round(n * 10_000) / 10_000
}

/**
 * @en Validates a quantity against UoM rules: must be > 0 and finite; integer unless decimals are allowed; multiple of multiploVenta when set (tolerance 1e-6).
 * @es Valida una cantidad contra las reglas de UoM: debe ser > 0 y finita; entera salvo que se permitan decimales; múltiplo de multiploVenta si está definido (tolerancia 1e-6).
 * @pt-BR Valida uma quantidade contra as regras de UoM: deve ser > 0 e finita; inteira salvo quando decimais são permitidos; múltipla de multiploVenta quando definido (tolerância 1e-6).
 */
export function validateQuantityForUom(params: {
  cantidad: number
  unidadBase: UnidadBase
  multiploVenta?: number | null
}): { ok: true } | { ok: false; error: string } {
  const { cantidad, unidadBase, multiploVenta } = params

  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    return { ok: false, error: 'cantidad must be a finite number greater than 0' }
  }

  const decimalAllowed = allowsDecimalQuantity(unidadBase, multiploVenta)
  if (!decimalAllowed && !Number.isInteger(cantidad)) {
    return { ok: false, error: `cantidad must be an integer for unidadBase "${unidadBase}"` }
  }

  if (multiploVenta !== null && multiploVenta !== undefined && multiploVenta > 0) {
    const ratio = cantidad / multiploVenta
    const nearestMultiple = Math.round(ratio)
    if (Math.abs(ratio - nearestMultiple) > 1e-6) {
      return { ok: false, error: `cantidad must be a multiple of ${multiploVenta}` }
    }
  }

  return { ok: true }
}
