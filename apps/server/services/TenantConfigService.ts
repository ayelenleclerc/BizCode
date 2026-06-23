import type { Prisma, PrismaClient } from '@prisma/client'
import {
  DEFAULT_MODULES,
  MODULE_KEYS,
  MODULE_PRESETS,
  NEW_TENANT_MODULES,
  type ModuleKey,
  type ModulePresetKey,
} from '@bizcode/types'
import { resolveDeploymentEnv } from '../../web/src/lib/modules/env'
import { validateModuleSet } from '../../web/src/lib/modules/validation'
import {
  getCachedTenantFeatures,
  invalidateTenantFeaturesCache,
  setCachedTenantFeatures,
} from './tenantConfigCache'

export type TenantConfigDto = {
  tenantId: number
  businessType: string
  rubros: string[]
  plan: string
  modules: ModuleKey[]
  integrations: string[]
  updatedAt: string
}

export type TenantFeaturesDto = {
  modules: ModuleKey[]
  integrations: string[]
}

export type TenantConfigUpsertInput = {
  businessType?: string
  rubros?: string[]
  plan?: string
  modules: ModuleKey[]
  integrations?: string[]
}

const BUSINESS_TYPES = new Set(['mayorista', 'minorista', 'ambos'])
const PLANS = new Set(['starter', 'pro', 'enterprise'])

function isModuleKey(value: string): value is ModuleKey {
  return (MODULE_KEYS as readonly string[]).includes(value)
}

function normalizeModules(raw: string[]): ModuleKey[] {
  const unique = new Set<ModuleKey>()
  for (const entry of raw) {
    if (isModuleKey(entry)) {
      unique.add(entry)
    }
  }
  return [...unique]
}

function rowToDto(row: {
  tenantId: number
  businessType: string
  rubros: string[]
  plan: string
  modules: string[]
  integrations: string[]
  updatedAt: Date
}): TenantConfigDto {
  return {
    tenantId: row.tenantId,
    businessType: row.businessType,
    rubros: row.rubros,
    plan: row.plan,
    modules: normalizeModules(row.modules),
    integrations: [...row.integrations],
    updatedAt: row.updatedAt.toISOString(),
  }
}

function snapshotConfig(row: TenantConfigDto | null): Prisma.InputJsonValue {
  if (!row) {
    return { modules: [], integrations: [] }
  }
  return {
    businessType: row.businessType,
    rubros: row.rubros,
    plan: row.plan,
    modules: row.modules,
    integrations: row.integrations,
  }
}

