/**
 * @en UI helpers that derive tax-condition and VAT-rate options from the per-country rule registry (#440).
 * @es Helpers de UI que derivan las opciones de condición fiscal y alícuota del registro por país (#440).
 * @pt-BR Helpers de UI que derivam as opções de condição fiscal e alíquota do registro por país (#440).
 */

import {
  getDefaultSubjectTaxCondition,
  getDocumentKinds,
  getFiscalRules,
  getSubjectTaxConditions,
  getVatRateCodes,
  type FiscalJurisdictionCode,
  type SubjectTaxCondition,
  type VatRateCode,
} from '@bizcode/types'

export type TaxConditionOption = {
  code: string
  labelKey: string
}

export type VatRateOption = {
  code: string
  rate: number
  exempt: boolean
  /**
   * @en Rate label derived from the number (`21%`); exempt uses the caller's translated string.
   * @es Etiqueta de alícuota derivada del número (`21%`); exento usa el string traducido del caller.
   * @pt-BR Rótulo de alíquota derivado do número (`21%`); isento usa a string traduzida do caller.
   */
  rateLabel: string
}

/**
 * @en Formats a VAT rate as a percentage label without hardcoding country-specific numbers in JSX.
 * @es Formatea una alícuota como etiqueta porcentual sin cablear números por país en el JSX.
 * @pt-BR Formata uma alíquota como rótulo percentual sem fixar números por país no JSX.
 */
export function formatVatRatePercent(rate: number): string {
  const text = Number.isInteger(rate) ? String(rate) : String(rate)
  return `${text}%`
}

/**
 * @en Subject tax conditions offered for a jurisdiction, for `<select>` options.
 * @es Condiciones fiscales ofrecidas para una jurisdicción, para opciones de `<select>`.
 * @pt-BR Condições fiscais oferecidas para uma jurisdição, para opções de `<select>`.
 */
export function taxConditionOptions(jurisdiction: unknown): readonly TaxConditionOption[] {
  return getSubjectTaxConditions(jurisdiction).map((c: SubjectTaxCondition) => ({
    code: c.code,
    labelKey: c.labelKey,
  }))
}

/**
 * @en Default subject tax condition for new records in a jurisdiction.
 * @es Condición fiscal por defecto de los registros nuevos en una jurisdicción.
 * @pt-BR Condição fiscal padrão dos registros novos em uma jurisdição.
 */
export function defaultTaxCondition(jurisdiction: unknown): string {
  return getDefaultSubjectTaxCondition(jurisdiction)
}

/**
 * @en Whether a code is a valid subject tax condition for the jurisdiction.
 * @es Si un código es una condición fiscal válida para la jurisdicción.
 * @pt-BR Se um código é uma condição fiscal válida para a jurisdição.
 */
export function isValidTaxCondition(code: string, jurisdiction: unknown): boolean {
  return getSubjectTaxConditions(jurisdiction).some((c) => c.code === code)
}

/**
 * @en Article VAT codes with labels derived from the rates declared by the country.
 * @es Códigos de IVA de artículo con etiquetas derivadas de las tasas que declara el país.
 * @pt-BR Códigos de IVA de artigo com rótulos derivados das taxas que o país declara.
 */
export function vatRateOptions(jurisdiction: unknown): readonly VatRateOption[] {
  return getVatRateCodes(jurisdiction).map((c: VatRateCode) => ({
    code: c.code,
    rate: c.rate,
    exempt: c.exempt,
    rateLabel: formatVatRatePercent(c.rate),
  }))
}

/**
 * @en Invoice letters of a jurisdiction, or `null` when the concept does not exist.
 * @es Letras de comprobante de una jurisdicción, o `null` cuando el concepto no existe.
 * @pt-BR Letras de comprovante de uma jurisdição, ou `null` quando o conceito não existe.
 */
export function documentKindOptions(jurisdiction: unknown): readonly string[] | null {
  return getDocumentKinds(jurisdiction)
}

/**
 * @en Whether the jurisdiction has an evidenced bank account identifier (e.g. Argentine CBU).
 * @es Si la jurisdicción tiene un identificador bancario evidenciado (p. ej. CBU argentino).
 * @pt-BR Se a jurisdição tem um identificador bancário evidenciado (ex.: CBU argentino).
 */
export function hasBankAccountRules(jurisdiction: FiscalJurisdictionCode | unknown): boolean {
  return getFiscalRules(jurisdiction).bankAccount != null
}
