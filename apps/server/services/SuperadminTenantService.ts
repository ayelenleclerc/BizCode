import type { PrismaClient } from '@prisma/client'
import { NEW_TENANT_MODULES } from '@bizcode/types'
import { USER_CHANNELS } from '@bizcode/types'
import { hashPassword } from '../passwordHash'
import { revokeAllTenantAuthTokens } from '../lib/sessionTokens'
import { writeAuditEvent } from '../audit'

export type SuperadminTenantListRow = {
  id: number
  name: string
  slug: string
  active: boolean
  plan: string | null
  userCount: number
  facturaCount: number
  createdAt: string
}

export type SuperadminTenantDetail = {
  id: number
  name: string
  slug: string
  active: boolean
  maintenanceMode: boolean
  createdAt: string
  updatedAt: string
  plan: string | null
  modulesCount: number
  configUpdatedAt: string | null
  stats: {
    userCount: number
    facturaCount: number
    pedidoCount: number
    clienteCount: number
  }
  lastActivityAt: string | null
}

export type SuperadminGlobalStats = {
  activeTenants: number
  totalTenants: number
  inactiveTenants: number
  facturasToday: number
  totalUsers: number
}

export type CreateSuperadminTenantInput = {
  name: string
  slug: string
  plan?: string
  ownerUsername?: string
  ownerPassword?: string
}

export type CreateSuperadminTenantResult = {
  tenantId: number
  ownerUserId: number | null
}

const VALID_PLANS = new Set(['starter', 'pro', 'enterprise'])

function startOfTodayUtc(): Date {
  const d = new Date()
  d.setUTCHours(0, 0, 0, 0)
  return d
}

/**
 * @en Platform tenant listing and lifecycle for super-admin (#137).
 * @es Listado y ciclo de vida de tenants de plataforma para super-admin (#137).
 * @pt-BR Listagem e ciclo de vida de tenants de plataforma para super-admin (#137).
 */
export class SuperadminTenantService {
  constructor(private readonly prisma: PrismaClient) {}

