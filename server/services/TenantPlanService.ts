import type { PrismaClient } from '@prisma/client'
import {
  DEFAULT_PLAN_KEY,
  PLAN_CATALOG,
  isLimitExceeded,
  planIncludesFeature,
  type PlanFeatureKey,
  type PlanKey,
  type TenantPlanSnapshot,
} from '../../src/lib/plans'
import { invalidateTenantFeaturesCache } from './tenantConfigCache'
import {
  getCachedTenantPlan,
  invalidateTenantPlanCache,
  setCachedTenantPlan,
} from './tenantPlanCache'

export type PublicPlanDto = {
  key: string
  name: string
  monthlyPrice: number
  currency: string
  maxUsers: number | null
  maxInvoicesPerMonth: number | null
  features: string[]
}

function parseFeatures(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return []
  }
  return raw.filter((v): v is string => typeof v === 'string')
}

function rowToSnapshot(
  planKey: string,
  planName: string,
  monthlyPrice: number,
  currency: string,
  maxUsers: number | null,
  maxInvoicesPerMonth: number | null,
  features: string[],
  status: string,
  usersUsed: number,
  invoicesUsed: number,
): TenantPlanSnapshot {
  return {
    planKey,
    planName,
    monthlyPrice,
    currency,
    maxUsers,
    maxInvoicesPerMonth,
    features,
    status,
    usage: { usersUsed, invoicesUsed },
  }
}

/**
 * @en Resolves SaaS plan limits and usage for a tenant (#181).
 * @es Resuelve límites y uso del plan SaaS de un tenant (#181).
 * @pt-BR Resolve limites e uso do plano SaaS de um tenant (#181).
 */
export class TenantPlanService {
  constructor(private readonly prisma: PrismaClient) {}

  async listPublicPlans(): Promise<PublicPlanDto[]> {
    const rows = await this.prisma.plan.findMany({
      where: { active: true },
      orderBy: { monthlyPrice: 'asc' },
    })
    if (rows.length > 0) {
      return rows.map((row) => ({
        key: row.key,
        name: row.name,
        monthlyPrice: row.monthlyPrice,
        currency: row.currency,
        maxUsers: row.maxUsers,
        maxInvoicesPerMonth: row.maxInvoicesPerMonth,
        features: parseFeatures(row.features),
      }))
    }
    return Object.values(PLAN_CATALOG).map((def) => ({
      key: def.key,
      name: def.name,
      monthlyPrice: def.monthlyPrice,
      currency: def.currency,
      maxUsers: def.maxUsers,
      maxInvoicesPerMonth: def.maxInvoicesPerMonth,
      features: [...def.features],
    }))
  }

  async countActiveUsers(tenantId: number): Promise<number> {
    return this.prisma.appUser.count({
      where: { tenantId, active: true },
    })
  }

  async countFacturasInCurrentMonth(tenantId: number, now = new Date()): Promise<number> {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))
    return this.prisma.factura.count({
      where: {
        tenantId,
        createdAt: { gte: start, lt: end },
      },
    })
  }

  async getSnapshotForTenant(tenantId: number): Promise<TenantPlanSnapshot> {
    const cached = getCachedTenantPlan(tenantId)
    if (cached) {
      return cached
    }

    const [row, usersUsed, invoicesUsed] = await Promise.all([
      this.prisma.tenantPlan.findUnique({
        where: { tenantId },
        include: { plan: true },
      }),
      this.countActiveUsers(tenantId),
      this.countFacturasInCurrentMonth(tenantId),
    ])

    let snapshot: TenantPlanSnapshot
    if (row?.plan) {
      snapshot = rowToSnapshot(
        row.plan.key,
        row.plan.name,
        row.plan.monthlyPrice,
        row.plan.currency,
        row.plan.maxUsers,
        row.plan.maxInvoicesPerMonth,
        parseFeatures(row.plan.features),
        row.status,
        usersUsed,
        invoicesUsed,
      )
    } else {
      const def = PLAN_CATALOG[DEFAULT_PLAN_KEY]
      snapshot = rowToSnapshot(
        def.key,
        def.name,
        def.monthlyPrice,
        def.currency,
        def.maxUsers,
        def.maxInvoicesPerMonth,
        [...def.features],
        'active',
        usersUsed,
        invoicesUsed,
      )
    }

    setCachedTenantPlan(tenantId, snapshot)
    return snapshot
  }

  assertCanAddUser(snapshot: TenantPlanSnapshot): void {
    if (isLimitExceeded(snapshot.usage.usersUsed, snapshot.maxUsers)) {
      const err = new Error('plan_limit_users') as Error & { statusCode: number }
      err.statusCode = 402
      throw err
    }
  }

  assertCanCreateInvoice(snapshot: TenantPlanSnapshot): void {
    if (isLimitExceeded(snapshot.usage.invoicesUsed, snapshot.maxInvoicesPerMonth)) {
      const err = new Error('plan_limit_invoices') as Error & { statusCode: number }
      err.statusCode = 402
      throw err
    }
  }

  assertPlanFeature(snapshot: TenantPlanSnapshot, featureKey: PlanFeatureKey): void {
    if (!planIncludesFeature(snapshot.features, featureKey)) {
      const err = new Error('plan_feature_required') as Error & {
        statusCode: number
        feature: string
        currentPlan: string
      }
      err.statusCode = 402
      err.feature = featureKey
      err.currentPlan = snapshot.planKey
      throw err
    }
  }

  async ensureTenantPlanRow(tenantId: number, planKey: PlanKey, changedById?: number): Promise<void> {
    const plan = await this.prisma.plan.findUnique({ where: { key: planKey } })
    if (!plan) {
      throw new Error('invalid_plan')
    }
    await this.prisma.tenantPlan.upsert({
      where: { tenantId },
      create: {
        tenantId,
        planId: plan.id,
        status: 'active',
        changedById: changedById ?? null,
      },
      update: {
        planId: plan.id,
        status: 'active',
        changedById: changedById ?? null,
      },
    })
    invalidateTenantPlanCache(tenantId)
  }

  async changeTenantPlan(
    tenantId: number,
    planKey: string,
    changedById: number,
    reason: string,
  ): Promise<TenantPlanSnapshot> {
    const trimmed = planKey.trim()
    if (!(trimmed in PLAN_CATALOG)) {
      throw new Error('invalid_plan')
    }
    const key = trimmed as PlanKey

    await this.prisma.$transaction(async (tx) => {
      const plan = await tx.plan.findUnique({ where: { key } })
      if (!plan) {
        throw new Error('invalid_plan')
      }
      await tx.tenantPlan.upsert({
        where: { tenantId },
        create: {
          tenantId,
          planId: plan.id,
          status: 'active',
          changedById,
        },
        update: {
          planId: plan.id,
          status: 'active',
          changedById,
        },
      })
      await tx.tenantConfig.updateMany({
        where: { tenantId },
        data: { plan: key, updatedById: changedById },
      })
    })

    invalidateTenantPlanCache(tenantId)
    invalidateTenantFeaturesCache(tenantId)

    const snapshot = await this.getSnapshotForTenant(tenantId)
    void reason
    return snapshot
  }
}

export function planErrorBody(err: Error & { feature?: string; currentPlan?: string }): {
  success: false
  error: string
  feature?: string
  currentPlan?: string
} {
  const body: {
    success: false
    error: string
    feature?: string
    currentPlan?: string
  } = {
    success: false,
    error: err.message,
  }
  if (err.feature) {
    body.feature = err.feature
  }
  if (err.currentPlan) {
    body.currentPlan = err.currentPlan
  }
  return body
}
