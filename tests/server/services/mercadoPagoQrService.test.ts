/**
 * @en Unit tests for Mercado Pago QR service (#177).
 * @es Tests unitarios del servicio QR Mercado Pago (#177).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { encryptFiscalSecret } from '../../../server/fiscal/ar/fiscalSecrets'

vi.mock('../../../server/integrations/mercadopago/mercadoPagoApiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../server/integrations/mercadopago/mercadoPagoApiClient')>()
  return {
    ...actual,
    createMercadoPagoInstoreQr: vi.fn(),
    fetchMercadoPagoUserMe: vi.fn(),
  }
})

vi.mock('../../../server/lib/mercadopagoQrImage', () => ({
  mercadoPagoQrPayloadToBase64: vi.fn().mockResolvedValue('base64png'),
}))

import {
  createMercadoPagoInstoreQr,
  fetchMercadoPagoUserMe,
} from '../../../server/integrations/mercadopago/mercadoPagoApiClient'
import { MercadoPagoQrService } from '../../../server/services/MercadoPagoQrService'

const futureQrExpiry = new Date(Date.now() + 10 * 60 * 1000)

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    reciboCobroImputacion: {
      groupBy: vi.fn().mockResolvedValue([]),
    },
    tenant: {
      findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo' }),
    },
    mercadoPagoConfig: {
      findUnique: vi.fn().mockResolvedValue({
        activo: true,
        accessTokenEncrypted: encryptFiscalSecret('TEST-access-token'),
        collectorId: '12345',
        externalPosId: 'pos-demo',
        staticQrData: '000201010212',
      }),
      update: vi.fn().mockResolvedValue({}),
    },
    factura: {
      findFirst: vi.fn().mockResolvedValue({
        id: 7,
        tenantId: 1,
        clienteId: 2,
        tipo: 'A',
        prefijo: '0001',
        numero: 42,
        total: new Decimal('1500.00'),
        estado: 'A',
        mpEstado: null,
        mpPreferenceId: null,
        mpPreferenceExpiresAt: null,
        mpQrData: null,
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

describe('MercadoPagoQrService', () => {
  beforeEach(() => {
    vi.mocked(createMercadoPagoInstoreQr).mockReset()
    vi.mocked(fetchMercadoPagoUserMe).mockReset()
    vi.mocked(createMercadoPagoInstoreQr).mockResolvedValue({
      qr_data: '000201010212',
      in_store_order_id: 'order-1',
    })
  })

  it('creates dynamic QR for invoice', async () => {
    const service = new MercadoPagoQrService(buildPrisma())
    const result = await service.createDynamicQr(1, 7)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.channel).toBe('qr')
      expect(result.data.qrData).toBe('000201010212')
      expect(result.data.qrImageBase64).toBe('base64png')
    }
    expect(createMercadoPagoInstoreQr).toHaveBeenCalledOnce()
  })

  it('returns 409 when active preference exists', async () => {
    const service = new MercadoPagoQrService(
      buildPrisma({
        factura: {
          findFirst: vi.fn().mockResolvedValue({
            id: 7,
            tenantId: 1,
            clienteId: 2,
            tipo: 'A',
            prefijo: '0001',
            numero: 42,
            total: new Decimal('1500.00'),
            estado: 'A',
            mpEstado: 'pending',
            mpPreferenceId: 'pref-old',
            mpPreferenceExpiresAt: futureQrExpiry,
            mpQrData: null,
            mpQrExpiresAt: null,
            cliente: { rsocial: 'ACME SA' },
          }),
          update: vi.fn(),
        },
      }),
    )
    const result = await service.createDynamicQr(1, 7)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(409)
      expect(result.error).toBe('MP_PREFERENCE_ALREADY_ACTIVE')
    }
  })

  it('returns static QR when configured', async () => {
    const service = new MercadoPagoQrService(buildPrisma())
    const result = await service.getStaticQr(1)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.qrData).toBe('000201010212')
      expect(result.data.qrImageBase64).toBe('base64png')
    }
  })

  it('returns 404 when static QR not configured', async () => {
    const service = new MercadoPagoQrService(
      buildPrisma({
        mercadoPagoConfig: {
          findUnique: vi.fn().mockResolvedValue({
            activo: true,
            staticQrData: null,
          }),
          update: vi.fn(),
        },
      }),
    )
    const result = await service.getStaticQr(1)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('MP_STATIC_QR_NOT_CONFIGURED')
    }
  })
})
