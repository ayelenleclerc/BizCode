/**
 * @en Unit tests for Mercado Pago reconciliation service (#178).
 * @es Tests unitarios del servicio de reconciliación Mercado Pago (#178).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { encryptFiscalSecret } from '../../../apps/server/fiscal/ar/fiscalSecrets'

vi.mock('../../../apps/server/integrations/mercadopago/mercadoPagoApiClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../apps/server/integrations/mercadopago/mercadoPagoApiClient')>()
  return {
    ...actual,
    searchMercadoPagoPayments: vi.fn(),
  }
})

vi.mock('../../../apps/server/lib/systemUserId', () => ({
  resolveSystemUserId: vi.fn().mockReturnValue(99),
}))

vi.mock('../../../apps/server/notifications', () => ({
  notifyManagers: vi.fn().mockResolvedValue(undefined),
}))

import { searchMercadoPagoPayments } from '../../../apps/server/integrations/mercadopago/mercadoPagoApiClient'
import { MercadoPagoReconciliationService } from '../../../apps/server/services/MercadoPagoReconciliationService'

const approvedPayment = {
  id: 9001,
  status: 'approved',
  transaction_amount: 1500,
  currency_id: 'ARS',
  date_created: '2026-06-10T12:00:00.000Z',
  external_reference: null,
  preference_id: null,
  payer: {
    email: 'payer@example.com',
    first_name: 'Juan',
    last_name: 'Perez',
    identification: { type: 'CUIT', number: '20-12345678-9' },
  },
}

function buildPrisma(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  const reconciliationUpsert = vi.fn().mockResolvedValue({})
  const reconciliationFindUnique = vi.fn().mockResolvedValue(null)
  const reconciliationFindMany = vi.fn().mockResolvedValue([])
  const reconciliationUpdate = vi.fn().mockResolvedValue({})
  const processedFindUnique = vi.fn().mockResolvedValue(null)
  const processedCreate = vi.fn().mockResolvedValue({})
  const processedUpdateMany = vi.fn().mockResolvedValue({ count: 0 })

  return {
    paramEmpresa: {
      findUnique: vi.fn().mockResolvedValue({ timezone: 'America/Argentina/Buenos_Aires' }),
    },
    mercadoPagoConfig: {
      findUnique: vi.fn().mockResolvedValue({
        activo: true,
        accessTokenEncrypted: encryptFiscalSecret('TEST-access-token'),
      }),
    },
    mercadoPagoProcessedPayment: {
      findUnique: processedFindUnique,
      create: processedCreate,
      updateMany: processedUpdateMany,
    },
    mercadoPagoReconciliationEntry: {
      findUnique: reconciliationFindUnique,
      findMany: reconciliationFindMany,
      upsert: reconciliationUpsert,
      update: reconciliationUpdate,
      findUniqueOrThrow: vi.fn().mockResolvedValue({
        mpPaymentId: '9001',
        transactionAmount: new Decimal('1500.00'),
        currencyId: 'ARS',
        paymentDate: new Date('2026-06-10T12:00:00.000Z'),
        payerName: 'Juan Perez',
        payerEmail: 'payer@example.com',
        payerIdentification: '20-12345678-9',
        preferenceId: null,
        externalReference: null,
        createdAt: new Date('2026-06-10T12:00:00.000Z'),
      }),
    },
    cliente: {
      findMany: vi.fn().mockResolvedValue([{ id: 2, cuit: '20123456789' }]),
      findFirst: vi.fn().mockResolvedValue({ rsocial: 'ACME SA' }),
    },
    factura: {
      findMany: vi.fn().mockResolvedValue([
        {
          id: 7,
          clienteId: 2,
          tipo: 'A',
          prefijo: '0001',
          numero: 42,
          total: new Decimal('1500.00'),
        },
      ]),
      findFirst: vi.fn().mockResolvedValue({
        id: 7,
        clienteId: 2,
        tipo: 'A',
        prefijo: '0001',
        numero: 42,
        total: new Decimal('1500.00'),
      }),
      update: vi.fn().mockResolvedValue({}),
    },
    reciboCobroImputacion: {
      groupBy: vi.fn().mockResolvedValue([]),
    },
    reciboCobro: {
      aggregate: vi.fn().mockResolvedValue({ _max: { numero: 0 } }),
      create: vi.fn().mockResolvedValue({ id: 501 }),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('MercadoPagoReconciliationService (#178)', () => {
  beforeEach(() => {
    vi.mocked(searchMercadoPagoPayments).mockReset()
    vi.mocked(searchMercadoPagoPayments).mockResolvedValue({
      paging: { total: 1, limit: 50, offset: 0 },
      results: [approvedPayment],
    })
  })

  it('auto-reconciles unique exact match during forced job', async () => {
    const prisma = buildPrisma()
    const service = new MercadoPagoReconciliationService(prisma)
    vi.spyOn(service['reciboCobro'], 'create').mockResolvedValue({
      ok: true,
      data: { id: 501 } as never,
    })

    const summary = await service.runDailyJob(1, new Date('2026-06-10T15:00:00.000Z'), { force: true })

    expect(summary.processed).toBe(1)
    expect(summary.autoReconciled).toBe(1)
    expect(summary.queued).toBe(0)
    expect(prisma.mercadoPagoReconciliationEntry.upsert).toHaveBeenCalled()
    expect(prisma.mercadoPagoProcessedPayment.create).toHaveBeenCalled()
  })

  it('queues ambiguous matches instead of auto-reconciling', async () => {
    const prisma = buildPrisma({
      factura: {
        findMany: vi.fn().mockResolvedValue([
          {
            id: 7,
            clienteId: 2,
            tipo: 'A',
            prefijo: '0001',
            numero: 42,
            total: new Decimal('1500.00'),
          },
          {
            id: 8,
            clienteId: 2,
            tipo: 'A',
            prefijo: '0001',
            numero: 43,
            total: new Decimal('1500.00'),
          },
        ]),
      },
    })
    const service = new MercadoPagoReconciliationService(prisma)
    const summary = await service.runDailyJob(1, new Date('2026-06-10T15:00:00.000Z'), { force: true })

    expect(summary.autoReconciled).toBe(0)
    expect(summary.queued).toBe(1)
    expect(prisma.mercadoPagoProcessedPayment.create).not.toHaveBeenCalled()
  })

  it('queues partial amount payments for manual review', async () => {
    vi.mocked(searchMercadoPagoPayments).mockResolvedValue({
      paging: { total: 1, limit: 50, offset: 0 },
      results: [{ ...approvedPayment, transaction_amount: 500 }],
    })
    const prisma = buildPrisma()
    const service = new MercadoPagoReconciliationService(prisma)
    const summary = await service.runDailyJob(1, new Date('2026-06-10T15:00:00.000Z'), { force: true })

    expect(summary.autoReconciled).toBe(0)
    expect(summary.queued).toBe(1)
  })

  it('skips already reconciled payments on second job run', async () => {
    const prisma = buildPrisma({
      mercadoPagoProcessedPayment: {
        findUnique: vi.fn().mockResolvedValue({ reciboCobroId: 501 }),
        create: vi.fn(),
        updateMany: vi.fn(),
      },
    })
    const service = new MercadoPagoReconciliationService(prisma)
    const summary = await service.runDailyJob(1, new Date('2026-06-10T15:00:00.000Z'), { force: true })

    expect(summary.skipped).toBe(1)
    expect(summary.autoReconciled).toBe(0)
    expect(summary.queued).toBe(0)
  })

  it('lists pending reconciliation entries', async () => {
    const prisma = buildPrisma({
      mercadoPagoReconciliationEntry: {
        findMany: vi.fn().mockResolvedValue([
          {
            mpPaymentId: '9001',
            transactionAmount: new Decimal('1500.00'),
            currencyId: 'ARS',
            paymentDate: new Date('2026-06-10T12:00:00.000Z'),
            payerName: 'Juan Perez',
            payerEmail: 'payer@example.com',
            payerIdentification: '20123456789',
            preferenceId: null,
            externalReference: null,
            createdAt: new Date('2026-06-10T12:00:00.000Z'),
          },
        ]),
      },
    })
    const service = new MercadoPagoReconciliationService(prisma)
    const rows = await service.listPending(1)
    expect(rows).toHaveLength(1)
    expect(rows[0]?.mpPaymentId).toBe('9001')
    expect(rows[0]?.transactionAmount).toBe('1500.00')
  })
})
