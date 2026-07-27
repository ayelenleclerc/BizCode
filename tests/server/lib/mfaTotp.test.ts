import { describe, expect, it, beforeEach } from 'vitest'
import * as OTPAuth from 'otpauth'
import { decryptMfaSecret, encryptMfaSecret } from '../../../apps/server/lib/mfaSecrets'
import {
  createMemoryMfaChallengeStore,
  MFA_CHALLENGE_TTL_SECONDS,
} from '../../../apps/server/lib/mfaChallengeStore'
import {
  generateBackupCodes,
  generateTotpSecret,
  matchBackupCode,
  verifyTotpCode,
} from '../../../apps/server/lib/mfaTotp'
import { hashPassword } from '../../../apps/server/passwordHash'

describe('mfaSecrets', () => {
  beforeEach(() => {
    process.env.BIZCODE_MFA_ENCRYPTION_KEY = 'unit-test-mfa-key'
  })

  it('round-trips AES-GCM', () => {
    const secret = generateTotpSecret()
    const enc = encryptMfaSecret(secret)
    expect(enc).not.toContain(secret)
    expect(decryptMfaSecret(enc)).toBe(secret)
  })
})

describe('mfaChallengeStore memory', () => {
  it('take is single-use and respects TTL semantics', async () => {
    const store = createMemoryMfaChallengeStore()
    await store.set('h1', { userId: 1, tenantId: 2, rememberMe: true }, MFA_CHALLENGE_TTL_SECONDS)
    const first = await store.take('h1')
    expect(first).toEqual({ userId: 1, tenantId: 2, rememberMe: true })
    expect(await store.take('h1')).toBeNull()
  })
})

describe('mfaTotp', () => {
  it('verifies current TOTP within window', () => {
    const secret = generateTotpSecret()
    const totp = new OTPAuth.TOTP({
      issuer: 'BizCode',
      label: 'user',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    })
    expect(verifyTotpCode(secret, totp.generate())).toBe(true)
    expect(verifyTotpCode(secret, '000000')).toBe(false)
  })

  it('matches unused backup codes only', () => {
    const { plainCodes, hashes } = generateBackupCodes()
    expect(plainCodes).toHaveLength(8)
    const rows = hashes.map((codeHash, i) => ({
      id: i + 1,
      codeHash,
      usedAt: i === 0 ? new Date() : null,
    }))
    expect(matchBackupCode(plainCodes[0]!, rows)).toBeNull()
    expect(matchBackupCode(plainCodes[1]!, rows)).toBe(2)
    expect(matchBackupCode('nope', rows)).toBeNull()
    // scrypt hashPassword used for storage shape
    expect(hashPassword('x').includes(':')).toBe(true)
  })
})
