/**
 * @en Durable Mercado Pago webhook inbox: persist before 2xx, recoverable worker (#447).
 * @es Inbox durable de webhooks Mercado Pago: persistir antes del 2xx, worker recuperable (#447).
 * @pt-BR Inbox durável de webhooks Mercado Pago: persistir antes do 2xx, worker recuperável (#447).
 */

import { Prisma, type MercadoPagoWebhookInbox, type PrismaClient } from '@prisma/client'
import { sanitizeLogField } from '../lib/sanitizeLogField'
import { PaymentWebhookService } from '../payments/PaymentWebhookService'
import type { MercadoPagoWebhookPayload } from './MercadoPagoWebhookService'

const BACKOFF_MS = [60_000, 5 * 60_000, 15 * 60_000, 60 * 60_000] as const
const STALE_PROCESSING_MS = 5 * 60_000
const DEFAULT_BATCH = 25

export type WebhookInboxEnqueueInput = {
  tenantId: number
  resourceType: 'payment' | 'chargeback'
  resourceId: string
  payload: MercadoPagoWebhookPayload
  /** @en Optional action suffix for chargeback dedupe keys. */
  action?: string | null
}

export type WebhookInboxProcessSummary = {
  processed: number
  succeeded: number
  failed: number
  dead: number
  skipped: number
  recoveredStale: number
}

function buildEventKey(input: WebhookInboxEnqueueInput): string {
  const action = input.action?.trim()
  if (input.resourceType === 'chargeback' && action) {
    return `chargeback:${input.resourceId}:${action}`
  }
  return `${input.resourceType}:${input.resourceId}`
}

function backoffMs(attemptCount: number): number {
  const idx = Math.min(Math.max(attemptCount - 1, 0), BACKOFF_MS.length - 1)
  return BACKOFF_MS[idx]
}

function sanitizeError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err)
  return sanitizeLogField(raw).slice(0, 500)
}

export class MercadoPagoWebhookInboxService {
  private readonly paymentWebhooks: PaymentWebhookService

  constructor(private readonly prisma: PrismaClient) {
    this.paymentWebhooks = new PaymentWebhookService(prisma)
  }

  /**
   * @en Inserts or returns an existing inbox row (deduped by tenantId+eventKey).
   * @es Inserta o devuelve una fila inbox existente (dedupe por tenantId+eventKey).
   * @pt-BR Insere ou devolve uma linha inbox existente (dedupe por tenantId+eventKey).
   */
  async enqueue(input: WebhookInboxEnqueueInput): Promise<MercadoPagoWebhookInbox> {
    const eventKey = buildEventKey(input)
    const payloadJson = input.payload as Prisma.InputJsonValue

    try {
      return await this.prisma.mercadoPagoWebhookInbox.create({
        data: {
          tenantId: input.tenantId,
          eventKey,
          resourceType: input.resourceType,
          resourceId: input.resourceId,
          payloadJson,
          estado: 'pending',
          nextAttemptAt: new Date(),
        },
      })
    } catch (err: unknown) {
      if (!(err instanceof Prisma.PrismaClientKnownRequestError) || err.code !== 'P2002') {
        throw err
      }
      const existing = await this.prisma.mercadoPagoWebhookInbox.findUnique({
        where: {
          tenantId_eventKey: { tenantId: input.tenantId, eventKey },
        },
      })
      if (!existing) throw err
      return existing
    }
  }

