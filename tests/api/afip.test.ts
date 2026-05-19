/**
 * @en AFIP config / CAE API tests (homologación mock).
 * @es Tests API AFIP config / CAE (mock homologación).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../server/createApp'
import { encryptFiscalSecret } from '../../server/fiscal/ar/fiscalSecrets'

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

describe('AFIP API', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
  })

  it('GET /api/afip/config returns metadata without secrets', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/afip/config').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.configured).toBe(true)
    expect(res.body.data.cuit).toBe('20123456789')
    expect(res.body.data).not.toHaveProperty('certificate')
    expect(res.body.data).not.toHaveProperty('privateKey')
    expect(JSON.stringify(res.body)).not.toMatch(/BEGIN CERTIFICATE/)
  })

  it('PUT /api/afip/config does not echo certificate in response', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .put('/api/afip/config')
      .send({
        cuit: '20123456789',
        certificate: '-----BEGIN CERTIFICATE-----\nMOCK\n-----END CERTIFICATE-----',
        privateKey: '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----',
      })
      .expect(200)
    expect(res.body.data.configured).toBe(true)
    expect(JSON.stringify(res.body)).not.toMatch(/BEGIN CERTIFICATE/)
  })

  it('POST /api/afip/cae issues mock CAE', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/afip/cae').send({ facturaId: 9 }).expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.cae).toMatch(/^\d{14}$/)
    expect(res.body.data.caeVto).toBeTruthy()
  })
})
