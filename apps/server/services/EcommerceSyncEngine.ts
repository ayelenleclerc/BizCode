/**
 * @en Shared ecommerce sync engine: Prisma queue, retry/backoff, SyncLog, DLQ (#189).
 * @es Motor compartido de sync eCommerce: cola Prisma, retry/backoff, SyncLog, DLQ (#189).
 * @pt-BR Motor compartilhado de sync eCommerce: fila Prisma, retry/backoff, SyncLog, DLQ (#189).
 */

import type { EcommerceSyncJob, Prisma, PrismaClient } from '@prisma/client'
import { dispatchSecurityAlert } from '../security/securityAlertDispatch'
import { logger } from '../logger'
import type {
  ConnectorArticuloSnapshot,
  EcommerceConnectorType,
  EcommerceSyncOperation,
} from '../integrations/ecommerce/EcommerceConnector'
import {
  getEcommerceConnector,
  hasEcommerceConnectorFactory,
} from '../integrations/ecommerce/connectorRegistry'
import type { EcommerceConnector } from '../integrations/ecommerce/EcommerceConnector'

const CATALOG_OPS = new Set<EcommerceSyncOperation>([
  'publish_product',
  'update_product',
  'pause_product',
])

const BACKOFF_MS = [60_000, 5 * 60_000, 30 * 60_000] as const

/** @en Per-connector requests-per-minute ceilings (#189). @es Techos req/min por conector (#189). @pt-BR Tetos req/min por conector (#189). */
export const CONNECTOR_RATE_LIMITS: Record<EcommerceConnectorType, number> = {
  meli: 300,
  tiendanube: 500,
  woocommerce: 300,
}

const rateWindows = new Map<EcommerceConnectorType, { windowStart: number; count: number }>()

export type EnqueueInput = {
  tenantId: number
  connectorType: EcommerceConnectorType
  operation: EcommerceSyncOperation
  payload: Prisma.InputJsonValue
  idempotencyKey: string
  articuloId?: number | null
}

export type ProcessDueSummary = {
  processed: number
  succeeded: number
  failed: number
  deferred: number
  dead: number
}

function isConnectorType(value: string): value is EcommerceConnectorType {
  return value === 'meli' || value === 'tiendanube' || value === 'woocommerce'
}

