import express from 'express'
import type { NextFunction, Request, Response } from 'express'
import { authRouterHttpRateLimiter, loginIpHttpRateLimiter, loginUsernameHttpRateLimiter } from './middleware/routeRateLimit'
import type { PrismaClient } from '@prisma/client'
import type { ModuleKey } from '@bizcode/types'
import type { TenantPlanSnapshot } from '@bizcode/types'
import {
  ROLE_PERMISSIONS,
  USER_CHANNELS,
  USER_ROLES,
  hasPermission,
  isMfaRequiredRole,
  type AuthClaims,
  type AuthScope,
  type Permission,
  type UserChannel,
  type UserRole,
} from '@bizcode/types'
import { hashPassword, verifyPassword } from './passwordHash'
import { writeAuditEvent } from './audit'
import { NEW_TENANT_MODULES } from '@bizcode/types'
import {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  SESSION_EXPIRED_ERROR,
  blacklistRefreshHash,
  clearAuthCookies,
  createOpaqueToken,
  getCookieValue,
  hashOpaqueToken,
  opaqueTokenHashCandidates,
  issueTokenPair,
  revokeTokenFamily,
  setAuthCookies,
} from './lib/sessionTokens'
import { getRefreshTokenBlacklist } from './lib/refreshTokenBlacklist'
import {
  MFA_CHALLENGE_TTL_SECONDS,
  getMfaChallengeStore,
  type MfaChallengePayload,
} from './lib/mfaChallengeStore'
import { decryptMfaSecret, encryptMfaSecret } from './lib/mfaSecrets'
import {
  buildTotpEnrollmentQr,
  generateBackupCodes,
  generateTotpSecret,
  matchBackupCode,
  verifyTotpCode,
} from './lib/mfaTotp'

export { revokeAllUserAuthTokens } from './lib/sessionTokens'

const LOGIN_WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const LOGIN_MAX_FAILURES = 5 // consecutive failures before lockout

export type RequestAuthContext = {
  claims: AuthClaims
  sessionId?: number
}

export type AuthenticatedRequest = Request & {
  auth?: RequestAuthContext
  tenantId?: number
  tenantModules?: readonly ModuleKey[]
  tenantPlan?: TenantPlanSnapshot
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

function normalizeChannel(value: string): UserChannel | null {
  return USER_CHANNELS.includes(value as UserChannel) ? (value as UserChannel) : null
}

function getRequestedChannel(req: Request): UserChannel | null | 'invalid' {
  const rawHeader = req.headers['x-bizcode-channel']
  if (!rawHeader) {
    return null
  }
  const rawValue = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader
  const trimmed = rawValue.trim().toLowerCase()
  if (!trimmed) {
    return null
  }
  return normalizeChannel(trimmed) ?? 'invalid'
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
  mfaEnabled: boolean
}): AuthClaims {
  return {
    userId: input.userId,
    username: input.username,
    tenantId: input.tenantId,
    role: input.role,
    permissions: [...ROLE_PERMISSIONS[input.role]],
    scope: input.scope,
    mfaEnabled: input.mfaEnabled,
    mfaSetupRequired: isMfaRequiredRole(input.role) && !input.mfaEnabled,
  }
}

export function resolveSession(prisma: PrismaClient) {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    const bypassEnabled = process.env.NODE_ENV === 'test' && process.env.BIZCODE_TEST_AUTH_BYPASS !== 'false'
    if (bypassEnabled) {
      const bypassRole = normalizeRole(process.env.BIZCODE_TEST_ROLE ?? 'owner') ?? 'owner'
      const bypassUserId = parseInt(process.env.BIZCODE_TEST_USER_ID ?? '0', 10)
      req.auth = {
        claims: buildClaims({
          userId: Number.isInteger(bypassUserId) ? bypassUserId : 0,
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
          mfaEnabled: false,
        }),
      }
      next()
      return
    }

    const token = getCookieValue(req.headers.cookie, ACCESS_COOKIE_NAME)
    if (!token) {
      next()
      return
    }
    const session = await prisma.appSession.findFirst({
      where: {
        tokenHash: { in: opaqueTokenHashCandidates(token) },
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
        mfaEnabled: session.user.mfaEnabled === true,
      }),
    }
    await prisma.appSession.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    })
    next()
  }
}

