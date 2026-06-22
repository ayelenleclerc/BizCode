/**
 * @en API tests for Mercado Pago refund and chargeback routes (#179, #344).
 * @es Tests API de reembolso y contracargos Mercado Pago (#179, #344).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { createApp } from '../../apps/server/createApp'
import { encryptFiscalSecret } from '../../apps/server/fiscal/ar/fiscalSecrets'
import { clearTenantFeaturesCache } from '../../apps/server/services/tenantConfigCache'

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
  const mock: Record<string, unknown> = {
    deliveryZone: { findMany: vi.fn().mockResolvedValue([]) },
    cliente: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue({ rsocial: 'ACME SA' }),
      findFirstOrThrow: vi.fn().mockResolvedValue({ id: 2, rsocial: 'ACME SA', balance: 0, creditLimit: null }),
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
      findFirst: vi.fn().mockResolvedValue(null),
      findMany: vi.fn().mockResolvedValue([refundRow]),
      aggregate: vi.fn().mockResolvedValue({ _sum: { monto: new Decimal('0') } }),
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
          numero: 12,
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
        estadoCae: 'not_required',
        tipo: 'B',
        prefijo: '0001',
        numero: 7,
      }),
      update: vi.fn().mockResolvedValue({}),
    },
    notaCredito: {
      create: vi.fn().mockResolvedValue({ id: 10, monto: new Decimal('500'), createdAt: new Date() }),
      aggregate: vi.fn().mockResolvedValue({ _sum: { monto: new Decimal('0') } }),
    },
    reciboCobro: {
      findFirst: vi.fn().mockResolvedValue({
        id: 50,
        estado: 'emitido',
        clienteId: 2,
        totalCobrado: new Decimal('1500.00'),
        numero: 12,
        retencionesAplicadas: [],
      }),
      findFirstOrThrow: vi.fn().mockResolvedValue({
        id: 50,
        estado: 'emitido',
        clienteId: 2,
        totalCobrado: new Decimal('1500.00'),
        numero: 12,
        retencionesAplicadas: [],
      }),
      update: vi.fn().mockResolvedValue({ id: 50, estado: 'anulado' }),
    },
    retencionAplicada: { deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
    reciboCobroImputacion: { groupBy: vi.fn().mockResolvedValue([]) },
    movimientoClienteCC: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
    },
    ...overrides,
  }
  mock.$transaction = vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn(mock))
  return mock as unknown as PrismaClient
}

vi.mock('../../apps/server/integrations/mercadopago/mercadoPagoApiClient', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('../../apps/server/integrations/mercadopago/mercadoPagoApiClient')
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

vi.mock('../../apps/server/services/ReciboCobroService', () => ({
  ReciboCobroService: class {
    voidRecibo = vi.fn().mockResolvedValue({ ok: true, data: { id: 50 } })
    recordPartialRefundReversal = vi.fn().mockResolvedValue({ ok: true, data: { id: 50 } })
  },
}))

vi.mock('../../apps/server/services/FacturaService', () => ({
  FacturaService: class {
    void = vi.fn().mockResolvedValue({ ok: true, data: { notaCredito: { id: 10 } } })
    createPartialCreditNote = vi.fn().mockResolvedValue({ ok: true, data: { notaCredito: { id: 11 } } })
  },
}))

describe('Mercado Pago refund/chargeback API (#179, #344)', () => {
  beforeEach(() => {
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'owner'
    clearTenantFeaturesCache()
  })

  it('GET /api/facturas/:id/mp/reembolso returns refund status with balance', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app).get('/api/facturas/7/mp/reembolso').expect(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.refundableBalance).toBe('1500.00')
    expect(res.body.data.refunds).toHaveLength(1)
    expect(res.body.data.refunds[0].estado).toBe('completado')
  })

  it('POST /api/facturas/:id/mp/reembolso accepts partial amount', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/facturas/7/mp/reembolso')
      .send({ motivo: 'Motivo de prueba largo', monto: 500 })
      .expect(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.estado).toBe('completado')
  })

  it('POST /api/facturas/:id/mp/reembolso rejects amount above balance', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/facturas/7/mp/reembolso')
      .send({ motivo: 'Motivo de prueba largo', monto: 2000 })
      .expect(422)
    expect(res.body.success).toBe(false)
    expect(res.body.error).toBe('exceeds_refundable_balance')
  })

  it('POST /api/facturas/:id/mp/reembolso completes total refund', async () => {
    const prisma = buildPrismaMock()
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