  /**
   * @en Processes one inbox row end-to-end (claim → PaymentWebhookService → mark).
   * @es Procesa una fila inbox de punta a punta (claim → PaymentWebhookService → mark).
   * @pt-BR Processa uma linha inbox de ponta a ponta (claim → PaymentWebhookService → mark).
   */
  async processInboxRow(
    row: MercadoPagoWebhookInbox,
    ipAddress?: string | null,
  ): Promise<'succeeded' | 'failed' | 'dead' | 'skipped'> {
    if (row.estado === 'processed') return 'skipped'

    const claimed = await this.prisma.mercadoPagoWebhookInbox.updateMany({
      where: {
        id: row.id,
        estado: { in: ['pending', 'failed'] },
      },
      data: { estado: 'processing', updatedAt: new Date() },
    })
    if (claimed.count !== 1) return 'skipped'

    const attemptCount = row.attemptCount + 1
    try {
      if (row.resourceType === 'chargeback') {
        await this.paymentWebhooks.processMercadoPagoChargebackNotification(
          row.tenantId,
          row.resourceId,
          row.payloadJson,
          ipAddress,
        )
      } else {
        await this.paymentWebhooks.processMercadoPagoPaymentNotification(
          row.tenantId,
          row.resourceId,
          ipAddress,
        )
      }
      await this.prisma.mercadoPagoWebhookInbox.update({
        where: { id: row.id },
        data: {
          estado: 'processed',
          attemptCount,
          lastError: null,
          processedAt: new Date(),
        },
      })
      return 'succeeded'
    } catch (err: unknown) {
      const message = sanitizeError(err)
      const dead = attemptCount >= row.maxAttempts
      await this.prisma.mercadoPagoWebhookInbox.update({
        where: { id: row.id },
        data: {
          estado: 'failed',
          attemptCount,
          lastError: message,
          nextAttemptAt: dead
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            : new Date(Date.now() + backoffMs(attemptCount)),
        },
      })
      console.warn(
        '[mercadopago-webhook-inbox] process_error',
        'tenant',
        row.tenantId,
        row.resourceType,
        sanitizeLogField(row.resourceId),
        'attempt',
        attemptCount,
        'dead',
        dead,
        'detail',
        message,
      )
      return dead ? 'dead' : 'failed'
    }
  }

  async processById(id: number, ipAddress?: string | null): Promise<'succeeded' | 'failed' | 'dead' | 'skipped'> {
    const row = await this.prisma.mercadoPagoWebhookInbox.findUnique({ where: { id } })
    if (!row) return 'skipped'
    return this.processInboxRow(row, ipAddress)
  }

  /**
   * @en Requeues stale `processing` rows after a crash, then drains due work.
   * @es Reencola filas `processing` obsoletas tras un crash y drena trabajo vencido.
   * @pt-BR Reencola linhas `processing` obsoletas após crash e drena trabalho vencido.
   */
  async processDue(options?: {
    limit?: number
    now?: Date
    tenantId?: number
  }): Promise<WebhookInboxProcessSummary> {
    const now = options?.now ?? new Date()
    const limit = options?.limit ?? DEFAULT_BATCH
    const tenantFilter =
      options?.tenantId != null && Number.isFinite(options.tenantId)
        ? { tenantId: options.tenantId }
        : {}
    const summary: WebhookInboxProcessSummary = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      dead: 0,
      skipped: 0,
      recoveredStale: 0,
    }

    const staleBefore = new Date(now.getTime() - STALE_PROCESSING_MS)
    const recovered = await this.prisma.mercadoPagoWebhookInbox.updateMany({
      where: {
        ...tenantFilter,
        estado: 'processing',
        updatedAt: { lt: staleBefore },
      },
      data: {
        estado: 'pending',
        nextAttemptAt: now,
      },
    })
    summary.recoveredStale = recovered.count

    const due = await this.prisma.mercadoPagoWebhookInbox.findMany({
      where: {
        ...tenantFilter,
        nextAttemptAt: { lte: now },
        OR: [{ estado: 'pending' }, { estado: 'failed' }],
      },
      orderBy: [{ nextAttemptAt: 'asc' }, { id: 'asc' }],
      take: limit * 2,
    })

    const actionable = due
      .filter(
        (row) =>
          row.estado === 'pending' || (row.estado === 'failed' && row.attemptCount < row.maxAttempts),
      )
      .slice(0, limit)

    for (const row of actionable) {
      summary.processed += 1
      const outcome = await this.processInboxRow(row)
      if (outcome === 'succeeded') summary.succeeded += 1
      else if (outcome === 'failed') summary.failed += 1
      else if (outcome === 'dead') summary.dead += 1
      else summary.skipped += 1
    }

    return summary
  }
}
