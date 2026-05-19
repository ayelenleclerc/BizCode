import { describe, expect, it, vi } from 'vitest'
import type { Response } from 'express'
import type { AuthenticatedRequest } from '../../../server/auth'
import { requirePlanFeature } from '../../../server/middleware/requirePlanFeature'

describe('requirePlanFeature', () => {
  it('returns 402 when feature missing', () => {
    const req = {
      auth: { claims: { tenantId: 1, userId: 1, role: 'owner' } },
      tenantPlan: {
        planKey: 'starter',
        planName: 'Starter',
        monthlyPrice: 0,
        currency: 'ARS',
        maxUsers: 3,
        maxInvoicesPerMonth: 100,
        features: [],
        status: 'active',
        usage: { usersUsed: 1, invoicesUsed: 0 },
      },
    } as unknown as AuthenticatedRequest
    const json = vi.fn()
    const status = vi.fn(() => ({ json }))
    const res = { status } as unknown as Response
    const next = vi.fn()

    requirePlanFeature('apps.driver')(req, res, next)

    expect(status).toHaveBeenCalledWith(402)
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ error: 'plan_feature_required', feature: 'apps.driver' }),
    )
    expect(next).not.toHaveBeenCalled()
  })

  it('calls next when feature present', () => {
    const req = {
      auth: { claims: { tenantId: 1, userId: 1, role: 'owner' } },
      tenantPlan: {
        planKey: 'pro',
        planName: 'Pro',
        monthlyPrice: 0,
        currency: 'ARS',
        maxUsers: 10,
        maxInvoicesPerMonth: 500,
        features: ['apps.driver'],
        status: 'active',
        usage: { usersUsed: 1, invoicesUsed: 0 },
      },
    } as unknown as AuthenticatedRequest
    const res = { status: vi.fn() } as unknown as Response
    const next = vi.fn()

    requirePlanFeature('apps.driver')(req, res, next)

    expect(next).toHaveBeenCalled()
  })
})
