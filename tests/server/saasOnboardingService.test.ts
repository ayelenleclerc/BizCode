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

  describe('fiscal jurisdiction at registration (#437)', () => {
    const VALID_RUT_UY = '210001730016'

    function baseInput() {
      return {
        businessName: 'Demo SaaS',
        email: 'owner@example.com',
        tenantSlug: 'demo-saas',
        password: 'password1',
        acceptTerms: true,
        acceptPrivacy: true,
      } as const
    }

    it('persists the installation default when no jurisdiction is chosen', async () => {
      const svc = new SaasOnboardingService(prisma)
      const r = await svc.register({ ...baseInput(), cuit: PADRON_MOCK_KNOWN_CUIT })
      expect(r.ok).toBe(true)
      expect(tenantConfigCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ jurisdiccionFiscal: 'AR' }),
        }),
      )
    })

    it('rejects a jurisdiction this installation does not enable', async () => {
      const svc = new SaasOnboardingService(prisma)
      const r = await svc.register({
        ...baseInput(),
        cuit: PADRON_MOCK_KNOWN_CUIT,
        jurisdiccionFiscal: 'ZZ',
      })
      expect(r.ok).toBe(false)
      if (!r.ok) expect(r.code).toBe('JURISDICTION_NOT_ENABLED')
      expect(tenantCreate).not.toHaveBeenCalled()
    })

    it('validates the tax id with the algorithm of the chosen jurisdiction', async () => {
      const svc = new SaasOnboardingService(prisma)
      const argentineCuitInUruguay = await svc.register({
        ...baseInput(),
        cuit: PADRON_MOCK_KNOWN_CUIT,
        jurisdiccionFiscal: 'UY',
      })
      expect(argentineCuitInUruguay.ok).toBe(false)
      if (!argentineCuitInUruguay.ok) expect(argentineCuitInUruguay.code).toBe('INVALID_CUIT')
    })

    it('creates a Uruguayan tenant without the Argentine legal modules', async () => {
      const svc = new SaasOnboardingService(prisma)
      const r = await svc.register({
        ...baseInput(),
        cuit: VALID_RUT_UY,
        jurisdiccionFiscal: 'UY',
      })
      expect(r.ok).toBe(true)
      const data = tenantConfigCreate.mock.calls[0]?.[0]?.data as {
        jurisdiccionFiscal: string
        modules: string[]
      }
      expect(data.jurisdiccionFiscal).toBe('UY')
      expect(data.modules).not.toContain('billing.arca_cae')
      expect(data.modules).not.toContain('fiscal.remito')
      expect(data.modules).toContain('core.invoicing')
    })
  })
})
