import { createHmac, randomBytes } from 'node:crypto'
import type { Response } from 'express'
import { getAppConfig } from '../config/env'

export const PORTAL_SESSION_COOKIE_NAME = 'bizcode_portal_session'
export const PORTAL_MAGIC_LINK_TTL_MS = 15 * 60 * 1000
export const PORTAL_SESSION_DURATION_MS = 8 * 60 * 60 * 1000

export function createPortalToken(): string {
  return randomBytes(32).toString('hex')
}

export function hashPortalToken(token: string): string {
  return createHmac('sha256', getAppConfig().JWT_SECRET).update(token).digest('hex')
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
