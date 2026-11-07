import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Prisma } from '@prisma/client'
import { MercadoPagoWebhookInboxService } from '../../../apps/server/services/MercadoPagoWebhookInboxService'

const processPayment = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
const processChargeback = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))

vi.mock('../../../apps/server/payments/PaymentWebhookService', () => ({
  PaymentWebhookService: class {
    processMercadoPagoPaymentNotification = processPayment
    processMercadoPagoChargebackNotification = processChargeback
  },
}))

type InboxRow = {
  id: number
  tenantId: number
  eventKey: string
  resourceType: string
  resourceId: string
  payloadJson: unknown
  estado: string
  attemptCount: number
  maxAttempts: number
  nextAttemptAt: Date
  lastError: string | null
  receivedAt: Date
  processedAt: Date | null
  updatedAt: Date
}

function buildStore() {
  const rows = new Map<number, InboxRow>()
  let seq = 1

  const create = vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
    const eventKey = data.eventKey as string
    const tenantId = data.tenantId as number
    for (const row of rows.values()) {
      if (row.tenantId === tenantId && row.eventKey === eventKey) {
        throw new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
          code: 'P2002',
          clientVersion: 'test',
        })
      }
    }
    const id = seq++
    const row: InboxRow = {
      id,
      tenantId,
      eventKey,
      resourceType: data.resourceType as string,
      resourceId: data.resourceId as string,
      payloadJson: data.payloadJson,
      estado: (data.estado as string) ?? 'pending',
      attemptCount: 0,
      maxAttempts: 5,
      nextAttemptAt: (data.nextAttemptAt as Date) ?? new Date(),
      lastError: null,
      receivedAt: new Date(),
      processedAt: null,
      updatedAt: new Date(),
    }
    rows.set(id, row)
    return { ...row }
  })

  const findUnique = vi.fn().mockImplementation(async ({ where }: {
    where: { id?: number; tenantId_eventKey?: { tenantId: number; eventKey: string } }
  }) => {
    if (where.id != null) return rows.get(where.id) ? { ...rows.get(where.id)! } : null
    const key = where.tenantId_eventKey
    if (!key) return null
    for (const row of rows.values()) {
      if (row.tenantId === key.tenantId && row.eventKey === key.eventKey) return { ...row }
    }
    return null
  })

  const updateMany = vi.fn().mockImplementation(async ({ where, data }: {
    where: { id: number; estado: { in: string[] } }
    data: Partial<InboxRow>
  }) => {
    const row = rows.get(where.id)
    if (!row || !where.estado.in.includes(row.estado)) return { count: 0 }
    Object.assign(row, data, { updatedAt: new Date() })
    return { count: 1 }
  })

  const update = vi.fn().mockImplementation(async ({ where, data }: {
    where: { id: number }
    data: Partial<InboxRow>
  }) => {
    const row = rows.get(where.id)
    if (!row) throw new Error('missing')
    Object.assign(row, data, { updatedAt: new Date() })
    return { ...row }
  })

  const findMany = vi.fn().mockImplementation(async ({ where }: {
    where: {
      nextAttemptAt: { lte: Date }
      OR: Array<{ estado: string }>
    }
  }) => {
    const estados = new Set(where.OR.map((o) => o.estado))
    return [...rows.values()]
      .filter((r) => estados.has(r.estado) && r.nextAttemptAt <= where.nextAttemptAt.lte)
      .map((r) => ({ ...r }))
  })

  const updateManyStale = updateMany

  return {
    rows,
    prisma: {
      mercadoPagoWebhookInbox: {
        create,
        findUnique,
        updateMany,
        update,
        findMany,
      },
    },
    // expose for stale recovery path which uses updateMany without id
    patchUpdateManyForStale() {
      this.prisma.mercadoPagoWebhookInbox.updateMany = vi.fn().mockImplementation(async ({ where, data }: {
        where: Record<string, unknown>
        data: Partial<InboxRow>
      }) => {
        if ('id' in where) {
          return updateManyStale({ where: where as never, data })
        }
        let count = 0
        const estado = where.estado as string | undefined
        const updatedAtLt = (where.updatedAt as { lt: Date } | undefined)?.lt
        for (const row of rows.values()) {
          if (estado && row.estado !== estado) continue
          if (updatedAtLt && !(row.updatedAt < updatedAtLt)) continue
          Object.assign(row, data, { updatedAt: new Date() })
          count += 1
        }
        return { count }
      })
    },
  }
}