function isOperation(value: string): value is EcommerceSyncOperation {
  return (
    value === 'publish_product' ||
    value === 'update_product' ||
    value === 'pause_product' ||
    value === 'update_stock' ||
    value === 'mark_dispatched'
  )
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

/**
 * @en In-process RPM gate; defers job when ceiling reached (#189).
 * @es Gate RPM in-process; pospone el job si se alcanza el techo (#189).
 * @pt-BR Gate RPM in-process; adia o job se o teto for atingido (#189).
 */
export function consumeRateLimitSlot(connectorType: EcommerceConnectorType): boolean {
  const limit = CONNECTOR_RATE_LIMITS[connectorType]
  const now = Date.now()
  const window = rateWindows.get(connectorType)
  if (!window || now - window.windowStart >= 60_000) {
    rateWindows.set(connectorType, { windowStart: now, count: 1 })
    return true
  }
  if (window.count >= limit) return false
  window.count += 1
  return true
}

/** @en Test helper to reset RPM counters. @es Helper de test para resetear contadores RPM. @pt-BR Helper de teste para resetar contadores RPM. */
export function resetEcommerceRateLimits(): void {
  rateWindows.clear()
}

function backoffMsForAttempt(attemptsAfterFailure: number): number {
  const idx = Math.min(Math.max(attemptsAfterFailure - 1, 0), BACKOFF_MS.length - 1)
  return BACKOFF_MS[idx]
}

/**
 * @en Persists sync jobs and processes them with per-connector isolation (#189).
 * @es Persiste jobs de sync y los procesa con aislamiento por conector (#189).
 * @pt-BR Persiste jobs de sync e os processa com isolamento por conector (#189).
 */
export class EcommerceSyncEngine {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * @en Upserts a job by idempotencyKey (resets succeeded/dead to pending with fresh payload).
   * @es Upsert de job por idempotencyKey (reinicia succeeded/dead a pending con payload nuevo).
   * @pt-BR Upsert de job por idempotencyKey (reinicia succeeded/dead para pending com payload novo).
   */
  async enqueue(input: EnqueueInput): Promise<EcommerceSyncJob> {
    const existing = await this.prisma.ecommerceSyncJob.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
    })

    if (!existing) {
      return this.prisma.ecommerceSyncJob.create({
        data: {
          tenantId: input.tenantId,
          connectorType: input.connectorType,
          operation: input.operation,
          payload: input.payload,
          idempotencyKey: input.idempotencyKey,
          status: 'pending',
          articuloId: input.articuloId ?? null,
          nextAttemptAt: new Date(),
        },
      })
    }

    if (existing.status === 'processing') {
      return existing
    }

    return this.prisma.ecommerceSyncJob.update({
      where: { id: existing.id },
      data: {
        operation: input.operation,
        payload: input.payload,
        articuloId: input.articuloId ?? existing.articuloId,
        status: 'pending',
        attempts: existing.status === 'failed' ? existing.attempts : 0,
        nextAttemptAt: new Date(),
        lastError: null,
      },
    })
  }

  async processJobById(jobId: number): Promise<'succeeded' | 'failed' | 'dead' | 'deferred' | 'skipped'> {
    const job = await this.prisma.ecommerceSyncJob.findUnique({ where: { id: jobId } })
    if (!job) return 'skipped'
    if (job.status !== 'pending' && job.status !== 'failed') return 'skipped'
    if (job.nextAttemptAt.getTime() > Date.now()) return 'deferred'
    return this.executeClaimedOrDefer(job)
  }

  /**
   * @en Claims and runs due jobs; failures in one connector do not abort the batch (#189).
   * @es Toma y ejecuta jobs vencidos; fallos de un conector no abortan el lote (#189).
   * @pt-BR Captura e executa jobs vencidos; falhas de um conector não abortam o lote (#189).
   */
  async processDueJobs(limit = 50): Promise<ProcessDueSummary> {
    const now = new Date()
    const due = await this.prisma.ecommerceSyncJob.findMany({
      where: {
        status: { in: ['pending', 'failed'] },
        nextAttemptAt: { lte: now },
      },
      orderBy: [{ nextAttemptAt: 'asc' }, { id: 'asc' }],
      take: Math.max(1, Math.min(limit, 200)),
    })

    const summary: ProcessDueSummary = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      deferred: 0,
      dead: 0,
    }

    for (const job of due) {
      try {
        const result = await this.executeClaimedOrDefer(job)
        if (result === 'deferred') {
          summary.deferred += 1
          continue
        }
        if (result === 'skipped') continue
        summary.processed += 1
        if (result === 'succeeded') summary.succeeded += 1
        else if (result === 'dead') summary.dead += 1
        else summary.failed += 1
      } catch (err) {
        summary.processed += 1
        summary.failed += 1
        logger.warn(
          {
            jobId: job.id,
            err: err instanceof Error ? { name: err.name, message: err.message } : String(err),
          },
          '[ecommerce-sync] unexpected job failure',
        )
      }
    }

    return summary
  }

  private async executeClaimedOrDefer(
    job: EcommerceSyncJob,
  ): Promise<'succeeded' | 'failed' | 'dead' | 'deferred' | 'skipped'> {
    if (!isConnectorType(job.connectorType) || !isOperation(job.operation)) {
      await this.failJob(job, 'Invalid connectorType or operation', true)
      return 'dead'
    }

    if (job.operation === 'update_stock' && job.articuloId != null) {
      const blocking = await this.prisma.ecommerceSyncJob.count({
        where: {
          tenantId: job.tenantId,
          articuloId: job.articuloId,
          connectorType: job.connectorType,
          operation: { in: [...CATALOG_OPS] },
          status: { in: ['pending', 'processing', 'failed'] },
          id: { not: job.id },
        },
      })
      if (blocking > 0) {
        await this.prisma.ecommerceSyncJob.update({
          where: { id: job.id },
          data: { nextAttemptAt: new Date(Date.now() + 30_000) },
        })
        return 'deferred'
      }
    }

    if (!consumeRateLimitSlot(job.connectorType)) {
      await this.prisma.ecommerceSyncJob.update({
        where: { id: job.id },
        data: { nextAttemptAt: new Date(Date.now() + 5_000) },
      })
      return 'deferred'
    }

    const claimed = await this.prisma.ecommerceSyncJob.updateMany({
      where: {
        id: job.id,
        status: { in: ['pending', 'failed'] },
      },
      data: { status: 'processing', updatedAt: new Date() },
    })
    if (claimed.count !== 1) return 'skipped'

    const connector = getEcommerceConnector(job.connectorType, this.prisma, job.tenantId)
    if (!connector) {
      await this.failJob(
        { ...job, attempts: job.attempts + 1 },
        `No connector registered for ${job.connectorType}`,
        true,
      )
      return 'dead'
    }

    try {
      await this.dispatchOperation(connector, job)
      await this.prisma.ecommerceSyncJob.update({
        where: { id: job.id },
        data: {
          status: 'succeeded',
          lastError: null,
          attempts: job.attempts + 1,
        },
      })
      await this.writeLog(job, 'success', null)
      return 'succeeded'
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      const attempts = job.attempts + 1
      const dead = attempts >= job.maxAttempts
      await this.failJob({ ...job, attempts }, message, dead)
      return dead ? 'dead' : 'failed'
    }
  }

  private async dispatchOperation(
    connector: EcommerceConnector,
    job: EcommerceSyncJob,
  ): Promise<void> {
    const payload = asRecord(job.payload)
    const op = job.operation as EcommerceSyncOperation

    if (op === 'publish_product') {
      await connector.publishProduct(payload as unknown as ConnectorArticuloSnapshot)
      return
    }

    if (op === 'update_product') {
      const externalId = String(payload.externalId ?? '')
      if (!externalId) throw new Error('update_product requires payload.externalId')
      await connector.updateProduct(externalId, payload as Partial<ConnectorArticuloSnapshot>)
      return
    }

    if (op === 'pause_product') {
      const externalId = String(payload.externalId ?? '')
      if (!externalId) throw new Error('pause_product requires payload.externalId')
      await connector.pauseProduct(externalId)
      return
    }

    if (op === 'update_stock') {
      const externalId = String(payload.externalId ?? '')
      if (!externalId) throw new Error('update_stock requires payload.externalId')
      const quantity = Number(payload.quantity ?? 0)
      await connector.updateStock(externalId, quantity)
      return
    }

    if (op === 'mark_dispatched') {
      const externalOrderId = String(payload.externalOrderId ?? '')
      if (!externalOrderId) throw new Error('mark_dispatched requires payload.externalOrderId')
      const tracking =
        typeof payload.trackingCode === 'string' ? payload.trackingCode : undefined
      await connector.markOrderDispatched(externalOrderId, tracking)
      return
    }

    throw new Error(`Unsupported operation: ${job.operation}`)
  }

  private async failJob(
    job: Pick<EcommerceSyncJob, 'id' | 'tenantId' | 'connectorType' | 'operation' | 'attempts' | 'maxAttempts'>,
    message: string,
    forceDead: boolean,
  ): Promise<void> {
    const attempts = job.attempts
    const dead = forceDead || attempts >= job.maxAttempts
    const nextAttemptAt = dead
      ? new Date()
      : new Date(Date.now() + backoffMsForAttempt(attempts))

    await this.prisma.ecommerceSyncJob.update({
      where: { id: job.id },
      data: {
        status: dead ? 'dead' : 'failed',
        attempts,
        lastError: message.slice(0, 2000),
        nextAttemptAt,
      },
    })
    await this.writeLog(
      {
        tenantId: job.tenantId,
        connectorType: job.connectorType,
        operation: job.operation,
        id: job.id,
      },
      'error',
      message,
    )

    if (dead) {
      try {
        await dispatchSecurityAlert(this.prisma, {
          tenantId: job.tenantId,
          securityEventType: 'tenant_incident_action',
          severity: 'high',
          action: 'ecommerce_sync_dead_letter',
          resource: 'EcommerceSyncJob',
          resourceId: String(job.id),
          detail: `${job.connectorType}/${job.operation}: ${message}`.slice(0, 500),
        })
      } catch (err) {
        logger.warn(
          {
            jobId: job.id,
            err: err instanceof Error ? { name: err.name, message: err.message } : String(err),
          },
          '[ecommerce-sync] DLQ alert failed',
        )
      }
    }
  }

  private async writeLog(
    job: Pick<EcommerceSyncJob, 'id' | 'tenantId' | 'connectorType' | 'operation'>,
    status: 'success' | 'error',
    errorMsg: string | null,
  ): Promise<void> {
    await this.prisma.syncLog.create({
      data: {
        tenantId: job.tenantId,
        connectorType: job.connectorType,
        operation: job.operation,
        status,
        errorMsg: errorMsg?.slice(0, 2000) ?? null,
        jobId: job.id,
      },
    })
  }

  async listSyncLogs(
    tenantId: number,
    opts: { connectorType?: string; status?: string; take?: number; skip?: number },
  ): Promise<{ total: number; logs: Array<{
    id: number
    connectorType: string
    operation: string
    status: string
    errorMsg: string | null
    jobId: number | null
    createdAt: Date
  }> }> {
    const take = Math.min(Math.max(opts.take ?? 50, 1), 200)
    const skip = Math.max(opts.skip ?? 0, 0)
    const where = {
      tenantId,
      ...(opts.connectorType ? { connectorType: opts.connectorType } : {}),
      ...(opts.status ? { status: opts.status } : {}),
    }
    const [total, logs] = await Promise.all([
      this.prisma.syncLog.count({ where }),
      this.prisma.syncLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        select: {
          id: true,
          connectorType: true,
          operation: true,
          status: true,
          errorMsg: true,
          jobId: true,
          createdAt: true,
        },
      }),
    ])
    return { total, logs }
  }

  async listConnectorStatuses(tenantId: number): Promise<
    Array<{
      connectorType: EcommerceConnectorType
      status: 'active' | 'inactive' | 'not_configured'
      registered: boolean
    }>
  > {
    const known: EcommerceConnectorType[] = ['meli', 'tiendanube', 'woocommerce']
    const meli = await this.prisma.meliConfig.findUnique({
      where: { tenantId },
      select: { activo: true },
    })
    return known.map((connectorType) => {
      const registered = hasEcommerceConnectorFactory(connectorType)
      if (connectorType === 'meli') {
        if (!meli) {
          return { connectorType, status: 'not_configured' as const, registered }
        }
        return {
          connectorType,
          status: meli.activo ? ('active' as const) : ('inactive' as const),
          registered,
        }
      }
      return { connectorType, status: 'not_configured' as const, registered }
    })
  }
}
