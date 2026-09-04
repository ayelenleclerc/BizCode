/**
 * @en Registry that composes the per-country rule sets (#440). Adding a jurisdiction means adding a
 *   file under `countries/` and one entry here: the core needs no change.
 * @es Registro que compone los conjuntos de reglas por pais (#440). Agregar una jurisdiccion es
 *   agregar un archivo en `countries/` y una entrada aqui: el nucleo no cambia.
 * @pt-BR Registro que compoe os conjuntos de regras por pais (#440). Adicionar uma jurisdicao e
 *   adicionar um arquivo em `countries/` e uma entrada aqui: o nucleo nao muda.
 */

import { AR_FISCAL_RULES } from './countries/ar'
import { UY_FISCAL_RULES } from './countries/uy'
import { CL_FISCAL_RULES } from './countries/cl'
import type { FiscalRuleSet, SubjectTaxCondition, VatRateCode } from './types'

/**
 * @en Order matters: it is the order the user interface offers the jurisdictions in.
 * @es El orden importa: es el orden en que la interfaz ofrece las jurisdicciones.
 * @pt-BR A ordem importa: e a ordem em que a interface oferece as jurisdicoes.
 */
export const FISCAL_JURISDICTION_CODES = ['AR', 'UY', 'CL'] as const

export type FiscalJurisdictionCode = (typeof FISCAL_JURISDICTION_CODES)[number]

/**
 * @en Jurisdiction used when a tenant has no explicit configuration; preserves the historical behaviour.
 * @es Jurisdiccion usada cuando el tenant no tiene configuracion explicita; conserva el comportamiento historico.
 * @pt-BR Jurisdicao usada quando o tenant nao tem configuracao explicita; mantem o comportamento historico.
 */
export const DEFAULT_FISCAL_JURISDICTION: FiscalJurisdictionCode = 'AR'

export const FISCAL_RULE_SETS: Record<FiscalJurisdictionCode, FiscalRuleSet> = {
  AR: AR_FISCAL_RULES,
  UY: UY_FISCAL_RULES,
  CL: CL_FISCAL_RULES,
}

/**
 * @en Narrows an arbitrary string to a supported jurisdiction code.
 * @es Estrecha un string arbitrario a un codigo de jurisdiccion soportado.
 * @pt-BR Restringe uma string arbitraria a um codigo de jurisdicao suportado.
 */
export function isFiscalJurisdictionCode(value: unknown): value is FiscalJurisdictionCode {
  return typeof value === 'string' && (FISCAL_JURISDICTION_CODES as readonly string[]).includes(value)
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
 * @en Rule set of a jurisdiction, safe against unknown persisted values.
 * @es Conjunto de reglas de una jurisdiccion, a prueba de valores persistidos desconocidos.
 * @pt-BR Conjunto de regras de uma jurisdicao, seguro contra valores persistidos desconhecidos.
 */
export function getFiscalRules(value: unknown): FiscalRuleSet {
  return FISCAL_RULE_SETS[resolveJurisdiction(value)]
}

/**
 * @en Tax conditions a jurisdiction offers for customers, suppliers and the issuing company.
 * @es Condiciones fiscales que una jurisdiccion ofrece para clientes, proveedores y empresa emisora.
 * @pt-BR Condicoes fiscais que uma jurisdicao oferece para clientes, fornecedores e empresa emissora.
 */
export function getSubjectTaxConditions(value: unknown): readonly SubjectTaxCondition[] {
  return getFiscalRules(value).subjectTaxConditions
}

/**
 * @en Default tax condition for new records in a jurisdiction.
 * @es Condicion fiscal por defecto de los registros nuevos en una jurisdiccion.
 * @pt-BR Condicao fiscal padrao dos registros novos em uma jurisdicao.
 */
export function getDefaultSubjectTaxCondition(value: unknown): string {
  return getFiscalRules(value).subjectTaxConditions[0].code
}

/**
 * @en Whether a subject tax condition pays VAT. Unknown codes are treated as paying VAT, which is
 *   the conservative outcome: it never silently drops tax from an invoice.
 * @es Si una condicion fiscal paga IVA. Los codigos desconocidos se tratan como que pagan, que es el
 *   resultado conservador: nunca quita impuesto de una factura en silencio.
 * @pt-BR Se uma condicao fiscal paga IVA. Codigos desconhecidos sao tratados como pagantes, que e o
 *   resultado conservador: nunca remove imposto de uma fatura silenciosamente.
 */
export function subjectPaysVat(conditionCode: string, value: unknown): boolean {
  const condition = getFiscalRules(value).subjectTaxConditions.find((c) => c.code === conditionCode)
  return condition ? condition.paysVat : true
}

/**
 * @en Article VAT codes of a jurisdiction with the rate each one means.
 * @es Codigos de IVA de articulo de una jurisdiccion con la tasa que significa cada uno.
 * @pt-BR Codigos de IVA de artigo de uma jurisdicao com a taxa que cada um significa.
 */
export function getVatRateCodes(value: unknown): readonly VatRateCode[] {
  return getFiscalRules(value).vatRateCodes
}

/**
 * @en Invoice letters of a jurisdiction, or `null` where the concept does not exist.
 * @es Letras de comprobante de una jurisdiccion, o `null` donde el concepto no existe.
 * @pt-BR Letras de comprovante de uma jurisdicao, ou `null` onde o conceito nao existe.
 */
export function getDocumentKinds(value: unknown): readonly string[] | null {
  return getFiscalRules(value).documentKinds
}
