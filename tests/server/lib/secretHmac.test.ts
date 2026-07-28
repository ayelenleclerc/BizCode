import { afterEach, describe, expect, it } from 'vitest'
import {
  hashWithCurrentJwtSecret,
  hmacSha256Hex,
  jwtSecretHashCandidates,
  tokenHashMatches,
} from '../../../apps/server/lib/secretHmac'
import { initializeAppConfig, resetAppConfigCache } from '../../../apps/server/config/env'
import {
  encryptFiscalSecret,
  decryptFiscalSecret,
} from '../../../apps/server/fiscal/ar/fiscalSecrets'
import { encryptMfaSecret, decryptMfaSecret } from '../../../apps/server/lib/mfaSecrets'

describe('secretHmac (#216)', () => {
  afterEach(() => {
    resetAppConfigCache()
    delete process.env.JWT_SECRET_PREVIOUS
  })

  it('mints with current secret and matches stored hash', () => {
    initializeAppConfig({
      DATABASE_URL: 'postgresql://x@localhost:5432/y',
      JWT_SECRET: 'current-secret',
      NODE_ENV: 'test',
    })
    const token = 'opaque-token-1'
    const stored = hashWithCurrentJwtSecret(token)
    expect(stored).toBe(hmacSha256Hex('current-secret', token))
    expect(tokenHashMatches(token, stored)).toBe(true)
    expect(tokenHashMatches('other', stored)).toBe(false)
  })

  it('accepts hashes minted with JWT_SECRET_PREVIOUS during rotation', () => {
    const token = 'opaque-token-2'
    const previousHash = hmacSha256Hex('old-secret', token)
    initializeAppConfig({
      DATABASE_URL: 'postgresql://x@localhost:5432/y',
      JWT_SECRET: 'new-secret',
      JWT_SECRET_PREVIOUS: 'old-secret',
      NODE_ENV: 'test',
    })
    expect(jwtSecretHashCandidates(token)).toEqual([
      hmacSha256Hex('new-secret', token),
      previousHash,
    ])
    expect(tokenHashMatches(token, previousHash)).toBe(true)
    expect(hashWithCurrentJwtSecret(token)).toBe(hmacSha256Hex('new-secret', token))
  })
})

describe('AES secrets harden (#216)', () => {
  afterEach(() => {
    delete process.env.BIZCODE_FISCAL_ENCRYPTION_KEY
    delete process.env.BIZCODE_MFA_ENCRYPTION_KEY
    delete process.env.NODE_ENV
  })

  it('round-trips fiscal and MFA ciphertext with dedicated keys', () => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_FISCAL_ENCRYPTION_KEY = 'fiscal-test-key'
    process.env.BIZCODE_MFA_ENCRYPTION_KEY = 'mfa-test-key'
    const fiscal = decryptFiscalSecret(encryptFiscalSecret('afip-cert-material'))
    const mfa = decryptMfaSecret(encryptMfaSecret('BASE32SECRET'))
    expect(fiscal).toBe('afip-cert-material')
    expect(mfa).toBe('BASE32SECRET')
  })

  it('refuses fiscal encrypt in production without BIZCODE_FISCAL_ENCRYPTION_KEY', () => {
    process.env.NODE_ENV = 'production'
    delete process.env.BIZCODE_FISCAL_ENCRYPTION_KEY
    expect(() => encryptFiscalSecret('x')).toThrow(/BIZCODE_FISCAL_ENCRYPTION_KEY is required in production/)
  })
})
