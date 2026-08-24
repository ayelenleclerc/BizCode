import type { Prisma, PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'
import { PLAN_CATALOG, type PlanKey } from '@bizcode/types'
import { isSmtpConfigured } from '../channels'
import { resolveSmtpTransportConfig } from '../config/smtpTransport'
import { logger } from '../logger'
import { MercadoPagoApiError } from '../integrations/mercadopago/mercadoPagoApiClient'
import {
  SAAS_INVOICE_FAILED,
  SAAS_INVOICE_PAID,
  SAAS_INVOICE_PENDING,
  SAAS_PAYMENT_RETRY_MAX,
  SAAS_PAYMENT_RETRY_WINDOW_DAYS,
  SAAS_STATUS_ACTIVE,
  SAAS_STATUS_SUSPENDED_PAYMENT,
  SAAS_SUBSCRIPTION_AUTHORIZED,
  SAAS_SUBSCRIPTION_PENDING,
} from './saasStatus'
import { createMercadoPagoPreapproval, createMockPreapproval } from './mpPreapprovalClient'
import {
  getPlatformMpAccessToken,
  getPlatformMpBackUrl,
  isPlatformMpConfigured,
} from './platformMpConfig'

export type SaasSubscribeInput = {
  planKey?: string
}

export type SaasInvoiceDto = {
  id: number
  planKey: string
  periodStart: string
  periodEnd: string
  amount: string
  currency: string
  status: string
  createdAt: string
}

export type SaasSubscribeResult = {
  planKey: string
  saasStatus: string
  subscriptionStatus: string
  mock: boolean
  initPoint: string | null
  amount: string
  currency: string
}

export type SaasBillingListResult = {
  saasStatus: string
  subscription: {
    planKey: string
    status: string
    mock: boolean
    initPoint: string | null
    paymentRetryCount: number
  } | null
  invoices: SaasInvoiceDto[]
  platformMpLive: boolean
}

export type SaasBillingOpResult<T> =
  | { ok: true; status: number; data: T }
  | { ok: false; status: number; error: string; code?: string }

function addUtcMonths(d: Date, months: number): Date {
  const out = new Date(d.getTime())
  out.setUTCMonth(out.getUTCMonth() + months)
  return out
}

function isBillablePlanKey(key: string): key is PlanKey {
  return key in PLAN_CATALOG && key !== 'trial'
}

function mapInvoice(row: {
  id: number
  planKey: string
  periodStart: Date
  periodEnd: Date
  amount: Prisma.Decimal
  currency: string
  status: string
  createdAt: Date
}): SaasInvoiceDto {
  return {
    id: row.id,
    planKey: row.planKey,
    periodStart: row.periodStart.toISOString(),
    periodEnd: row.periodEnd.toISOString(),
    amount: row.amount.toFixed(2),
    currency: row.currency,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  }
}

async function sendBillingEmail(to: string, subject: string, text: string): Promise<boolean> {
  if (!isSmtpConfigured()) {
    logger.info('[saas-billing] SMTP not configured; skipping email')
    return false
  }
  const smtp = resolveSmtpTransportConfig()
  if (!smtp) return false
  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: smtp.auth,
    })
    await transporter.sendMail({ from: smtp.from, to, subject, text })
    return true
  } catch (err) {
    logger.warn(
      { err: err instanceof Error ? { name: err.name, message: err.message } : String(err) },
      '[saas-billing] email send failed',
    )
    return false
  }
}

/**
 * @en Platform SaaS billing: subscribe, invoices, webhook, payment retries (#182).
 * @es Billing SaaS de plataforma: suscribir, facturas, webhook, reintentos de cobro (#182).
 * @pt-BR Billing SaaS da plataforma: assinar, faturas, webhook, tentativas de cobrança (#182).
 */
export class SaasBillingService {
  constructor(private readonly prisma: PrismaClient) {}

