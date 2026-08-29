/**
 * @en Tax jurisdiction catalog for the multi-country base (#207): VAT rates, tax-id kind and currency.
 * @es Catalogo de jurisdicciones fiscales para la base multi-pais (#207): alicuotas de IVA, tipo de identificador y moneda.
 * @pt-BR Catalogo de jurisdicoes fiscais para a base multipais (#207): aliquotas de IVA, tipo de identificador e moeda.
 *
 * @en Declarative data only: emitting a fiscal document still depends on each provider adapter.
 * @es Solo datos declarativos: emitir un comprobante sigue dependiendo del adaptador de cada proveedor.
 * @pt-BR Apenas dados declarativos: emitir um comprovante ainda depende do adaptador de cada provedor.
 */

/**
 * @en Jurisdictions with an operational tax model. Mexico is excluded: its adapter is a capability stub.
 * @es Jurisdicciones con modelo fiscal operativo. Mexico queda fuera: su adaptador es un stub de capacidades.
 * @pt-BR Jurisdicoes com modelo fiscal operacional. Mexico fica de fora: seu adaptador e um stub de capacidades.
 */
export const FISCAL_JURISDICTION_CODES = ['AR', 'UY'] as const

export type FiscalJurisdictionCode = (typeof FISCAL_JURISDICTION_CODES)[number]

/**
 * @en Jurisdiction used when a tenant has no explicit configuration; preserves the historical behaviour.
 * @es Jurisdiccion usada cuando el tenant no tiene configuracion explicita; conserva el comportamiento historico.
 * @pt-BR Jurisdicao usada quando o tenant nao tem configuracao explicita; mantem o comportamento historico.
 */
export const DEFAULT_FISCAL_JURISDICTION: FiscalJurisdictionCode = 'AR'

/**
 * @en Kind of tax identifier a jurisdiction expects, which selects the validation algorithm.
 * @es Tipo de identificador fiscal que espera la jurisdiccion, que selecciona el algoritmo de validacion.
 * @pt-BR Tipo de identificador fiscal esperado pela jurisdicao, que seleciona o algoritmo de validacao.
 */
export type TaxIdKind = 'cuit' | 'rut'

/**
 * @en Two VAT rates per jurisdiction, matching the `neto1`/`neto2` buckets persisted on `Factura`.
 * @es Dos alicuotas de IVA por jurisdiccion, alineadas con los buckets `neto1`/`neto2` de `Factura`.
 * @pt-BR Duas aliquotas de IVA por jurisdicao, alinhadas aos buckets `neto1`/`neto2` de `Factura`.
 */
export type VatRates = {
  standard: number
  reduced: number
}

export type FiscalJurisdiction = {
  code: FiscalJurisdictionCode
  label: string
  currency: string
  taxIdKind: TaxIdKind
  vatRates: VatRates
  /**
   * @en Fiscal provider code expected for the jurisdiction; must exist in the provider registry.
   * @es Codigo de proveedor fiscal esperado para la jurisdiccion; debe existir en el registro de proveedores.
   * @pt-BR Codigo de provedor fiscal esperado para a jurisdicao; deve existir no registro de provedores.
   */
  providerCode: string
}

export const FISCAL_JURISDICTIONS: Record<FiscalJurisdictionCode, FiscalJurisdiction> = {
  AR: {
    code: 'AR',
    label: 'Argentina',
    currency: 'ARS',
    taxIdKind: 'cuit',
    vatRates: { standard: 21, reduced: 10.5 },
    providerCode: 'arca_wsfe',
  },
  UY: {
    code: 'UY',
    label: 'Uruguay',
    currency: 'UYU',
    taxIdKind: 'rut',
    vatRates: { standard: 22, reduced: 10 },
    providerCode: 'uruguay_dgi',
  },
}

/**
 * @en Narrows an arbitrary string to a supported jurisdiction code.
 * @es Estrecha un string arbitrario a un codigo de jurisdiccion soportado.
 * @pt-BR Restringe uma string arbitraria a um codigo de jurisdicao suportado.
 */
export function isFiscalJurisdictionCode(value: unknown): value is FiscalJurisdictionCode {
  return (
    typeof value === 'string' &&
    (FISCAL_JURISDICTION_CODES as readonly string[]).includes(value)
  )
}

/**
 * @en Resolves a persisted value to a jurisdiction, falling back to the default when unknown or absent.
 * @es Resuelve un valor persistido a una jurisdiccion, cayendo al default cuando es desconocido o falta.
 * @pt-BR Resolve um valor persistido para uma jurisdicao, retornando ao padrao quando desconhecido ou ausente.
 */
export function resolveJurisdiction(value: unknown): FiscalJurisdictionCode {
  return isFiscalJurisdictionCode(value) ? value : DEFAULT_FISCAL_JURISDICTION
}

/**
 * @en VAT rates for a jurisdiction, safe against unknown persisted values.
 * @es Alicuotas de IVA de una jurisdiccion, a prueba de valores persistidos desconocidos.
 * @pt-BR Aliquotas de IVA de uma jurisdicao, seguras contra valores persistidos desconhecidos.
 */
export function getVatRates(value: unknown): VatRates {
  return FISCAL_JURISDICTIONS[resolveJurisdiction(value)].vatRates
}
