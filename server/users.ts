import type { Application, Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import { TENANT_ROLES, USER_CHANNELS, hasPermission, type UserRole, type UserChannel } from '../src/lib/rbac'
import { hashPassword, verifyPassword } from './passwordHash'
import { requirePermission, type AuthenticatedRequest } from './auth'

/**
 * @en Role hierarchy index — a user may only assign roles with an equal or lower index than their own.
 * @es Índice de jerarquía de roles — un usuario solo puede asignar roles con índice igual o inferior al propio.
 * @pt-BR Índice de hierarquia de roles — um usuário só pode atribuir roles com índice igual ou inferior ao seu.
 */
const ROLE_RANK: Record<UserRole, number> = {
  super_admin: 0,
  owner: 1,
  manager: 2,
  billing: 3,
  finance: 3,
  auditor: 3,
  backoffice: 4,
  seller: 4,
  cashier: 4,
  collections: 4,
  warehouse_lead: 4,
  logistics_planner: 4,
  warehouse_op: 5,
  driver: 5,
}

function canAssignRole(callerRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_RANK[callerRole] <= ROLE_RANK[targetRole]
}

function isValidRole(value: unknown): value is UserRole {
  // Only TENANT_ROLES are assignable via the API.
  // super_admin is platform-internal and can only be created via the bootstrap CLI.
  return typeof value === 'string' && (TENANT_ROLES as readonly string[]).includes(value)
}

function sanitizeChannels(raw: unknown): UserChannel[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((c): c is UserChannel => USER_CHANNELS.includes(c as UserChannel))
}

function sanitizeIntArray(raw: unknown): number[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((v): v is number => typeof v === 'number' && Number.isInteger(v))
}

function isNonEmptyString(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

async function writeAudit(
  prisma: PrismaClient,
  req: AuthenticatedRequest,
  action: string,
  resourceId?: string,
): Promise<void> {
  try {
    await prisma.auditEvent.create({
      data: {
        tenantId: req.auth!.claims.tenantId,
        userId: req.auth!.claims.userId,
        action,
        resource: 'user',
        resourceId,
        ipAddress: req.ip,
      },
    })
  } catch {
    // Audit failures must not block operations.
  }
}

/**
 * @en Registers user management routes: list, create, update, change-password.
 * @es Registra rutas de gestión de usuarios: listar, crear, actualizar, cambiar contraseña.
 * @pt-BR Registra rotas de gerenciamento de usuários: listar, criar, atualizar, alterar senha.
 */
export function registerUserRoutes(app: Application, prisma: PrismaClient): void {
  // ── GET /api/users ──────────────────────────────────────────────────────────

  app.get('/api/users', requirePermission('users.manage'), async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    try {
      const users = await prisma.appUser.findMany({
        where: { tenantId: authReq.auth!.claims.tenantId, NOT: { role: 'super_admin' } },
        select: {
          id: true,
          username: true,
          role: true,
          active: true,
          scopeChannels: true,
          scopeBranchIds: true,
          scopeWarehouseIds: true,
          scopeRouteIds: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { username: 'asc' },
      })
      res.json({ success: true, data: users })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) })
    }
  })

  // ── POST /api/users ─────────────────────────────────────────────────────────

  app.post('/api/users', requirePermission('users.manage'), async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    const body = (req.body ?? {}) as Record<string, unknown>

    if (!isNonEmptyString(body.username)) {
      res.status(400).json({ success: false, error: 'username is required' })
      return
    }
    if (!isNonEmptyString(body.password) || (body.password as string).length < 8) {
      res.status(400).json({ success: false, error: 'password must be at least 8 characters' })
      return
    }
    if (!isValidRole(body.role)) {
      res.status(400).json({ success: false, error: `role must be one of: ${TENANT_ROLES.join(', ')}` })
      return
    }

    const callerRole = authReq.auth!.claims.role
    if (!canAssignRole(callerRole, body.role)) {
      res.status(403).json({ success: false, error: 'Cannot assign a role with higher privileges than your own' })
      return
    }

    // Check roles.assign permission when assigning anything other than default
    if (!hasPermission(callerRole, 'roles.assign') && body.role !== 'seller') {
      res.status(403).json({ success: false, error: "Missing permission: roles.assign" })
      return
    }

    try {
      const user = await prisma.appUser.create({
        data: {
          tenantId: authReq.auth!.claims.tenantId,
          username: (body.username as string).trim().toLowerCase(),
          passwordHash: hashPassword(body.password as string),
          role: body.role,
          active: body.active !== false,
          scopeChannels: sanitizeChannels(body.scopeChannels),
          scopeBranchIds: sanitizeIntArray(body.scopeBranchIds),
          scopeWarehouseIds: sanitizeIntArray(body.scopeWarehouseIds),
          scopeRouteIds: sanitizeIntArray(body.scopeRouteIds),
        },
        select: {
          id: true,
          username: true,
          role: true,
          active: true,
          scopeChannels: true,
          scopeBranchIds: true,
          scopeWarehouseIds: true,
          scopeRouteIds: true,
          createdAt: true,
        },
      })
      await writeAudit(prisma, authReq, 'user_create', String(user.id))
      res.status(201).json({ success: true, data: user })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('Unique constraint')) {
        res.status(409).json({ success: false, error: 'Username already exists in this tenant' })
        return
      }
      res.status(500).json({ success: false, error: msg })
    }
  })

  // ── PUT /api/users/:id ──────────────────────────────────────────────────────

  app.put('/api/users/:id', requirePermission('users.manage'), async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    const targetId = parseInt(String(req.params.id), 10)
    if (isNaN(targetId)) {
      res.status(400).json({ success: false, error: 'Invalid user id' })
      return
    }

    const body = (req.body ?? {}) as Record<string, unknown>
    const callerRole = authReq.auth!.claims.role

    // Verify target belongs to same tenant
    const existing = await prisma.appUser.findFirst({
      where: { id: targetId, tenantId: authReq.auth!.claims.tenantId },
    })
    if (!existing) {
      res.status(404).json({ success: false, error: 'User not found' })
      return
    }

    // Prevent self-deactivation
    if (body.active === false && targetId === authReq.auth!.claims.userId) {
      res.status(400).json({ success: false, error: 'Cannot deactivate your own account' })
      return
    }

    const updateData: Record<string, unknown> = {}

    if (typeof body.active === 'boolean') updateData.active = body.active

    if (body.role !== undefined) {
      if (!isValidRole(body.role)) {
        res.status(400).json({ success: false, error: `role must be one of: ${TENANT_ROLES.join(', ')}` })
        return
      }
      if (!canAssignRole(callerRole, body.role)) {
        res.status(403).json({ success: false, error: 'Cannot assign a role with higher privileges than your own' })
        return
      }
      updateData.role = body.role
    }

    if (body.scopeChannels !== undefined) updateData.scopeChannels = sanitizeChannels(body.scopeChannels)
    if (body.scopeBranchIds !== undefined) updateData.scopeBranchIds = sanitizeIntArray(body.scopeBranchIds)
    if (body.scopeWarehouseIds !== undefined) updateData.scopeWarehouseIds = sanitizeIntArray(body.scopeWarehouseIds)
    if (body.scopeRouteIds !== undefined) updateData.scopeRouteIds = sanitizeIntArray(body.scopeRouteIds)

    try {
      const user = await prisma.appUser.update({
        where: { id: targetId },
        data: updateData,
        select: {
          id: true,
          username: true,
          role: true,
          active: true,
          scopeChannels: true,
          scopeBranchIds: true,
          scopeWarehouseIds: true,
          scopeRouteIds: true,
          updatedAt: true,
        },
      })
      await writeAudit(prisma, authReq, 'user_update', String(user.id))
      res.json({ success: true, data: user })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) })
    }
  })

  // ── POST /api/auth/change-password ──────────────────────────────────────────

  app.post('/api/auth/change-password', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    if (!authReq.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }

    const body = (req.body ?? {}) as Record<string, unknown>
    if (!isNonEmptyString(body.currentPassword)) {
      res.status(400).json({ success: false, error: 'currentPassword is required' })
      return
    }
    if (!isNonEmptyString(body.newPassword) || (body.newPassword as string).length < 8) {
      res.status(400).json({ success: false, error: 'newPassword must be at least 8 characters' })
      return
    }

    const user = await prisma.appUser.findUnique({ where: { id: authReq.auth.claims.userId } })
    if (!user || !verifyPassword(body.currentPassword as string, user.passwordHash)) {
      res.status(401).json({ success: false, error: 'Current password is incorrect' })
      return
    }

    try {
      await prisma.appUser.update({
        where: { id: user.id },
        data: { passwordHash: hashPassword(body.newPassword as string) },
      })
      await writeAudit(prisma, authReq, 'user_change_password', String(user.id))
      res.json({ success: true, data: { changed: true } })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) })
    }
  })
}
