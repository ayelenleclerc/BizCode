import { describe, expect, it } from 'vitest'
import type { ModuleDef, ModuleKey } from '../../apps/web/src/lib/modules'
import {
  DEFAULT_MODULES,
  MODULE_CATALOG,
  MODULE_KEYS,
  NEW_TENANT_MODULES,
  buildModuleCatalogPayload,
  canDeactivate,
  filterModulesByJurisdiction,
  getDefaultModulesForJurisdiction,
  isModuleAvailableInJurisdiction,
  validateModuleSet,
} from '../../apps/web/src/lib/modules'

function moduleDef(key: ModuleKey): ModuleDef {
  return MODULE_CATALOG[key] as ModuleDef
}

const ARGENTINE_ONLY_MODULES = [
  'billing.arca_cae',
  'finance.retenciones',
  'fiscal.remito',
  'fiscal.cheques',
  'fiscal.libro_iva',
] as const

const MEXICO_ONLY_MODULES = ['billing.cfdi_sat'] as const

const COUNTRY_RESTRICTED_MODULES = [...ARGENTINE_ONLY_MODULES, ...MEXICO_ONLY_MODULES] as const

describe('module availability per jurisdiction (#437)', () => {
  it('marks exactly the country-restricted legal modules', () => {
    const restricted = MODULE_KEYS.filter((key) => moduleDef(key).availableForCountries)
    expect(restricted.sort()).toEqual([...COUNTRY_RESTRICTED_MODULES].sort())
  })

  it('keeps every unrestricted module available in any jurisdiction', () => {
    for (const key of MODULE_KEYS) {
      if (moduleDef(key).availableForCountries) {
        continue
      }
      expect(isModuleAvailableInJurisdiction(key, 'UY')).toBe(true)
      expect(isModuleAvailableInJurisdiction(key, 'AR')).toBe(true)
    }
  })

  it('restricts the Argentine legal modules outside Argentina', () => {
    for (const key of ARGENTINE_ONLY_MODULES) {
      expect(isModuleAvailableInJurisdiction(key, 'AR')).toBe(true)
      expect(isModuleAvailableInJurisdiction(key, 'UY')).toBe(false)
    }
  })

  it('falls back to the default jurisdiction for unknown values', () => {
    expect(isModuleAvailableInJurisdiction('billing.arca_cae', undefined)).toBe(true)
    expect(isModuleAvailableInJurisdiction('billing.arca_cae', 'ZZ')).toBe(true)
  })
})

describe('default modules per jurisdiction (#437)', () => {
  it('preserves the Argentine default set (filters out foreign legal modules)', () => {
    const argentine = getDefaultModulesForJurisdiction('AR')
    expect(argentine).toEqual(filterModulesByJurisdiction(DEFAULT_MODULES, 'AR'))
    expect(argentine).not.toContain('billing.cfdi_sat')
    expect(NEW_TENANT_MODULES).toEqual([...argentine])
  })

  it('includes Mexico CFDI in Mexican defaults and drops Argentine legal modules', () => {
    const mexican = getDefaultModulesForJurisdiction('MX')
    expect(mexican).toContain('billing.cfdi_sat')
    expect(mexican).toContain('core.invoicing')
    for (const key of ARGENTINE_ONLY_MODULES) {
      expect(mexican).not.toContain(key)
    }
  })

  it('drops the Argentine legal modules for a Uruguayan tenant', () => {
    const uruguayan = getDefaultModulesForJurisdiction('UY')
    for (const key of ARGENTINE_ONLY_MODULES) {
      expect(uruguayan).not.toContain(key)
    }
    expect(uruguayan).not.toContain('billing.cfdi_sat')
    expect(uruguayan).toContain('core.invoicing')
  })

  it('filters an arbitrary module list preserving order', () => {
    const filtered = filterModulesByJurisdiction(
      ['core.invoicing', 'billing.arca_cae', 'finance.collections'],
      'UY',
    )
    expect(filtered).toEqual(['core.invoicing', 'finance.collections'])
  })
})

describe('validateModuleSet rejects non applicable modules (#437)', () => {
  it('reports not_available_in_country for an Argentine module in Uruguay', () => {
    const result = validateModuleSet([...getDefaultModulesForJurisdiction('UY'), 'fiscal.remito'], 'dev', 'UY')
    expect(result.valid).toBe(false)
    expect(result.errors).toContainEqual({
      module: 'fiscal.remito',
      reason: 'not_available_in_country:UY',
    })
  })

  it('accepts the derived default set for each jurisdiction', () => {
    expect(validateModuleSet(getDefaultModulesForJurisdiction('AR'), 'dev', 'AR').valid).toBe(true)
    expect(validateModuleSet(getDefaultModulesForJurisdiction('UY'), 'dev', 'UY').valid).toBe(true)
  })

  it('does not demand an Argentine module in production outside Argentina', () => {
    const result = validateModuleSet(getDefaultModulesForJurisdiction('UY'), 'prod', 'UY')
    expect(result.errors).not.toContainEqual({
      module: 'billing.arca_cae',
      reason: 'required_module_missing',
    })
  })

  it('keeps billing.arca_cae mandatory in Argentine production', () => {
    const withoutCae = getDefaultModulesForJurisdiction('AR').filter(
      (key) => key !== 'billing.arca_cae',
    )
    const result = validateModuleSet(withoutCae, 'prod', 'AR')
    expect(result.errors).toContainEqual({
      module: 'billing.arca_cae',
      reason: 'required_module_missing',
    })
  })

  it('treats a country restricted module as deactivable outside its country', () => {
    expect(canDeactivate('billing.arca_cae', 'prod', 'AR')).toBe(false)
    expect(canDeactivate('billing.arca_cae', 'prod', 'UY')).toBe(true)
  })
})

describe('catalog payload hides non applicable modules (#437)', () => {
  it('omits the Argentine legal modules for a Uruguayan tenant', () => {
    const payload = buildModuleCatalogPayload('UY')
    const keys = payload.modules.map((entry) => entry.key)
    for (const key of ARGENTINE_ONLY_MODULES) {
      expect(keys).not.toContain(key)
    }
  })

  it('keeps every module applicable in Argentina (omits Mexico-only)', () => {
    const payload = buildModuleCatalogPayload('AR')
    const expected = MODULE_KEYS.filter((key) => isModuleAvailableInJurisdiction(key, 'AR'))
    expect(payload.modules.map((entry) => entry.key).sort()).toEqual([...expected].sort())
    expect(payload.modules.map((entry) => entry.key)).not.toContain('billing.cfdi_sat')
  })

  it('filters presets by applicability', () => {
    const payload = buildModuleCatalogPayload('UY')
    for (const preset of Object.values(payload.presets)) {
      for (const key of ARGENTINE_ONLY_MODULES) {
        expect(preset.modules).not.toContain(key)
      }
      expect(preset.modules).not.toContain('billing.cfdi_sat')
    }
  })
})
