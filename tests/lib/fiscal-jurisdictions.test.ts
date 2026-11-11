import { describe, expect, it } from 'vitest'
import {
  DEFAULT_FISCAL_JURISDICTION,
  FISCAL_JURISDICTIONS,
  FISCAL_JURISDICTION_CODES,
  getVatRates,
  isFiscalJurisdictionCode,
  resolveJurisdiction,
} from '../../packages/types/src/fiscal-jurisdictions'

describe('fiscal jurisdictions catalog (#207)', () => {
  it('exposes Argentina, Uruguay, Chile, Mexico and Brazil', () => {
    expect([...FISCAL_JURISDICTION_CODES]).toEqual(['AR', 'UY', 'CL', 'MX', 'BR'])
    expect(Object.keys(FISCAL_JURISDICTIONS)).toEqual(['AR', 'UY', 'CL', 'MX', 'BR'])
  })

  it('defaults to Argentina to preserve the historical behaviour', () => {
    expect(DEFAULT_FISCAL_JURISDICTION).toBe('AR')
  })

  it('keeps every entry consistent with its own key', () => {
    for (const code of FISCAL_JURISDICTION_CODES) {
      expect(FISCAL_JURISDICTIONS[code].code).toBe(code)
    }
  })

  it('carries the VAT rates of each country', () => {
    expect(FISCAL_JURISDICTIONS.AR.vatRates).toEqual({ standard: 21, reduced: 10.5 })
    expect(FISCAL_JURISDICTIONS.UY.vatRates).toEqual({ standard: 22, reduced: 10 })
    expect(FISCAL_JURISDICTIONS.MX.vatRates).toEqual({ standard: 16, reduced: 0 })
    expect(FISCAL_JURISDICTIONS.BR.vatRates).toEqual({ standard: 18, reduced: 12 })
  })

  it('maps each jurisdiction to its tax identifier kind, currency and provider', () => {
    expect(FISCAL_JURISDICTIONS.AR).toMatchObject({
      taxIdKind: 'cuit',
      currency: 'ARS',
      providerCode: 'arca_wsfe',
    })
    expect(FISCAL_JURISDICTIONS.UY).toMatchObject({
      taxIdKind: 'rut',
      currency: 'UYU',
      providerCode: 'uruguay_dgi',
    })
    expect(FISCAL_JURISDICTIONS.MX).toMatchObject({
      taxIdKind: 'rfc',
      currency: 'MXN',
      providerCode: 'mexico_sat_pac',
    })
    expect(FISCAL_JURISDICTIONS.BR).toMatchObject({
      taxIdKind: 'cnpj',
      currency: 'BRL',
      providerCode: 'brazil_sefaz_nfe',
    })
  })

  describe('isFiscalJurisdictionCode', () => {
    it('accepts supported codes', () => {
      expect(isFiscalJurisdictionCode('AR')).toBe(true)
      expect(isFiscalJurisdictionCode('UY')).toBe(true)
      expect(isFiscalJurisdictionCode('MX')).toBe(true)
      expect(isFiscalJurisdictionCode('BR')).toBe(true)
    })

    it('rejects unsupported or non-string values', () => {
      expect(isFiscalJurisdictionCode('ZZ')).toBe(false)
      expect(isFiscalJurisdictionCode('ar')).toBe(false)
      expect(isFiscalJurisdictionCode('')).toBe(false)
      expect(isFiscalJurisdictionCode(null)).toBe(false)
      expect(isFiscalJurisdictionCode(undefined)).toBe(false)
      expect(isFiscalJurisdictionCode(42)).toBe(false)
    })
  })

  describe('resolveJurisdiction', () => {
    it('returns the code when supported', () => {
      expect(resolveJurisdiction('UY')).toBe('UY')
      expect(resolveJurisdiction('MX')).toBe('MX')
      expect(resolveJurisdiction('BR')).toBe('BR')
    })

    it('falls back to the default for unknown or absent values', () => {
      expect(resolveJurisdiction('ZZ')).toBe('AR')
      expect(resolveJurisdiction(null)).toBe('AR')
      expect(resolveJurisdiction(undefined)).toBe('AR')
    })
  })

  describe('getVatRates', () => {
    it('returns the rates of the requested jurisdiction', () => {
      expect(getVatRates('UY')).toEqual({ standard: 22, reduced: 10 })
    })

    it('returns Argentine rates for unknown values', () => {
      expect(getVatRates('ZZ')).toEqual({ standard: 21, reduced: 10.5 })
    })
  })
})
