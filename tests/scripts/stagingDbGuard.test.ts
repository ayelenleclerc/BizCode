import { describe, expect, it } from 'vitest'
import {
  assertSafeStagingDatabaseUrl,
  resolveStagingSeedTargetUrl,
} from '../../scripts/lib/stagingDbGuard'

describe('assertSafeStagingDatabaseUrl', () => {
  it('accepts local docker URL when prod is unset', () => {
    const r = assertSafeStagingDatabaseUrl({
      targetUrl: 'postgresql://bizcode:bizcode@127.0.0.1:5432/bizcode',
    })
    expect(r.ok).toBe(true)
  })

  it('rejects empty target', () => {
    const r = assertSafeStagingDatabaseUrl({ targetUrl: '  ' })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toMatch(/empty/i)
  })

  it('rejects when staging URL equals prod URL', () => {
    const same = 'postgresql://u:p@db.example:5432/app'
    const r = assertSafeStagingDatabaseUrl({
      targetUrl: same,
      stagingUrl: same,
      prodUrl: same,
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toMatch(/must not equal/i)
  })

  it('rejects when target equals PROD_DATABASE_URL', () => {
    const prod = 'postgresql://u:p@prod.db:5432/bizcode'
    const r = assertSafeStagingDatabaseUrl({
      targetUrl: prod,
      prodUrl: prod,
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toMatch(/PROD_DATABASE_URL/)
  })

  it('rejects hostname in BIZCODE_PROD_DB_HOSTS denylist', () => {
    const r = assertSafeStagingDatabaseUrl({
      targetUrl: 'postgresql://u:p@prod-db.internal:5432/bizcode',
      prodHostsDenylist: 'prod-db.internal,other.example',
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.reason).toMatch(/BIZCODE_PROD_DB_HOSTS/)
  })
})

describe('resolveStagingSeedTargetUrl', () => {
  it('prefers STAGING_DATABASE_URL over DATABASE_URL', () => {
    expect(
      resolveStagingSeedTargetUrl({
        STAGING_DATABASE_URL: 'postgresql://s',
        DATABASE_URL: 'postgresql://d',
      }),
    ).toBe('postgresql://s')
  })

  it('falls back to DATABASE_URL', () => {
    expect(resolveStagingSeedTargetUrl({ DATABASE_URL: 'postgresql://d' })).toBe('postgresql://d')
  })
})
