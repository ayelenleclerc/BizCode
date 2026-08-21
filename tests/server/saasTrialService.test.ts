import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SaasTrialService } from '../../apps/server/saas/SaasTrialService'
import type { PrismaClient } from '@prisma/client'

describe('SaasTrialService', () => {
  const findUnique = vi.fn()
  const update = vi.fn()
  const prisma = {
    tenant: { findUnique, update },
  } as unknown as PrismaClient

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('suspends expired trial', async () => {
    findUnique.mockResolvedValue({
      saasStatus: 'trial',
      trialEndsAt: new Date('2020-01-01T00:00:00.000Z'),
    })
    update.mockResolvedValue({})
    const svc = new SaasTrialService(prisma)
    const snap = await svc.ensureAndGetSnapshot(1, new Date('2026-08-21T00:00:00.000Z'))
    expect(update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { saasStatus: 'suspended_trial' },
    })
    expect(snap?.invoiceMutationsBlocked).toBe(true)
  })

  it('assertCanCreateInvoice blocks suspended', async () => {
    findUnique.mockResolvedValue({
      saasStatus: 'suspended_trial',
      trialEndsAt: new Date('2020-01-01T00:00:00.000Z'),
    })
    const svc = new SaasTrialService(prisma)
    const r = await svc.assertCanCreateInvoice(1)
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe('TRIAL_SUSPENDED')
  })
})
