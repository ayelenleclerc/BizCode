import { randomBytes } from 'node:crypto'
import type { Response } from 'express'
import { hashWithCurrentJwtSecret, jwtSecretHashCandidates } from '../lib/secretHmac'

export const PORTAL_SESSION_COOKIE_NAME = 'bizcode_portal_session'
export const PORTAL_MAGIC_LINK_TTL_MS = 15 * 60 * 1000
export const PORTAL_SESSION_DURATION_MS = 8 * 60 * 60 * 1000

export function createPortalToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * @en Hashes a portal token with the current JWT_SECRET (#216).
 * @es Hashea un token de portal con el JWT_SECRET actual (#216).
 * @pt-BR Faz hash de um token de portal com o JWT_SECRET atual (#216).
 */
export function hashPortalToken(token: string): string {
  return hashWithCurrentJwtSecret(token)
}

/**
 * @en HMAC digests for portal token lookup during secret rotation (#216).
 * @es Digests HMAC para búsqueda de token de portal durante rotación (#216).
 * @pt-BR Digests HMAC para lookup de token de portal durante rotação (#216).
 */
export function portalTokenHashCandidates(token: string): string[] {
  return jwtSecretHashCandidates(token)
}

export function getCookieValue(rawCookieHeader: string | undefined, key: string): string | null {
  if (!rawCookieHeader) {
    return null
  }
  const pairs = rawCookieHeader.split(';')
  for (const pair of pairs) {
    const [left, ...rest] = pair.trim().split('=')
    if (left === key) {
      return decodeURIComponent(rest.join('='))
    }
  }
  return null
}

/**
 * @en Sets the portal session cookie (8h, credentialed cross-origin SPA).
 * @es Establece la cookie de sesión del portal (8h, SPA cross-origin con credenciales).
 * @pt-BR Define o cookie de sessão do portal (8h, SPA cross-origin com credenciais).
 */
export function setPortalSessionCookie(res: Response, token: string): void {
  const maxAge = PORTAL_SESSION_DURATION_MS / 1000
  res.setHeader(
    'Set-Cookie',
    `${PORTAL_SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=${maxAge}`,
  )
}

export function clearPortalSessionCookie(res: Response): void {
  res.setHeader(
    'Set-Cookie',
    `${PORTAL_SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=0`,
  )
}

export function resolvePortalPublicBaseUrl(): string {
  const fromEnv = process.env.PORTAL_PUBLIC_URL?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '')
  }
  return 'http://localhost:5173'
}
