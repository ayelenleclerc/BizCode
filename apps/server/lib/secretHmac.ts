import { createHmac, timingSafeEqual } from 'node:crypto'
import { getAppConfig } from '../config/env'

/**
 * @en HMAC-SHA256 hex digest of `token` with the given secret material.
 * @es Digest HMAC-SHA256 en hex de `token` con el material de secreto indicado.
 * @pt-BR Digest HMAC-SHA256 em hex de `token` com o material de segredo indicado.
 */
export function hmacSha256Hex(secret: string, token: string): string {
  return createHmac('sha256', secret).update(token).digest('hex')
}

/**
 * @en Hashes an opaque token with the current `JWT_SECRET` (mint path).
 * @es Hashea un token opaco con el `JWT_SECRET` actual (emisión).
 * @pt-BR Faz hash de um token opaco com o `JWT_SECRET` atual (emissão).
 */
export function hashWithCurrentJwtSecret(token: string): string {
  return hmacSha256Hex(getAppConfig().JWT_SECRET, token)
}

/**
 * @en Candidate HMAC digests for lookup during `JWT_SECRET` / `JWT_SECRET_PREVIOUS` rotation (#216).
 * @es Digests HMAC candidatos para búsqueda durante rotación `JWT_SECRET` / `JWT_SECRET_PREVIOUS` (#216).
 * @pt-BR Digests HMAC candidatos para lookup durante rotação `JWT_SECRET` / `JWT_SECRET_PREVIOUS` (#216).
 */
export function jwtSecretHashCandidates(token: string): string[] {
  const current = hashWithCurrentJwtSecret(token)
  const previous = getAppConfig().JWT_SECRET_PREVIOUS?.trim()
  if (!previous || previous.length === 0) {
    return [current]
  }
  const prevHash = hmacSha256Hex(previous, token)
  if (prevHash === current) {
    return [current]
  }
  return [current, prevHash]
}

/**
 * @en True when `storedHash` matches the token under current or previous JWT secret (timing-safe).
 * @es True si `storedHash` coincide con el token bajo el secreto JWT actual o el previous (timing-safe).
 * @pt-BR True se `storedHash` coincide com o token sob o segredo JWT atual ou o previous (timing-safe).
 */
export function tokenHashMatches(token: string, storedHash: string): boolean {
  const stored = Buffer.from(storedHash, 'utf8')
  for (const candidate of jwtSecretHashCandidates(token)) {
    const cand = Buffer.from(candidate, 'utf8')
    if (stored.length === cand.length && timingSafeEqual(stored, cand)) {
      return true
    }
  }
  return false
}
