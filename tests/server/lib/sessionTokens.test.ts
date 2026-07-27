import { beforeEach, describe, expect, it, vi } from 'vitest'
import { initializeAppConfig, resetAppConfigCache } from '../../../apps/server/config/env'
import {
  createMemoryRefreshTokenBlacklist,
  getRefreshTokenBlacklist,
  setRefreshTokenBlacklistForTests,
} from '../../../apps/server/lib/refreshTokenBlacklist'
import {
  ACCESS_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL_MS,
  blacklistRefreshHash,
  clearAuthCookies,
  createOpaqueToken,
  getCookieValue,
  hashOpaqueToken,
  issueTokenPair,
  revokeAllUserAuthTokens,
  revokeTokenFamily,
  setAuthCookies,
} from '../../../apps/server/lib/sessionTokens'
import type { PrismaClient } from '@prisma/client'
import type { Response } from 'express'

describe('refreshTokenBlacklist', () => {
  beforeEach(() => {
    setRefreshTokenBlacklistForTests(createMemoryRefreshTokenBlacklist())
  })

  it('stores and expires hashes in memory', async () => {
    const bl = getRefreshTokenBlacklist()
    await bl.add('abc', 60)
    expect(await bl.has('abc')).toBe(true)
    expect(await bl.has('missing')).toBe(false)
    await bl.disconnect()
    expect(await bl.has('abc')).toBe(false)
  })
})

describe('sessionTokens helpers', () => {
  beforeEach(() => {
    resetAppConfigCache()
    process.env.NODE_ENV = 'test'
    process.env.JWT_SECRET = 'session-tokens-unit-secret'
    initializeAppConfig()
    setRefreshTokenBlacklistForTests(createMemoryRefreshTokenBlacklist())
  })

  it('hashes and parses opaque tokens / cookies', () => {
    const token = createOpaqueToken()
    expect(token.length).toBe(64)
    expect(hashOpaqueToken(token)).toHaveLength(64)
    expect(getCookieValue(`a=1; bizcode_refresh=${encodeURIComponent(token)}`, 'bizcode_refresh')).toBe(token)
    expect(getCookieValue(undefined, 'bizcode_refresh')).toBeNull()
  })

  it('sets and clears dual auth cookies including append path', () => {
    const headers: string[] = []
    const res = {
      getHeader: (name: string) => {
        if (name !== 'Set-Cookie') return undefined
        if (headers.length === 0) return undefined
        if (headers.length === 1) return headers[0]
        return headers
      },
      setHeader: (name: string, value: string | string[]) => {
        if (name !== 'Set-Cookie') return
        headers.length = 0
        if (Array.isArray(value)) headers.push(...value)
        else headers.push(value)
      },
    } as unknown as Response

    setAuthCookies(res, 'access-token', 'refresh-token', REFRESH_TOKEN_TTL_MS)
    expect(headers.some((h) => h.includes('bizcode_session='))).toBe(true)
    expect(headers.some((h) => h.includes('bizcode_refresh='))).toBe(true)
    // Second call exercises append when Set-Cookie is already an array.
    setAuthCookies(res, 'access-2', 'refresh-2', REFRESH_TOKEN_TTL_MS)
    expect(headers.length).toBeGreaterThanOrEqual(2)
    clearAuthCookies(res)
    expect(headers.some((h) => h.includes('Max-Age=0'))).toBe(true)
  })

  it('issues token pairs and revokes user / family tokens with blacklist', async () => {
    const sessions: Array<{ id: number; userId: number; tokenFamily: string; revokedAt: Date | null; tokenHash: string }> =
      []
    const refreshes: Array<{
      id: number
      userId: number
      tokenFamily: string
      revokedAt: Date | null
      tokenHash: string
      expiresAt: Date
    }> = []
    let sid = 1
    let rid = 1

    const prisma = {
      appSession: {
        create: vi.fn(async ({ data }: { data: { userId: number; tokenFamily: string; tokenHash: string; expiresAt: Date } }) => {
          const row = { id: sid++, userId: data.userId, tokenFamily: data.tokenFamily, revokedAt: null, tokenHash: data.tokenHash }
          sessions.push(row)
          return row
        }),
        updateMany: vi.fn(async ({ where, data }: { where: Record<string, unknown>; data: { revokedAt: Date } }) => {
          for (const row of sessions) {
            if (where.userId != null && row.userId !== where.userId) continue
            if (where.tokenFamily && row.tokenFamily !== where.tokenFamily) continue
            if (where.revokedAt === null && row.revokedAt != null) continue
            row.revokedAt = data.revokedAt
          }
          return { count: 1 }
        }),
      },
      appRefreshToken: {
        create: vi.fn(async ({ data }: { data: { userId: number; tokenFamily: string; tokenHash: string; expiresAt: Date } }) => {
          const row = {
            id: rid++,
            userId: data.userId,
            tokenFamily: data.tokenFamily,
            revokedAt: null,
            tokenHash: data.tokenHash,
            expiresAt: data.expiresAt,
          }
          refreshes.push(row)
          return row
        }),
        findMany: vi.fn(async ({ where }: { where: Record<string, unknown> }) =>
          refreshes.filter((row) => {
            if (where.userId != null && row.userId !== where.userId) return false
            if (where.tokenFamily && row.tokenFamily !== where.tokenFamily) return false
            if (where.revokedAt === null && row.revokedAt != null) return false
            return true
          }),
        ),
        updateMany: vi.fn(async ({ where, data }: { where: Record<string, unknown>; data: { revokedAt: Date } }) => {
          for (const row of refreshes) {
            if (where.userId != null && row.userId !== where.userId) continue
            if (where.tokenFamily && row.tokenFamily !== where.tokenFamily) continue
            if (where.revokedAt === null && row.revokedAt != null) continue
            row.revokedAt = data.revokedAt
          }
          return { count: 1 }
        }),
      },
      $transaction: vi.fn(async (arg: unknown) => {
        if (Array.isArray(arg)) return Promise.all(arg)
        throw new Error('unexpected')
      }),
    } as unknown as PrismaClient

    const pair = await issueTokenPair(prisma, { userId: 9, rememberMe: false })
    expect(pair.accessSessionId).toBeGreaterThan(0)
    expect(pair.refreshTtlMs).toBe(REFRESH_TOKEN_TTL_MS)
    expect(pair.accessToken.length).toBeGreaterThan(20)
    expect(ACCESS_TOKEN_TTL_MS).toBe(15 * 60 * 1000)

    await blacklistRefreshHash(refreshes[0]!.tokenHash, refreshes[0]!.expiresAt)
    expect(await getRefreshTokenBlacklist().has(refreshes[0]!.tokenHash)).toBe(true)

    await revokeTokenFamily(prisma, 9, pair.tokenFamily)
    expect(sessions.every((s) => s.revokedAt != null)).toBe(true)

    const pair2 = await issueTokenPair(prisma, { userId: 9, rememberMe: true })
    expect(pair2.refreshTtlMs).toBeGreaterThan(REFRESH_TOKEN_TTL_MS)
    await revokeAllUserAuthTokens(prisma, 9)
    expect(refreshes.filter((r) => r.userId === 9).every((r) => r.revokedAt != null)).toBe(true)
  })
})
