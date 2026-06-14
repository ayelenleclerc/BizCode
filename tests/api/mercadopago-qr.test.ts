/**
 * @en Mercado Pago instore QR API tests (#177).
 * @es Tests API QR instore Mercado Pago (#177).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../server/createApp'
import { encryptFiscalSecret } from '../../server/fiscal/ar/fiscalSecrets'
import { clearTenantFeaturesCache } from '../../server/services/tenantConfigCache'

vi.mock('../../server/integrations/mercadopago/mercadoPagoApiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../server/integrations/mercadopago/mercadoPagoApiClient')>()
  return {
    ...actual,
    createMercadoPagoInstoreQr: vi.fn(),
  }
})

vi.mock('../../server/lib/mercadopagoQrImage', () => ({
  mercadoPagoQrPayloadToBase64: vi.fn().mockResolvedValue('base64png'),
}))

import { createMercadoPagoInstoreQr } from '../../server/integrations/mercadopago/mercadoPagoApiClient'

const futureQrExpiry = new Date(Date.now() + 10 * 60 * 1000)

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    deliveryZone: { findMany: vi.fn().mockResolvedValue([]) },
    cliente: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn().mockResolvedValue(null) },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
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
        integrations: ['mercadopago'],
        updatedAt: new Date(),
      }),
    },
    mercadoPagoConfig: {
      findUnique: vi.fn().mockResolvedValue({
        publicKey: 'APP_USR-public',
        sandboxMode: true,
        activo: true,
        accessTokenLast4: '5678',
        webhookSecretEncrypted: encryptFiscalSecret('whsec'),
        accessTokenEncrypted: encryptFiscalSecret('TEST-access-token-5678'),
        collectorId: '12345',
        externalPosId: 'pos-demo',
        staticQrData: '000201010212',
      }),
      update: vi.fn().mockResolvedValue({}),
    },
    reciboCobroImputacion: {
      groupBy: vi.fn().mockResolvedValue([]),
    },
    factura: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue({
        id: 7,
        tenantId: 1,
        clienteId: 2,
        tipo: 'A',
        prefijo: '0001',
        numero: 42,
        total: new Decimal('2500.00'),
        estado: 'A',
        mpPreferenceId: null,
        mpPaymentLink: null,
        mpEstado: null,
        mpPagadoAt: null,
        mpPreferenceExpiresAt: null,
        mpQrData: null,
        mpQrOrderId: null,
        mpQrExpiresAt: null,
        cliente: { rsocial: 'ACME SA' },
      }),
      update: vi.fn().mockResolvedValue({
        tipo: 'A',
        prefijo: '0001',
        numero: 42,
        mpPreferenceId: null,
        mpPaymentLink: null,
        mpEstado: 'pending',
        mpPagadoAt: null,
        mpPreferenceExpiresAt: null,
        mpQrData: '000201010212',
        mpQrOrderId: 'order-1',
        mpQrExpiresAt: futureQrExpiry,
      }),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('Mercado Pago instore QR API', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    clearTenantFeaturesCache()
    vi.mocked(createMercadoPagoInstoreQr).mockReset()
    vi.mocked(createMercadoPagoInstoreQr).mockResolvedValue({
      qr_data: '000201010212',
      in_store_order_id: 'order-1',
    })
  })

  it('POST /api/facturas/:id/mp/qr creates dynamic QR', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/facturas/7/mp/qr').expect(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.channel).toBe('qr')
    expect(res.body.data.qrData).toBe('000201010212')
    expect(createMercadoPagoInstoreQr).toHaveBeenCalledOnce()
  })

  it('POST /api/facturas/:id/mp/qr returns 409 when active QR exists', async () => {
    const app = createApp(
      buildPrismaMock({
        factura: {
          findMany: vi.fn().mockResolvedValue([]),
          findFirst: vi.fn().mockResolvedValue({
            id: 7,
            tenantId: 1,
            clienteId: 2,
            tipo: 'A',
            prefijo: '0001',
            numero: 42,
            total: new Decimal('2500.00'),
            estado: 'A',
            mpEstado: 'pending',
            mpQrData: '000201',
            mpQrExpiresAt: futureQrExpiry,
            mpPreferenceId: null,
            mpPreferenceExpiresAt: null,
            mpPaymentLink: null,
            mpPagadoAt: null,
            mpQrOrderId: 'order-old',
            cliente: { rsocial: 'ACME SA' },
          }),
          update: vi.fn(),
        },
      }),
    )
    const res = await request(app).post('/api/facturas/7/mp/qr').expect(409)
    expect(res.body.error).toBe('MP_QR_ALREADY_ACTIVE')
  })

  it('GET /api/configuracion/mercadopago/qr-estatico returns static QR', async () => {
    process.env.BIZCODE_TEST_ROLE = 'owner'
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/configuracion/mercadopago/qr-estatico').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.qrData).toBe('000201010212')
    expect(res.body.data.qrImageBase64).toBe('base64png')
  })

  it('GET /api/facturas/:id/mp includes QR fields when active', async () => {
    const app = createApp(
      buildPrismaMock({
        factura: {
          findMany: vi.fn().mockResolvedValue([]),
          findFirst: vi.fn().mockResolvedValue({
            id: 7,
            tenantId: 1,
            clienteId: 2,
            tipo: 'A',
            prefijo: '0001',
            numero: 42,
            total: new Decimal('2500.00'),
            estado: 'A',
            mpEstado: 'pending',
            mpQrData: '000201010212',
            mpQrOrderId: 'order-1',
            mpQrExpiresAt: futureQrExpiry,
            mpPreferenceId: null,
            mpPaymentLink: null,
            mpPagadoAt: null,
            mpPreferenceExpiresAt: null,
          }),
          update: vi.fn(),
        },
      }),
    )
    const res = await request(app).get('/api/facturas/7/mp').expect(200)
    expect(res.body.data.channel).toBe('qr')
    expect(res.body.data.qrData).toBe('000201010212')
  })

  it('POST /api/facturas/:id/mp/preference returns 409 when active QR exists', async () => {
    const app = createApp(
      buildPrismaMock({
        factura: {
          findMany: vi.fn().mockResolvedValue([]),
          findFirst: vi.fn().mockResolvedValue({
            id: 7,
            tenantId: 1,
            clienteId: 2,
            tipo: 'A',
            prefijo: '0001',
            numero: 42,
            total: new Decimal('2500.00'),
            estado: 'A',
            mpEstado: 'pending',
            mpQrData: '000201',
            mpQrExpiresAt: futureQrExpiry,
            mpQrOrderId: 'order-old',
            mpPreferenceId: null,
            mpPreferenceExpiresAt: null,
            mpPaymentLink: null,
            mpPagadoAt: null,
            cliente: { rsocial: 'ACME SA' },
          }),
          update: vi.fn(),
        },
      }),
    )
    const res = await request(app).post('/api/facturas/7/mp/preference').expect(409)
    expect(res.body.error).toBe('MP_QR_ALREADY_ACTIVE')
  })
})
