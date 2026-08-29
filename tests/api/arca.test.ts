/**
 * @en AFIP config / CAE API tests (homologación mock).
 * @es Tests API AFIP config / CAE (mock homologación).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { encryptFiscalSecret } from '../../apps/server/fiscal/ar/fiscalSecrets'
import {
  PADRON_MOCK_KNOWN_CUIT,
  PADRON_MOCK_NOT_FOUND_CUIT,
  PADRON_MOCK_TIMEOUT_CUIT,
} from '../../apps/server/fiscal/ar/arcaPadronMock'
import { assertMatchesOpenApi } from './validate-openapi-response'

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  const padronCacheStore = new Map<string, Record<string, unknown>>()
  return {
    deliveryZone: { findMany: vi.fn().mockResolvedValue([]) },
    cliente: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue({ id: 9, total: 100, tipo: 'B' }),
      update: vi.fn().mockResolvedValue({}),
    },
    tenantFiscalConfig: {
      findUnique: vi.fn().mockResolvedValue({
        id: 1,
        cuit: '20123456789',
        ambiente: 'homologacion',
        certEncrypted: encryptFiscalSecret('cert'),
        keyEncrypted: encryptFiscalSecret('key'),
      }),
      upsert: vi.fn().mockResolvedValue({ id: 1 }),
    },
    tenantConfig: {
      findUnique: vi.fn().mockResolvedValue({ jurisdiccionFiscal: 'AR' }),
    },
    fiscalProviderConfig: {
      findUnique: vi.fn().mockResolvedValue(null),
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([]),
      upsert: vi.fn().mockResolvedValue({ id: 1, isDefault: true, configVersion: 1 }),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    fiscalDocument: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 1, ...data })),
      update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 1, ...data })),
    },
    padronA4Cache: {
      findUnique: vi.fn(async ({ where }: { where: { tenantId_cuit: { tenantId: number; cuit: string } } }) => {
        const key = `${where.tenantId_cuit.tenantId}:${where.tenantId_cuit.cuit}`
        return padronCacheStore.get(key) ?? null
      }),
      upsert: vi.fn(
        async ({
          where,
          create,
        }: {
          where: { tenantId_cuit: { tenantId: number; cuit: string } }
          create: Record<string, unknown>
        }) => {
          const key = `${where.tenantId_cuit.tenantId}:${where.tenantId_cuit.cuit}`
          padronCacheStore.set(key, { ...create })
          return create
        },
      ),
    },
    paramEmpresa: { findUnique: vi.fn().mockResolvedValue({ nombre: 'Demo', cuit: '30123456789', domicilio: '' }) },
    auditEvent: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', active: true }) },
    appUser: { count: vi.fn().mockResolvedValue(1) },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('ARCA API', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })

  it('GET /api/arca/config returns metadata without secrets', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/arca/config').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.configured).toBe(true)
    expect(res.body.data.cuit).toBe('20123456789')
    expect(res.body.data).not.toHaveProperty('certificate')
    expect(res.body.data).not.toHaveProperty('privateKey')
    expect(JSON.stringify(res.body)).not.toMatch(/BEGIN CERTIFICATE/)
  })

  it('PUT /api/arca/config does not echo certificate in response', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .put('/api/arca/config')
      .send({
        cuit: '20123456789',
        certificate: '-----BEGIN CERTIFICATE-----\nMOCK\n-----END CERTIFICATE-----',
        privateKey: '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----',
      })
      .expect(200)
    expect(res.body.data.configured).toBe(true)
    expect(JSON.stringify(res.body)).not.toMatch(/BEGIN CERTIFICATE/)
  })

  it('POST /api/arca/cae issues mock CAE', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/arca/cae').send({ facturaId: 9 }).expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.cae).toMatch(/^\d{14}$/)
    expect(res.body.data.caeVto).toBeTruthy()
  })

  describe('GET /api/arca/padron/:cuit (#192)', () => {
    it('returns verificado true for the known homologación CUIT and matches OpenAPI', async () => {
      const app = createApp(buildPrismaMock())
      const res = await request(app).get(`/api/arca/padron/${PADRON_MOCK_KNOWN_CUIT}`).expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.verificado).toBe(true)
      expect(res.body.data.reason).toBe('ok')
      expect(res.body.data.fromCache).toBe(false)
      expect(res.body.data.condIva).toBe('RI')
      expect(res.body.data.razonSocialTruncadaFlag).toBe(true)
      await assertMatchesOpenApi('/api/arca/padron/{cuit}', 'get', '200', res.body)
    })

    it('returns fromCache=true on the second request for the same CUIT', async () => {
      const app = createApp(buildPrismaMock())
      await request(app).get(`/api/arca/padron/${PADRON_MOCK_KNOWN_CUIT}`).expect(200)
      const res = await request(app).get(`/api/arca/padron/${PADRON_MOCK_KNOWN_CUIT}`).expect(200)

      expect(res.body.data.fromCache).toBe(true)
      expect(res.body.data.verificado).toBe(true)
      await assertMatchesOpenApi('/api/arca/padron/{cuit}', 'get', '200', res.body)
    })

    it('returns not_found for a CUIT absent from the padrón', async () => {
      const app = createApp(buildPrismaMock())
      const res = await request(app).get(`/api/arca/padron/${PADRON_MOCK_NOT_FOUND_CUIT}`).expect(200)

      expect(res.body.data.verificado).toBe(false)
      expect(res.body.data.available).toBe(true)
      expect(res.body.data.reason).toBe('not_found')
      await assertMatchesOpenApi('/api/arca/padron/{cuit}', 'get', '200', res.body)
    })

    it('returns timeout (unavailable) for the timeout fixture', async () => {
      const app = createApp(buildPrismaMock())
      const res = await request(app).get(`/api/arca/padron/${PADRON_MOCK_TIMEOUT_CUIT}`).expect(200)

      expect(res.body.data.verificado).toBe(false)
      expect(res.body.data.available).toBe(false)
      expect(res.body.data.reason).toBe('timeout')
      await assertMatchesOpenApi('/api/arca/padron/{cuit}', 'get', '200', res.body)
    })

    it('returns invalid_cuit for a malformed CUIT', async () => {
      const app = createApp(buildPrismaMock())
      const res = await request(app).get('/api/arca/padron/123').expect(200)

      expect(res.body.data.verificado).toBe(false)
      expect(res.body.data.reason).toBe('invalid_cuit')
      await assertMatchesOpenApi('/api/arca/padron/{cuit}', 'get', '200', res.body)
    })

    it('degrades to unavailable when the tenant has no fiscal config', async () => {
      const app = createApp(buildPrismaMock({ tenantFiscalConfig: { findUnique: vi.fn().mockResolvedValue(null) } }))
      const res = await request(app).get(`/api/arca/padron/${PADRON_MOCK_KNOWN_CUIT}`).expect(200)

      expect(res.body.data.verificado).toBe(false)
      expect(res.body.data.reason).toBe('unavailable')
      await assertMatchesOpenApi('/api/arca/padron/{cuit}', 'get', '200', res.body)
    })

    it('degrades to unavailable when billing.arca_cae module is disabled', async () => {
      process.env.BIZCODE_TEST_MODULES = 'core.auth'
      const app = createApp(buildPrismaMock())
      const res = await request(app).get(`/api/arca/padron/${PADRON_MOCK_KNOWN_CUIT}`).expect(200)

      expect(res.body.data.verificado).toBe(false)
      expect(res.body.data.reason).toBe('unavailable')
      await assertMatchesOpenApi('/api/arca/padron/{cuit}', 'get', '200', res.body)
      delete process.env.BIZCODE_TEST_MODULES
    })

    it('requires customers.manage permission', async () => {
      process.env.BIZCODE_TEST_ROLE = 'driver'
      const app = createApp(buildPrismaMock())
      await request(app).get(`/api/arca/padron/${PADRON_MOCK_KNOWN_CUIT}`).expect(403)
      process.env.BIZCODE_TEST_ROLE = 'owner'
    })
  })
})
