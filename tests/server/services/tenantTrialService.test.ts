import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { DEFAULT_MODULES } from '../../../apps/web/src/lib/modules'
import { TenantTrialService } from '../../../apps/server/services/TenantTrialService'
import type { TenantConfigService } from '../../../apps/server/services/TenantConfigService'
import { notifyTenantOwners } from '../../../apps/server/notifications'

vi.mock('../../../apps/server/notifications', () => ({
  notifyTenantOwners: vi.fn().mockResolvedValue(undefined),
}))

const configDto = {
  tenantId: 1,
  businessType: 'ambos',
  rubros: [] as string[],
  plan: 'starter',
  modules: [...DEFAULT_MODULES],
  integrations: [] as string[],
  updatedAt: new Date().toISOString(),
}

function buildPrisma(): PrismaClient {
  const trialRow = {
    id: 1,
    tenantId: 1,
    moduleKey: 'billing.orders',
    expiresAt: new Date('2026-06-18T00:00:00.000Z'),
    active: true,
    createdAt: new Date(),
  }
  return {
    tenant: {
      findUnique: vi.fn().mockResolvedValue({ id: 1 }),
    },
    tenantModuleTrial: {
      findMany: vi.fn().mockResolvedValue([trialRow]),
      findUnique: vi.fn().mockResolvedValue(trialRow),
      upsert: vi.fn().mockResolvedValue(trialRow),
      update: vi.fn().mockResolvedValue({ ...trialRow, active: false }),
    },
  } as unknown as PrismaClient
}

describe('TenantTrialService', () => {
  const getConfig = vi.fn()
  const upsertConfig = vi.fn()
  const createDefaultForTenant = vi.fn()
  let configService: TenantConfigService

  beforeEach(() => {
    vi.clearAllMocks()
    getConfig.mockResolvedValue(configDto)
    upsertConfig.mockResolvedValue({
      ...configDto,
      modules: [...DEFAULT_MODULES, 'billing.orders'],
    })
    createDefaultForTenant.mockResolvedValue(configDto)
    configService = {
      getConfig,
      upsertConfig,
      createDefaultForTenant,
    } as unknown as TenantConfigService
  })

  it('lists active trials with days remaining', async () => {
    const svc = new TenantTrialService(buildPrisma(), configService)
    const now = new Date('2026-05-18T12:00:00.000Z')
    const rows = await svc.listActiveTrials(1, now)
    expect(rows).toHaveLength(1)
    expect(rows[0]?.moduleKey).toBe('billing.orders')
    expect(rows[0]?.daysRemaining).toBeGreaterThanOrEqual(0)
  })

  it('activates trial and updates tenant modules', async () => {
    const svc = new TenantTrialService(buildPrisma(), configService)
    const row = await svc.activateTrial(1, 'billing.orders', 30, 1, 'trial promo')
    expect(row.moduleKey).toBe('billing.orders')
    expect(upsertConfig).toHaveBeenCalled()
  })

  it('deactivates trial', async () => {
    const svc = new TenantTrialService(buildPrisma(), configService)
    const row = await svc.deactivateTrial(1, 'billing.orders')
    expect(row?.active).toBe(false)
  })

  it('warns owners when trial expires in seven days', async () => {
    const now = new Date('2026-05-11T12:00:00.000Z')
    const expiresAt = new Date('2026-05-18T12:00:00.000Z')
    const prisma = buildPrisma()
    vi.mocked(prisma.tenantModuleTrial.findMany).mockResolvedValue([
      {
        id: 1,
        tenantId: 1,
        moduleKey: 'billing.orders',
        expiresAt,
        active: true,
        createdAt: now,
      },
    ])
    const svc = new TenantTrialService(prisma, configService)
    const count = await svc.warnTrialsExpiringInSevenDays(now)
    expect(count).toBe(1)
    expect(notifyTenantOwners).toHaveBeenCalledWith(
      prisma,
      1,
      'module_trial_expiring',
      expect.objectContaining({ moduleKey: 'billing.orders', daysRemaining: 7 }),
    )
  })

  it('expires overdue trials and removes module from config', async () => {
    const now = new Date('2026-06-20T00:00:00.000Z')
    const prisma = buildPrisma()
    vi.mocked(prisma.tenantModuleTrial.findMany).mockResolvedValue([
      {
        id: 1,
        tenantId: 1,
        moduleKey: 'billing.orders',
        expiresAt: new Date('2026-06-01T00:00:00.000Z'),
        active: true,
        createdAt: new Date(),
      },
    ])
    const svc = new TenantTrialService(prisma, configService)
    const count = await svc.expireOverdueTrials(now)
    expect(count).toBe(1)
    expect(upsertConfig).toHaveBeenCalled()
  })
})
