/**
 * @en API tests for Mercado Pago refund and chargeback routes (#179).
 * @es Tests API de reembolso y contracargos Mercado Pago (#179).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../server/createApp'
import { encryptFiscalSecret } from '../../server/fiscal/ar/fiscalSecrets'
import { clearTenantFeaturesCache } from '../../server/services/tenantConfigCache'

const MODULES =
  'core.auth,billing.credit_notes,billing.arca_cae,finance.ledger,billing.orders,logistics.dispatches,logistics.picking,logistics.gps'

const refundRow = {
  id: 1,
  facturaId: 7,
  mpPaymentId: 'mp-pay-1',
  mpRefundId: 'ref-1',
  monto: new Decimal('1500.00'),
  motivo: 'Motivo de prueba largo',
  estado: 'completado',
  notaCreditoId: 10,
  reciboCobroId: 50,
  errorMessage: null,
  createdAt: new Date('2026-06-10T12:00:00.000Z'),
  updatedAt: new Date('2026-06-10T12:00:00.000Z'),
}

const chargebackRow = {
  id: 3,
  mpChargebackId: 'cb-90001',
  mpPaymentId: 'mp-pay-1',
  facturaId: 7,
  estado: 'pendiente',
  notifiedAt: new Date('2026-06-10T12:00:00.000Z'),
  resolvedAt: null,
  createdAt: new Date('2026-06-10T12:00:00.000Z'),
}

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    deliveryZone: { findMany: vi.fn().mockResolvedValue([]) },
    cliente: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue({ rsocial: 'ACME SA' }),
    },
    articulo: { findMany: vi.fn().mockResolvedValue([]) },
    rubro: { findMany: vi.fn().mockResolvedValue([]) },
    formaPago: { findMany: vi.fn().mockResolvedValue([]) },
    tenantFiscalConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    paramEmpresa: {
      findUnique: vi.fn().mockResolvedValue({
        nombre: 'Demo',
        cuit: '30123456789',
        domicilio: '',
        timezone: 'America/Argentina/Buenos_Aires',
      }),
    },
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
        modules: MODULES.split(','),
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
      }),
    },
    mercadoPagoRefund: {
      findFirst: vi.fn().mockResolvedValue(refundRow),
      create: vi.fn().mockResolvedValue({ id: 1, estado: 'iniciado' }),
      update: vi.fn().mockResolvedValue(refundRow),
    },
    mercadoPagoChargeback: {
      findMany: vi.fn().mockResolvedValue([chargebackRow]),
      findFirst: vi.fn().mockResolvedValue(chargebackRow),
      update: vi.fn().mockResolvedValue({ ...chargebackRow, estado: 'resuelto', resolvedAt: new Date() }),
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
    factura: {
      findFirst: vi.fn().mockResolvedValue({
        id: 7,
        estado: 'A',
        mpEstado: 'approved',
        clienteId: 2,
        total: new Decimal('1500.00'),
      }),
      update: vi.fn().mockResolvedValue({}),
    },
    notaCredito: { create: vi.fn().mockResolvedValue({ id: 10 }) },
    reciboCobro: {
      findFirst: vi.fn().mockResolvedValue({ id: 50, estado: 'emitido', clienteId: 2 }),
      update: vi.fn().mockResolvedValue({ id: 50, estado: 'anulado' }),
    },
    reciboCobroImputacion: { groupBy: vi.fn().mockResolvedValue([]) },
    movimientoClienteCC: { create: vi.fn().mockResolvedValue({ id: 1 }) },
    ...overrides,
  } as unknown as PrismaClient
}

vi.mock('../../server/integrations/mercadopago/mercadoPagoApiClient', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('../../server/integrations/mercadopago/mercadoPagoApiClient')
  >()
  return {
    ...actual,
    createMercadoPagoRefund: vi.fn().mockResolvedValue({
      id: 900,
      payment_id: 123,
      amount: 1500,
      status: 'approved',
    }),
  }
})

vi.mock('../../server/services/ReciboCobroService', () => ({
  ReciboCobroService: class {
    voidRecibo = vi.fn().mockResolvedValue({ ok: true, data: { id: 50 } })
  },
}))

vi.mock('../../server/services/FacturaService', () => ({
  FacturaService: class {
    void = vi.fn().mockResolvedValue({ ok: true, data: { notaCredito: { id: 10 } } })
  },
}))

describe('Mercado Pago refund/chargeback API (#179)', () => {
  beforeEach(() => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    clearTenantFeaturesCache()
  })

  it('GET /api/facturas/:id/mp/reembolso returns refund timeline', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/facturas/7/mp/reembolso').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.estado).toBe('completado')
  })

  it('POST /api/facturas/:id/mp/reembolso rejects partial amount with 422', async () => {
    const app = createApp(
      buildPrismaMock({
        mercadoPagoRefund: {
          findFirst: vi.fn().mockResolvedValue(null),
          create: vi.fn().mockResolvedValue({ id: 1, estado: 'iniciado' }),
          update: vi.fn().mockResolvedValue(refundRow),
        },
      }),
    )
    const res = await request(app)
      .post('/api/facturas/7/mp/reembolso')
      .send({ motivo: 'Motivo de prueba largo', monto: 500 })
      .expect(422)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toBe('partial_refund_not_supported')
  })

  it('POST /api/facturas/:id/mp/reembolso completes total refund', async () => {
    const prisma = buildPrismaMock({
      mercadoPagoRefund: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 1, estado: 'iniciado' }),
        update: vi.fn().mockResolvedValue(refundRow),
      },
    })
    const app = createApp(prisma)
    const res = await request(app)
      .post('/api/facturas/7/mp/reembolso')
      .send({ motivo: 'Motivo de prueba largo' })
      .expect(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.estado).toBe('completado')
  })

  it('GET /api/mercadopago/contracargos returns pending queue', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/mercadopago/contracargos').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].mpChargebackId).toBe('cb-90001')
  })

  it('PATCH /api/mercadopago/contracargos/:id marks chargeback resolved', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .patch('/api/mercadopago/contracargos/3')
      .send({ estado: 'resuelto' })
      .expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.estado).toBe('resuelto')
  })
})
