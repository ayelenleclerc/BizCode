import { describe, it, expect, afterEach } from 'vitest'
import request from 'supertest'
import { createApp } from '../../apps/server/createApp'
import {
  DEFAULT_MODULES,
  MODULE_CATALOG,
  MODULE_KEYS,
  MODULE_PRESETS,
  MODULE_PRESET_KEYS,
  canDeactivate,
  detectCatalogDependencyCycles,
  findUnknownCatalogDependencies,
  validateModuleSet,
} from '../../apps/web/src/lib/modules'

describe('module catalog', () => {
  it('defines at least 45 modules', () => {
    expect(MODULE_KEYS.length).toBeGreaterThanOrEqual(45)
  })

  it('has no unknown dependency targets', () => {
    expect(findUnknownCatalogDependencies()).toEqual([])
  })

  it('has no dependency cycles', () => {
    expect(detectCatalogDependencyCycles()).toEqual([])
  })

  it('blocks billing.arca_cae deactivation in prod but allows dev', () => {
    expect(canDeactivate('billing.arca_cae', 'prod')).toBe(false)
    expect(canDeactivate('billing.arca_cae', 'dev')).toBe(true)
    expect(canDeactivate('core.auth', 'prod')).toBe(false)
    expect(canDeactivate('core.auth', 'dev')).toBe(false)
  })

  it('validates DEFAULT_MODULES in prod', () => {
    const result = validateModuleSet([...DEFAULT_MODULES], 'prod')
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('flags missing required modules in prod', () => {
    const withoutCore = DEFAULT_MODULES.filter((k) => k !== 'core.auth')
    const result = validateModuleSet(withoutCore, 'prod')
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.module === 'core.auth')).toBe(true)
  })

  it('flags missing dependencies when a module is active', () => {
    const result = validateModuleSet(['core.auth', 'billing.orders'], 'prod')
    expect(result.valid).toBe(false)
    expect(
      result.errors.some(
        (e) => e.module === 'billing.orders' && e.reason.startsWith('missing_dependency:'),
      ),
    ).toBe(true)
  })

  it('requires billing.arca_cae in prod when not in active set', () => {
    const modules = MODULE_KEYS.filter((k) => k !== 'billing.arca_cae')
    const result = validateModuleSet(modules, 'prod')
    expect(result.valid).toBe(false)
    expect(result.errors.some((e) => e.module === 'billing.arca_cae')).toBe(true)
  })

  it('allows omitting billing.arca_cae in dev when dependents are inactive', () => {
    const modules = ['core.auth', 'core.catalog', 'core.clients', 'core.invoicing'] as const
    const result = validateModuleSet(modules, 'dev')
    expect(result.valid).toBe(true)
  })

  it('validates all six presets in prod', () => {
    for (const key of MODULE_PRESET_KEYS) {
      const preset = MODULE_PRESETS[key]
      const result = validateModuleSet(preset, 'prod')
      expect(result.valid, `preset ${key} invalid: ${JSON.stringify(result.errors)}`).toBe(true)
    }
  })

  it('exposes billing.arca_cae as required in prod only for Argentina (#207)', () => {
    expect(MODULE_CATALOG['billing.arca_cae'].requiredInProd).toBe(false)
    expect(MODULE_CATALOG['billing.arca_cae'].required).toBe(false)
    expect(MODULE_CATALOG['billing.arca_cae'].requiredInProdForCountries).toEqual(['AR'])
  })

  describe('multi-country base (#207)', () => {
    it('keeps generic modules independent from the Argentine fiscal module', () => {
      for (const key of ['billing.credit_notes', 'finance.ledger', 'finance.retenciones'] as const) {
        expect(MODULE_CATALOG[key].dependencies).not.toContain('billing.arca_cae')
      }
    })

    it('lets a Uruguayan tenant run credit notes and the ledger without ARCA in prod', () => {
      const modules = [
        'core.auth',
        'core.catalog',
        'core.clients',
        'core.invoicing',
        'billing.credit_notes',
        'finance.collections',
        'finance.ledger',
      ] as const
      expect(validateModuleSet(modules, 'prod', 'UY').valid).toBe(true)
      expect(validateModuleSet(modules, 'prod', 'AR').valid).toBe(false)
    })

    it('only blocks deactivating ARCA in Argentine production', () => {
      expect(canDeactivate('billing.arca_cae', 'prod', 'AR')).toBe(false)
      expect(canDeactivate('billing.arca_cae', 'prod', 'UY')).toBe(true)
      expect(canDeactivate('billing.arca_cae', 'dev', 'AR')).toBe(true)
    })

    it('defaults to Argentina when the jurisdiction is absent or unknown', () => {
      expect(canDeactivate('billing.arca_cae', 'prod')).toBe(false)
      expect(canDeactivate('billing.arca_cae', 'prod', 'ZZ')).toBe(false)
    })

    it('keeps required core modules mandatory in every jurisdiction', () => {
      expect(canDeactivate('core.auth', 'prod', 'UY')).toBe(false)
      expect(canDeactivate('core.auth', 'dev', 'UY')).toBe(false)
    })
  })
})

describe('GET /api/modules/catalog', () => {
  const prisma = {
    tenantConfig: { findUnique: async () => null },
  } as unknown as Parameters<typeof createApp>[0]

  afterEach(() => {
    delete process.env.BIZCODE_TEST_AUTH_BYPASS
  })

  it('returns catalog for authenticated session (test bypass)', async () => {
    const app = createApp(prisma)
    const res = await request(app).get('/api/modules/catalog').expect(200)
    expect(res.body).toMatchObject({
      success: true,
      data: {
        deploymentEnv: expect.stringMatching(/^(dev|prod)$/),
        modules: expect.any(Array),
        presets: expect.any(Object),
      },
    })
    expect(res.body.data.modules.length).toBeGreaterThanOrEqual(45)
    const arca = res.body.data.modules.find(
      (m: { key: string }) => m.key === 'billing.arca_cae',
    )
    expect(arca).toMatchObject({ requiredInProd: false, required: false })
  })

  it('returns 401 when auth bypass is disabled', async () => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'false'
    const app = createApp(prisma)
    await request(app).get('/api/modules/catalog').expect(401)
  })
})
