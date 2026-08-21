import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SaasOnboardingService } from '../../apps/server/saas/SaasOnboardingService'
import { PADRON_MOCK_KNOWN_CUIT } from '../../apps/server/fiscal/ar/arcaPadronMock'
import type { PrismaClient } from '@prisma/client'

describe('SaasOnboardingService', () => {
  const tenantCreate = vi.fn()
  const tenantFindUnique = vi.fn()
  const tenantConfigCreate = vi.fn()
  const planFindUnique = vi.fn()
  const tenantPlanCreate = vi.fn()
  const appUserCreate = vi.fn()
  const paramEmpresaCreate = vi.fn()

  const prisma = {
    tenant: { findUnique: tenantFindUnique, create: tenantCreate },
    $transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) =>
      fn({
        tenant: { create: tenantCreate },
        tenantConfig: { create: tenantConfigCreate },
        plan: { findUnique: planFindUnique },
        tenantPlan: { create: tenantPlanCreate },
        appUser: { create: appUserCreate },
        paramEmpresa: { create: paramEmpresaCreate },
      }),
    ),
  } as unknown as PrismaClient

  beforeEach(() => {
    vi.clearAllMocks()
    tenantFindUnique.mockResolvedValue(null)
    planFindUnique.mockResolvedValue({ id: 1, key: 'starter' })
    tenantCreate.mockResolvedValue({ id: 99, slug: 'demo-saas' })
    appUserCreate.mockResolvedValue({ id: 7, username: 'owner@example.com' })
    tenantConfigCreate.mockResolvedValue({})
    tenantPlanCreate.mockResolvedValue({})
    paramEmpresaCreate.mockResolvedValue({})
  })

  it('rejects invalid CUIT', async () => {
    const svc = new SaasOnboardingService(prisma)
    const r = await svc.register({
      businessName: 'Demo',
      cuit: '20123456787',
      email: 'owner@example.com',
      tenantSlug: 'demo-saas',
      password: 'password1',
      acceptTerms: true,
      acceptPrivacy: true,
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe('INVALID_CUIT')
  })

  it('rejects duplicate slug', async () => {
    tenantFindUnique.mockResolvedValue({ id: 1 })
    const svc = new SaasOnboardingService(prisma)
    const r = await svc.register({
      businessName: 'Demo',
      cuit: PADRON_MOCK_KNOWN_CUIT,
      email: 'owner@example.com',
      tenantSlug: 'demo-saas',
      password: 'password1',
      acceptTerms: true,
      acceptPrivacy: true,
    })
    expect(r.ok).toBe(false)
    if (!r.ok) expect(r.code).toBe('SLUG_TAKEN')
  })

  it('creates tenant on happy path', async () => {
    const svc = new SaasOnboardingService(prisma)
    const r = await svc.register({
      businessName: 'Demo SaaS',
      cuit: PADRON_MOCK_KNOWN_CUIT,
      email: 'owner@example.com',
      tenantSlug: 'demo-saas',
      password: 'password1',
      acceptTerms: true,
      acceptPrivacy: true,
    })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.data.tenantSlug).toBe('demo-saas')
      expect(r.data.saasStatus).toBe('trial')
      expect(r.data.ownerUsername).toBe('owner@example.com')
    }
    expect(tenantCreate).toHaveBeenCalled()
    expect(paramEmpresaCreate).toHaveBeenCalled()
  })
})