  async listForTenant(tenantId: number): Promise<SaasBillingOpResult<SaasBillingListResult>> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { saasStatus: true },
    })
    if (!tenant) {
      return { ok: false, status: 404, error: 'Tenant not found', code: 'TENANT_NOT_FOUND' }
    }
    const sub = await this.prisma.saasSubscription.findUnique({ where: { tenantId } })
    const invoices = await this.prisma.saasInvoice.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return {
      ok: true,
      status: 200,
      data: {
        saasStatus: tenant.saasStatus,
        subscription: sub
          ? {
              planKey: sub.planKey,
              status: sub.status,
              mock: sub.mock,
              initPoint: sub.initPoint,
              paymentRetryCount: sub.paymentRetryCount,
            }
          : null,
        invoices: invoices.map(mapInvoice),
        platformMpLive: isPlatformMpConfigured(),
      },
    }
  }

  async subscribe(
    tenantId: number,
    input: SaasSubscribeInput,
    now = new Date(),
  ): Promise<SaasBillingOpResult<SaasSubscribeResult>> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, contactEmail: true, slug: true, name: true },
    })
    if (!tenant) {
      return { ok: false, status: 404, error: 'Tenant not found', code: 'TENANT_NOT_FOUND' }
    }
    const config = await this.prisma.tenantConfig.findUnique({
      where: { tenantId },
      select: { plan: true },
    })
    const requested = (input.planKey ?? config?.plan ?? 'starter').trim()
    if (!isBillablePlanKey(requested)) {
      return { ok: false, status: 400, error: 'Invalid planKey', code: 'INVALID_PLAN' }
    }
    const def = PLAN_CATALOG[requested]
    const amount = def.monthlyPrice
    const currency = def.currency
    const periodStart = now
    const periodEnd = addUtcMonths(now, 1)
    const payerEmail = tenant.contactEmail?.trim() || `owner@${tenant.slug}.invalid`

    const liveToken = getPlatformMpAccessToken()
    let preapproval = createMockPreapproval(tenantId, requested)
    let useMock = true
    if (amount > 0 && liveToken) {
      try {
        preapproval = await createMercadoPagoPreapproval(liveToken, {
          reason: `BizCode ${def.name}`,
          payerEmail,
          transactionAmount: amount,
          currencyId: currency,
          backUrl: getPlatformMpBackUrl(),
          externalReference: `tenant:${tenantId}:plan:${requested}`,
        })
        useMock = false
      } catch (err) {
        if (err instanceof MercadoPagoApiError) {
          return {
            ok: false,
            status: err.status >= 400 && err.status < 600 ? err.status : 502,
            error: err.message,
            code: 'MP_PREAPPROVAL_FAILED',
          }
        }
        throw err
      }
    }

    const activateNow = useMock || amount === 0
    const subStatus = activateNow ? SAAS_SUBSCRIPTION_AUTHORIZED : SAAS_SUBSCRIPTION_PENDING
    const invoiceStatus = activateNow ? SAAS_INVOICE_PAID : SAAS_INVOICE_PENDING

    const subscription = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.saasSubscription.findUnique({ where: { tenantId } })
      const data = {
        planKey: requested,
        status: subStatus,
        mpPreapprovalId: preapproval.id,
        initPoint: preapproval.initPoint,
        mock: useMock,
        paymentRetryCount: 0,
        lastPaymentFailedAt: null as Date | null,
        cancelReason: null as string | null,
      }
      const row = existing
        ? await tx.saasSubscription.update({ where: { tenantId }, data })
        : await tx.saasSubscription.create({ data: { tenantId, ...data } })

      await tx.saasInvoice.create({
        data: {
          tenantId,
          subscriptionId: row.id,
          planKey: requested,
          periodStart,
          periodEnd,
          amount,
          currency,
          status: invoiceStatus,
          mpPaymentId: activateNow ? `mock-pay-${tenantId}-${now.getTime()}` : null,
        },
      })

      if (activateNow) {
        await tx.tenant.update({
          where: { id: tenantId },
          data: { saasStatus: SAAS_STATUS_ACTIVE },
        })
        if (config && config.plan !== requested) {
          await tx.tenantConfig.update({
            where: { tenantId },
            data: { plan: requested },
          })
        }
      }
      return row
    })

    return {
      ok: true,
      status: 200,
      data: {
        planKey: requested,
        saasStatus: activateNow ? SAAS_STATUS_ACTIVE : (await this.prisma.tenant.findUnique({
          where: { id: tenantId },
          select: { saasStatus: true },
        }))!.saasStatus,
        subscriptionStatus: subscription.status,
        mock: useMock,
        initPoint: activateNow ? null : subscription.initPoint,
        amount: amount.toFixed(2),
        currency,
      },
    }
  }

  async applyWebhookEvent(input: {
    idempotencyKey: string
    eventType: string
    payload: Prisma.InputJsonValue
    preapprovalId?: string | null
    tenantId?: number | null
    outcome: 'authorized' | 'paid' | 'failed'
    mpPaymentId?: string | null
    now?: Date
  }): Promise<SaasBillingOpResult<{ duplicate: boolean; saasStatus: string }>> {
    const now = input.now ?? new Date()
    const existing = await this.prisma.saasWebhookEvent.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    })
    if (existing) {
      const tenantId = input.tenantId ?? (await this.resolveTenantId(input.preapprovalId, input.tenantId))
      const status = tenantId
        ? (await this.prisma.tenant.findUnique({ where: { id: tenantId }, select: { saasStatus: true } }))
            ?.saasStatus ?? 'unknown'
        : 'unknown'
      return { ok: true, status: 200, data: { duplicate: true, saasStatus: status } }
    }

    const tenantId = await this.resolveTenantId(input.preapprovalId, input.tenantId)
    if (tenantId == null) {
      return { ok: false, status: 404, error: 'Subscription not found', code: 'SUBSCRIPTION_NOT_FOUND' }
    }

    await this.prisma.saasWebhookEvent.create({
      data: {
        idempotencyKey: input.idempotencyKey,
        eventType: input.eventType,
        payload: input.payload,
      },
    })

    if (input.outcome === 'authorized' || input.outcome === 'paid') {
      await this.markPaid(tenantId, input.mpPaymentId ?? `wh-${input.idempotencyKey}`, now)
      return { ok: true, status: 200, data: { duplicate: false, saasStatus: SAAS_STATUS_ACTIVE } }
    }

    const suspended = await this.markFailed(tenantId, now)
    return {
      ok: true,
      status: 200,
      data: {
        duplicate: false,
        saasStatus: suspended ? SAAS_STATUS_SUSPENDED_PAYMENT : SAAS_STATUS_ACTIVE,
      },
    }
  }

  /**
   * @en Suspends subscriptions whose payment retry window elapsed (#182).
   * @es Suspende suscripciones cuyo ventana de reintento de cobro venció (#182).
   * @pt-BR Suspende assinaturas cuja janela de nova tentativa de cobrança expirou (#182).
   */
  async processRetryWindow(now = new Date()): Promise<{ suspended: number; emailed: number }> {
    const windowMs = SAAS_PAYMENT_RETRY_WINDOW_DAYS * 24 * 60 * 60 * 1000
    const cutoff = new Date(now.getTime() - windowMs)
    const rows = await this.prisma.saasSubscription.findMany({
      where: {
        lastPaymentFailedAt: { lte: cutoff },
        paymentRetryCount: { gte: 1 },
        status: SAAS_SUBSCRIPTION_AUTHORIZED,
        tenant: { saasStatus: { not: SAAS_STATUS_SUSPENDED_PAYMENT } },
      },
      include: { tenant: { select: { id: true, contactEmail: true, slug: true } } },
    })
    let suspended = 0
    let emailed = 0
    for (const row of rows) {
      await this.prisma.tenant.update({
        where: { id: row.tenantId },
        data: { saasStatus: SAAS_STATUS_SUSPENDED_PAYMENT },
      })
      suspended += 1
      logger.warn({ tenantId: row.tenantId, slug: row.tenant.slug }, '[saas-billing] suspended_payment')
      if (row.tenant.contactEmail) {
        const sent = await sendBillingEmail(
          row.tenant.contactEmail,
          `BizCode — suscripción suspendida (${row.tenant.slug})`,
          `El cobro de tu plan ${row.planKey} falló. Renová en /configuracion/billing.\n`,
        )
        if (sent) emailed += 1
      }
    }
    return { suspended, emailed }
  }

  private async resolveTenantId(
    preapprovalId: string | null | undefined,
    tenantId: number | null | undefined,
  ): Promise<number | null> {
    if (typeof tenantId === 'number' && tenantId > 0) return tenantId
    if (!preapprovalId) return null
    const sub = await this.prisma.saasSubscription.findUnique({
      where: { mpPreapprovalId: preapprovalId },
      select: { tenantId: true },
    })
    return sub?.tenantId ?? null
  }

  private async markPaid(tenantId: number, mpPaymentId: string, now: Date): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.tenant.update({
        where: { id: tenantId },
        data: { saasStatus: SAAS_STATUS_ACTIVE },
      })
      await tx.saasSubscription.updateMany({
        where: { tenantId },
        data: {
          status: SAAS_SUBSCRIPTION_AUTHORIZED,
          paymentRetryCount: 0,
          lastPaymentFailedAt: null,
        },
      })
      const pending = await tx.saasInvoice.findFirst({
        where: { tenantId, status: { in: [SAAS_INVOICE_PENDING, SAAS_INVOICE_FAILED] } },
        orderBy: { createdAt: 'desc' },
      })
      if (pending) {
        await tx.saasInvoice.update({
          where: { id: pending.id },
          data: { status: SAAS_INVOICE_PAID, mpPaymentId },
        })
      }
    })
    void now
  }

  private async markFailed(tenantId: number, now: Date): Promise<boolean> {
    const sub = await this.prisma.saasSubscription.findUnique({ where: { tenantId } })
    if (!sub) return false
    const nextCount = sub.paymentRetryCount + 1
    const suspend = nextCount >= SAAS_PAYMENT_RETRY_MAX
    await this.prisma.$transaction(async (tx) => {
      await tx.saasSubscription.update({
        where: { tenantId },
        data: {
          paymentRetryCount: nextCount,
          lastPaymentFailedAt: now,
        },
      })
      const latest = await tx.saasInvoice.findFirst({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
      })
      if (latest) {
        await tx.saasInvoice.update({
          where: { id: latest.id },
          data: { status: SAAS_INVOICE_FAILED },
        })
      }
      if (suspend) {
        await tx.tenant.update({
          where: { id: tenantId },
          data: { saasStatus: SAAS_STATUS_SUSPENDED_PAYMENT },
        })
      }
    })
    if (suspend) {
      const tenant = await this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { contactEmail: true, slug: true },
      })
      logger.warn({ tenantId, slug: tenant?.slug }, '[saas-billing] suspended_payment after retries')
      if (tenant?.contactEmail) {
        await sendBillingEmail(
          tenant.contactEmail,
          `BizCode — cobro fallido (${tenant.slug})`,
          `No se pudo cobrar tu suscripción. Renová en /configuracion/billing.\n`,
        )
      }
    }
    return suspend
  }
}
