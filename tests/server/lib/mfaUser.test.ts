import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import * as OTPAuth from 'otpauth'
import { encryptMfaSecret } from '../../../apps/server/lib/mfaSecrets'
import { clearUserMfa, verifyUserMfaCode } from '../../../apps/server/lib/mfaUser'
import { hashPassword } from '../../../apps/server/passwordHash'

describe('mfaUser', () => {
  beforeEach(() => {
    process.env.BIZCODE_MFA_ENCRYPTION_KEY = 'unit-test-mfa-user-key'
  })

  it('verifyUserMfaCode accepts TOTP and backup codes', async () => {
    const secret = new OTPAuth.Secret({ size: 20 }).base32
    const totp = new OTPAuth.TOTP({
      issuer: 'BizCode',
      label: 'u',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(secret),
    })
    const backupPlain = 'deadbeef'
    const rows = [{ id: 11, codeHash: hashPassword(backupPlain), usedAt: null as Date | null }]

    const prisma = {
      appUser: {
        findUnique: vi.fn().mockResolvedValue({
          id: 1,
          username: 'u',
          mfaEnabled: true,
          totpSecretEncrypted: encryptMfaSecret(secret),
          mfaBackupCodes: rows,
        }),
      },
    } as unknown as PrismaClient

    const totpOk = await verifyUserMfaCode(prisma, 1, totp.generate())
    expect(totpOk).toEqual({ ok: true, usedBackupCodeId: null })

    const backupOk = await verifyUserMfaCode(prisma, 1, backupPlain)
    expect(backupOk).toEqual({ ok: true, usedBackupCodeId: 11 })

    const bad = await verifyUserMfaCode(prisma, 1, '000000')
    expect(bad).toEqual({ ok: false })
  })

  it('clearUserMfa deletes codes and disables MFA', async () => {
    const updates: unknown[] = []
    const prisma = {
      $transaction: vi.fn(async (fn: (tx: PrismaClient) => Promise<void>) => {
        const tx = {
          appMfaBackupCode: {
            update: vi.fn(async (args: unknown) => {
              updates.push(['update', args])
            }),
            deleteMany: vi.fn(async (args: unknown) => {
              updates.push(['deleteMany', args])
              return { count: 1 }
            }),
          },
          appUser: {
            update: vi.fn(async (args: unknown) => {
              updates.push(['user', args])
            }),
          },
        } as unknown as PrismaClient
        await fn(tx)
      }),
    } as unknown as PrismaClient

    await clearUserMfa(prisma, 5, 99)
    expect(updates).toEqual(
      expect.arrayContaining([
        ['update', expect.objectContaining({ where: { id: 99 } })],
        ['deleteMany', { where: { userId: 5 } }],
        [
          'user',
          expect.objectContaining({
            where: { id: 5 },
            data: expect.objectContaining({ mfaEnabled: false, totpSecretEncrypted: null }),
          }),
        ],
      ]),
    )
  })
})
