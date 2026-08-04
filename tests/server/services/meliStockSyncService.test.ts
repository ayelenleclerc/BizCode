/**
 * @en Mercado Libre stock push service tests (#185/#189).
 * @es Tests del servicio de push de stock ML (#185/#189).
 * @pt-BR Testes do serviço de push de estoque ML (#185/#189).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { MeliStockSyncService } from '../../../apps/server/services/MeliStockSyncService'
import { encryptFiscalSecret } from '../../../apps/server/fiscal/ar/fiscalSecrets'
import {
  clearEcommerceConnectorRegistry,
} from '../../../apps/server/integrations/ecommerce/connectorRegistry'
import { resetEcommerceConnectorBootstrap } from '../../../apps/server/integrations/ecommerce/bootstrapEcommerceConnectors'

vi.mock('../../../apps/server/integrations/meli/meliItemsClient', () => ({
  getMeliItem: vi.fn(),
  updateMeliItem: vi.fn(),
}))

import { getMeliItem, updateMeliItem } from '../../../apps/server/integrations/meli/meliItemsClient'

function withSyncQueue(base: Record<string, unknown>): PrismaClient {
  const jobs: Array<Record<string, unknown>> = []
  let seq = 1
  return {
    ...base,
    ecommerceSyncJob: {
      findUnique: vi.fn(async ({ where }: { where: { id?: number; idempotencyKey?: string } }) => {
        if (where.id != null) return jobs.find((j) => j.id === where.id) ?? null
        if (where.idempotencyKey != null) {
          return jobs.find((j) => j.idempotencyKey === where.idempotencyKey) ?? null
        }
        return null
      }),
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => {
        const job = {
          id: seq++,
          status: 'pending',
          attempts: 0,
          maxAttempts: 3,
          nextAttemptAt: new Date(0),
          lastError: null,
          ...data,
        }
        jobs.push(job)
        return job
      }),
      update: vi.fn(async ({ where, data }: { where: { id: number }; data: Record<string, unknown> }) => {
        const job = jobs.find((j) => j.id === where.id)
        if (!job) throw new Error('job missing')
        Object.assign(job, data)
        return job
      }),
      updateMany: vi.fn(
        async ({
          where,
          data,
        }: {
          where: { id: number; status?: { in: string[] } }
          data: Record<string, unknown>
        }) => {
          const job = jobs.find((j) => j.id === where.id)
          if (!job) return { count: 0 }
          if (where.status?.in && !where.status.in.includes(String(job.status))) {
            return { count: 0 }
          }
          Object.assign(job, data)
          return { count: 1 }
        },
      ),
      count: vi.fn().mockResolvedValue(0),
      findMany: vi.fn(async () => jobs.filter((j) => j.status === 'pending' || j.status === 'failed')),
    },
    syncLog: { create: vi.fn().mockResolvedValue({ id: 1 }) },
  } as unknown as PrismaClient
}

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return withSyncQueue({
    meliConfig: {
      findUnique: vi.fn().mockResolvedValue({
        tenantId: 1,
        accessTokenEncrypted: encryptFiscalSecret('access-token'),
        refreshTokenEncrypted: encryptFiscalSecret('refresh-token'),
        meliUserId: '999',
      }),
    },
    articulo: {
      findFirst: vi.fn().mockResolvedValue({ stock: 5, activo: true }),
    },
    meliPublicacion: {
      findFirst: vi.fn().mockResolvedValue({
        id: 1,
        meliItemId: 'MLA100',
        estado: 'active',
      }),
      update: vi.fn().mockResolvedValue({}),
      findMany: vi.fn().mockResolvedValue([]),
    },
    ...overrides,
  })
}

describe('MeliStockSyncService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearEcommerceConnectorRegistry()
    resetEcommerceConnectorBootstrap()
  })

  it('patches available_quantity only and pauses when stock is 0', async () => {
    const prisma = buildPrisma({
      articulo: {
        findFirst: vi.fn().mockResolvedValue({ stock: 0, activo: true }),
      },
    })
    vi.mocked(updateMeliItem).mockResolvedValue({
      id: 'MLA100',
      status: 'paused',
      available_quantity: 0,
    })

    const result = await new MeliStockSyncService(prisma).syncStockToMeli(1, 10)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.synced).toBe(true)
      expect(result.data.status).toBe('paused')
    }
    expect(updateMeliItem).toHaveBeenCalledWith('access-token', 'MLA100', {
      available_quantity: 0,
      status: 'paused',
    })
    expect(updateMeliItem).toHaveBeenCalledTimes(1)
    const patch = vi.mocked(updateMeliItem).mock.calls[0][2]
    expect(patch).not.toHaveProperty('title')
    expect(patch).not.toHaveProperty('price')
    expect(patch).not.toHaveProperty('pictures')
  })

  it('reactivates listing when stock returns and article is active', async () => {
    const prisma = buildPrisma({
      articulo: {
        findFirst: vi.fn().mockResolvedValue({ stock: 3, activo: true }),
      },
      meliPublicacion: {
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          meliItemId: 'MLA100',
          estado: 'paused',
        }),
        update: vi.fn().mockResolvedValue({}),
        findMany: vi.fn().mockResolvedValue([]),
      },
    })
    vi.mocked(updateMeliItem).mockResolvedValue({
      id: 'MLA100',
      status: 'active',
      available_quantity: 3,
    })

    const result = await new MeliStockSyncService(prisma).syncStockToMeli(1, 10)
    expect(result.ok).toBe(true)
    expect(updateMeliItem).toHaveBeenCalledWith('access-token', 'MLA100', {
      available_quantity: 3,
      status: 'active',
    })
  })

  it('no-ops when no linked meliItemId', async () => {
    const prisma = buildPrisma({
      meliPublicacion: {
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
        findMany: vi.fn(),
      },
    })
    const result = await new MeliStockSyncService(prisma).syncStockToMeli(1, 10)
    expect(result).toEqual({ ok: true, data: { synced: false } })
    expect(updateMeliItem).not.toHaveBeenCalled()
  })

  it('reconcile pushes when remote qty differs without creating StockAjuste', async () => {
    const prisma = buildPrisma({
      meliPublicacion: {
        findFirst: vi.fn().mockResolvedValue({
          id: 1,
          meliItemId: 'MLA100',
          estado: 'active',
        }),
        update: vi.fn().mockResolvedValue({}),
        findMany: vi.fn().mockResolvedValue([
          { tenantId: 1, articuloId: 10, meliItemId: 'MLA100' },
        ]),
      },
      articulo: {
        findFirst: vi.fn().mockResolvedValue({ stock: 7, activo: true }),
      },
      stockAjuste: { create: vi.fn() },
    })
    vi.mocked(getMeliItem).mockResolvedValue({
      id: 'MLA100',
      available_quantity: 2,
      status: 'active',
    })
    vi.mocked(updateMeliItem).mockResolvedValue({
      id: 'MLA100',
      available_quantity: 7,
      status: 'active',
    })

    const summary = await new MeliStockSyncService(prisma).reconcileAll()
    expect(summary).toEqual({ checked: 1, corrected: 1, errors: 0 })
    expect(updateMeliItem).toHaveBeenCalled()
    expect(prisma.stockAjuste.create).not.toHaveBeenCalled()
  })
})
