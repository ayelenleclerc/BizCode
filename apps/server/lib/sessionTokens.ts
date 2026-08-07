import { randomBytes, randomUUID } from 'node:crypto'
import type { PrismaClient } from '@prisma/client'
import type { Response } from 'express'
import { getRefreshTokenBlacklist } from './refreshTokenBlacklist'
import { hashWithCurrentJwtSecret, jwtSecretHashCandidates } from './secretHmac'

export const ACCESS_COOKIE_NAME = 'bizcode_session'
export const REFRESH_COOKIE_NAME = 'bizcode_refresh'

/** @en Access cookie TTL (15 minutes) per #212. @es TTL cookie access (15 min) según #212. @pt-BR TTL cookie access (15 min) conforme #212. */
export const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000
/** @en Refresh TTL without rememberMe (7 days). @es TTL refresh sin rememberMe (7 días). @pt-BR TTL refresh sem rememberMe (7 dias). */
export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000
/** @en Refresh TTL with rememberMe (30 days). @es TTL refresh con rememberMe (30 días). @pt-BR TTL refresh com rememberMe (30 dias). */
export const REFRESH_TOKEN_REMEMBER_TTL_MS = 30 * 24 * 60 * 60 * 1000

export const SESSION_EXPIRED_ERROR = 'SESSION_EXPIRED'

export function createOpaqueToken(): string {
  return randomBytes(32).toString('hex')
}

/**
 * @en Hashes an opaque session/refresh/MFA challenge token with the current JWT_SECRET (#216).
 * @es Hashea un token opaco de sesión/refresh/challenge MFA con el JWT_SECRET actual (#216).
 * @pt-BR Faz hash de um token opaco de sessão/refresh/challenge MFA com o JWT_SECRET atual (#216).
 */
export function hashOpaqueToken(token: string): string {
  return hashWithCurrentJwtSecret(token)
}

/**
 * @en HMAC digests to try when looking up a stored token hash during secret rotation (#216).
 * @es Digests HMAC a probar al buscar un hash almacenado durante rotación de secreto (#216).
 * @pt-BR Digests HMAC a tentar ao buscar um hash armazenado durante rotação de segredo (#216).
 */
export function opaqueTokenHashCandidates(token: string): string[] {
  return jwtSecretHashCandidates(token)
}

