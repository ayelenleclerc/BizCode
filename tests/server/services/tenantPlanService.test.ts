import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { TenantPlanService } from '../../../apps/server/services/TenantPlanService'
import { clearTenantPlanCache } from '../../../apps/server/services/tenantPlanCache'

function buildPrisma(): PrismaClient {
  return {
    plan: {
      findMany: vi.fn().mockResolvedValue([
        {
          key: 'starter',
          name: 'Starter',
          monthlyPrice: 0,
          currency: 'ARS',
          maxUsers: 3,
          maxInvoicesPerMonth: 100,
          features: [],
          active: true,
        },
      ]),
      findUnique: vi.fn().mockResolvedValue({ id: 1, key: 'starter' }),
    },
    tenantPlan: {
      findUnique: vi.fn().mockResolvedValue({
        status: 'active',
        plan: {
          key: 'starter',
          name: 'Starter',
          monthlyPrice: 0,
          currency: 'ARS',
          maxUsers: 3,
          maxInvoicesPerMonth: 100,
          features: [],
        },
      }),
      upsert: vi.fn(),
    },
    tenantConfig: {
      updateMany: vi.fn(),
    },
    appUser: {
      count: vi.fn().mockResolvedValue(3),
    },
    factura: {
      count: vi.fn().mockResolvedValue(0),
    },
    $transaction: vi.fn(async (fn: (tx: PrismaClient) => Promise<unknown>) => fn(buildPrisma())),
  } as unknown as PrismaClient
}

describe('TenantPlanService', () => {
  beforeEach(() => {
    clearTenantPlanCache()
  })

  it('assertCanAddUser throws plan_limit_users at cap', async () => {
    const service = new TenantPlanService(buildPrisma())
    const snapshot = await service.getSnapshotForTenant(1)
    expect(() => service.assertCanAddUser(snapshot)).toThrow('plan_limit_users')
  })

  it('changeTenantPlan rejects invalid plan key', async () => {
    const service = new TenantPlanService(buildPrisma())
    await expect(service.changeTenantPlan(1, 'invalid', 1, 'test')).rejects.toThrow('invalid_plan')
  })
})
