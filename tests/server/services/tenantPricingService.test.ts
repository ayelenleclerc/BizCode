import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { DEFAULT_MODULES } from '../../../src/lib/modules'
import { TenantPricingService } from '../../../server/services/TenantPricingService'
import type { TenantConfigService } from '../../../server/services/TenantConfigService'

function buildPrisma(): PrismaClient {
  return {
    tenant: {
      findUnique: vi.fn().mockResolvedValue({ id: 1, name: 'Demo' }),
    },
  } as unknown as PrismaClient
}

describe('TenantPricingService', () => {
  const getConfig = vi.fn()
  const createDefaultForTenant = vi.fn()
  let configService: TenantConfigService

  beforeEach(() => {
    vi.clearAllMocks()
    getConfig.mockResolvedValue({
      tenantId: 1,
      plan: 'pro',
      modules: [...DEFAULT_MODULES, 'billing.orders'],
      businessType: 'ambos',
      rubros: [],
      integrations: [],
      updatedAt: new Date().toISOString(),
    })
    createDefaultForTenant.mockResolvedValue({
      tenantId: 1,
      plan: 'starter',
      modules: [...DEFAULT_MODULES],
      businessType: 'ambos',
      rubros: [],
      integrations: [],
      updatedAt: new Date().toISOString(),
    })
    configService = { getConfig, createDefaultForTenant } as unknown as TenantConfigService
  })

  it('returns pricing estimate for existing tenant config', async () => {
    const svc = new TenantPricingService(buildPrisma(), configService)
    const result = await svc.getPricing(1)
    expect(result).not.toBeNull()
    expect(result?.plan).toBe('pro')
    expect(result?.basePrice).toBe(15000)
    expect(result?.totalMonthly).toBeGreaterThan(15000)
  })

  it('uses preview modules when provided', async () => {
    const svc = new TenantPricingService(buildPrisma(), configService)
    const result = await svc.getPricing(1, ['core.auth'])
    expect(result?.addons).toEqual([])
    expect(result?.totalMonthly).toBe(15000)
  })

  it('returns null when tenant missing', async () => {
    const prisma = buildPrisma()
    vi.mocked(prisma.tenant.findUnique).mockResolvedValue(null)
    const svc = new TenantPricingService(prisma, configService)
    expect(await svc.getPricing(99)).toBeNull()
  })
})
