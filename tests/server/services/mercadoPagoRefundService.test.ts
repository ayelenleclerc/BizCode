/**
 * @en Unit tests for Mercado Pago refund service (#179, #344).
 * @es Tests unitarios del servicio de reembolso Mercado Pago (#179, #344).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { encryptFiscalSecret } from '../../../apps/server/fiscal/ar/fiscalSecrets'

vi.mock('../../../apps/server/integrations/mercadopago/mercadoPagoApiClient', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('../../../apps/server/integrations/mercadopago/mercadoPagoApiClient')
  >()
  return {
    ...actual,
    createMercadoPagoRefund: vi.fn(),
  }
})

const voidReciboMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ ok: true, data: { id: 50, estado: 'anulado' } }),
)

const recordPartialRefundReversalMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ ok: true, data: { id: 50, estado: 'emitido' } }),
)

const voidFacturaMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    ok: true,
    data: { notaCredito: { id: 10 } },
  }),
)

const createPartialCreditNoteMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    ok: true,
    data: { notaCredito: { id: 11 } },
  }),
)

vi.mock('../../../apps/server/services/ReciboCobroService', () => ({
  ReciboCobroService: class {
    voidRecibo = voidReciboMock
    recordPartialRefundReversal = recordPartialRefundReversalMock
  },
}))

vi.mock('../../../apps/server/services/FacturaService', () => ({
  FacturaService: class {
    void = voidFacturaMock
    createPartialCreditNote = createPartialCreditNoteMock
  },
}))

vi.mock('../../../apps/server/audit', () => ({
  writeAuditEvent: vi.fn().mockResolvedValue(undefined),
}))

import { createMercadoPagoRefund } from '../../../apps/server/integrations/mercadopago/mercadoPagoApiClient'
import { MercadoPagoRefundService } from '../../../apps/server/services/MercadoPagoRefundService'

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
      monto: data.monto ?? new Decimal('1500.00'),
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
      findMany: vi.fn().mockResolvedValue([]),
      aggregate: vi.fn().mockResolvedValue({ _sum: { monto: new Decimal('0') } }),
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
          numero: 12,
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

describe('MercadoPagoRefundService (#179, #344)', () => {
  beforeEach(() => {
    voidReciboMock.mockClear()
    recordPartialRefundReversalMock.mockClear()
    voidFacturaMock.mockClear()
    createPartialCreditNoteMock.mockClear()
    vi.mocked(createMercadoPagoRefund).mockReset()
    vi.mocked(createMercadoPagoRefund).mockResolvedValue({
      id: 900,
      payment_id: 123,
      amount: 1500,
      status: 'approved',
    })
  })

  it('completes partial refund via MP + reversal + partial NC', async () => {
    const service = new MercadoPagoRefundService(buildPrisma())
    const result = await service.refundTotal(1, 7, 1, {
      motivo: 'Motivo de prueba largo',
      monto: 500,
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.estado).toBe('completado')
      expect(result.data.notaCreditoId).toBe(11)
    }
    expect(createMercadoPagoRefund).toHaveBeenCalledWith(expect.any(String), 'mp-pay-1', {
      amount: 500,
    })
    expect(recordPartialRefundReversalMock).toHaveBeenCalled()
    expect(createPartialCreditNoteMock).toHaveBeenCalled()
    expect(voidReciboMock).not.toHaveBeenCalled()
    expect(voidFacturaMock).not.toHaveBeenCalled()
  })

  it('rejects refund above refundable balance', async () => {
    const service = new MercadoPagoRefundService(buildPrisma())
    const result = await service.refundTotal(1, 7, 1, {
      motivo: 'Motivo de prueba largo',
      monto: 2000,
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(422)
      expect(result.error).toBe('exceeds_refundable_balance')
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

  it('getStatusByFactura returns refundable balance after prior refunds', async () => {
    const service = new MercadoPagoRefundService(
      buildPrisma({
        mercadoPagoRefund: {
          findFirst: vi.fn().mockResolvedValue(null),
          findMany: vi.fn().mockResolvedValue([
            {
              id: 2,
              facturaId: 7,
              mpPaymentId: 'mp-pay-1',
              mpRefundId: 'r1',
              monto: new Decimal('500.00'),
              motivo: 'Motivo de prueba largo',
              estado: 'completado',
              notaCreditoId: 11,
              reciboCobroId: 50,
              errorMessage: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]),
          aggregate: vi.fn().mockResolvedValue({ _sum: { monto: new Decimal('500.00') } }),
          create: vi.fn(),
          update: vi.fn(),
        },
      }),
    )
    const status = await service.getStatusByFactura(1, 7)
    expect(status.refundableBalance).toBe('1000.00')
    expect(status.originalPaymentAmount).toBe('1500.00')
    expect(status.refunds).toHaveLength(1)
  })
})
