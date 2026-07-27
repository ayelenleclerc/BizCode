import type { PrismaClient } from '@prisma/client'
import { decryptMfaSecret } from './mfaSecrets'
import { matchBackupCode, verifyTotpCode } from './mfaTotp'

/**
 * @en Verifies a TOTP or unused backup code for a user with MFA enabled.
 * @es Verifica un código TOTP o de respaldo no usado para un usuario con MFA activo.
 * @pt-BR Verifica um código TOTP ou de backup não usado para um usuário com MFA ativo.
 */
export async function verifyUserMfaCode(
  prisma: PrismaClient,
  userId: number,
  code: string,
): Promise<{ ok: true; usedBackupCodeId: number | null } | { ok: false }> {
  const user = await prisma.appUser.findUnique({
    where: { id: userId },
    include: { mfaBackupCodes: { where: { usedAt: null } } },
  })
  if (!user || !user.mfaEnabled || !user.totpSecretEncrypted) {
    return { ok: false }
  }

  try {
    const secret = decryptMfaSecret(user.totpSecretEncrypted)
    if (verifyTotpCode(secret, code, user.username)) {
      return { ok: true, usedBackupCodeId: null }
    }
  } catch {
    // fall through to backup codes
  }

  const backupId = matchBackupCode(code, user.mfaBackupCodes)
  if (backupId != null) {
    return { ok: true, usedBackupCodeId: backupId }
  }
  return { ok: false }
}

/**
 * @en Clears MFA secret and backup codes for a user (admin or self-disable).
 * @es Borra el secreto MFA y códigos de respaldo de un usuario (admin o auto-desactivación).
 * @pt-BR Limpa o segredo MFA e códigos de backup de um usuário (admin ou auto-desativação).
 */
export async function clearUserMfa(
  prisma: PrismaClient,
  userId: number,
  usedBackupCodeId: number | null = null,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    if (usedBackupCodeId != null) {
      await tx.appMfaBackupCode.update({
        where: { id: usedBackupCodeId },
        data: { usedAt: new Date() },
      })
    }
    await tx.appMfaBackupCode.deleteMany({ where: { userId } })
    await tx.appUser.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        totpSecretEncrypted: null,
        mfaVerifiedAt: null,
      },
    })
  })
}
