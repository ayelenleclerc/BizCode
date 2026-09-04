/**
 * @en Mexico as a fiscal jurisdiction on the per-country rule registry (#210).
 * @es México como jurisdicción fiscal sobre el registro de reglas por país (#210).
 * @pt-BR México como jurisdição fiscal sobre o registro de regras por país (#210).
 */

import { describe, expect, it } from 'vitest'
import {
  FISCAL_JURISDICTION_CODES,
  FISCAL_JURISDICTIONS,
  FISCAL_RULE_SETS,
  getVatRates,
  validateRFC,
} from '@bizcode/types'
import { getDefaultModulesForJurisdiction } from '../../apps/web/src/lib/modules'
import { calculateInvoice } from '../../apps/web/src/lib/invoice'
import { formatTaxId, validateTaxId } from '../../apps/web/src/lib/validators'

describe('Mexico fiscal jurisdiction (#210)', () => {
  it('is listed in the jurisdiction catalog with MXN and SAT provider', () => {
    expect(FISCAL_JURISDICTION_CODES).toContain('MX')
    expect(FISCAL_JURISDICTIONS.MX).toMatchObject({
      currency: 'MXN',
      taxIdKind: 'rfc',
      providerCode: 'mexico_sat_pac',
      vatRates: { standard: 16, reduced: 0 },
    })
    expect(getVatRates('MX')).toEqual({ standard: 16, reduced: 0 })
  })

  it('declares a complete rule set without bank id or invoice letters', () => {
    const rules = FISCAL_RULE_SETS.MX
    expect(rules.taxId.validate(rules.taxId.example)).toBe(true)
    expect(validateRFC(rules.taxId.example)).toBe(true)
    expect(rules.bankAccount).toBeNull()
    expect(rules.documentKinds).toBeNull()
    expect(rules.vatRateCodes.map((c) => c.rate)).toEqual([16, 0, 0])
  })

  it('validates and formats tax ids through the shared helpers', () => {
    expect(validateTaxId('XEXX010101000', 'MX')).toBe(true)
    expect(formatTaxId('xexx010101000', 'MX')).toBe('XEXX010101000')
    expect(validateTaxId('20123456786', 'MX')).toBe(false)
  })

  it('excludes Argentine-only modules from Mexican defaults', () => {
    const modules = getDefaultModulesForJurisdiction('MX')
    expect(modules).not.toContain('billing.arca_cae')
    expect(modules).not.toContain('fiscal.cheques')
    expect(modules).not.toContain('fiscal.libro_iva')
    expect(modules).toContain('core.invoicing')
    expect(modules).toContain('billing.cfdi_sat')
  })

  it('charges 16% VAT on the standard bucket for a taxpayer', () => {
    const items = [{ cantidad: 1, precio: 100, dscto: 0, articuloIva: '1' as const }]
    expect(calculateInvoice(items, 'IVA', 'MX').iva1).toBe(16)
    expect(calculateInvoice(items, 'CF', 'MX').iva1).toBe(0)
  })
})
