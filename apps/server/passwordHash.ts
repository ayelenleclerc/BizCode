import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

/**
 * @en Derives a stored password string (salt + scrypt hash) compatible with login verification.
 * @es Deriva una cadena almacenable de contraseña (salt + hash scrypt) compatible con el login.
 * @pt-BR Deriva string armazenável de senha (salt + hash scrypt) compatível com a verificação no login.
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

/**
 * @en Verifies a plaintext password against the salt:hash encoding from hashPassword.
 * @es Verifica la contraseña en claro frente al formato salt:hash de hashPassword.
 * @pt-BR Verifica a senha em texto puro contra o formato salt:hash de hashPassword.
 */
export function verifyPassword(password: string, encoded: string): boolean {
  const [salt, storedHash] = encoded.split(':')
  if (!salt || !storedHash) {
    return false
  }
  const computed = scryptSync(password, salt, 64).toString('hex')
  return timingSafeEqual(Buffer.from(storedHash, 'hex'), Buffer.from(computed, 'hex'))
}
