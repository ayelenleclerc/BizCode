import type { PrismaClient } from '@prisma/client'
import { MODULE_KEYS, type ModuleKey } from '../../src/lib/modules'
import { notifyTenantOwners } from '../notifications'
import { TenantConfigService } from './TenantConfigService'

const MS_PER_DAY = 24 * 60 * 60 * 1000

export type TenantModuleTrialDto = {
  id: number
  tenantId: number
  moduleKey: string
  expiresAt: string
  active: boolean
  daysRemaining: number
  createdAt: string
}

export type ModuleTrialJobSummary = {
  expired: number
  warned: number
}

function isModuleKey(value: string): value is ModuleKey {
  return (MODULE_KEYS as readonly string[]).includes(value)
}

function daysRemaining(expiresAt: Date, now: Date): number {
  const diff = expiresAt.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / MS_PER_DAY))
}

function rowToDto(row: {
  id: number
  tenantId: number
  moduleKey: string
  expiresAt: Date
  active: boolean
  createdAt: Date
}, now: Date): TenantModuleTrialDto {
  return {
    id: row.id,
    tenantId: row.tenantId,
    moduleKey: row.moduleKey,
    expiresAt: row.expiresAt.toISOString(),
    active: row.active,
    daysRemaining: daysRemaining(row.expiresAt, now),
    createdAt: row.createdAt.toISOString(),
  }
}

/**
 * @en Super-admin module trials: activate, list, expire, and owner warnings (#226).
 * @es Trials de módulos super-admin: activar, listar, expirar y avisos a owners (#226).
 * @pt-BR Trials de módulos super-admin: ativar, listar, expirar e avisos a owners (#226).
 */
export class TenantTrialService {
  private readonly configService: TenantConfigService

  constructor(prisma: PrismaClient, configService?: TenantConfigService) {
    this.prisma = prisma
    this.configService = configService ?? new TenantConfigService(prisma)
  }

  private readonly prisma: PrismaClient

  async listActiveTrials(tenantId: number, now = new Date()): Promise<TenantModuleTrialDto[]> {
    const rows = await this.prisma.tenantModuleTrial.findMany({
      where: { tenantId, active: true },
      orderBy: { expiresAt: 'asc' },
    })
    return rows.map((r) => rowToDto(r, now))
  }

  async activateTrial(
    tenantId: number,
    moduleKey: string,
    days: number,
    changedById: number,
    reason: string,
  ): Promise<TenantModuleTrialDto> {
    if (!isModuleKey(moduleKey)) {
      throw new Error('invalid_module_key')
    }
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      throw new Error('invalid_trial_days')
    }

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } })
    if (!tenant) {
      throw new Error('tenant_not_found')
    }

    const expiresAt = new Date(Date.now() + days * MS_PER_DAY)
    const now = new Date()

    let config = await this.configService.getConfig(tenantId)
    if (!config) {
      config = await this.configService.createDefaultForTenant(tenantId)
    }

    const modules = new Set(config.modules)
    modules.add(moduleKey)

    await this.configService.upsertConfig(
      tenantId,
      {
        businessType: config.businessType,
        rubros: config.rubros,
        plan: config.plan,
        modules: [...modules],
        integrations: config.integrations,
      },
      changedById,
      reason,
    )

    const result = await this.prisma.tenantModuleTrial.upsert({
      where: { tenantId_moduleKey: { tenantId, moduleKey } },
      create: { tenantId, moduleKey, expiresAt, active: true },
      update: { expiresAt, active: true },
    })

    return rowToDto(result, now)
  }

  async deactivateTrial(
    tenantId: number,
    moduleKey: string,
  ): Promise<TenantModuleTrialDto | null> {
    if (!isModuleKey(moduleKey)) {
      throw new Error('invalid_module_key')
    }

    const existing = await this.prisma.tenantModuleTrial.findUnique({
      where: { tenantId_moduleKey: { tenantId, moduleKey } },
    })
    if (!existing) {
      return null
    }

    const updated = await this.prisma.tenantModuleTrial.update({
      where: { tenantId_moduleKey: { tenantId, moduleKey } },
      data: { active: false },
    })

    return rowToDto(updated, new Date())
  }

  /**
   * @en Expires overdue trials and removes modules from tenant config.
   * @es Expira trials vencidos y quita módulos de la config del tenant.
   * @pt-BR Expira trials vencidos e remove módulos da config do tenant.
   */
  async expireOverdueTrials(
    now = new Date(),
    tenantIdFilter?: number,
  ): Promise<number> {
    const where = {
      active: true,
      expiresAt: { lt: now },
      ...(tenantIdFilter !== undefined ? { tenantId: tenantIdFilter } : {}),
    }

    const overdue = await this.prisma.tenantModuleTrial.findMany({ where })
    let count = 0

    for (const trial of overdue) {
      await this.expireSingleTrial(trial.tenantId, trial.moduleKey, changedByIdForJob(), now)
      count += 1
    }

    return count
  }

  /**
   * @en Notifies tenant owners when a trial expires in exactly seven days.
   * @es Notifica a owners cuando un trial vence en exactamente siete días.
   * @pt-BR Notifica owners quando um trial vence em exatamente sete dias.
   */
  async warnTrialsExpiringInSevenDays(
    now = new Date(),
    tenantIdFilter?: number,
  ): Promise<number> {
    const activeTrials = await this.prisma.tenantModuleTrial.findMany({
      where: {
        active: true,
        expiresAt: { gt: now },
        ...(tenantIdFilter !== undefined ? { tenantId: tenantIdFilter } : {}),
      },
    })

    let count = 0
    for (const trial of activeTrials) {
      const remaining = daysRemaining(trial.expiresAt, now)
      if (remaining !== 7) {
        continue
      }
      await notifyTenantOwners(this.prisma, trial.tenantId, 'module_trial_expiring', {
        moduleKey: trial.moduleKey,
        expiresAt: trial.expiresAt.toISOString(),
        daysRemaining: remaining,
      })
      count += 1
    }

    return count
  }

  async runDailyJob(now = new Date(), tenantIdFilter?: number): Promise<ModuleTrialJobSummary> {
    const warned = await this.warnTrialsExpiringInSevenDays(now, tenantIdFilter)
    const expired = await this.expireOverdueTrials(now, tenantIdFilter)
    return { expired, warned }
  }

  private async expireSingleTrial(
    tenantId: number,
    moduleKey: string,
    changedById: number,
    _now: Date,
  ): Promise<void> {
    await this.prisma.tenantModuleTrial.update({
      where: { tenantId_moduleKey: { tenantId, moduleKey } },
      data: { active: false },
    })

    const config = await this.configService.getConfig(tenantId)
    if (!config) {
      return
    }

    const modules = config.modules.filter((m) => m !== moduleKey)
    await this.configService.upsertConfig(
      tenantId,
      {
        businessType: config.businessType,
        rubros: config.rubros,
        plan: config.plan,
        modules,
        integrations: config.integrations,
      },
      changedById,
      `module_trial_expired:${moduleKey}`,
    )
  }
}

/**
 * @en System user id for automated trial expiry (audit trail).
 * @es Id de usuario sistema para expiración automática de trials (auditoría).
 * @pt-BR Id de usuário sistema para expiração automática de trials (auditoria).
 */
function changedByIdForJob(): number {
  const raw = process.env.BIZCODE_SYSTEM_USER_ID
  if (raw) {
    const id = parseInt(raw, 10)
    if (Number.isInteger(id) && id > 0) {
      return id
    }
  }
  return 1
}