describe('MercadoPagoWebhookInboxService (#447)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    processPayment.mockResolvedValue(undefined)
    processChargeback.mockResolvedValue(undefined)
  })

  it('enqueues a pending payment event', async () => {
    const store = buildStore()
    const svc = new MercadoPagoWebhookInboxService(store.prisma as never)
    const row = await svc.enqueue({
      tenantId: 1,
      resourceType: 'payment',
      resourceId: '99',
      payload: { data: { id: '99' }, type: 'payment' },
    })
    expect(row.estado).toBe('pending')
    expect(row.eventKey).toBe('payment:99')
  })

  it('deduplicates enqueue by tenantId+eventKey', async () => {
    const store = buildStore()
    const svc = new MercadoPagoWebhookInboxService(store.prisma as never)
    const a = await svc.enqueue({
      tenantId: 1,
      resourceType: 'payment',
      resourceId: '99',
      payload: { data: { id: '99' } },
    })
    const b = await svc.enqueue({
      tenantId: 1,
      resourceType: 'payment',
      resourceId: '99',
      payload: { data: { id: '99' }, action: 'payment.updated' },
    })
    expect(a.id).toBe(b.id)
    expect(store.rows.size).toBe(1)
  })

  it('processes payment inbox via PaymentWebhookService once', async () => {
    const store = buildStore()
    store.patchUpdateManyForStale()
    const svc = new MercadoPagoWebhookInboxService(store.prisma as never)
    const row = await svc.enqueue({
      tenantId: 1,
      resourceType: 'payment',
      resourceId: '123',
      payload: { data: { id: '123' } },
    })
    const outcome = await svc.processById(row.id)
    expect(outcome).toBe('succeeded')
    expect(processPayment).toHaveBeenCalledTimes(1)
    expect(store.rows.get(row.id)?.estado).toBe('processed')
  })

  it('retries failed processing with backoff then marks dead', async () => {
    const store = buildStore()
    store.patchUpdateManyForStale()
    processPayment.mockRejectedValue(new Error('mp down'))
    const svc = new MercadoPagoWebhookInboxService(store.prisma as never)
    const row = await svc.enqueue({
      tenantId: 1,
      resourceType: 'payment',
      resourceId: '7',
      payload: { data: { id: '7' } },
    })
    // Force low maxAttempts
    store.rows.get(row.id)!.maxAttempts = 2

    expect(await svc.processById(row.id)).toBe('failed')
    expect(store.rows.get(row.id)?.estado).toBe('failed')
    expect(store.rows.get(row.id)?.attemptCount).toBe(1)

    // Reset to pending for second attempt
    store.rows.get(row.id)!.estado = 'pending'
    expect(await svc.processById(row.id)).toBe('dead')
    expect(store.rows.get(row.id)?.attemptCount).toBe(2)
  })

  it('recovers stale processing rows then drains', async () => {
    const store = buildStore()
    store.patchUpdateManyForStale()
    const svc = new MercadoPagoWebhookInboxService(store.prisma as never)
    const row = await svc.enqueue({
      tenantId: 1,
      resourceType: 'payment',
      resourceId: '55',
      payload: { data: { id: '55' } },
    })
    const stuck = store.rows.get(row.id)!
    stuck.estado = 'processing'
    stuck.updatedAt = new Date(Date.now() - 10 * 60_000)

    const summary = await svc.processDue({ now: new Date() })
    expect(summary.recoveredStale).toBe(1)
    expect(summary.succeeded).toBe(1)
    expect(processPayment).toHaveBeenCalled()
  })
})
