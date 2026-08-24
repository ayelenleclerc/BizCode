import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SaasBillingService } from '../../apps/server/saas/SaasBillingService'
import type { PrismaClient } from '@prisma/client'
import { Prisma } from '@prisma/client'

describe('SaasBillingService', () => {
  const tenantFindUnique = vi.fn()
  const tenantUpdate = vi.fn()
  const tenantConfigFindUnique = vi.fn()
  const tenantConfigUpdate = vi.fn()
  const subFindUnique = vi.fn()
  const subCreate = vi.fn()
  const subUpdate = vi.fn()
  const subUpdateMany = vi.fn()
  const invoiceCreate = vi.fn()
  const invoiceFindMany = vi.fn()
  const invoiceFindFirst = vi.fn()
  const invoiceUpdate = vi.fn()
  const webhookFindUnique = vi.fn()
  const webhookCreate = vi.fn()
  const tx = {
    saasSubscription: {
      findUnique: subFindUnique,
      create: subCreate,
      update: subUpdate,
      updateMany: subUpdateMany,
    },
    saasInvoice: {
      create: invoiceCreate,
      findFirst: invoiceFindFirst,
      update: invoiceUpdate,
    },
    tenant: { update: tenantUpdate },
    tenantConfig: { update: tenantConfigUpdate },
  }
  const prisma = {
    tenant: { findUnique: tenantFindUnique, update: tenantUpdate },
    tenantConfig: { findUnique: tenantConfigFindUnique },
    saasSubscription: {
      findUnique: subFindUnique,
      findMany: vi.fn(),
    },
    saasInvoice: { findMany: invoiceFindMany, findFirst: invoiceFindFirst, update: invoiceUpdate },
    saasWebhookEvent: { findUnique: webhookFindUnique, create: webhookCreate },
    $transaction: vi.fn(async (fn: (t: typeof tx) => Promise<unknown>) => fn(tx)),
  } as unknown as PrismaClient

  beforeEach(() => {
    vi.clearAllMocks()
    delete process.env.BIZCODE_SAAS_MP_ACCESS_TOKEN
  })

  it('subscribes with mock and activates when platform MP is unset', async () => {
    tenantFindUnique.mockResolvedValue({
      id: 1,
      contactEmail: 'a@b.com',
      slug: 'acme',
      name: 'Acme',
      saasStatus: 'active',
    })
    tenantConfigFindUnique.mockResolvedValue({ plan: 'starter' })
    subFindUnique.mockResolvedValue(null)
    subCreate.mockResolvedValue({
      id: 9,
      tenantId: 1,
      planKey: 'starter',
      status: 'authorized',
      initPoint: '/configuracion/billing?mock=authorized',
      mock: true,
    })
    invoiceCreate.mockResolvedValue({})
    tenantUpdate.mockResolvedValue({})
    const svc = new SaasBillingService(prisma)
    const result = await svc.subscribe(1, { planKey: 'starter' }, new Date('2026-08-24T00:00:00.000Z'))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.mock).toBe(true)
    expect(result.data.saasStatus).toBe('active')
    expect(result.data.subscriptionStatus).toBe('authorized')
    expect(tenantUpdate).toHaveBeenCalled()
  })

  it('rejects unknown planKey', async () => {
    tenantFindUnique.mockResolvedValue({
      id: 1,
      contactEmail: 'a@b.com',
      slug: 'acme',
      name: 'Acme',
    })
    tenantConfigFindUnique.mockResolvedValue({ plan: 'starter' })
    const svc = new SaasBillingService(prisma)
    const result = await svc.subscribe(1, { planKey: 'gold' })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.code).toBe('INVALID_PLAN')
  })

  it('lists invoices for tenant', async () => {
    tenantFindUnique.mockResolvedValue({ saasStatus: 'active' })
    subFindUnique.mockResolvedValue({
      planKey: 'starter',
      status: 'authorized',
      mock: true,
      initPoint: null,
      paymentRetryCount: 0,
    })
    invoiceFindMany.mockResolvedValue([
      {
        id: 1,
        planKey: 'starter',
        periodStart: new Date('2026-08-01T00:00:00.000Z'),
        periodEnd: new Date('2026-09-01T00:00:00.000Z'),
        amount: new Prisma.Decimal('0.00'),
        currency: 'ARS',
        status: 'paid',
        createdAt: new Date('2026-08-01T00:00:00.000Z'),
      },
    ])
    const svc = new SaasBillingService(prisma)
    const result = await svc.listForTenant(1)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.invoices).toHaveLength(1)
    expect(result.data.invoices[0]?.amount).toBe('0.00')
  })

  it('webhook paid is idempotent on duplicate key', async () => {
    webhookFindUnique.mockResolvedValue({ id: 1 })
    tenantFindUnique.mockResolvedValue({ saasStatus: 'active' })
    const svc = new SaasBillingService(prisma)
    const result = await svc.applyWebhookEvent({
      idempotencyKey: 'k1',
      eventType: 'payment.paid',
      payload: {},
      tenantId: 1,
      outcome: 'paid',
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.duplicate).toBe(true)
    expect(webhookCreate).not.toHaveBeenCalled()
  })

  it('webhook failed three times suspends payment', async () => {
    webhookFindUnique.mockResolvedValue(null)
    webhookCreate.mockResolvedValue({})
    subFindUnique.mockResolvedValue({
      tenantId: 1,
      paymentRetryCount: 2,
      planKey: 'pro',
    })
    invoiceFindFirst.mockResolvedValue({ id: 4 })
    invoiceUpdate.mockResolvedValue({})
    tenantUpdate.mockResolvedValue({})
    tenantFindUnique.mockResolvedValue({ contactEmail: null, slug: 'acme' })
    const svc = new SaasBillingService(prisma)
    const result = await svc.applyWebhookEvent({
      idempotencyKey: 'k-fail',
      eventType: 'payment.failed',
      payload: { type: 'payment.failed' },
      tenantId: 1,
      outcome: 'failed',
      now: new Date('2026-08-24T00:00:00.000Z'),
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.saasStatus).toBe('suspended_payment')
  })
})
