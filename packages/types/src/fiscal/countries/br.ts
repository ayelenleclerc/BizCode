/**
 * @en Brazilian tax rules (#211). Product-model only: two VAT buckets match `Factura.neto1`/`neto2`.
 * @es Reglas fiscales brasileñas (#211). Solo modelo de producto: dos buckets alineados a `Factura.neto1`/`neto2`.
 * @pt-BR Regras fiscais brasileiras (#211). Apenas modelo de produto: dois buckets alinhados a `Factura.neto1`/`neto2`.
 *
 * @en Rates 18% / 12% are a simplified product model for the dual-bucket invoice schema — not the
 *   real ICMS state matrix, IPI, PIS/COFINS, ICMS-ST, or Simples Nacional DAS. Those remain residual
 *   (#211 / #440). SEFAZ taxpayer categories are not in this repository; conditions below need
 *   review by a Brazilian tax adviser.
 * @es Las tasas 18% / 12% son un modelo de producto simplificado para el esquema de dos buckets —
 *   no la matriz real de ICMS estadual, IPI, PIS/COFINS, ICMS-ST ni Simples Nacional. Eso queda
 *   residual (#211 / #440). Las categorías de la SEFAZ no están en este repositorio; las condiciones
 *   requieren revisión de un asesor fiscal brasileño.
 * @pt-BR As taxas 18% / 12% são um modelo de produto simplificado para o esquema de dois buckets —
 *   não a matriz real de ICMS estadual, IPI, PIS/COFINS, ICMS-ST nem Simples Nacional. Isso fica
 *   residual (#211 / #440). As categorias da SEFAZ não estão neste repositório; as condições exigem
 *   revisão de um consultor fiscal brasileiro.
 */

import { formatCNPJ, validateCNPJ } from '../identifiers/cnpj'
import type { FiscalRuleSet } from '../types'

export const BR_FISCAL_RULES: FiscalRuleSet = {
  code: 'BR',
  label: 'Brazil',
  currency: 'BRL',
  taxId: {
    kind: 'cnpj',
    validate: validateCNPJ,
    format: formatCNPJ,
    example: '11.222.333/0001-81',
  },
  bankAccount: null,
  subjectTaxConditions: [
    { code: 'Contribuinte', labelKey: 'condicionIvaTaxpayer', paysVat: true },
    { code: 'NaoContribuinte', labelKey: 'condicionCf', paysVat: false },
    { code: 'Isento', labelKey: 'condicionExento', paysVat: false },
  ],
  vatRateCodes: [
    { code: '1', rate: 18, exempt: false },
    { code: '2', rate: 12, exempt: false },
    { code: '3', rate: 0, exempt: true },
  ],
  /**
   * @en Product-model NF-e kinds for invoice / return UI — not the full official SEFAZ catalog.
   *   Model 55 is cited by issue #211 (NF-e); devolução is the credit-note counterpart in the product model.
   * @es Tipos NF-e del modelo de producto para factura / devolución — no el catálogo oficial SEFAZ.
   *   El modelo 55 lo cita el issue #211 (NF-e); devolução es el par de NC en el modelo de producto.
   * @pt-BR Tipos NF-e do modelo de produto para fatura / devolução — não o catálogo oficial SEFAZ.
   *   O modelo 55 é citado pelo issue #211 (NF-e); devolução é o par de NC no modelo de produto.
   */
  documentKinds: ['55-NFe', 'NFe-Devolucao'],
  vatRates: { standard: 18, reduced: 12 },
  providerCode: 'brazil_sefaz_nfe',
}
