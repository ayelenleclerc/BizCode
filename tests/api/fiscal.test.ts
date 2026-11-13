/**
 * @en Multi-organism fiscal e-invoicing API tests (#378/#210/#207/#208/#211): provider config,
 *   capabilities, validation, and document authorization. Homologación mocks: `arca_wsfe`,
 *   `mexico_sat_pac`, `uruguay_dgi`, `chile_sii`, `brazil_sefaz_nfe`. Live AFIP/DGI/SII/PAC/SEFAZ remain Not evidenced.
 * @es Tests API de facturación electrónica multi-organismo (#378/#210/#207/#208/#211): config,
 *   capacidades, validación y autorización. Mocks de homologación: `arca_wsfe`, `mexico_sat_pac`,
 *   `uruguay_dgi`, `chile_sii`, `brazil_sefaz_nfe`. AFIP/DGI/SII/PAC/SEFAZ live siguen sin evidenciarse.
 * @pt-BR Testes da API fiscal multi-organismo (#378/#210/#207/#208/#211): config, capacidades,
 *   validação e autorização. Mocks de homologação: `arca_wsfe`, `mexico_sat_pac`, `uruguay_dgi`,
 *   `chile_sii`, `brazil_sefaz_nfe`. AFIP/DGI/SII/PAC/SEFAZ live permanecem não evidenciados.
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

  it('GET /api/fiscal/providers/capabilities lists all five providers as implemented mocks', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/fiscal/providers/capabilities').expect(200)

    expect(res.body.success).toBe(true)
    const byProvider = new Map(
      (res.body.data as Array<{ provider: string; implemented: boolean }>).map((c) => [c.provider, c]),
    )
    expect(byProvider.get('arca_wsfe')?.implemented).toBe(true)
    expect(byProvider.get('uruguay_dgi')?.implemented).toBe(true)
    expect(byProvider.get('mexico_sat_pac')?.implemented).toBe(true)
    expect(byProvider.get('chile_sii')?.implemented).toBe(true)
    expect(byProvider.get('brazil_sefaz_nfe')?.implemented).toBe(true)
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

  it('PUT /api/fiscal/providers/config requires RUT for chile_sii', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .put('/api/fiscal/providers/config')
      .send({ provider: 'chile_sii' })
      .expect(400)

    expect(res.body.success).toBe(false)
    expect(res.body.error).toBe('RUT_REQUIRED')
    await assertMatchesOpenApi('/api/fiscal/providers/config', 'put', '400', res.body)
  })

  it('PUT /api/fiscal/providers/config upserts chile_sii mock RUT', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .put('/api/fiscal/providers/config')
      .send({ provider: 'chile_sii', rut: '12.345.678-5', ambiente: 'homologacion' })
      .expect(200)

    expect(res.body.data.configured).toBe(true)
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
    const res = await request(app).post('/api/fiscal/documents/not-a-number/authorize').expect(400)
    await assertMatchesOpenApi('/api/fiscal/documents/{facturaId}/authorize', 'post', '400', res.body)
  })

  it('requires settings.fiscal.manage permission for provider config endpoints', async () => {
    process.env.BIZCODE_TEST_ROLE = 'driver'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/fiscal/providers/config').expect(403)
    await assertMatchesOpenApi('/api/fiscal/providers/config', 'get', '403', res.body)
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })
})