export function getCookieValue(rawCookieHeader: string | undefined, key: string): string | null {
  if (!rawCookieHeader) return null
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
 * @en Extracts an opaque Bearer token from an Authorization header (#167).
 * @es Extrae un token opaco Bearer del header Authorization (#167).
 * @pt-BR Extrai um token opaco Bearer do header Authorization (#167).
 */
export function getBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader) return null
  const match = /^Bearer\s+(\S+)$/i.exec(authorizationHeader.trim())
  return match?.[1] ?? null
}

function appendSetCookie(res: Response, cookie: string): void {
  const prev = res.getHeader('Set-Cookie')
  if (!prev) {
    res.setHeader('Set-Cookie', cookie)
    return
  }
  if (Array.isArray(prev)) {
    res.setHeader('Set-Cookie', [...prev.map(String), cookie])
    return
  }
  res.setHeader('Set-Cookie', [String(prev), cookie])
}

function buildCookie(name: string, value: string, maxAgeSeconds: number): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=${maxAgeSeconds}`
}

export function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
  refreshTtlMs: number,
): void {
  appendSetCookie(res, buildCookie(ACCESS_COOKIE_NAME, accessToken, ACCESS_TOKEN_TTL_MS / 1000))
  appendSetCookie(res, buildCookie(REFRESH_COOKIE_NAME, refreshToken, refreshTtlMs / 1000))
}

export function clearAuthCookies(res: Response): void {
  appendSetCookie(res, buildCookie(ACCESS_COOKIE_NAME, '', 0))
  appendSetCookie(res, buildCookie(REFRESH_COOKIE_NAME, '', 0))
}

export type IssuedTokenPair = {
  accessToken: string
  refreshToken: string
  tokenFamily: string
  accessSessionId: number
  refreshTokenId: number
  refreshTtlMs: number
}

/**
 * @en Session token fields returned alongside cookies for RN/Expo clients (#167).
 * @es Campos de token de sesión devueltos junto a cookies para clientes RN/Expo (#167).
 * @pt-BR Campos de token de sessão retornados junto com cookies para clientes RN/Expo (#167).
 */
export function buildBearerTokenPayload(pair: Pick<IssuedTokenPair, 'accessToken' | 'refreshToken'>): {
  accessToken: string
  refreshToken: string
  expiresIn: number
} {
  return {
    accessToken: pair.accessToken,
    refreshToken: pair.refreshToken,
    expiresIn: ACCESS_TOKEN_TTL_MS / 1000,
  }
}

/**
 * @en Issues a new access+refresh pair for a token family (#212).
 * @es Emite un nuevo par access+refresh para una familia de tokens (#212).
 * @pt-BR Emite um novo par access+refresh para uma família de tokens (#212).
 */
export async function issueTokenPair(
  prisma: PrismaClient,
  input: {
    userId: number
    tokenFamily?: string
    rememberMe?: boolean
    userAgent?: string
    ipAddress?: string
  },
): Promise<IssuedTokenPair> {
  const tokenFamily = input.tokenFamily ?? randomUUID()
  const refreshTtlMs = input.rememberMe ? REFRESH_TOKEN_REMEMBER_TTL_MS : REFRESH_TOKEN_TTL_MS
  const accessToken = createOpaqueToken()
  const refreshToken = createOpaqueToken()
  const now = Date.now()

  const [session, refresh] = await prisma.$transaction([
    prisma.appSession.create({
      data: {
        userId: input.userId,
        tokenHash: hashOpaqueToken(accessToken),
        tokenFamily,
        expiresAt: new Date(now + ACCESS_TOKEN_TTL_MS),
        userAgent: input.userAgent,
        ipAddress: input.ipAddress,
      },
    }),
    prisma.appRefreshToken.create({
      data: {
        userId: input.userId,
        tokenHash: hashOpaqueToken(refreshToken),
        tokenFamily,
        expiresAt: new Date(now + refreshTtlMs),
        userAgent: input.userAgent,
        ipAddress: input.ipAddress,
      },
    }),
  ])

  return {
    accessToken,
    refreshToken,
    tokenFamily,
    accessSessionId: session.id,
    refreshTokenId: refresh.id,
    refreshTtlMs,
  }
}

export async function blacklistRefreshHash(tokenHash: string, expiresAt: Date): Promise<void> {
  const ttlSeconds = Math.max(1, Math.ceil((expiresAt.getTime() - Date.now()) / 1000))
  await getRefreshTokenBlacklist().add(tokenHash, ttlSeconds)
}

/**
 * @en Revokes all access sessions and refresh tokens for a user (#212 password change / reuse).
 * @es Revoca todas las sesiones access y refresh de un usuario (#212 cambio de password / reuso).
 * @pt-BR Revoga todas as sessões access e refresh de um usuário (#212 troca de senha / reuso).
 */
export async function revokeAllUserAuthTokens(prisma: PrismaClient, userId: number): Promise<void> {
  const now = new Date()
  const activeRefresh = await prisma.appRefreshToken.findMany({
    where: { userId, revokedAt: null },
    select: { tokenHash: true, expiresAt: true },
  })
  await prisma.$transaction([
    prisma.appSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: now },
    }),
    prisma.appRefreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: now },
    }),
  ])
  await Promise.all(
    activeRefresh.map((row) =>
      row.expiresAt > now ? blacklistRefreshHash(row.tokenHash, row.expiresAt) : Promise.resolve(),
    ),
  )
}

/**
 * @en Revokes all access sessions and refresh tokens for every user of a tenant (#222).
 * @es Revoca todas las sesiones access y refresh de todos los usuarios de un tenant (#222).
 * @pt-BR Revoga todas as sessões access e refresh de todos os usuários de um tenant (#222).
 */
export async function revokeAllTenantAuthTokens(prisma: PrismaClient, tenantId: number): Promise<number> {
  const users = await prisma.appUser.findMany({
    where: { tenantId },
    select: { id: true },
  })
  if (users.length === 0) {
    return 0
  }
  const userIds = users.map((u) => u.id)
  const now = new Date()
  const activeRefresh = await prisma.appRefreshToken.findMany({
    where: { userId: { in: userIds }, revokedAt: null },
    select: { tokenHash: true, expiresAt: true },
  })
  await prisma.$transaction([
    prisma.appSession.updateMany({
      where: { userId: { in: userIds }, revokedAt: null },
      data: { revokedAt: now },
    }),
    prisma.appRefreshToken.updateMany({
      where: { userId: { in: userIds }, revokedAt: null },
      data: { revokedAt: now },
    }),
  ])
  await Promise.all(
    activeRefresh.map((row) =>
      row.expiresAt > now ? blacklistRefreshHash(row.tokenHash, row.expiresAt) : Promise.resolve(),
    ),
  )
  return userIds.length
}

/**
 * @en Revokes every token in a family after refresh reuse is detected (#212).
 * @es Revoca todos los tokens de una familia tras detectar reuso de refresh (#212).
 * @pt-BR Revoga todos os tokens de uma família após detectar reuso de refresh (#212).
 */
export async function revokeTokenFamily(
  prisma: PrismaClient,
  userId: number,
  tokenFamily: string,
): Promise<void> {
  const now = new Date()
  const activeRefresh = await prisma.appRefreshToken.findMany({
    where: { userId, tokenFamily, revokedAt: null },
    select: { tokenHash: true, expiresAt: true },
  })
  await prisma.$transaction([
    prisma.appSession.updateMany({
      where: { userId, tokenFamily, revokedAt: null },
      data: { revokedAt: now },
    }),
    prisma.appRefreshToken.updateMany({
      where: { userId, tokenFamily, revokedAt: null },
      data: { revokedAt: now },
    }),
  ])
  await Promise.all(
    activeRefresh.map((row) =>
      row.expiresAt > now ? blacklistRefreshHash(row.tokenHash, row.expiresAt) : Promise.resolve(),
    ),
  )
}
