import { createHash, randomBytes } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import rateLimit from 'express-rate-limit'
import { Prisma, type PrismaClient } from '@prisma/client'
import {
  ROLE_PERMISSIONS,
  USER_CHANNELS,
  USER_ROLES,
  hasPermission,
  type AuthClaims,
  type AuthScope,
  type Permission,
  type UserChannel,
  type UserRole,
} from '../src/lib/rbac'
import { hashPassword, verifyPassword } from './passwordHash'

const SESSION_COOKIE_NAME = 'bizcode_session'
const SESSION_DURATION_MS = 1000 * 60 * 60 * 8

const LOGIN_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const LOGIN_MAX_FAILURES = 5            // consecutive failures before lockout
const LOGIN_RATE_LIMIT = 20             // requests per window per IP

export type RequestAuthContext = {
  claims: AuthClaims
  sessionId?: number
}

export type AuthenticatedRequest = Request & { auth?: RequestAuthContext }

function getCookieValue(rawCookieHeader: string | undefined, key: string): string | null {
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

function createSessionToken(): string {
  return randomBytes(32).toString('hex')
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function normalizeRole(value: string): UserRole | null {
  return USER_ROLES.includes(value as UserRole) ? (value as UserRole) : null
}

function normalizeChannels(values: string[]): UserChannel[] {
  const unique = new Set<UserChannel>()
  for (const entry of values) {
    if (USER_CHANNELS.includes(entry as UserChannel)) {
      unique.add(entry as UserChannel)
    }
  }
  return [...unique]
}

function createScope(raw: {
  tenantId: number
  branchIds: number[]
  warehouseIds: number[]
  routeIds: number[]
  channels: string[]
}): AuthScope {
  return {
    tenantId: raw.tenantId,
    branchIds: raw.branchIds,
    warehouseIds: raw.warehouseIds,
    routeIds: raw.routeIds,
    channels: normalizeChannels(raw.channels),
  }
}

function buildClaims(input: {
  userId: number
  username: string
  tenantId: number
  role: UserRole
  scope: AuthScope
}): AuthClaims {
  return {
    userId: input.userId,
    username: input.username,
    tenantId: input.tenantId,
    role: input.role,
    permissions: [...ROLE_PERMISSIONS[input.role]],
    scope: input.scope,
  }
}

/**
 * @en Session cookies use SameSite=None so the SPA on another origin (e.g. Vite :5173) can send them with credentialed XHR.
 * @es Las cookies de sesión usan SameSite=None para que el SPA en otro origen (p. ej. Vite :5173) las envíe con XHR con credenciales.
 * @pt-BR Cookies de sessão com SameSite=None para o SPA em outra origem (ex.: Vite :5173) enviá-las em XHR com credenciais.
 */
function setSessionCookie(res: Response, token: string): void {
  const maxAge = SESSION_DURATION_MS / 1000
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=${maxAge}`,
  )
}

function clearSessionCookie(res: Response): void {
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=0`,
  )
}

async function writeAuditEvent(args: {
  prisma: PrismaClient
  tenantId: number
  userId?: number
  action: string
  resource: string
  resourceId?: string
  ipAddress?: string
  metadata?: Prisma.InputJsonValue
}): Promise<void> {
  await args.prisma.auditEvent.create({
    data: {
      tenantId: args.tenantId,
      userId: args.userId,
      action: args.action,
      resource: args.resource,
      resourceId: args.resourceId,
      ipAddress: args.ipAddress,
      metadata: args.metadata,
    },
  })
}

export function resolveSession(prisma: PrismaClient) {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    const bypassEnabled = process.env.NODE_ENV === 'test' && process.env.BIZCODE_TEST_AUTH_BYPASS !== 'false'
    if (bypassEnabled) {
      const bypassRole = normalizeRole(process.env.BIZCODE_TEST_ROLE ?? 'owner') ?? 'owner'
      req.auth = {
        claims: buildClaims({
          userId: 0,
          username: 'test-owner',
          tenantId: 1,
          role: bypassRole,
          scope: {
            tenantId: 1,
            branchIds: [],
            warehouseIds: [],
            routeIds: [],
            channels: [...USER_CHANNELS],
          },
        }),
      }
      next()
      return
    }

    const token = getCookieValue(req.headers.cookie, SESSION_COOKIE_NAME)
    if (!token) {
      next()
      return
    }
    const tokenHash = hashToken(token)
    const session = await prisma.appSession.findFirst({
      where: {
        tokenHash,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    })
    if (!session || !session.user.active) {
      next()
      return
    }
    const role = normalizeRole(String(session.user.role))
    if (!role) {
      next()
      return
    }
    const scope = createScope({
      tenantId: session.user.tenantId,
      branchIds: session.user.scopeBranchIds,
      warehouseIds: session.user.scopeWarehouseIds,
      routeIds: session.user.scopeRouteIds,
      channels: session.user.scopeChannels,
    })
    req.auth = {
      sessionId: session.id,
      claims: buildClaims({
        userId: session.user.id,
        username: session.user.username,
        tenantId: session.user.tenantId,
        role,
        scope,
      }),
    }
    await prisma.appSession.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    })
    next()
  }
}

