import { describe, expect, it } from 'vitest'
import {
  FISCAL_JURISDICTIONS,
  FISCAL_JURISDICTION_CODES,
  getVatRates,
  isFiscalJurisdictionCode,
} from '@bizcode/types'
import { calculateInvoice } from '../../apps/web/src/lib/invoice'
import { formatTaxId, validateTaxId } from '../../apps/web/src/lib/validators'
import { getDefaultModulesForJurisdiction } from '../../apps/web/src/lib/modules'

describe('Chile in the fiscal jurisdiction catalog (#208)', () => {
  it('is a supported jurisdiction', () => {
    expect(FISCAL_JURISDICTION_CODES).toContain('CL')
    expect(isFiscalJurisdictionCode('CL')).toBe(true)
  })

  it('uses CLP and a single 19% VAT rate in both buckets', () => {
    expect(FISCAL_JURISDICTIONS.CL.currency).toBe('CLP')
    expect(getVatRates('CL')).toEqual({ standard: 19, reduced: 19 })
  })

  it('points at the SII provider', () => {
    expect(FISCAL_JURISDICTIONS.CL.providerCode).toBe('chile_sii')
  })

  it('does not alter the Argentine or Uruguayan rates', () => {
    expect(getVatRates('AR')).toEqual({ standard: 21, reduced: 10.5 })
    expect(getVatRates('UY')).toEqual({ standard: 22, reduced: 10 })
  })
})

describe('Chilean tax id resolution (#208)', () => {
  const CHILEAN_RUT = '123456785'
  const URUGUAYAN_RUT = '210001730016'
  const ARGENTINE_CUIT = '20123456786'

  it('validates a Chilean RUT only under the CL jurisdiction', () => {
    expect(validateTaxId(CHILEAN_RUT, 'CL')).toBe(true)
    expect(validateTaxId(CHILEAN_RUT, 'UY')).toBe(false)
    expect(validateTaxId(CHILEAN_RUT, 'AR')).toBe(false)
  })

  it('keeps each jurisdiction on its own algorithm even though UY and CL both say RUT', () => {
    expect(FISCAL_JURISDICTIONS.UY.taxIdKind).toBe('rut')
    expect(FISCAL_JURISDICTIONS.CL.taxIdKind).toBe('rut')
    expect(validateTaxId(URUGUAYAN_RUT, 'UY')).toBe(true)
    expect(validateTaxId(URUGUAYAN_RUT, 'CL')).toBe(false)
    expect(validateTaxId(ARGENTINE_CUIT, 'AR')).toBe(true)
  })

  it('formats with the Chilean convention', () => {
    expect(formatTaxId(CHILEAN_RUT, 'CL')).toBe('12.345.678-5')
  })
})

describe('Chilean invoicing and modules (#208)', () => {
  it('applies 19% VAT to both net buckets', () => {
    const result = calculateInvoice(
      [
        { cantidad: 1, precio: 100, dscto: 0, articuloIva: '1' },
        { cantidad: 1, precio: 200, dscto: 0, articuloIva: '2' },
      ],
      'RI',
      'CL',
    )
    expect(result.iva1).toBe(19)
    expect(result.iva2).toBe(38)
    expect(result.total).toBe(357)
  })

  it('does not give a Chilean tenant the Argentine legal modules', () => {
    const modules = getDefaultModulesForJurisdiction('CL')
    expect(modules).not.toContain('billing.arca_cae')
    expect(modules).not.toContain('finance.retenciones')
    expect(modules).not.toContain('fiscal.remito')
    expect(modules).not.toContain('fiscal.cheques')
    expect(modules).toContain('core.invoicing')
  })
})