  async listTenants(q?: string): Promise<SuperadminTenantListRow[]> {
    const trimmed = q?.trim()
    const where =
      trimmed && trimmed.length > 0
        ? {
            OR: [
              { name: { contains: trimmed, mode: 'insensitive' as const } },
              { slug: { contains: trimmed.toLowerCase(), mode: 'insensitive' as const } },
            ],
          }
        : undefined

    const rows = await this.prisma.tenant.findMany({
      where,
      orderBy: { id: 'asc' },
      include: {
        _count: { select: { users: true, facturas: true } },
        tenantConfig: { select: { plan: true } },
      },
    })

    return rows.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      active: t.active,
      plan: t.tenantConfig?.plan ?? null,
      userCount: t._count.users,
      facturaCount: t._count.facturas,
      createdAt: t.createdAt.toISOString(),
    }))
  }

  async getTenantDetail(tenantId: number): Promise<SuperadminTenantDetail | null> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        _count: { select: { users: true, facturas: true, pedidos: true, clientes: true } },
        tenantConfig: { select: { plan: true, modules: true, updatedAt: true } },
      },
    })
    if (!tenant) {
      return null
    }

    const [lastAudit, lastSession] = await Promise.all([
      this.prisma.auditEvent.findFirst({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      this.prisma.appSession.findFirst({
        where: { user: { tenantId } },
        orderBy: { lastSeenAt: 'desc' },
        select: { lastSeenAt: true },
      }),
    ])

    const activityTimes = [lastAudit?.createdAt, lastSession?.lastSeenAt]
      .filter((d): d is Date => d instanceof Date)
      .map((d) => d.getTime())
    const lastActivityAt =
      activityTimes.length > 0 ? new Date(Math.max(...activityTimes)).toISOString() : null

    return {
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      active: tenant.active,
      maintenanceMode: tenant.maintenanceMode,
      createdAt: tenant.createdAt.toISOString(),
      updatedAt: tenant.updatedAt.toISOString(),
      plan: tenant.tenantConfig?.plan ?? null,
      modulesCount: tenant.tenantConfig?.modules.length ?? 0,
      configUpdatedAt: tenant.tenantConfig?.updatedAt?.toISOString() ?? null,
      stats: {
        userCount: tenant._count.users,
        facturaCount: tenant._count.facturas,
        pedidoCount: tenant._count.pedidos,
        clienteCount: tenant._count.clientes,
      },
      lastActivityAt,
    }
  }

  async getGlobalStats(): Promise<SuperadminGlobalStats> {
    const startOfToday = startOfTodayUtc()
    const [activeTenants, totalTenants, facturasToday, totalUsers] = await Promise.all([
      this.prisma.tenant.count({ where: { active: true } }),
      this.prisma.tenant.count(),
      this.prisma.factura.count({ where: { fecha: { gte: startOfToday } } }),
      this.prisma.appUser.count(),
    ])

    return {
      activeTenants,
      totalTenants,
      inactiveTenants: totalTenants - activeTenants,
      facturasToday,
      totalUsers,
    }
  }

  async createTenant(input: CreateSuperadminTenantInput): Promise<CreateSuperadminTenantResult> {
    const plan = input.plan && VALID_PLANS.has(input.plan) ? input.plan : 'starter'

    const result = await this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          name: input.name,
          slug: input.slug,
        },
      })
      await tx.tenantConfig.create({
        data: {
          tenantId: tenant.id,
          businessType: 'ambos',
          rubros: [],
          plan,
          modules: [...NEW_TENANT_MODULES],
          integrations: [],
        },
      })

      const planRow = await tx.plan.findUnique({ where: { key: plan } })
      if (planRow) {
        await tx.tenantPlan.create({
          data: {
            tenantId: tenant.id,
            planId: planRow.id,
            status: 'active',
          },
        })
      }

      let ownerUserId: number | null = null
      if (input.ownerUsername && input.ownerPassword) {
        const user = await tx.appUser.create({
          data: {
            tenantId: tenant.id,
            username: input.ownerUsername,
            passwordHash: hashPassword(input.ownerPassword),
            role: 'owner',
            scopeChannels: [...USER_CHANNELS],
          },
        })
        ownerUserId = user.id
      }

      return { tenantId: tenant.id, ownerUserId }
    })

    return result
  }

  async patchTenantActive(tenantId: number, active: boolean): Promise<SuperadminTenantDetail | null> {
    let persisted: { active: boolean }
    try {
      persisted = await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { active },
        select: { active: true },
      })
    } catch {
      return null
    }
    // @en Revoke using persisted DB state (not raw request body) for session teardown (#222).
    // @es Revocar según estado persistido en DB (no el body crudo) al cortar sesiones (#222).
    // @pt-BR Revogar com estado persistido no DB (não o body cru) ao encerrar sessões (#222).
    if (persisted.active === false) {
      await revokeAllTenantAuthTokens(this.prisma, tenantId)
    }
    return this.getTenantDetail(tenantId)
  }

  /**
   * @en Disables a tenant (`active=false`) and revokes all of its sessions (#222).
   * @es Deshabilita un tenant (`active=false`) y revoca todas sus sesiones (#222).
   * @pt-BR Desabilita um tenant (`active=false`) e revoga todas as suas sessões (#222).
   */
  async disableTenant(
    tenantId: number,
    actor: { userId: number; ipAddress?: string | null },
  ): Promise<SuperadminTenantDetail | null> {
    const detail = await this.patchTenantActive(tenantId, false)
    if (!detail) {
      return null
    }
    await writeAuditEvent({
      prisma: this.prisma,
      tenantId,
      userId: actor.userId,
      action: 'incident_disable_tenant',
      resource: 'tenant',
      resourceId: String(tenantId),
      ipAddress: actor.ipAddress ?? null,
      metadata: { active: false },
    })
    return detail
  }

  /**
   * @en Sets maintenance mode and revokes sessions when enabling (#222).
   * @es Activa/desactiva modo mantenimiento y revoca sesiones al activarlo (#222).
   * @pt-BR Define modo manutenção e revoga sessões ao ativar (#222).
   */
  async setMaintenanceMode(
    tenantId: number,
    enabled: boolean,
    actor: { userId: number; ipAddress?: string | null },
  ): Promise<SuperadminTenantDetail | null> {
    let persisted: { maintenanceMode: boolean }
    try {
      persisted = await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { maintenanceMode: enabled },
        select: { maintenanceMode: true },
      })
    } catch {
      return null
    }
    // @en Revoke using persisted DB state when maintenance is on (#222).
    // @es Revocar según estado persistido cuando el mantenimiento está activo (#222).
    // @pt-BR Revogar com estado persistido quando a manutenção está ativa (#222).
    if (persisted.maintenanceMode === true) {
      await revokeAllTenantAuthTokens(this.prisma, tenantId)
    }
    await writeAuditEvent({
      prisma: this.prisma,
      tenantId,
      userId: actor.userId,
      action: persisted.maintenanceMode ? 'incident_maintenance_on' : 'incident_maintenance_off',
      resource: 'tenant',
      resourceId: String(tenantId),
      ipAddress: actor.ipAddress ?? null,
      metadata: { maintenanceMode: persisted.maintenanceMode },
    })
    return this.getTenantDetail(tenantId)
  }

  /**
   * @en Revokes all auth tokens for users of a tenant (#222).
   * @es Revoca todos los tokens de auth de los usuarios de un tenant (#222).
   * @pt-BR Revoga todos os tokens de auth dos usuários de um tenant (#222).
   */
  async revokeAllSessions(
    tenantId: number,
    actor: { userId: number; ipAddress?: string | null },
  ): Promise<{ revokedUserCount: number } | null> {
    const exists = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true },
    })
    if (!exists) {
      return null
    }
    const revokedUserCount = await revokeAllTenantAuthTokens(this.prisma, tenantId)
    await writeAuditEvent({
      prisma: this.prisma,
      tenantId,
      userId: actor.userId,
      action: 'incident_revoke_sessions',
      resource: 'tenant',
      resourceId: String(tenantId),
      ipAddress: actor.ipAddress ?? null,
      metadata: { revokedUserCount },
    })
    return { revokedUserCount }
  }

  /**
   * @en Forensic audit listing for a tenant with optional date range (#222).
   * @es Listado forense de auditoría de un tenant con rango de fechas opcional (#222).
   * @pt-BR Listagem forense de auditoria de um tenant com intervalo de datas opcional (#222).
   */
  async listAuditEvents(
    tenantId: number,
    opts: { startDate?: Date; endDate?: Date; take: number; skip: number },
  ): Promise<{ total: number; events: Array<Record<string, unknown>> } | null> {
    const exists = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true },
    })
    if (!exists) {
      return null
    }
    const where = {
      tenantId,
      ...(opts.startDate || opts.endDate
        ? {
            createdAt: {
              ...(opts.startDate ? { gte: opts.startDate } : {}),
              ...(opts.endDate ? { lte: opts.endDate } : {}),
            },
          }
        : {}),
    }
    const [total, rows] = await Promise.all([
      this.prisma.auditEvent.count({ where }),
      this.prisma.auditEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: opts.take,
        skip: opts.skip,
        include: { user: { select: { username: true } } },
      }),
    ])
    return {
      total,
      events: rows.map((event) => ({
        id: event.id,
        tenantId: event.tenantId,
        userId: event.userId,
        username: event.user?.username ?? null,
        action: event.action,
        resource: event.resource,
        resourceId: event.resourceId,
        ipAddress: event.ipAddress,
        metadata: event.metadata,
        createdAt: event.createdAt.toISOString(),
      })),
    }
  }

  async slugExists(slug: string): Promise<boolean> {
    const row = await this.prisma.tenant.findUnique({ where: { slug }, select: { id: true } })
    return row !== null
  }
}