export class TenantConfigService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * @en Resolves active module keys for a tenant (DB row or NEW_TENANT_MODULES fallback).
   * @es Resuelve módulos activos de un tenant (fila DB o fallback NEW_TENANT_MODULES).
   * @pt-BR Resolve chaves de módulos ativos de um tenant (linha DB ou fallback NEW_TENANT_MODULES).
   */
  async getModulesForTenant(tenantId: number): Promise<ModuleKey[]> {
    const features = await this.getFeaturesForTenant(tenantId)
    return features.modules
  }

  async getFeaturesForTenant(tenantId: number): Promise<TenantFeaturesDto> {
    const cached = getCachedTenantFeatures(tenantId)
    if (cached) {
      return { modules: [...cached.modules], integrations: [...cached.integrations] }
    }

    const row = await this.prisma.tenantConfig.findUnique({ where: { tenantId } })
    const modules = row ? normalizeModules(row.modules) : [...NEW_TENANT_MODULES]
    const integrations = row ? [...row.integrations] : []
    setCachedTenantFeatures(tenantId, modules, integrations)
    return { modules, integrations }
  }

  async getConfig(tenantId: number): Promise<TenantConfigDto | null> {
    const row = await this.prisma.tenantConfig.findUnique({ where: { tenantId } })
    if (!row) {
      return null
    }
    return rowToDto(row)
  }

  validateModules(modules: readonly ModuleKey[]): ReturnType<typeof validateModuleSet> {
    const env = resolveDeploymentEnv()
    return validateModuleSet(modules, env)
  }

  async createDefaultForTenant(
    tenantId: number,
    tx?: Prisma.TransactionClient,
  ): Promise<TenantConfigDto> {
    const db = tx ?? this.prisma
    const row = await db.tenantConfig.create({
      data: {
        tenantId,
        businessType: 'ambos',
        rubros: [],
        plan: 'starter',
        modules: [...NEW_TENANT_MODULES],
        integrations: [],
      },
    })
    invalidateTenantFeaturesCache(tenantId)
    return rowToDto(row)
  }

  async upsertConfig(
    tenantId: number,
    input: TenantConfigUpsertInput,
    changedById: number,
    reason: string,
  ): Promise<TenantConfigDto> {
    const modules = normalizeModules(input.modules)
    const validation = this.validateModules(modules)
    if (!validation.valid) {
      const err = new Error('invalid_module_set') as Error & { validation: typeof validation }
      err.validation = validation
      throw err
    }

    const businessType = input.businessType?.trim() ?? 'ambos'
    if (!BUSINESS_TYPES.has(businessType)) {
      throw new Error('invalid_business_type')
    }
    const plan = input.plan?.trim() ?? 'starter'
    if (!PLANS.has(plan)) {
      throw new Error('invalid_plan')
    }
    const rubros = input.rubros ?? []
    const integrations = input.integrations ?? []

    const beforeRow = await this.getConfig(tenantId)
    const row = await this.prisma.tenantConfig.upsert({
      where: { tenantId },
      create: {
        tenantId,
        businessType,
        rubros,
        plan,
        modules,
        integrations,
        updatedById: changedById,
      },
      update: {
        businessType,
        rubros,
        plan,
        modules,
        integrations,
        updatedById: changedById,
      },
    })

    const afterDto = rowToDto(row)
    await this.prisma.tenantConfigHistory.create({
      data: {
        tenantId,
        changedById,
        before: snapshotConfig(beforeRow),
        after: snapshotConfig(afterDto),
        reason: reason.trim().slice(0, 500),
      },
    })

    invalidateTenantFeaturesCache(tenantId)
    return afterDto
  }

  async applyPreset(
    tenantId: number,
    presetKey: ModulePresetKey,
    changedById: number,
    reason: string,
  ): Promise<TenantConfigDto> {
    const presetModules = MODULE_PRESETS[presetKey]
    if (!presetModules) {
      throw new Error('invalid_preset')
    }
    const existing = await this.getConfig(tenantId)
    return this.upsertConfig(
      tenantId,
      {
        businessType: existing?.businessType ?? 'ambos',
        rubros: existing?.rubros ?? [],
        plan: existing?.plan ?? 'starter',
        modules: [...presetModules],
        integrations: existing?.integrations ?? [],
      },
      changedById,
      reason,
    )
  }

  async listHistory(
    tenantId: number,
    take: number,
    skip: number,
  ): Promise<{ total: number; items: Array<{ id: number; changedById: number; before: unknown; after: unknown; reason: string | null; createdAt: string }> }> {
    const [total, rows] = await Promise.all([
      this.prisma.tenantConfigHistory.count({ where: { tenantId } }),
      this.prisma.tenantConfigHistory.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
    ])
    return {
      total,
      items: rows.map((r) => ({
        id: r.id,
        changedById: r.changedById,
        before: r.before,
        after: r.after,
        reason: r.reason,
        createdAt: r.createdAt.toISOString(),
      })),
    }
  }
}

export function modulesInclude(modules: readonly ModuleKey[] | undefined, key: ModuleKey): boolean {
  if (!modules) {
    return false
  }
  return modules.includes(key)
}

export { DEFAULT_MODULES, NEW_TENANT_MODULES }
