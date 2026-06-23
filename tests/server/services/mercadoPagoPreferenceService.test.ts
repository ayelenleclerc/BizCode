/**
 * @en MercadoPagoPreferenceService unit tests (#175).
 * @es Tests unitarios MercadoPagoPreferenceService (#175).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { encryptFiscalSecret } from '../../../apps/server/fiscal/ar/fiscalSecrets'
import { MercadoPagoApiError } from '../../../apps/server/integrations/mercadopago/mercadoPagoApiClient'
import { MercadoPagoPreferenceService } from '../../../apps/server/services/MercadoPagoPreferenceService'

vi.mock('../../../apps/server/integrations/mercadopago/mercadoPagoApiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../apps/server/integrations/mercadopago/mercadoPagoApiClient')>()
  return {
    ...actual,
    createMercadoPagoPreference: vi.fn(),
  }
})

import { createMercadoPagoPreference } from '../../../apps/server/integrations/mercadopago/mercadoPagoApiClient'

const baseFactura = {
  id: 7,
  tenantId: 1,
  clienteId: 2,
  fecha: new Date('2026-06-01'),
  tipo: 'A',
  prefijo: '0001',
  numero: 42,
  total: new Decimal('1500.00'),
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
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    factura: {
      findFirst: vi.fn().mockResolvedValue(baseFactura),
      update: vi.fn().mockResolvedValue({
        tipo: 'A',
        prefijo: '0001',
        numero: 42,
        mpPreferenceId: 'pref-123',
        mpPaymentLink: 'https://mp.test/pay',
        mpEstado: 'pending',
        mpPagadoAt: null,
        mpPreferenceExpiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000),
        mpQrData: null,
        mpQrOrderId: null,
        mpQrExpiresAt: null,
      }),
    },
    reciboCobroImputacion: {
      groupBy: vi.fn().mockResolvedValue([]),
    },
    mercadoPagoConfig: {
      findUnique: vi.fn().mockResolvedValue({
        activo: true,
        sandboxMode: true,
        accessTokenEncrypted: encryptFiscalSecret('TEST-token'),
      }),
    },
    tenant: {
      findUnique: vi.fn().mockResolvedValue({ slug: 'demo' }),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('MercadoPagoPreferenceService', () => {
  beforeEach(() => {
    vi.mocked(createMercadoPagoPreference).mockReset()
    vi.mocked(createMercadoPagoPreference).mockResolvedValue({
      id: 'pref-123',
      init_point: 'https://mp.test/prod',
      sandbox_init_point: 'https://mp.test/pay',
    })
  })

  it('getStatus returns none when no mp fields', async () => {
    const service = new MercadoPagoPreferenceService(buildPrismaMock())
    const result = await service.getStatus(1, 7)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.estado).toBe('none')
      expect(result.data.amount).toBe('1500.00')
    }
  })

  it('getStatus returns expired for pending preference past expiry', async () => {
    const prisma = buildPrismaMock({
      factura: {
        findFirst: vi.fn().mockResolvedValue({
          ...baseFactura,
          mpEstado: 'pending',
          mpPreferenceExpiresAt: new Date('2020-01-01'),
          mpPaymentLink: 'https://mp.test/old',
        }),
      },
    })
    const service = new MercadoPagoPreferenceService(prisma)
    const result = await service.getStatus(1, 7)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.estado).toBe('expired')
      expect(result.data.paymentLink).toBeUndefined()
    }
  })

  it('createPreference rejects active pending preference', async () => {
    const prisma = buildPrismaMock({
      factura: {
        findFirst: vi.fn().mockResolvedValue({
          ...baseFactura,
          mpEstado: 'pending',
          mpPreferenceId: 'pref-active',
          mpPreferenceExpiresAt: new Date(Date.now() + 60_000),
        }),
        update: vi.fn(),
      },
    })
    const service = new MercadoPagoPreferenceService(prisma)
    const result = await service.createPreference(1, 7)
    expect(result).toEqual({ ok: false, status: 409, error: 'MP_PREFERENCE_ALREADY_ACTIVE' })
    expect(createMercadoPagoPreference).not.toHaveBeenCalled()
  })

  it('createPreference rejects fully paid invoice', async () => {
    const prisma = buildPrismaMock({
      reciboCobroImputacion: {
        groupBy: vi.fn().mockResolvedValue([{ facturaId: 7, _sum: { importe: new Decimal('1500.00') } }]),
      },
    })
    const service = new MercadoPagoPreferenceService(prisma)
    const result = await service.createPreference(1, 7)
    expect(result).toEqual({ ok: false, status: 422, error: 'FACTURA_ALREADY_PAID' })
  })

  it('createPreference rejects approved mp state', async () => {
    const prisma = buildPrismaMock({
      factura: {
        findFirst: vi.fn().mockResolvedValue({ ...baseFactura, mpEstado: 'approved' }),
        update: vi.fn(),
      },
    })
    const service = new MercadoPagoPreferenceService(prisma)
    const result = await service.createPreference(1, 7)
    expect(result).toEqual({ ok: false, status: 422, error: 'FACTURA_ALREADY_PAID_MP' })
  })

  it('createPreference persists preference and returns pending status', async () => {
    const prisma = buildPrismaMock()
    const service = new MercadoPagoPreferenceService(prisma)
    const result = await service.createPreference(1, 7)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.estado).toBe('pending')
      expect(result.data.preferenceId).toBe('pref-123')
      expect(result.data.paymentLink).toBe('https://mp.test/pay')
    }
    expect(createMercadoPagoPreference).toHaveBeenCalledOnce()
    expect(prisma.factura.update).toHaveBeenCalled()
  })

  it('createPreference maps MercadoPagoApiError to 422', async () => {
    vi.mocked(createMercadoPagoPreference).mockRejectedValue(new MercadoPagoApiError(401, 'Invalid Mercado Pago credentials'))
    const service = new MercadoPagoPreferenceService(buildPrismaMock())
    const result = await service.createPreference(1, 7)
    expect(result).toEqual({ ok: false, status: 422, error: 'Invalid Mercado Pago credentials' })
  })
})