function enforceChannelScope(req: AuthenticatedRequest, res: Response): boolean {
  const requestedChannel = getRequestedChannel(req)
  if (requestedChannel === 'invalid') {
    res.status(400).json({
      success: false,
      error: `Invalid x-bizcode-channel header. Allowed values: ${USER_CHANNELS.join(', ')}`,
    })
    return false
  }
  if (requestedChannel !== null && !req.auth!.claims.scope.channels.includes(requestedChannel)) {
    res.status(403).json({ success: false, error: `Missing channel scope: ${requestedChannel}` })
    return false
  }
  return true
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
    if (!enforceChannelScope(req, res)) {
      return
    }
    next()
  }
}

/** @en Requires at least one of the listed permissions (channel scope still enforced). */
export function requireAnyPermission(...permissions: Permission[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    const allowed = permissions.some((p) => hasPermission(req.auth!.claims.role, p))
    if (!allowed) {
      res.status(403).json({
        success: false,
        error: `Missing one of permissions: ${permissions.join(', ')}`,
      })
      return
    }
    if (!enforceChannelScope(req, res)) {
      return
    }
    next()
  }
}

/**
 * @en Requires `super_admin` role (platform operations).
 * @es Exige rol `super_admin` (operaciones de plataforma).
 * @pt-BR Exige papel `super_admin` (operações de plataforma).
 */
