/**
 * @en Mercado Libre catalog listing service tests with mocked ML HTTP (#184).
 * @es Tests del servicio de publicaciones ML con HTTP mockeado (#184).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { MeliCatalogService } from '../../../apps/server/services/MeliCatalogService'
import { MeliApiError } from '../../../apps/server/integrations/meli/meliOAuthClient'
import { encryptFiscalSecret } from '../../../apps/server/fiscal/ar/fiscalSecrets'
import {
  clearEcommerceConnectorRegistry,
} from '../../../apps/server/integrations/ecommerce/connectorRegistry'
import { resetEcommerceConnectorBootstrap } from '../../../apps/server/integrations/ecommerce/bootstrapEcommerceConnectors'

vi.mock('../../../apps/server/integrations/meli/meliItemsClient', () => ({
  createMeliItem: vi.fn(),
  updateMeliItem: vi.fn(),
  searchMeliCategories: vi.fn(),
  fetchMeliCategoryAttributes: vi.fn(),
}))

import {
  createMeliItem,
  fetchMeliCategoryAttributes,
  updateMeliItem,
} from '../../../apps/server/integrations/meli/meliItemsClient'

function articuloBase(overrides: Record<string, unknown> = {}) {
  return {
    id: 10,
    tenantId: 1,
    codigo: 100,
    descripcion: 'Producto demo ML',
    precioLista1: 1500,
    stock: 5,
    monedaPrecio: 'ARS',
    activo: true,
    esPadre: false,
    tipo: 'articulo',
    imagenes: [{ id: 1, pathOriginal: 't1/a10/orig.jpg', orden: 0, esPrincipal: true }],
    ...overrides,
  }
}

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
  const pub = {
    id: 1,
    tenantId: 1,
    articuloId: 10,
    meliItemId: null as string | null,
    meliCategoryId: 'MLA1234',
    estado: 'pending',
    atributosJson: null as unknown,
    permalink: null as string | null,
    syncStatus: 'pending',
    syncError: null as string | null,
    ultimaSyncAt: null as Date | null,
  }
  return withSyncQueue({
    meliConfig: {
      findUnique: vi.fn().mockResolvedValue({
        tenantId: 1,
        sitio: 'MLA',
        activo: true,
        accessTokenEncrypted: encryptFiscalSecret('access-token'),
        refreshTokenEncrypted: encryptFiscalSecret('refresh-token'),
        meliUserId: '999',
      }),
    },
    articulo: {
      findFirst: vi.fn().mockResolvedValue(articuloBase()),
    },
    meliPublicacion: {
      findFirst: vi.fn().mockImplementation(async () => ({ ...pub })),
      upsert: vi.fn().mockResolvedValue(pub),
      update: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
        Object.assign(pub, data)
        return { ...pub }
      }),
      delete: vi.fn().mockResolvedValue(pub),
      findMany: vi.fn().mockResolvedValue([]),
    },
    ...overrides,
  })
}

describe('MeliCatalogService (#184)', () => {
  beforeEach(() => {
    process.env.API_PUBLIC_URL = 'http://localhost:3001'
    clearEcommerceConnectorRegistry()
    resetEcommerceConnectorBootstrap()
    vi.mocked(createMeliItem).mockReset()
    vi.mocked(updateMeliItem).mockReset()
    vi.mocked(fetchMeliCategoryAttributes).mockReset()
    vi.mocked(fetchMeliCategoryAttributes).mockResolvedValue([
      { id: 'ITEM_CONDITION', name: 'Condición', tags: { required: true } },
    ])
  })

  it('rejects publish without photos', async () => {
    const prisma = buildPrisma({
      articulo: {
        findFirst: vi.fn().mockResolvedValue(articuloBase({ imagenes: [] })),
      },
    })
    const svc = new MeliCatalogService(prisma)
    const res = await svc.upsertAndSync(1, 10, { meliCategoryId: 'MLA1234' })
    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.status).toBe(400)
      expect(res.error).toMatch(/photo/i)
    }
  })

  it('creates ML item when mapping is new', async () => {
    vi.mocked(createMeliItem).mockResolvedValue({
      id: 'MLA999',
      status: 'active',
      permalink: 'https://articulo.mercadolibre.com.ar/MLA999',
    })
    const prisma = buildPrisma()
    const svc = new MeliCatalogService(prisma)
    const res = await svc.upsertAndSync(1, 10, {
      meliCategoryId: 'MLA1234',
      atributos: [{ id: 'BRAND', value_name: 'Demo' }],
    })
    expect(res.ok).toBe(true)
    expect(createMeliItem).toHaveBeenCalled()
    if (res.ok) {
      expect(res.data.linked).toBe(true)
      expect(res.data.syncStatus).toBe('synced')
      expect(res.data.meliItemId).toBe('MLA999')
    }
  })

  it('updates and pauses when article is inactive', async () => {
    vi.mocked(updateMeliItem).mockResolvedValue({
      id: 'MLA999',
      status: 'paused',
      permalink: 'https://articulo.mercadolibre.com.ar/MLA999',
    })
    const existing = {
      id: 1,
      tenantId: 1,
      articuloId: 10,
      meliItemId: 'MLA999',
      meliCategoryId: 'MLA1234',
      estado: 'active',
      atributosJson: [{ id: 'ITEM_CONDITION', value_id: '2230280' }],
      permalink: 'https://articulo.mercadolibre.com.ar/MLA999',
      syncStatus: 'synced',
      syncError: null,
      ultimaSyncAt: new Date(),
    }
    const prisma = buildPrisma({
      articulo: {
        findFirst: vi.fn().mockResolvedValue(articuloBase({ activo: false })),
      },
      meliPublicacion: {
        findFirst: vi.fn().mockResolvedValue(existing),
        upsert: vi.fn().mockResolvedValue(existing),
        update: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
          ...existing,
          ...data,
        })),
        delete: vi.fn(),
        findMany: vi.fn().mockResolvedValue([]),
      },
    })
    const svc = new MeliCatalogService(prisma)
    const res = await svc.upsertAndSync(1, 10, { meliCategoryId: 'MLA1234' })
    expect(res.ok).toBe(true)
    expect(updateMeliItem).toHaveBeenCalledWith(
      expect.any(String),
      'MLA999',
      expect.objectContaining({ status: 'paused' }),
    )
  })

  it('maps ML 403 quota errors', async () => {
    vi.mocked(createMeliItem).mockRejectedValue(new MeliApiError(403, 'listing quota limit reached'))
    const prisma = buildPrisma()
    const svc = new MeliCatalogService(prisma)
    const res = await svc.upsertAndSync(1, 10, { meliCategoryId: 'MLA1234' })
    expect(res.ok).toBe(false)
    if (!res.ok) {
      expect(res.status).toBe(403)
      expect(res.error).toMatch(/quota/i)
    }
  })
})
