/**
 * @en Argentine tax rules (#440). The codes are the ones already persisted by existing tenants, so
 *   declaring them here changes no data: it only moves them out of the country-agnostic core.
 * @es Reglas fiscales argentinas (#440). Los codigos son los que ya persisten los tenants actuales,
 *   asi que declararlos aqui no cambia dato alguno: solo los saca del nucleo pais-agnostico.
 * @pt-BR Regras fiscais argentinas (#440). Os codigos sao os que os tenants atuais ja persistem,
 *   entao declara-los aqui nao muda dado algum: apenas os tira do nucleo pais-agnostico.
 */

import { formatCBU, validateCBU, CBU_DIGITS } from '../identifiers/cbu'
import { formatCUIT, validateCUIT } from '../identifiers/cuit'
import type { FiscalRuleSet } from '../types'

export const AR_FISCAL_RULES: FiscalRuleSet = {
  code: 'AR',
  label: 'Argentina',
  currency: 'ARS',
  taxId: {
    kind: 'cuit',
    validate: validateCUIT,
    format: formatCUIT,
    example: '20-12345678-6',
  },
  bankAccount: {
    code: 'CBU',
    digits: CBU_DIGITS,
    validate: validateCBU,
    format: formatCBU,
  },
  subjectTaxConditions: [
    { code: 'RI', labelKey: 'condicionRi', paysVat: true },
    { code: 'Mono', labelKey: 'condicionMono', paysVat: true },
    { code: 'CF', labelKey: 'condicionCf', paysVat: false },
    { code: 'Exento', labelKey: 'condicionExento', paysVat: false },
  ],
  vatRateCodes: [
    { code: '1', rate: 21, exempt: false },
    { code: '2', rate: 10.5, exempt: false },
    { code: '3', rate: 0, exempt: true },
  ],
  documentKinds: ['A', 'B', 'C'],
  vatRates: { standard: 21, reduced: 10.5 },
  providerCode: 'arca_wsfe',
}
