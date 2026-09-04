/**
 * @en UI options derived from the per-country fiscal rule registry (#440).
 * @es Opciones de UI derivadas del registro de reglas fiscales por país (#440).
 * @pt-BR Opções de UI derivadas do registro de regras fiscais por país (#440).
 */

import { describe, expect, it } from 'vitest'
import {
  defaultTaxCondition,
  documentKindOptions,
  formatVatRatePercent,
  hasBankAccountRules,
  isValidTaxCondition,
  taxConditionOptions,
  vatRateOptions,
} from '../../apps/web/src/lib/fiscal/uiOptions'

describe('fiscal UI options (#440)', () => {
  it('offers Argentine tax conditions and invoice letters for AR', () => {
    expect(taxConditionOptions('AR').map((c) => c.code)).toEqual(['RI', 'Mono', 'CF', 'Exento'])
    expect(defaultTaxCondition('AR')).toBe('RI')
    expect(documentKindOptions('AR')).toEqual(['A', 'B', 'C'])
    expect(hasBankAccountRules('AR')).toBe(true)
  })

  it('offers the product-model conditions for UY and CL; UY exposes CFE document kinds', () => {
    expect(taxConditionOptions('UY').map((c) => c.code)).toEqual(['IVA', 'CF', 'Exento'])
    expect(defaultTaxCondition('CL')).toBe('IVA')
    expect(isValidTaxCondition('RI', 'UY')).toBe(false)
    expect(isValidTaxCondition('IVA', 'UY')).toBe(true)
    expect(documentKindOptions('UY')).toEqual(['e-Factura', 'e-NotaCredito'])
    expect(documentKindOptions('CL')).toBeNull()
    expect(hasBankAccountRules('CL')).toBe(false)
  })

  it('derives VAT rate labels from the rates declared by each country', () => {
    expect(formatVatRatePercent(10.5)).toBe('10.5%')
    expect(vatRateOptions('AR').map((o) => o.rateLabel)).toEqual(['21%', '10.5%', '0%'])
    expect(vatRateOptions('UY').map((o) => (o.exempt ? 'exempt' : o.rateLabel))).toEqual([
      '22%',
      '10%',
      'exempt',
    ])
    expect(vatRateOptions('CL').filter((o) => !o.exempt).map((o) => o.rateLabel)).toEqual([
      '19%',
      '19%',
    ])
  })
})
