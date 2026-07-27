import { randomBytes } from 'node:crypto'
import * as OTPAuth from 'otpauth'
import QRCode from 'qrcode'
import { hashPassword, verifyPassword } from '../passwordHash'

const TOTP_DIGITS = 6
const TOTP_PERIOD = 30
const TOTP_WINDOW = 1
const BACKUP_CODE_COUNT = 8
const BACKUP_CODE_BYTES = 4

/**
 * @en Generates a new base32 TOTP secret for enrollment.
 * @es Genera un nuevo secreto TOTP en base32 para el alta.
 * @pt-BR Gera um novo segredo TOTP em base32 para o cadastro.
 */
export function generateTotpSecret(): string {
  return new OTPAuth.Secret({ size: 20 }).base32
}

/**
 * @en Builds a TOTP instance for the given secret and account label.
 * @es Construye una instancia TOTP para el secreto y etiqueta de cuenta dados.
 * @pt-BR Constrói uma instância TOTP para o segredo e rótulo de conta dados.
 */
export function createTotp(secretBase32: string, label: string, issuer = 'BizCode'): OTPAuth.TOTP {
  return new OTPAuth.TOTP({
    issuer,
    label,
    algorithm: 'SHA1',
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD,
    secret: OTPAuth.Secret.fromBase32(secretBase32),
  })
}

/**
 * @en Verifies a 6-digit TOTP code with ±1 step window.
 * @es Verifica un código TOTP de 6 dígitos con ventana de ±1 paso.
 * @pt-BR Verifica um código TOTP de 6 dígitos com janela de ±1 passo.
 */
export function verifyTotpCode(secretBase32: string, code: string, label = 'user'): boolean {
  const trimmed = code.trim().replace(/\s+/g, '')
  if (!/^\d{6}$/.test(trimmed)) return false
  const totp = createTotp(secretBase32, label)
  const delta = totp.validate({ token: trimmed, window: TOTP_WINDOW })
  return delta !== null
}

/**
 * @en Returns otpauth URI and PNG data-URL QR for authenticator apps.
 * @es Devuelve URI otpauth y QR PNG (data-URL) para apps autenticadoras.
 * @pt-BR Retorna URI otpauth e QR PNG (data-URL) para apps autenticadoras.
 */
export async function buildTotpEnrollmentQr(
  secretBase32: string,
  label: string,
): Promise<{ otpauthUrl: string; qrDataUrl: string }> {
  const totp = createTotp(secretBase32, label)
  const otpauthUrl = totp.toString()
  const qrDataUrl = await QRCode.toDataURL(otpauthUrl, { margin: 1, width: 256 })
  return { otpauthUrl, qrDataUrl }
}

/**
 * @en Generates 8 single-use backup codes (hex) and their scrypt hashes for storage.
 * @es Genera 8 códigos de respaldo de un solo uso (hex) y sus hashes scrypt para guardar.
 * @pt-BR Gera 8 códigos de backup de uso único (hex) e seus hashes scrypt para armazenamento.
 */
export function generateBackupCodes(): { plainCodes: string[]; hashes: string[] } {
  const plainCodes: string[] = []
  const hashes: string[] = []
  for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
    const code = randomBytes(BACKUP_CODE_BYTES).toString('hex')
    plainCodes.push(code)
    hashes.push(hashPassword(code))
  }
  return { plainCodes, hashes }
}

/**
 * @en Finds and validates an unused backup code against stored hashes; returns matching hash index or -1.
 * @es Busca y valida un código de respaldo no usado frente a hashes; devuelve el índice o -1.
 * @pt-BR Busca e valida um código de backup não usado contra hashes; retorna o índice ou -1.
 */
export function matchBackupCode(
  code: string,
  rows: ReadonlyArray<{ id: number; codeHash: string; usedAt: Date | null }>,
): number | null {
  const trimmed = code.trim().toLowerCase()
  if (!trimmed) return null
  for (const row of rows) {
    if (row.usedAt != null) continue
    if (verifyPassword(trimmed, row.codeHash)) {
      return row.id
    }
  }
  return null
}
