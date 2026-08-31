/**
 * @en Jurisdiction catalog kept as the historical public surface (#207), now derived from the
 *   per-country rule sets in `fiscal/` (#440) so there is a single source of truth.
 * @es Catalogo de jurisdicciones conservado como superficie publica historica (#207), ahora derivado
 *   de los conjuntos de reglas por pais de `fiscal/` (#440) para tener una unica fuente de verdad.
 * @pt-BR Catalogo de jurisdicoes mantido como superficie publica historica (#207), agora derivado
 *   dos conjuntos de regras por pais de `fiscal/` (#440) para haver uma unica fonte de verdade.
 */

import {
  FISCAL_RULE_SETS,
  FISCAL_JURISDICTION_CODES,
  DEFAULT_FISCAL_JURISDICTION,
  isFiscalJurisdictionCode,
  resolveJurisdiction,
  type FiscalJurisdictionCode,
} from './fiscal/registry'
import type { TaxIdKind, VatRates } from './fiscal/types'

export {
  FISCAL_JURISDICTION_CODES,
  DEFAULT_FISCAL_JURISDICTION,
  isFiscalJurisdictionCode,
  resolveJurisdiction,
}
export type { FiscalJurisdictionCode, TaxIdKind, VatRates }

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

/**
 * @en Flattened view of the rule sets, preserving the shape consumed since #207.
 * @es Vista aplanada de los conjuntos de reglas, preservando la forma consumida desde #207.
 * @pt-BR Visao achatada dos conjuntos de regras, preservando o formato consumido desde #207.
 */
export const FISCAL_JURISDICTIONS: Record<FiscalJurisdictionCode, FiscalJurisdiction> =
  Object.fromEntries(
    FISCAL_JURISDICTION_CODES.map((code) => {
      const rules = FISCAL_RULE_SETS[code]
      return [
        code,
        {
          code,
          label: rules.label,
          currency: rules.currency,
          taxIdKind: rules.taxId.kind,
          vatRates: rules.vatRates,
          providerCode: rules.providerCode,
        },
      ]
    }),
  ) as Record<FiscalJurisdictionCode, FiscalJurisdiction>

/**
 * @en VAT rates for a jurisdiction, safe against unknown persisted values.
 * @es Alicuotas de IVA de una jurisdiccion, a prueba de valores persistidos desconocidos.
 * @pt-BR Aliquotas de IVA de uma jurisdicao, seguras contra valores persistidos desconhecidos.
 */
export function getVatRates(value: unknown): VatRates {
  return FISCAL_RULE_SETS[resolveJurisdiction(value)].vatRates
}
