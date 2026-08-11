/**
 * @en WooCommerce stock push service tests (#188).
 * @es Tests del servicio de push de stock WooCommerce (#188).
 * @pt-BR Testes do serviço de push de estoque WooCommerce (#188).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { WooCommerceStockSyncService } from '../../../apps/server/services/WooCommerceStockSyncService'
import { encryptFiscalSecret } from '../../../apps/server/fiscal/ar/fiscalSecrets'
import { clearEcommerceConnectorRegistry } from '../../../apps/server/integrations/ecommerce/connectorRegistry'
import { resetEcommerceConnectorBootstrap } from '../../../apps/server/integrations/ecommerce/bootstrapEcommerceConnectors'

vi.mock('../../../apps/server/integrations/woocommerce/woocommerceApiClient', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('../../../apps/server/integrations/woocommerce/woocommerceApiClient')
    >()
  return {
    ...actual,
    updateWooCommerceProduct: vi.fn(),
  }
})

import { updateWooCommerceProduct } from '../../../apps/server/integrations/woocommerce/woocommerceApiClient'

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
    wooCommerceConfig: {
      findUnique: vi.fn().mockResolvedValue({
        tenantId: 1,
        storeUrl: 'https://shop.example.com',
        consumerKeyEncrypted: encryptFiscalSecret('ck'),
        consumerSecretEncrypted: encryptFiscalSecret('cs'),
        activo: true,
      }),
    },
    articulo: {
      findFirst: vi.fn().mockResolvedValue({ stock: 5, activo: true }),
    },
    wooCommercePublicacion: {
      findFirst: vi.fn().mockResolvedValue({
        id: 1,
        wcProductId: '42',
        estado: 'active',
      }),
      update: vi.fn().mockResolvedValue({}),
    },
    ...overrides,
  })
}

describe('WooCommerceStockSyncService (#188)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearEcommerceConnectorRegistry()
    resetEcommerceConnectorBootstrap()
  })

  it('no-ops when no linked wcProductId', async () => {
    const prisma = buildPrisma({
      wooCommercePublicacion: {
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
    })
    const result = await new WooCommerceStockSyncService(prisma).syncStockToWooCommerce(1, 10)
    expect(result).toEqual({ ok: true, data: { synced: false } })
    expect(updateWooCommerceProduct).not.toHaveBeenCalled()
  })

  it('queues and processes stock update via connector', async () => {
    vi.mocked(updateWooCommerceProduct).mockResolvedValue({
      id: 42,
      stock_quantity: 0,
      status: 'draft',
    })
    const prisma = buildPrisma({
      articulo: {
        findFirst: vi.fn().mockResolvedValue({ stock: 0, activo: true }),
      },
    })

    const result = await new WooCommerceStockSyncService(prisma).syncStockToWooCommerce(1, 10)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.synced).toBe(true)
      expect(result.data.status).toBe('paused')
      expect(result.data.availableQuantity).toBe(0)
    }
    expect(updateWooCommerceProduct).toHaveBeenCalled()
  })

  it('returns 404 when articulo is missing', async () => {
    const prisma = buildPrisma({
      articulo: { findFirst: vi.fn().mockResolvedValue(null) },
    })
    await expect(
      new WooCommerceStockSyncService(prisma).syncStockToWooCommerce(1, 10),
    ).resolves.toEqual({ ok: false, status: 404, error: 'Articulo not found' })
  })
})
