import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import type { Response } from 'express'
import {
  PORTAL_SESSION_COOKIE_NAME,
  PORTAL_MAGIC_LINK_TTL_MS,
  PORTAL_SESSION_DURATION_MS,
  clearPortalSessionCookie,
  createPortalToken,
  getCookieValue,
  hashPortalToken,
  resolvePortalPublicBaseUrl,
  setPortalSessionCookie,
} from '../../server/portal/portalTokens'
import { initializeAppConfig, resetAppConfigCache } from '../../server/config/env'

describe('portalTokens', () => {
  beforeEach(() => {
    resetAppConfigCache()
    process.env.NODE_ENV = 'test'
    process.env.JWT_SECRET = 'portal-test-jwt-secret-32chars!!'
    initializeAppConfig()
  })

  afterEach(() => {
    delete process.env.PORTAL_PUBLIC_URL
  })

  it('exposes expected TTL constants', () => {
    expect(PORTAL_MAGIC_LINK_TTL_MS).toBe(15 * 60 * 1000)
    expect(PORTAL_SESSION_DURATION_MS).toBe(8 * 60 * 60 * 1000)
  })

  it('creates and hashes portal tokens deterministically with secret', () => {
    const token = createPortalToken()
    expect(token).toHaveLength(64)
    const hashA = hashPortalToken(token)
    const hashB = hashPortalToken(token)
    expect(hashA).toBe(hashB)
    expect(hashA).not.toBe(token)
  })

  it('parses cookie values from header', () => {
    expect(getCookieValue(undefined, PORTAL_SESSION_COOKIE_NAME)).toBeNull()
    expect(
      getCookieValue(`${PORTAL_SESSION_COOKIE_NAME}=abc%3D123; other=1`, PORTAL_SESSION_COOKIE_NAME),
    ).toBe('abc=123')
    expect(getCookieValue('other=1', PORTAL_SESSION_COOKIE_NAME)).toBeNull()
  })

  it('sets and clears portal session cookie headers', () => {
    const headers: Record<string, string> = {}
    const res = {
      setHeader: (key: string, value: string) => {
        headers[key] = value
      },
    } as unknown as Response

    setPortalSessionCookie(res, 'session-token')
    expect(headers['Set-Cookie']).toContain(`${PORTAL_SESSION_COOKIE_NAME}=session-token`)
    expect(headers['Set-Cookie']).toContain('HttpOnly')
    expect(headers['Set-Cookie']).toContain(`Max-Age=${PORTAL_SESSION_DURATION_MS / 1000}`)

    clearPortalSessionCookie(res)
    expect(headers['Set-Cookie']).toContain('Max-Age=0')
  })

  it('resolves public base URL from env or localhost fallback', () => {
    expect(resolvePortalPublicBaseUrl()).toBe('http://localhost:5173')
    process.env.PORTAL_PUBLIC_URL = 'https://portal.example.com/'
    expect(resolvePortalPublicBaseUrl()).toBe('https://portal.example.com')
  })
})