export function requireSuperAdmin() {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    if (req.auth.claims.role !== 'super_admin') {
      res.status(403).json({ success: false, error: 'Super admin role required' })
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
  rememberMe?: boolean
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

function setLoginRateLimitHeaders(res: Response, failureCount: number): void {
  const remaining = Math.max(0, LOGIN_MAX_FAILURES - failureCount)
  res.setHeader('X-RateLimit-Limit', String(LOGIN_MAX_FAILURES))
  res.setHeader('X-RateLimit-Remaining', String(remaining))
  res.setHeader('X-RateLimit-Reset', new Date(Date.now() + LOGIN_WINDOW_MS).toISOString())
}

function respondAccountLocked(res: Response, failureCount: number): void {
  setLoginRateLimitHeaders(res, failureCount)
  res.status(429).json({ success: false, error: 'ACCOUNT_LOCKED' })
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
  const authRouter = express.Router()
  authRouter.use(authRouterHttpRateLimiter)

  authRouter.post('/setup-owner', async (req: Request, res: Response) => {
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
      const starterPlan = await tx.plan.findUnique({ where: { key: 'starter' } })
      await tx.tenantConfig.create({
        data: {
          tenantId: tenant.id,
          businessType: 'ambos',
          rubros: [],
          plan: 'starter',
          modules: [...NEW_TENANT_MODULES],
          integrations: [],
        },
      })
      if (starterPlan) {
        await tx.tenantPlan.create({
          data: {
            tenantId: tenant.id,
            planId: starterPlan.id,
            status: 'active',
            changedById: user.id,
          },
        })
      }
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

  authRouter.post(
    '/login',
    loginIpHttpRateLimiter,
    loginUsernameHttpRateLimiter,
    async (req: Request, res: Response) => {
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
      respondAccountLocked(res, priorFailures)
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
        respondAccountLocked(res, newFailures)
      } else {
        setLoginRateLimitHeaders(res, newFailures)
        res.status(401).json({ success: false, error: 'Invalid credentials' })
      }
      return
    }

    // Successful password — record it and clear the failure streak.
    await recordLoginAttempt(prisma, tenant.id, username, true, req.ip)

    const rememberMe = body.rememberMe === true
    const role = normalizeRole(String(user.role))
    if (!role) {
      res.status(500).json({ success: false, error: 'Unsupported role configuration' })
      return
    }

    if (user.mfaEnabled === true) {
      const mfaToken = createOpaqueToken()
      await getMfaChallengeStore().set(
        hashOpaqueToken(mfaToken),
        { userId: user.id, tenantId: user.tenantId, rememberMe },
        MFA_CHALLENGE_TTL_SECONDS,
      )
      res.json({
        success: true,
        data: {
          mfaRequired: true as const,
          mfaToken,
        },
      })
      return
    }

    const pair = await issueTokenPair(prisma, {
      userId: user.id,
      rememberMe,
      userAgent: req.headers['user-agent']?.toString(),
      ipAddress: req.ip,
    })
    setAuthCookies(res, pair.accessToken, pair.refreshToken, pair.refreshTtlMs)
    await writeAuditEvent({
      prisma,
      tenantId: user.tenantId,
      userId: user.id,
      action: 'login',
      resource: 'session',
      resourceId: String(pair.accessSessionId),
      ipAddress: req.ip,
      metadata: { tokenFamily: pair.tokenFamily, rememberMe },
    })
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

  authRouter.post('/mfa/verify', loginIpHttpRateLimiter, async (req: Request, res: Response) => {
    const body = (req.body ?? {}) as { mfaToken?: string; code?: string }
    if (!isNonEmptyString(body.mfaToken) || !isNonEmptyString(body.code)) {
      res.status(400).json({ success: false, error: 'mfaToken and code are required' })
      return
    }

    const challengeToken = body.mfaToken.trim()
    let challenge: MfaChallengePayload | null = null
    for (const candidateHash of opaqueTokenHashCandidates(challengeToken)) {
      challenge = await getMfaChallengeStore().take(candidateHash)
      if (challenge) {
        break
      }
    }
    if (!challenge) {
      res.status(401).json({ success: false, error: 'Invalid or expired MFA challenge' })
      return
    }

    const user = await prisma.appUser.findUnique({
      where: { id: challenge.userId },
      include: { mfaBackupCodes: { where: { usedAt: null } } },
    })
    if (!user || !user.active || !user.mfaEnabled || !user.totpSecretEncrypted) {
      res.status(401).json({ success: false, error: 'Invalid or expired MFA challenge' })
      return
    }

    let verified = false
    let usedBackupCodeId: number | null = null
    try {
      const secret = decryptMfaSecret(user.totpSecretEncrypted)
      if (verifyTotpCode(secret, body.code, user.username)) {
        verified = true
      }
    } catch {
      verified = false
    }

    if (!verified) {
      const backupId = matchBackupCode(body.code, user.mfaBackupCodes)
      if (backupId != null) {
        verified = true
        usedBackupCodeId = backupId
      }
    }

    if (!verified) {
      res.status(401).json({ success: false, error: 'Invalid MFA code' })
      return
    }

    if (usedBackupCodeId != null) {
      await prisma.appMfaBackupCode.update({
        where: { id: usedBackupCodeId },
        data: { usedAt: new Date() },
      })
    }

    const role = normalizeRole(String(user.role))
    if (!role) {
      res.status(500).json({ success: false, error: 'Unsupported role configuration' })
      return
    }

    const pair = await issueTokenPair(prisma, {
      userId: user.id,
      rememberMe: challenge.rememberMe,
      userAgent: req.headers['user-agent']?.toString(),
      ipAddress: req.ip,
    })
    setAuthCookies(res, pair.accessToken, pair.refreshToken, pair.refreshTtlMs)
    await writeAuditEvent({
      prisma,
      tenantId: user.tenantId,
      userId: user.id,
      action: 'mfa_verify',
      resource: 'session',
      resourceId: String(pair.accessSessionId),
      ipAddress: req.ip,
      metadata: {
        tokenFamily: pair.tokenFamily,
        rememberMe: challenge.rememberMe,
        method: usedBackupCodeId != null ? 'backup' : 'totp',
      },
    })
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

  authRouter.post('/mfa/setup/start', async (req: AuthenticatedRequest, res: Response) => {
    if (!req.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }

    const user = await prisma.appUser.findUnique({ where: { id: req.auth.claims.userId } })
    if (!user || !user.active) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    if (user.mfaEnabled) {
      res.status(409).json({ success: false, error: 'MFA already enabled' })
      return
    }

    let secret: string
    let encrypted: string
    try {
      secret = generateTotpSecret()
      encrypted = encryptMfaSecret(secret)
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : 'MFA encryption unavailable',
      })
      return
    }

    await prisma.appUser.update({
      where: { id: user.id },
      data: { totpSecretEncrypted: encrypted, mfaVerifiedAt: null, mfaEnabled: false },
    })

    const label = `${user.username}@tenant-${user.tenantId}`
    const { otpauthUrl, qrDataUrl } = await buildTotpEnrollmentQr(secret, label)
    res.json({
      success: true,
      data: {
        otpauthUrl,
        qrDataUrl,
        secret,
      },
    })
  })

  authRouter.post('/mfa/setup/confirm', async (req: AuthenticatedRequest, res: Response) => {
    if (!req.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }

    const body = (req.body ?? {}) as { code?: string }
    if (!isNonEmptyString(body.code)) {
      res.status(400).json({ success: false, error: 'code is required' })
      return
    }

    const user = await prisma.appUser.findUnique({ where: { id: req.auth.claims.userId } })
    if (!user || !user.active || !user.totpSecretEncrypted) {
      res.status(400).json({ success: false, error: 'MFA setup not started' })
      return
    }
    if (user.mfaEnabled) {
      res.status(409).json({ success: false, error: 'MFA already enabled' })
      return
    }

    let secret: string
    try {
      secret = decryptMfaSecret(user.totpSecretEncrypted)
    } catch {
      res.status(500).json({ success: false, error: 'MFA secret unavailable' })
      return
    }

    if (!verifyTotpCode(secret, body.code, user.username)) {
      res.status(401).json({ success: false, error: 'Invalid MFA code' })
      return
    }

    const { plainCodes, hashes } = generateBackupCodes()
    await prisma.$transaction(async (tx) => {
      await tx.appMfaBackupCode.deleteMany({ where: { userId: user.id } })
      await tx.appMfaBackupCode.createMany({
        data: hashes.map((codeHash) => ({ userId: user.id, codeHash })),
      })
      await tx.appUser.update({
        where: { id: user.id },
        data: { mfaEnabled: true, mfaVerifiedAt: new Date() },
      })
    })

    await writeAuditEvent({
      prisma,
      tenantId: user.tenantId,
      userId: user.id,
      action: 'mfa_enroll',
      resource: 'user',
      resourceId: String(user.id),
      ipAddress: req.ip,
    })

    res.json({
      success: true,
      data: {
        mfaEnabled: true,
        backupCodes: plainCodes,
      },
    })
  })

  authRouter.post('/mfa/disable', async (req: AuthenticatedRequest, res: Response) => {
    if (!req.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }

    const body = (req.body ?? {}) as { code?: string }
    if (!isNonEmptyString(body.code)) {
      res.status(400).json({ success: false, error: 'code is required' })
      return
    }

    const user = await prisma.appUser.findUnique({
      where: { id: req.auth.claims.userId },
      include: { mfaBackupCodes: { where: { usedAt: null } } },
    })
    if (!user || !user.active) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    if (!user.mfaEnabled || !user.totpSecretEncrypted) {
      res.status(400).json({ success: false, error: 'MFA is not enabled' })
      return
    }

    let verified = false
    let usedBackupCodeId: number | null = null
    try {
      const secret = decryptMfaSecret(user.totpSecretEncrypted)
      if (verifyTotpCode(secret, body.code, user.username)) {
        verified = true
      }
    } catch {
      verified = false
    }
    if (!verified) {
      const backupId = matchBackupCode(body.code, user.mfaBackupCodes)
      if (backupId != null) {
        verified = true
        usedBackupCodeId = backupId
      }
    }
    if (!verified) {
      res.status(401).json({ success: false, error: 'Invalid MFA code' })
      return
    }

    await prisma.$transaction(async (tx) => {
      if (usedBackupCodeId != null) {
        await tx.appMfaBackupCode.update({
          where: { id: usedBackupCodeId },
          data: { usedAt: new Date() },
        })
      }
      await tx.appMfaBackupCode.deleteMany({ where: { userId: user.id } })
      await tx.appUser.update({
        where: { id: user.id },
        data: {
          mfaEnabled: false,
          totpSecretEncrypted: null,
          mfaVerifiedAt: null,
        },
      })
    })

    await writeAuditEvent({
      prisma,
      tenantId: user.tenantId,
      userId: user.id,
      action: 'mfa_disable',
      resource: 'user',
      resourceId: String(user.id),
      ipAddress: req.ip,
    })

    res.json({ success: true, data: { mfaEnabled: false } })
  })

  authRouter.post('/refresh', async (req: Request, res: Response) => {
    const rawRefresh = getCookieValue(req.headers.cookie, REFRESH_COOKIE_NAME)
    // Missing cookie: reject without mutating cookies (CodeQL js/user-controlled-bypass).
    if (typeof rawRefresh !== 'string' || rawRefresh.length === 0) {
      res.status(401).json({ success: false, error: SESSION_EXPIRED_ERROR })
      return
    }

    const refreshCandidates = opaqueTokenHashCandidates(rawRefresh)
    const blacklist = getRefreshTokenBlacklist()
    let blacklisted = false
    for (const candidateHash of refreshCandidates) {
      if (await blacklist.has(candidateHash)) {
        blacklisted = true
        break
      }
    }
    if (blacklisted) {
      const blacklistedRow = await prisma.appRefreshToken.findFirst({
        where: { tokenHash: { in: refreshCandidates } },
        select: { userId: true, tokenFamily: true },
      })
      if (blacklistedRow) {
        await revokeTokenFamily(prisma, blacklistedRow.userId, blacklistedRow.tokenFamily)
        const user = await prisma.appUser.findUnique({ where: { id: blacklistedRow.userId } })
        if (user) {
          await writeAuditEvent({
            prisma,
            tenantId: user.tenantId,
            userId: user.id,
            action: 'session_reuse_detected',
            resource: 'refresh_token',
            resourceId: blacklistedRow.tokenFamily,
            ipAddress: req.ip,
          })
        }
      }
      clearAuthCookies(res)
      res.status(401).json({ success: false, error: SESSION_EXPIRED_ERROR })
      return
    }

    const existing = await prisma.appRefreshToken.findFirst({
      where: { tokenHash: { in: refreshCandidates } },
      include: { user: true },
    })

    if (!existing) {
      clearAuthCookies(res)
      res.status(401).json({ success: false, error: SESSION_EXPIRED_ERROR })
      return
    }

    if (existing.revokedAt != null || existing.expiresAt <= new Date() || !existing.user.active) {
      // Reuse of a revoked refresh token → kill the whole family.
      if (existing.revokedAt != null) {
        await revokeTokenFamily(prisma, existing.userId, existing.tokenFamily)
        await writeAuditEvent({
          prisma,
          tenantId: existing.user.tenantId,
          userId: existing.userId,
          action: 'session_reuse_detected',
          resource: 'refresh_token',
          resourceId: existing.tokenFamily,
          ipAddress: req.ip,
        })
      }
      clearAuthCookies(res)
      res.status(401).json({ success: false, error: SESSION_EXPIRED_ERROR })
      return
    }

    const rememberMe =
      existing.expiresAt.getTime() - existing.createdAt.getTime() > 8 * 24 * 60 * 60 * 1000

    await prisma.appRefreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    })
    await blacklistRefreshHash(existing.tokenHash, existing.expiresAt)
    await prisma.appSession.updateMany({
      where: { userId: existing.userId, tokenFamily: existing.tokenFamily, revokedAt: null },
      data: { revokedAt: new Date() },
    })

    const pair = await issueTokenPair(prisma, {
      userId: existing.userId,
      tokenFamily: existing.tokenFamily,
      rememberMe,
      userAgent: req.headers['user-agent']?.toString(),
      ipAddress: req.ip,
    })
    setAuthCookies(res, pair.accessToken, pair.refreshToken, pair.refreshTtlMs)
    await writeAuditEvent({
      prisma,
      tenantId: existing.user.tenantId,
      userId: existing.userId,
      action: 'refresh',
      resource: 'session',
      resourceId: String(pair.accessSessionId),
      ipAddress: req.ip,
      metadata: { tokenFamily: pair.tokenFamily },
    })
    res.json({ success: true, data: { refreshed: true } })
  })

  authRouter.post('/logout', async (req: AuthenticatedRequest, res: Response) => {
    const accessToken = getCookieValue(req.headers.cookie, ACCESS_COOKIE_NAME)
    const refreshToken = getCookieValue(req.headers.cookie, REFRESH_COOKIE_NAME)
    const now = new Date()

    if (refreshToken) {
      const refreshCandidates = opaqueTokenHashCandidates(refreshToken)
      const refreshRow = await prisma.appRefreshToken.findFirst({
        where: { tokenHash: { in: refreshCandidates } },
      })
      if (refreshRow) {
        await prisma.appRefreshToken.updateMany({
          where: { id: refreshRow.id, revokedAt: null },
          data: { revokedAt: now },
        })
        if (refreshRow.expiresAt > now) {
          await blacklistRefreshHash(refreshRow.tokenHash, refreshRow.expiresAt)
        }
        await prisma.appSession.updateMany({
          where: {
            userId: refreshRow.userId,
            tokenFamily: refreshRow.tokenFamily,
            revokedAt: null,
          },
          data: { revokedAt: now },
        })
      }
    } else if (accessToken) {
      await prisma.appSession.updateMany({
        where: {
          tokenHash: { in: opaqueTokenHashCandidates(accessToken) },
          revokedAt: null,
        },
        data: { revokedAt: now },
      })
    }

    clearAuthCookies(res)
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

  authRouter.get('/me', async (req: AuthenticatedRequest, res: Response) => {
    if (!req.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    const user = await prisma.appUser.findUnique({
      where: { id: req.auth.claims.userId },
      select: { mfaEnabled: true, role: true, active: true },
    })
    if (!user || !user.active) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    const role = normalizeRole(String(user.role)) ?? req.auth.claims.role
    const mfaEnabled = user.mfaEnabled === true
    res.json({
      success: true,
      data: {
        ...req.auth.claims,
        role,
        mfaEnabled,
        mfaSetupRequired: isMfaRequiredRole(role) && !mfaEnabled,
      },
    })
  })

  app.use('/api/auth', authRouter)
}
