import type { PrismaClient } from '@prisma/client'
import { NEW_TENANT_MODULES } from '../../src/lib/modules/tenantDefaults'
import { USER_CHANNELS } from '../../src/lib/rbac'
import { hashPassword } from '../passwordHash'

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
    try {
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { active },
      })
    } catch {
      return null
    }
    return this.getTenantDetail(tenantId)
  }

  async slugExists(slug: string): Promise<boolean> {
    const row = await this.prisma.tenant.findUnique({ where: { slug }, select: { id: true } })
    return row !== null
  }
}
