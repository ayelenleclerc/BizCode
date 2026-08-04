/**
 * @en Mercado Libre catalog API tests with mocked ML client (#184/#189).
 * @es Tests API de catálogo Mercado Libre con cliente ML mockeado (#184/#189).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { encryptFiscalSecret } from '../../apps/server/fiscal/ar/fiscalSecrets'
import { clearTenantFeaturesCache } from '../../apps/server/services/tenantConfigCache'
import {
  clearEcommerceConnectorRegistry,
} from '../../apps/server/integrations/ecommerce/connectorRegistry'
import { resetEcommerceConnectorBootstrap } from '../../apps/server/integrations/ecommerce/bootstrapEcommerceConnectors'

vi.mock('../../apps/server/integrations/meli/meliItemsClient', () => ({
  createMeliItem: vi.fn(),
  updateMeliItem: vi.fn(),
  searchMeliCategories: vi.fn(),
  fetchMeliCategoryAttributes: vi.fn(),
}))

import {
  createMeliItem,
  fetchMeliCategoryAttributes,
  searchMeliCategories,
} from '../../apps/server/integrations/meli/meliItemsClient'

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

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  const pub: Record<string, unknown> = {
    id: 1,
    tenantId: 1,
    articuloId: 10,
    meliItemId: null as string | null,
    meliCategoryId: 'MLA1055',
    estado: 'pending',
    atributosJson: null,
    permalink: null as string | null,
    syncStatus: 'pending',
    syncError: null as string | null,
    ultimaSyncAt: null as Date | null,
  }

  return withSyncQueue({
    deliveryZone: { findMany: vi.fn().mockResolvedValue([]) },
    cliente: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    articulo: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue({
        id: 10,
        tenantId: 1,
        codigo: 100,
        descripcion: 'Producto demo',
        precioLista1: 100,
        stock: 2,
        monedaPrecio: 'ARS',
        activo: true,
        esPadre: false,
        tipo: 'articulo',
        imagenes: [{ id: 1, pathOriginal: 't1/a10/o.jpg', orden: 0, esPrincipal: true }],
        meliPublicacion: null,
      }),
    },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    tenantFiscalConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    paramEmpresa: { findUnique: vi.fn().mockResolvedValue({ nombre: 'Demo', cuit: '30123456789', domicilio: '' }) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    appUser: { count: vi.fn().mockResolvedValue(1) },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    tenantConfig: {
      findUnique: vi.fn().mockResolvedValue({
        tenantId: 1,
        businessType: 'mayorista',
        rubros: [],
        plan: 'pro',
        modules: [],
        integrations: ['meli'],
        updatedAt: new Date(),
      }),
    },
    meliConfig: {
      findUnique: vi.fn().mockResolvedValue({
        tenantId: 1,
        sitio: 'MLA',
        activo: true,
        accessTokenEncrypted: encryptFiscalSecret('access'),
        refreshTokenEncrypted: encryptFiscalSecret('refresh'),
        meliUserId: '1',
      }),
    },
    meliPublicacion: {
      findFirst: vi.fn().mockImplementation(async () => ({ ...pub })),
      upsert: vi.fn().mockImplementation(async ({ create, update }: { create: Record<string, unknown>; update: Record<string, unknown> }) => {
        Object.assign(pub, create, update)
        return { ...pub }
      }),
      update: vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
        Object.assign(pub, data)
        return { ...pub }
      }),
      delete: vi.fn().mockResolvedValue({}),
      findMany: vi.fn().mockResolvedValue([]),
    },
    ...overrides,
  })
}

describe('Mercado Libre catalog API (#184)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-meli-catalog'
    process.env.API_PUBLIC_URL = 'http://localhost:3001'
    clearTenantFeaturesCache()
    clearEcommerceConnectorRegistry()
    resetEcommerceConnectorBootstrap()
    vi.mocked(createMeliItem).mockReset()
    vi.mocked(searchMeliCategories).mockReset()
    vi.mocked(fetchMeliCategoryAttributes).mockReset()
    vi.mocked(fetchMeliCategoryAttributes).mockResolvedValue([
      { id: 'ITEM_CONDITION', name: 'Condición', tags: { required: true } },
    ])
  })

  it('GET /api/articulos/:id/meli returns unlinked status with photo warning', async () => {
    const prisma = buildPrismaMock({
      articulo: {
        findMany: vi.fn().mockResolvedValue([]),
        findFirst: vi.fn().mockResolvedValue({
          id: 10,
          tenantId: 1,
          imagenes: [],
          meliPublicacion: null,
        }),
      },
    })
    const app = createApp(prisma)
    const res = await request(app).get('/api/articulos/10/meli').expect(200)
    expect(res.body.data.linked).toBe(false)
    expect(res.body.data.photoWarning).toBe(true)
  })

  it('PUT /api/articulos/:id/meli creates listing', async () => {
    vi.mocked(createMeliItem).mockResolvedValue({
      id: 'MLA111',
      status: 'active',
      permalink: 'https://articulo.mercadolibre.com.ar/MLA111',
    })
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .put('/api/articulos/10/meli')
      .send({ meliCategoryId: 'MLA1055', atributos: [{ id: 'BRAND', value_name: 'Demo' }] })
      .expect(200)
    expect(res.body.data.linked).toBe(true)
    expect(res.body.data.meliItemId).toBe('MLA111')
    expect(createMeliItem).toHaveBeenCalled()
  })

  it('GET /api/meli/categories/search proxies ML', async () => {
    vi.mocked(searchMeliCategories).mockResolvedValue([
      { category_id: 'MLA1055', category_name: 'Otros' },
    ])
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/meli/categories/search').query({ q: 'cable' }).expect(200)
    expect(res.body.data).toEqual([{ category_id: 'MLA1055', category_name: 'Otros' }])
  })
})