export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    if (!hasPermission(req.auth.claims.role, permission)) {
      res.status(403).json({ success: false, error: `Missing permission: ${permission}` })
      return
    }
    next()
  }
}

type SetupOwnerBody = {
  tenantName?: string
  tenantSlug?: string
  username?: string
  password?: string
}

type LoginBody = {
  tenantSlug?: string
  username?: string
  password?: string
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

/**
 * @en Counts consecutive failed login attempts for a tenant+username pair within the lockout window.
 *     Stops counting at the first successful attempt (resets streak).
 * @es Cuenta intentos fallidos consecutivos para un par tenant+usuario dentro de la ventana de bloqueo.
 *     Se detiene al primer intento exitoso (resetea la racha).
 */
async function countConsecutiveFailures(
  prisma: PrismaClient,
  tenantId: number,
  username: string,
): Promise<number> {
  const windowStart = new Date(Date.now() - LOGIN_WINDOW_MS)
  const attempts = await prisma.loginAttempt.findMany({
    where: { tenantId, username, createdAt: { gte: windowStart } },
    orderBy: { createdAt: 'desc' },
    select: { success: true },
  })
  let count = 0
  for (const attempt of attempts) {
    if (attempt.success) break
    count++
  }
  return count
}

/**
 * @en Records a login attempt and, when failures reach the threshold, locks the user account.
 * @es Registra un intento de login y, cuando las fallas alcanzan el umbral, bloquea la cuenta.
 */
async function recordLoginAttempt(
  prisma: PrismaClient,
  tenantId: number,
  username: string,
  success: boolean,
  ipAddress: string | undefined,
): Promise<void> {
  await prisma.loginAttempt.create({
    data: { tenantId, username, success, ipAddress },
  })

  if (!success) {
    const failures = await countConsecutiveFailures(prisma, tenantId, username)
    if (failures >= LOGIN_MAX_FAILURES) {
      // Lock the account — same message for existing and non-existing users (no enumeration).
      await prisma.appUser.updateMany({
        where: { tenantId, username, active: true },
        data: { active: false },
      })
    }
  }
}

export function registerAuthRoutes(app: import('express').Application, prisma: PrismaClient): void {
  app.post('/api/auth/setup-owner', async (req: Request, res: Response) => {
    const body = (req.body ?? {}) as SetupOwnerBody
    if (
      !isNonEmptyString(body.tenantName) ||
      !isNonEmptyString(body.tenantSlug) ||
      !isNonEmptyString(body.username) ||
      !isNonEmptyString(body.password)
    ) {
      res.status(400).json({ success: false, error: 'tenantName, tenantSlug, username and password are required' })
      return
    }

    const existingUsers = await prisma.appUser.count()
    if (existingUsers > 0) {
      res.status(409).json({ success: false, error: 'Initial owner setup already completed' })
      return
    }

    const tenantName = body.tenantName.trim()
    const tenantSlug = body.tenantSlug.trim().toLowerCase()
    const username = body.username.trim().toLowerCase()
    const password = body.password

    const owner = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: tenantName,
          slug: tenantSlug,
        },
      })
      const user = await tx.appUser.create({
        data: {
          tenantId: tenant.id,
          username,
          passwordHash: hashPassword(password),
          role: 'owner',
          scopeChannels: [...USER_CHANNELS],
        },
      })
      await writeAuditEvent({
        prisma: tx as unknown as PrismaClient,
        tenantId: tenant.id,
        userId: user.id,
        action: 'setup_owner',
        resource: 'user',
        resourceId: String(user.id),
        metadata: { username: user.username },
      })
      return { tenant, user }
    })

    res.status(201).json({
      success: true,
      data: {
        tenantId: owner.tenant.id,
        userId: owner.user.id,
        role: owner.user.role,
      },
    })
  })

  const loginRateLimiter = rateLimit({
    windowMs: LOGIN_WINDOW_MS,
    max: LOGIN_RATE_LIMIT,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test',
    handler: (_req: Request, res: Response) => {
      res.status(429).json({ success: false, error: 'TOO_MANY_REQUESTS' })
    },
  })

  app.post('/api/auth/login', loginRateLimiter, async (req: Request, res: Response) => {
    const body = (req.body ?? {}) as LoginBody
    if (!isNonEmptyString(body.tenantSlug) || !isNonEmptyString(body.username) || !isNonEmptyString(body.password)) {
      res.status(400).json({ success: false, error: 'tenantSlug, username and password are required' })
      return
    }

    const tenantSlug = body.tenantSlug.trim().toLowerCase()
    const username = body.username.trim().toLowerCase()

    const tenant = await prisma.tenant.findUnique({ where: { slug: tenantSlug } })
    if (!tenant || !tenant.active) {
      res.status(401).json({ success: false, error: 'Invalid credentials' })
      return
    }

    // Check consecutive failures BEFORE looking up the user (no enumeration).
    const priorFailures = await countConsecutiveFailures(prisma, tenant.id, username)
    if (priorFailures >= LOGIN_MAX_FAILURES) {
      res.status(401).json({ success: false, error: 'ACCOUNT_LOCKED' })
      return
    }

    const user = await prisma.appUser.findUnique({
      where: { tenantId_username: { tenantId: tenant.id, username } },
    })

    // Treat an already-inactive account the same as a failed attempt.
    const passwordOk = user !== null && user.active && verifyPassword(body.password, user.passwordHash)

    if (!passwordOk) {
      await recordLoginAttempt(prisma, tenant.id, username, false, req.ip)
      // Re-count so we return ACCOUNT_LOCKED on the exact threshold attempt.
      const newFailures = await countConsecutiveFailures(prisma, tenant.id, username)
      if (newFailures >= LOGIN_MAX_FAILURES) {
        res.status(401).json({ success: false, error: 'ACCOUNT_LOCKED' })
      } else {
        res.status(401).json({ success: false, error: 'Invalid credentials' })
      }
      return
    }

    // Successful login — record it and clear the failure streak.
    await recordLoginAttempt(prisma, tenant.id, username, true, req.ip)

    const token = createSessionToken()
    const tokenHash = hashToken(token)
    const session = await prisma.appSession.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + SESSION_DURATION_MS),
        userAgent: req.headers['user-agent']?.toString(),
        ipAddress: req.ip,
      },
    })
    setSessionCookie(res, token)
    await writeAuditEvent({
      prisma,
      tenantId: user.tenantId,
      userId: user.id,
      action: 'login',
      resource: 'session',
      resourceId: String(session.id),
      ipAddress: req.ip,
    })
    const role = normalizeRole(String(user.role))
    if (!role) {
      res.status(500).json({ success: false, error: 'Unsupported role configuration' })
      return
    }
    res.json({
      success: true,
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        username: user.username,
        role,
      },
    })
  })

  app.post('/api/auth/logout', async (req: AuthenticatedRequest, res: Response) => {
    const token = getCookieValue(req.headers.cookie, SESSION_COOKIE_NAME)
    if (token) {
      await prisma.appSession.updateMany({
        where: {
          tokenHash: hashToken(token),
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      })
    }
    clearSessionCookie(res)
    if (req.auth) {
      await writeAuditEvent({
        prisma,
        tenantId: req.auth.claims.tenantId,
        userId: req.auth.claims.userId,
        action: 'logout',
        resource: 'session',
        resourceId: req.auth.sessionId ? String(req.auth.sessionId) : undefined,
        ipAddress: req.ip,
      })
    }
    res.json({ success: true, data: { loggedOut: true } })
  })

  app.get('/api/auth/me', (req: AuthenticatedRequest, res: Response) => {
    if (!req.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    res.json({ success: true, data: req.auth.claims })
  })
}
