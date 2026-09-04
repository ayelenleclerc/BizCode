/**
 * @en Every jurisdiction declares its own rules and the core reads them from the registry (#440).
 * @es Cada jurisdicción declara sus propias reglas y el núcleo las lee del registro (#440).
 * @pt-BR Cada jurisdição declara suas próprias regras e o núcleo as lê do registro (#440).
 */

import { describe, expect, it } from 'vitest'
import {
  DEFAULT_FISCAL_JURISDICTION,
  FISCAL_JURISDICTIONS,
  FISCAL_JURISDICTION_CODES,
  FISCAL_RULE_SETS,
  getDefaultSubjectTaxCondition,
  getDocumentKinds,
  getFiscalRules,
  getSubjectTaxConditions,
  getVatRateCodes,
  getVatRates,
  subjectPaysVat,
} from '../../packages/types/src/index'
import { calculateInvoice } from '../../apps/web/src/lib/invoice'

describe('per-country fiscal rule registry (#440)', () => {
  it('declares a complete rule set for every supported jurisdiction', () => {
    for (const code of FISCAL_JURISDICTION_CODES) {
      const rules = FISCAL_RULE_SETS[code]
      expect(rules.code).toBe(code)
      expect(rules.currency).toMatch(/^[A-Z]{3}$/)
      expect(rules.taxId.validate(rules.taxId.example)).toBe(true)
      expect(rules.subjectTaxConditions.length).toBeGreaterThan(0)
      expect(rules.vatRateCodes.map((c) => c.code)).toEqual(['1', '2', '3'])
      expect(rules.providerCode.length).toBeGreaterThan(0)
    }
  })

  it('keeps the historical catalog in sync with the rule sets', () => {
    for (const code of FISCAL_JURISDICTION_CODES) {
      expect(FISCAL_JURISDICTIONS[code].vatRates).toEqual(FISCAL_RULE_SETS[code].vatRates)
      expect(FISCAL_JURISDICTIONS[code].taxIdKind).toBe(FISCAL_RULE_SETS[code].taxId.kind)
      expect(FISCAL_JURISDICTIONS[code].providerCode).toBe(FISCAL_RULE_SETS[code].providerCode)
      expect(getVatRates(code)).toEqual(FISCAL_RULE_SETS[code].vatRates)
    }
  })

  it('falls back to the default jurisdiction for unknown values', () => {
    expect(getFiscalRules('ZZ').code).toBe(DEFAULT_FISCAL_JURISDICTION)
    expect(getFiscalRules(undefined).code).toBe(DEFAULT_FISCAL_JURISDICTION)
  })

  it('declares the bank identifier only where the repository evidences one', () => {
    expect(FISCAL_RULE_SETS.AR.bankAccount?.code).toBe('CBU')
    expect(FISCAL_RULE_SETS.AR.bankAccount?.validate('2850590940090418135201')).toBe(true)
    expect(FISCAL_RULE_SETS.UY.bankAccount).toBeNull()
    expect(FISCAL_RULE_SETS.CL.bankAccount).toBeNull()
  })

  it('declares invoice letters / CFE kinds only where the product model defines them', () => {
    expect(getDocumentKinds('AR')).toEqual(['A', 'B', 'C'])
    expect(getDocumentKinds('UY')).toEqual(['e-Factura', 'e-NotaCredito'])
    expect(getDocumentKinds('CL')).toBeNull()
  })

  describe('subject tax conditions', () => {
    it('offers the Argentine codes already persisted by existing tenants', () => {
      expect(getSubjectTaxConditions('AR').map((c) => c.code)).toEqual(['RI', 'Mono', 'CF', 'Exento'])
      expect(getDefaultSubjectTaxCondition('AR')).toBe('RI')
    })

    it('drives who pays VAT instead of comparing against Argentine codes', () => {
      expect(subjectPaysVat('RI', 'AR')).toBe(true)
      expect(subjectPaysVat('Mono', 'AR')).toBe(true)
      expect(subjectPaysVat('CF', 'AR')).toBe(false)
      expect(subjectPaysVat('Exento', 'AR')).toBe(false)
      expect(subjectPaysVat('IVA', 'UY')).toBe(true)
      expect(subjectPaysVat('CF', 'CL')).toBe(false)
    })

    it('treats an unknown code as paying VAT so tax is never silently dropped', () => {
      expect(subjectPaysVat('unknown', 'AR')).toBe(true)
    })
  })

  describe('article VAT codes', () => {
    it('maps each persisted code to the rate it means in the country', () => {
      expect(getVatRateCodes('AR').map((c) => c.rate)).toEqual([21, 10.5, 0])
      expect(getVatRateCodes('UY').map((c) => c.rate)).toEqual([22, 10, 0])
      expect(getVatRateCodes('CL').map((c) => c.rate)).toEqual([19, 19, 0])
    })

    it('marks the exempt bucket in every jurisdiction', () => {
      for (const code of FISCAL_JURISDICTION_CODES) {
        expect(getVatRateCodes(code).filter((c) => c.exempt).map((c) => c.code)).toEqual(['3'])
      }
    })
  })

  describe('invoice engine', () => {
    const items = [
      { cantidad: 1, precio: 100, dscto: 0, articuloIva: '1' as const },
      { cantidad: 1, precio: 200, dscto: 0, articuloIva: '2' as const },
    ]

    it('preserves the Argentine result, which is the regression that matters', () => {
      expect(calculateInvoice(items, 'RI')).toEqual(calculateInvoice(items, 'RI', 'AR'))
      expect(calculateInvoice(items, 'RI', 'AR').iva1).toBe(21)
      expect(calculateInvoice(items, 'RI', 'AR').iva2).toBe(21)
    })

    it('charges no VAT to a final consumer in every jurisdiction', () => {
      for (const code of FISCAL_JURISDICTION_CODES) {
        const result = calculateInvoice(items, 'CF', code)
        expect(result.iva1).toBe(0)
        expect(result.iva2).toBe(0)
      }
    })

    it('charges VAT to the taxpayer condition of each country', () => {
      expect(calculateInvoice(items, 'IVA', 'UY').iva1).toBe(22)
      expect(calculateInvoice(items, 'IVA', 'CL').iva1).toBe(19)
    })
  })
})
