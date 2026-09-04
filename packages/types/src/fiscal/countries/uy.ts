/**
 * @en Uruguayan tax rules (#440).
 * @es Reglas fiscales uruguayas (#440).
 * @pt-BR Regras fiscais uruguaias (#440).
 *
 * @en The DGI catalog of taxpayer categories is not part of this repository. The conditions below
 *   are the product model, derived from the only distinction the invoice engine actually makes,
 *   whether the subject pays VAT, and they require review by a Uruguayan tax adviser before being
 *   treated as an official catalog.
 * @es El catalogo de categorias de contribuyente de DGI no forma parte de este repositorio. Las
 *   condiciones siguientes son el modelo del producto, derivado de la unica distincion que el motor
 *   de facturacion hace realmente, si el sujeto paga IVA, y requieren revision de un asesor fiscal
 *   uruguayo antes de tratarse como catalogo oficial.
 * @pt-BR O catalogo de categorias de contribuinte da DGI nao faz parte deste repositorio. As
 *   condicoes a seguir sao o modelo do produto, derivado da unica distincao que o motor de
 *   faturamento realmente faz, se o sujeito paga IVA, e exigem revisao de um consultor fiscal
 *   uruguaio antes de serem tratadas como catalogo oficial.
 */

import { formatRUT, validateRUT } from '../identifiers/rutUy'
import type { FiscalRuleSet } from '../types'

export const UY_FISCAL_RULES: FiscalRuleSet = {
  code: 'UY',
  label: 'Uruguay',
  currency: 'UYU',
  taxId: {
    kind: 'rut',
    validate: validateRUT,
    format: formatRUT,
    example: '01-234567-8908',
  },
  bankAccount: null,
  subjectTaxConditions: [
    { code: 'IVA', labelKey: 'condicionIvaTaxpayer', paysVat: true },
    { code: 'CF', labelKey: 'condicionCf', paysVat: false },
    { code: 'Exento', labelKey: 'condicionExento', paysVat: false },
  ],
  vatRateCodes: [
    { code: '1', rate: 22, exempt: false },
    { code: '2', rate: 10, exempt: false },
    { code: '3', rate: 0, exempt: true },
  ],
  /**
   * @en Product-model CFE kinds for invoice / credit note UI — not the full official DGI CFE catalog.
   * @es Tipos CFE del modelo de producto para factura / NC — no el catálogo oficial DGI completo.
   * @pt-BR Tipos CFE do modelo de produto para fatura / NC — não o catálogo oficial DGI completo.
   */
  documentKinds: ['e-Factura', 'e-NotaCredito'],
  vatRates: { standard: 22, reduced: 10 },
  providerCode: 'uruguay_dgi',
}
