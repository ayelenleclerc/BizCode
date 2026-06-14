/**
 * @en Unit tests for Mercado Pago refund service (#179).
 * @es Tests unitarios del servicio de reembolso Mercado Pago (#179).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { encryptFiscalSecret } from '../../../server/fiscal/ar/fiscalSecrets'

vi.mock('../../../server/integrations/mercadopago/mercadoPagoApiClient', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('../../../server/integrations/mercadopago/mercadoPagoApiClient')
  >()
  return {
    ...actual,
    createMercadoPagoRefund: vi.fn(),
  }
})

const voidReciboMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ ok: true, data: { id: 50, estado: 'anulado' } }),
)

const voidFacturaMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    ok: true,
    data: { notaCredito: { id: 10 } },
  }),
)

vi.mock('../../../server/services/ReciboCobroService', () => ({
  ReciboCobroService: class {
    voidRecibo = voidReciboMock
  },
}))

vi.mock('../../../server/services/FacturaService', () => ({
  FacturaService: class {
    void = voidFacturaMock
  },
}))

vi.mock('../../../server/audit', () => ({
  writeAuditEvent: vi.fn().mockResolvedValue(undefined),
}))

import { createMercadoPagoRefund } from '../../../server/integrations/mercadopago/mercadoPagoApiClient'
import { MercadoPagoRefundService } from '../../../server/services/MercadoPagoRefundService'

const FACTURA = {
  id: 7,
  estado: 'A',
  mpEstado: 'approved',
  clienteId: 2,
  total: new Decimal('1500.00'),
}

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  let storedMpRefundId: string | null = null
  const refundCreate = vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => ({
    id: 1,
    tenantId: 1,
    facturaId: 7,
    mpPaymentId: 'mp-pay-1',
    mpRefundId: null,
    monto: data.monto,
    motivo: data.motivo,
    estado: data.estado,
    notaCreditoId: null,
    reciboCobroId: 50,
    errorMessage: null,
    createdAt: new Date('2026-06-10T12:00:00.000Z'),
    updatedAt: new Date('2026-06-10T12:00:00.000Z'),
  }))
  const refundUpdate = vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
    if (data.mpRefundId != null) {
      storedMpRefundId = String(data.mpRefundId)
    }
    return {
      id: 1,
      tenantId: 1,
      facturaId: 7,
      mpPaymentId: 'mp-pay-1',
      mpRefundId: storedMpRefundId,
      monto: new Decimal('1500.00'),
      motivo: 'Motivo de prueba largo',
      estado: data.estado,
      notaCreditoId: data.notaCreditoId ?? null,
      reciboCobroId: 50,
      errorMessage: data.errorMessage ?? null,
      createdAt: new Date('2026-06-10T12:00:00.000Z'),
      updatedAt: new Date('2026-06-10T12:00:00.000Z'),
    }
  })

  return {
    factura: {
      findFirst: vi.fn().mockResolvedValue(FACTURA),
      update: vi.fn().mockResolvedValue({}),
    },
    mercadoPagoRefund: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: refundCreate,
      update: refundUpdate,
    },
    mercadoPagoProcessedPayment: {
      findFirst: vi.fn().mockResolvedValue({
        mpPaymentId: 'mp-pay-1',
        reciboCobroId: 50,
        reciboCobro: {
          id: 50,
          totalCobrado: new Decimal('1500.00'),
          estado: 'emitido',
          clienteId: 2,
        },
      }),
    },
    mercadoPagoConfig: {
      findUnique: vi.fn().mockResolvedValue({
        activo: true,
        accessTokenEncrypted: encryptFiscalSecret('TEST-token'),
      }),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('MercadoPagoRefundService (#179)', () => {
  beforeEach(() => {
    voidReciboMock.mockClear()
    voidFacturaMock.mockClear()
    vi.mocked(createMercadoPagoRefund).mockReset()
    vi.mocked(createMercadoPagoRefund).mockResolvedValue({
      id: 900,
      payment_id: 123,
      amount: 1500,
      status: 'approved',
    })
  })

  it('rejects partial refund with partial_refund_not_supported', async () => {
    const service = new MercadoPagoRefundService(buildPrisma())
    const result = await service.refundTotal(1, 7, 1, {
      motivo: 'Motivo de prueba largo',
      monto: 500,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(422)
      expect(result.error).toBe('partial_refund_not_supported')
    }
    expect(createMercadoPagoRefund).not.toHaveBeenCalled()
  })

  it('rejects refund above original amount', async () => {
    const service = new MercadoPagoRefundService(buildPrisma())
    const result = await service.refundTotal(1, 7, 1, {
      motivo: 'Motivo de prueba largo',
      monto: 2000,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(422)
      expect(result.error).toBe('Refund amount exceeds original payment')
    }
  })

  it('completes total refund via MP + void recibo + void factura', async () => {
    const service = new MercadoPagoRefundService(buildPrisma())
    const result = await service.refundTotal(1, 7, 1, {
      motivo: 'Motivo de prueba largo',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.estado).toBe('completado')
      expect(result.data.mpRefundId).toBe('900')
      expect(result.data.notaCreditoId).toBe(10)
    }
    expect(createMercadoPagoRefund).toHaveBeenCalledWith(expect.any(String), 'mp-pay-1', {
      amount: 1500,
    })
    expect(voidReciboMock).toHaveBeenCalled()
    expect(voidFacturaMock).toHaveBeenCalled()
  })

  it('marks refund failed when MP API fails', async () => {
    vi.mocked(createMercadoPagoRefund).mockRejectedValue(new Error('MP down'))
    const service = new MercadoPagoRefundService(buildPrisma())
    const result = await service.refundTotal(1, 7, 1, {
      motivo: 'Motivo de prueba largo',
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(502)
    }
    expect(voidReciboMock).not.toHaveBeenCalled()
    expect(voidFacturaMock).not.toHaveBeenCalled()
  })
})
