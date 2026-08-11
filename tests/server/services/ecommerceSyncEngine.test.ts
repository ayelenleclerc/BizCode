/**
 * @en Unit tests for EcommerceSyncEngine (#189).
 * @es Tests unitarios de EcommerceSyncEngine (#189).
 * @pt-BR Testes unitários de EcommerceSyncEngine (#189).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { EcommerceConnector } from '../../../apps/server/integrations/ecommerce/EcommerceConnector'
import {
  clearEcommerceConnectorRegistry,
  registerEcommerceConnectorFactory,
} from '../../../apps/server/integrations/ecommerce/connectorRegistry'
import { resetEcommerceConnectorBootstrap } from '../../../apps/server/integrations/ecommerce/bootstrapEcommerceConnectors'
import {
  EcommerceSyncEngine,
  resetEcommerceRateLimits,
} from '../../../apps/server/services/EcommerceSyncEngine'

const dispatchSecurityAlert = vi.fn().mockResolvedValue(undefined)

vi.mock('../../../apps/server/security/securityAlertDispatch', () => ({
  dispatchSecurityAlert: (...args: unknown[]) => dispatchSecurityAlert(...args),
}))

function makeJob(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    tenantId: 10,
    connectorType: 'meli',
    operation: 'update_stock',
    payload: { externalId: 'MLA1', quantity: 3, articuloId: 5 },
    idempotencyKey: 'meli:stock:10:5',
    status: 'pending',
    attempts: 0,
    maxAttempts: 3,
    nextAttemptAt: new Date(0),
    lastError: null,
    articuloId: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

describe('EcommerceSyncEngine', () => {
  let jobs: ReturnType<typeof makeJob>[]
  let logs: Array<Record<string, unknown>>
  let prisma: {
    ecommerceSyncJob: {
      findUnique: ReturnType<typeof vi.fn>
      findMany: ReturnType<typeof vi.fn>
      create: ReturnType<typeof vi.fn>
      update: ReturnType<typeof vi.fn>
      updateMany: ReturnType<typeof vi.fn>
      count: ReturnType<typeof vi.fn>
    }
    syncLog: { create: ReturnType<typeof vi.fn>; count: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn> }
    meliConfig: { findUnique: ReturnType<typeof vi.fn> }
  }
  let connector: EcommerceConnector

  beforeEach(() => {
    clearEcommerceConnectorRegistry()
    resetEcommerceConnectorBootstrap()
    resetEcommerceRateLimits()
    dispatchSecurityAlert.mockClear()
    jobs = []
    logs = []

    connector = {
      type: 'meli',
      publishProduct: vi.fn().mockResolvedValue('MLA-NEW'),
      updateProduct: vi.fn().mockResolvedValue(undefined),
      pauseProduct: vi.fn().mockResolvedValue(undefined),
      updateStock: vi.fn().mockResolvedValue(undefined),
      parseIncomingOrder: vi.fn(),
      markOrderDispatched: vi.fn().mockResolvedValue(undefined),
    }

    registerEcommerceConnectorFactory('meli', () => connector)

    prisma = {
      ecommerceSyncJob: {
        findUnique: vi.fn(async ({ where }: { where: { id?: number; idempotencyKey?: string } }) => {
          if (where.id != null) return jobs.find((j) => j.id === where.id) ?? null
          if (where.idempotencyKey != null) {
            return jobs.find((j) => j.idempotencyKey === where.idempotencyKey) ?? null
          }
          return null
        }),
        findMany: vi.fn(async () => jobs.filter((j) => j.status === 'pending' || j.status === 'failed')),
        create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
          const job = makeJob({ id: jobs.length + 1, ...data, nextAttemptAt: new Date(0) })
          jobs.push(job)
          return job
        }),
        update: vi.fn(async ({ where, data }: { where: { id: number }; data: Record<string, unknown> }) => {
          const idx = jobs.findIndex((j) => j.id === where.id)
          const next = { ...jobs[idx], ...data }
          jobs[idx] = next
          return next
        }),
        updateMany: vi.fn(async ({ where, data }: { where: { id: number }; data: Record<string, unknown> }) => {
          const idx = jobs.findIndex((j) => j.id === where.id)
          if (idx < 0) return { count: 0 }
          jobs[idx] = { ...jobs[idx], ...data }
          return { count: 1 }
        }),
        count: vi.fn(async () => 0),
      },
      syncLog: {
        create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
          logs.push(data)
          return { id: logs.length, ...data }
        }),
        count: vi.fn(async () => logs.length),
        findMany: vi.fn(async () => logs),
      },
      meliConfig: {
        findUnique: vi.fn(async () => null),
      },
    }
  })

  it('enqueues idempotently by idempotencyKey', async () => {
    const engine = new EcommerceSyncEngine(prisma as never)
    const a = await engine.enqueue({
      tenantId: 10,
      connectorType: 'meli',
      operation: 'update_stock',
      idempotencyKey: 'k1',
      articuloId: 5,
      payload: { externalId: 'MLA1', quantity: 1 },
    })
    const b = await engine.enqueue({
      tenantId: 10,
      connectorType: 'meli',
      operation: 'update_stock',
      idempotencyKey: 'k1',
      articuloId: 5,
      payload: { externalId: 'MLA1', quantity: 9 },
    })
    expect(a.id).toBe(b.id)
    expect(jobs).toHaveLength(1)
    expect((jobs[0].payload as { quantity: number }).quantity).toBe(9)
  })

  it('processes job and writes success SyncLog', async () => {
    jobs.push(makeJob())
    const engine = new EcommerceSyncEngine(prisma as never)
    const summary = await engine.processDueJobs(10)
    expect(summary.succeeded).toBe(1)
    expect(connector.updateStock).toHaveBeenCalledWith('MLA1', 3)
    expect(logs[0]).toMatchObject({ status: 'success', connectorType: 'meli' })
  })

  it('retries with failed status then dead-letters after maxAttempts', async () => {
    vi.mocked(connector.updateStock).mockRejectedValue(new Error('boom'))
    jobs.push(makeJob({ maxAttempts: 3, attempts: 0 }))
    const engine = new EcommerceSyncEngine(prisma as never)

    await engine.processDueJobs(10)
    expect(jobs[0].status).toBe('failed')
    expect(jobs[0].attempts).toBe(1)
    expect(dispatchSecurityAlert).not.toHaveBeenCalled()

    jobs[0].status = 'failed'
    jobs[0].nextAttemptAt = new Date(0)
    await engine.processDueJobs(10)
    expect(jobs[0].attempts).toBe(2)

    jobs[0].status = 'failed'
    jobs[0].nextAttemptAt = new Date(0)
    await engine.processDueJobs(10)
    expect(jobs[0].status).toBe('dead')
    expect(jobs[0].attempts).toBe(3)
    expect(dispatchSecurityAlert).toHaveBeenCalledWith(
      prisma,
      expect.objectContaining({ action: 'ecommerce_sync_dead_letter' }),
    )
  })

  it('defers update_stock when catalog job is pending for same articulo', async () => {
    jobs.push(
      makeJob({
        id: 1,
        operation: 'update_product',
        status: 'pending',
        articuloId: 5,
        idempotencyKey: 'cat',
      }),
      makeJob({
        id: 2,
        operation: 'update_stock',
        status: 'pending',
        articuloId: 5,
        idempotencyKey: 'stock',
        payload: { externalId: 'MLA1', quantity: 1 },
      }),
    )
    prisma.ecommerceSyncJob.count = vi.fn(async ({ where }: { where: { id?: { not: number } } }) => {
      // count catalog blockers for stock job id 2
      if (where?.id?.not === 2) return 1
      return 0
    })
    prisma.ecommerceSyncJob.findMany = vi.fn(async () => [jobs[1]])

    const engine = new EcommerceSyncEngine(prisma as never)
    const summary = await engine.processDueJobs(10)
    expect(summary.deferred).toBe(1)
    expect(connector.updateStock).not.toHaveBeenCalled()
  })

  it('isolates connector failures in a batch', async () => {
    const bad: EcommerceConnector = {
      ...connector,
      type: 'meli',
      updateStock: vi.fn().mockRejectedValue(new Error('only first')),
    }
    const good: EcommerceConnector = {
      type: 'meli',
      publishProduct: vi.fn(),
      updateProduct: vi.fn(),
      pauseProduct: vi.fn(),
      updateStock: vi.fn().mockResolvedValue(undefined),
      parseIncomingOrder: vi.fn(),
      markOrderDispatched: vi.fn(),
    }
    let calls = 0
    clearEcommerceConnectorRegistry()
    registerEcommerceConnectorFactory('meli', () => {
      calls += 1
      return calls === 1 ? bad : good
    })

    jobs.push(
      makeJob({ id: 1, idempotencyKey: 'a', payload: { externalId: 'A', quantity: 1 } }),
      makeJob({ id: 2, idempotencyKey: 'b', payload: { externalId: 'B', quantity: 2 } }),
    )
    prisma.ecommerceSyncJob.findMany = vi.fn(async () => [...jobs])

    const engine = new EcommerceSyncEngine(prisma as never)
    const summary = await engine.processDueJobs(10)
    expect(summary.processed).toBe(2)
    expect(summary.failed + summary.succeeded).toBe(2)
    expect(summary.succeeded).toBe(1)
    expect(summary.failed).toBe(1)
  })
})
