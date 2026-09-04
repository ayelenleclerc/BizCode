/**
 * @en Multi-organism fiscal e-invoicing API tests (#378/#210/#207): provider config,
 *   capabilities, validation, and document authorization. `arca_wsfe`, `mexico_sat_pac` and
 *   `uruguay_dgi` are evidenced as homologación mocks; `chile_sii` remains capability-only.
 * @es Tests API de facturación electrónica multi-organismo (#378/#210/#207): config,
 *   capacidades, validación y autorización. `arca_wsfe`, `mexico_sat_pac` y `uruguay_dgi` están
 *   evidenciados como mocks de homologación; `chile_sii` solo capacidades.
 * @pt-BR Testes da API fiscal multi-organismo (#378/#210/#207): config, capacidades,
 *   validação e autorização. `arca_wsfe`, `mexico_sat_pac` e `uruguay_dgi` são mocks de homologação;
 *   `chile_sii` apenas capacidades.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { encryptFiscalSecret } from '../../apps/server/fiscal/ar/fiscalSecrets'
import { assertMatchesOpenApi } from './validate-openapi-response'

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
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
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 1, attemptCount: 1, ...data })),
      update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 1, attemptCount: 1, ...data })),
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

describe('Fiscal multi-organism API (#378)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })

  it('GET /api/fiscal/providers/capabilities lists arca_wsfe, mexico_sat_pac and uruguay_dgi as implemented mocks', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/fiscal/providers/capabilities').expect(200)

    expect(res.body.success).toBe(true)
    const byProvider = new Map(
      (res.body.data as Array<{ provider: string; implemented: boolean }>).map((c) => [c.provider, c]),
    )
    expect(byProvider.get('arca_wsfe')?.implemented).toBe(true)
    expect(byProvider.get('uruguay_dgi')?.implemented).toBe(true)
    expect(byProvider.get('mexico_sat_pac')?.implemented).toBe(true)
    expect(byProvider.get('chile_sii')?.implemented).toBe(false)
    await assertMatchesOpenApi('/api/fiscal/providers/capabilities', 'get', '200', res.body)
  })

  it('GET /api/fiscal/providers/config falls back to legacy TenantFiscalConfig for arca_wsfe', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/fiscal/providers/config').expect(200)

    expect(res.body.success).toBe(true)
    const arca = (res.body.data as Array<{ provider: string; configured: boolean; taxIdentifier?: string }>).find(
      (p) => p.provider === 'arca_wsfe',
    )
    expect(arca?.configured).toBe(true)
    expect(arca?.taxIdentifier).toBe('20123456789')
    expect(JSON.stringify(res.body)).not.toMatch(/BEGIN CERTIFICATE/)
    await assertMatchesOpenApi('/api/fiscal/providers/config', 'get', '200', res.body)
  })

  it('PUT /api/fiscal/providers/config upserts arca_wsfe credentials without echoing secrets', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .put('/api/fiscal/providers/config')
      .send({
        provider: 'arca_wsfe',
        cuit: '20123456789',
        certificate: '-----BEGIN CERTIFICATE-----\nMOCK\n-----END CERTIFICATE-----',
        privateKey: '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----',
      })
      .expect(200)

    expect(res.body.data.configured).toBe(true)
    expect(JSON.stringify(res.body)).not.toMatch(/BEGIN CERTIFICATE/)
  })

  it('PUT /api/fiscal/providers/config rejects unimplemented providers with 501', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .put('/api/fiscal/providers/config')
      .send({ provider: 'chile_sii' })
      .expect(501)

    expect(res.body.success).toBe(false)
    expect(res.body.error).toBe('FISCAL_PROVIDER_NOT_IMPLEMENTED')
  })

  it('POST /api/fiscal/providers/validate reports arca_wsfe as configured', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/fiscal/providers/validate')
      .send({ provider: 'arca_wsfe' })
      .expect(200)

    expect(res.body.success).toBe(true)
    expect(res.body.data.configured).toBe(true)
    await assertMatchesOpenApi('/api/fiscal/providers/validate', 'post', '200', res.body)
  })

  it('POST /api/fiscal/documents/:facturaId/authorize issues a mock CAE via the ARCA adapter', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/fiscal/documents/9/authorize').expect(200)

    expect(res.body.success).toBe(true)
    expect(res.body.data.provider).toBe('arca_wsfe')
    expect(res.body.data.status).toBe('authorized')
    expect(res.body.data.authorizationCode).toMatch(/^\d{14}$/)
    await assertMatchesOpenApi('/api/fiscal/documents/{facturaId}/authorize', 'post', '200', res.body)
  })

  it('POST /api/fiscal/documents/:facturaId/authorize rejects an invalid facturaId', async () => {
    const app = createApp(buildPrismaMock())
    await request(app).post('/api/fiscal/documents/not-a-number/authorize').expect(400)
  })

  it('requires settings.fiscal.manage permission for provider config endpoints', async () => {
    process.env.BIZCODE_TEST_ROLE = 'driver'
    const app = createApp(buildPrismaMock())
    await request(app).get('/api/fiscal/providers/config').expect(403)
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })
})
