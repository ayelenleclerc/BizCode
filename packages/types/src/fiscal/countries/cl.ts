/**
 * @en Chilean tax rules (#208, #440).
 * @es Reglas fiscales chilenas (#208, #440).
 * @pt-BR Regras fiscais chilenas (#208, #440).
 *
 * @en Chile has a single 19% VAT rate, so `reduced` repeats it: `Factura` persists the `neto1` and
 *   `neto2` buckets and a bucket without a rate has no representation. As with Uruguay, the SII
 *   catalog of taxpayer categories is not part of this repository: the conditions below are the
 *   product model and require review by a Chilean tax adviser.
 * @es Chile tiene una unica alicuota del 19%, por eso `reduced` la repite: `Factura` persiste los
 *   buckets `neto1` y `neto2` y un bucket sin alicuota no tiene representacion. Igual que en
 *   Uruguay, el catalogo de categorias del SII no forma parte de este repositorio: las condiciones
 *   siguientes son el modelo del producto y requieren revision de un asesor fiscal chileno.
 * @pt-BR O Chile tem uma unica aliquota de 19%, por isso `reduced` a repete: `Factura` persiste os
 *   buckets `neto1` e `neto2` e um bucket sem aliquota nao tem representacao. Como no Uruguai, o
 *   catalogo de categorias do SII nao faz parte deste repositorio: as condicoes a seguir sao o
 *   modelo do produto e exigem revisao de um consultor fiscal chileno.
 */

import { formatRUTCL, validateRUTCL } from '../identifiers/rutCl'
import type { FiscalRuleSet } from '../types'

export const CL_FISCAL_RULES: FiscalRuleSet = {
  code: 'CL',
  label: 'Chile',
  currency: 'CLP',
  taxId: {
    kind: 'rut',
    validate: validateRUTCL,
    format: formatRUTCL,
    example: '12.345.678-5',
  },
  bankAccount: null,
  subjectTaxConditions: [
    { code: 'IVA', labelKey: 'condicionIvaTaxpayer', paysVat: true },
    { code: 'CF', labelKey: 'condicionCf', paysVat: false },
    { code: 'Exento', labelKey: 'condicionExento', paysVat: false },
  ],
  vatRateCodes: [
    { code: '1', rate: 19, exempt: false },
    { code: '2', rate: 19, exempt: false },
    { code: '3', rate: 0, exempt: true },
  ],
  documentKinds: null,
  vatRates: { standard: 19, reduced: 19 },
  providerCode: 'chile_sii',
}
