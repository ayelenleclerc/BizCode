import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { OutboxRow } from './types'

const updateItemPod = vi.fn()
const registerDevolucion = vi.fn()
const createCobro = vi.fn()
const listOutboxFifo = vi.fn()
const deleteOutbox = vi.fn()
const markOutboxError = vi.fn()
const hydrateOfflineCache = vi.fn()

vi.mock('../api/driverApi', () => ({
  driverRepartosApi: {
    updateItemPod: (...args: unknown[]) => updateItemPod(...args),
    registerDevolucion: (...args: unknown[]) => registerDevolucion(...args),
  },
  driverCobrosApi: {
    create: (...args: unknown[]) => createCobro(...args),
  },
}))

vi.mock('./db', () => ({
  getOfflineDb: vi.fn(async () => ({})),
}))

vi.mock('./outbox', () => ({
  listOutboxFifo: (...args: unknown[]) => listOutboxFifo(...args),
  deleteOutbox: (...args: unknown[]) => deleteOutbox(...args),
  markOutboxError: (...args: unknown[]) => markOutboxError(...args),
}))

vi.mock('./hydrate', () => ({
  hydrateOfflineCache: (...args: unknown[]) => hydrateOfflineCache(...args),
}))

vi.mock('./meta', () => ({
  offlineMeta: {
    setPendingCount: vi.fn(),
    setLastSyncError: vi.fn(),
    setLastSyncAt: vi.fn(),
  },
}))

import { flushOutbox } from './sync'

function row(partial: Partial<OutboxRow> & Pick<OutboxRow, 'id' | 'actionType' | 'payloadJson'>): OutboxRow {
  return {
    createdAt: '2026-08-19T12:00:00.000Z',
    attempts: 0,
    lastError: null,
    ...partial,
  }
}

describe('flushOutbox (#164)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    updateItemPod.mockResolvedValue({})
    registerDevolucion.mockResolvedValue({})
    createCobro.mockResolvedValue({})
    deleteOutbox.mockResolvedValue(undefined)
    markOutboxError.mockResolvedValue(undefined)
    hydrateOfflineCache.mockResolvedValue({})
  })

  it('flushes FIFO and stops on first failure', async () => {
    const first = row({
      id: 1,
      actionType: 'pod_delivered',
      payloadJson: JSON.stringify({
        repartoId: 9,
        itemId: 3,
        input: { outcome: 'delivered', receptorNombre: 'Ana' },
      }),
    })
    const second = row({
      id: 2,
      actionType: 'cobro_create',
      payloadJson: JSON.stringify({ body: { clienteId: 1, monto: 10 } }),
    })
    listOutboxFifo.mockResolvedValueOnce([first, second]).mockResolvedValueOnce([second])

    updateItemPod.mockRejectedValueOnce(new Error('REPARTO_ITEM_INVALID_STATE'))

    const result = await flushOutbox()

    expect(updateItemPod).toHaveBeenCalledTimes(1)
    expect(createCobro).not.toHaveBeenCalled()
    expect(markOutboxError).toHaveBeenCalledWith({}, 1, 1, 'REPARTO_ITEM_INVALID_STATE')
    expect(deleteOutbox).not.toHaveBeenCalled()
    expect(result.processed).toBe(0)
    expect(result.remaining).toBe(1)
    expect(result.lastError).toContain('REPARTO_ITEM_INVALID_STATE')
  })

  it('processes POD then cobro then devolucion in id order', async () => {
    const items: OutboxRow[] = [
      row({
        id: 1,
        actionType: 'pod_not_delivered',
        payloadJson: JSON.stringify({ repartoId: 9, itemId: 3, motivo: 'ausente' }),
      }),
      row({
        id: 2,
        actionType: 'cobro_create',
        payloadJson: JSON.stringify({ body: { clienteId: 8 } }),
      }),
      row({
        id: 3,
        actionType: 'devolucion_register',
        payloadJson: JSON.stringify({
          repartoId: 9,
          itemId: 4,
          input: { motivo: 'rechazo' },
        }),
      }),
    ]
    listOutboxFifo.mockResolvedValueOnce(items).mockResolvedValueOnce([])

    const result = await flushOutbox()

    expect(updateItemPod.mock.invocationCallOrder[0]).toBeLessThan(createCobro.mock.invocationCallOrder[0])
    expect(createCobro.mock.invocationCallOrder[0]).toBeLessThan(registerDevolucion.mock.invocationCallOrder[0])
    expect(updateItemPod).toHaveBeenCalledWith(9, 3, { outcome: 'not_delivered', motivoNoEntrega: 'ausente' })
    expect(createCobro).toHaveBeenCalledWith({ clienteId: 8 })
    expect(registerDevolucion).toHaveBeenCalledWith(9, 4, { motivo: 'rechazo' })
    expect(deleteOutbox).toHaveBeenCalledTimes(3)
    expect(result).toEqual({ processed: 3, remaining: 0, lastError: null })
    expect(hydrateOfflineCache).toHaveBeenCalled()
  })
})
