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

describe('module availability per jurisdiction (#437)', () => {
  it('marks exactly the Argentine legal modules as country restricted', () => {
    const restricted = MODULE_KEYS.filter((key) => moduleDef(key).availableForCountries)
    expect(restricted.sort()).toEqual([...ARGENTINE_ONLY_MODULES].sort())
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
  it('preserves the current Argentine default set', () => {
    expect(getDefaultModulesForJurisdiction('AR')).toEqual([...DEFAULT_MODULES])
    expect(NEW_TENANT_MODULES).toEqual([...DEFAULT_MODULES])
  })

  it('drops the Argentine legal modules for a Uruguayan tenant', () => {
    const uruguayan = getDefaultModulesForJurisdiction('UY')
    for (const key of ARGENTINE_ONLY_MODULES) {
      expect(uruguayan).not.toContain(key)
    }
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

  it('keeps the full catalog for an Argentine tenant', () => {
    const payload = buildModuleCatalogPayload('AR')
    expect(payload.modules).toHaveLength(MODULE_KEYS.length)
  })

  it('filters presets by applicability', () => {
    const payload = buildModuleCatalogPayload('UY')
    for (const preset of Object.values(payload.presets)) {
      for (const key of ARGENTINE_ONLY_MODULES) {
        expect(preset.modules).not.toContain(key)
      }
    }
  })
})
