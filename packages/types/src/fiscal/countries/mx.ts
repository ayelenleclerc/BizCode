/**
 * @en Mexican tax rules (#210).
 * @es Reglas fiscales mexicanas (#210).
 * @pt-BR Regras fiscais mexicanas (#210).
 *
 * @en VAT: standard 16%; the reduced bucket is 0% for the mass use case of food and medicines.
 *   The border rate of 8% depends on the establishment location, not on the article, so it is not
 *   modelled in `vatRateCodes` and remains residual. SAT taxpayer categories are not in this
 *   repository: the conditions below are the product model and require review by a Mexican tax adviser.
 * @es IVA: estándar 16%; el bucket reducido es 0% para el caso masivo de alimentos y medicinas.
 *   La tasa fronteriza del 8% depende de la ubicación del establecimiento, no del artículo, así que
 *   no se modela en `vatRateCodes` y queda residual. Las categorías del SAT no están en este
 *   repositorio: las condiciones siguientes son el modelo del producto y requieren revisión de un
 *   asesor fiscal mexicano.
 * @pt-BR IVA: padrão 16%; o bucket reduzido é 0% para o caso massivo de alimentos e medicamentos.
 *   A taxa fronteiriça de 8% depende da localização do estabelecimento, não do artigo, então não é
 *   modelada em `vatRateCodes` e fica residual. As categorias do SAT não estão neste repositório:
 *   as condições a seguir são o modelo do produto e exigem revisão de um consultor fiscal mexicano.
 */

import { formatRFC, validateRFC } from '../identifiers/rfc'
import type { FiscalRuleSet } from '../types'

export const MX_FISCAL_RULES: FiscalRuleSet = {
  code: 'MX',
  label: 'Mexico',
  currency: 'MXN',
  taxId: {
    kind: 'rfc',
    validate: validateRFC,
    format: formatRFC,
    example: 'XEXX010101000',
  },
  bankAccount: null,
  subjectTaxConditions: [
    { code: 'IVA', labelKey: 'condicionIvaTaxpayer', paysVat: true },
    { code: 'CF', labelKey: 'condicionCf', paysVat: false },
    { code: 'Exento', labelKey: 'condicionExento', paysVat: false },
  ],
  vatRateCodes: [
    { code: '1', rate: 16, exempt: false },
    { code: '2', rate: 0, exempt: false },
    { code: '3', rate: 0, exempt: true },
  ],
  documentKinds: null,
  vatRates: { standard: 16, reduced: 0 },
  providerCode: 'mexico_sat_pac',
}
