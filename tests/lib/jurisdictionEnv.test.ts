import { describe, expect, it } from 'vitest'
import {
  isJurisdictionEnabled,
  resolveDefaultJurisdiction,
  resolveInstallationJurisdictions,
} from '../../apps/web/src/lib/modules/jurisdictionEnv'

function env(vars: Record<string, string | undefined>): NodeJS.ProcessEnv {
  return vars as NodeJS.ProcessEnv
}

describe('resolveInstallationJurisdictions (#437)', () => {
  it('keeps the pre-#437 behaviour when nothing is configured', () => {
    const result = resolveInstallationJurisdictions(env({}))
    expect(result.enabled).toEqual(['AR', 'UY'])
    expect(result.default).toBe('AR')
  })

  it('limits the offer to the configured list', () => {
    const result = resolveInstallationJurisdictions(env({ BIZCODE_FISCAL_JURISDICTIONS: 'UY' }))
    expect(result.enabled).toEqual(['UY'])
    expect(result.default).toBe('UY')
  })

  it('normalizes case, spacing and duplicates', () => {
    const result = resolveInstallationJurisdictions(
      env({ BIZCODE_FISCAL_JURISDICTIONS: ' uy , UY, ar ' }),
    )
    expect(result.enabled).toEqual(['UY', 'AR'])
  })

  it('ignores unknown codes and falls back when none survive', () => {
    const result = resolveInstallationJurisdictions(
      env({ BIZCODE_FISCAL_JURISDICTIONS: 'ZZ,XX' }),
    )
    expect(result.enabled).toEqual(['AR', 'UY'])
    expect(result.default).toBe('AR')
  })

  it('honours an explicit default', () => {
    const result = resolveInstallationJurisdictions(
      env({ BIZCODE_FISCAL_JURISDICTIONS: 'AR,UY', BIZCODE_DEFAULT_JURISDICTION: 'uy' }),
    )
    expect(result.default).toBe('UY')
  })

  it('forces the default into the enabled list rather than creating unreachable tenants', () => {
    const result = resolveInstallationJurisdictions(
      env({ BIZCODE_FISCAL_JURISDICTIONS: 'AR', BIZCODE_DEFAULT_JURISDICTION: 'UY' }),
    )
    expect(result.enabled).toContain('UY')
    expect(result.default).toBe('UY')
  })

  it('ignores an invalid default', () => {
    const result = resolveInstallationJurisdictions(
      env({ BIZCODE_FISCAL_JURISDICTIONS: 'UY', BIZCODE_DEFAULT_JURISDICTION: 'ZZ' }),
    )
    expect(result.default).toBe('UY')
  })

  it('never leaves the default out of the enabled list', () => {
    for (const vars of [
      {},
      { BIZCODE_FISCAL_JURISDICTIONS: 'UY' },
      { BIZCODE_FISCAL_JURISDICTIONS: 'AR', BIZCODE_DEFAULT_JURISDICTION: 'UY' },
      { BIZCODE_DEFAULT_JURISDICTION: 'UY' },
    ]) {
      const result = resolveInstallationJurisdictions(env(vars))
      expect(result.enabled).toContain(result.default)
    }
  })
})

describe('resolveDefaultJurisdiction and isJurisdictionEnabled (#437)', () => {
  it('exposes the resolved default', () => {
    expect(resolveDefaultJurisdiction(env({ BIZCODE_DEFAULT_JURISDICTION: 'UY' }))).toBe('UY')
    expect(resolveDefaultJurisdiction(env({}))).toBe('AR')
  })

  it('rejects jurisdictions outside the enabled list', () => {
    const restricted = env({ BIZCODE_FISCAL_JURISDICTIONS: 'AR' })
    expect(isJurisdictionEnabled('AR', restricted)).toBe(true)
    expect(isJurisdictionEnabled('UY', restricted)).toBe(false)
  })

  it('rejects values that are not jurisdiction codes', () => {
    expect(isJurisdictionEnabled('ZZ', env({}))).toBe(false)
    expect(isJurisdictionEnabled(undefined, env({}))).toBe(false)
    expect(isJurisdictionEnabled(42, env({}))).toBe(false)
  })
})
