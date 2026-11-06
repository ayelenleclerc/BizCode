import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Prisma } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import { encryptFiscalSecret } from '../../../apps/server/fiscal/ar/fiscalSecrets'
import {
  buildMercadoPagoSignatureManifest,
  computeMercadoPagoSignatureHmac,
} from '../../../apps/server/lib/mercadopagoSignature'
import {
  extractPaymentIdFromPayload,
  MercadoPagoWebhookService,
} from '../../../apps/server/services/MercadoPagoWebhookService'
import { MP_PROCESSED_ESTADO_PROCESSING } from '../../../apps/server/services/mercadoPagoPaymentIdempotency'

vi.mock('../../../apps/server/integrations/mercadopago/mercadoPagoApiClient', async (importOriginal) => {
  const actual = await importOriginal<
    typeof import('../../../apps/server/integrations/mercadopago/mercadoPagoApiClient')
  >()
  return {
    ...actual,
    fetchMercadoPagoPayment: vi.fn(),
  }
})

const reciboCreateMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    ok: true,
    data: { id: 99, numero: 1, clienteId: 2, fecha: '2026-06-17', totalCobrado: '100.00' },
  }),
)

vi.mock('../../../apps/server/services/ReciboCobroService', () => ({
  ReciboCobroService: class {
    create = reciboCreateMock
  },
}))

vi.mock('../../../apps/server/notifications', () => ({
  notifyManagers: vi.fn().mockResolvedValue(undefined),
}))

import { fetchMercadoPagoPayment } from '../../../apps/server/integrations/mercadopago/mercadoPagoApiClient'
import { notifyManagers } from '../../../apps/server/notifications'

const WEBHOOK_SECRET = 'whsec-unit-test'

function buildSignature(dataId: string, requestId: string, ts = '1704908010'): string {
  const manifest = buildMercadoPagoSignatureManifest(dataId, requestId, ts)
  const v1 = computeMercadoPagoSignatureHmac(WEBHOOK_SECRET, manifest)
  return `ts=${ts},v1=${v1}`
}

function buildPrisma() {
  let processedRow: {
    id: number
    tenantId: number
    mpPaymentId: string
    facturaId: number | null
    estado: string
    reciboCobroId: number | null
  } | null = null
  let nextProcessedId = 1

  const processedCreate = vi.fn().mockImplementation(async ({ data }: { data: Record<string, unknown> }) => {
    if (
      processedRow &&
      processedRow.tenantId === data.tenantId &&
      processedRow.mpPaymentId === data.mpPaymentId
    ) {
      throw new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: 'test',
      })
    }
    processedRow = {
      id: nextProcessedId++,
      tenantId: data.tenantId as number,
      mpPaymentId: data.mpPaymentId as string,
      facturaId: (data.facturaId as number | null) ?? null,
      estado: data.estado as string,
      reciboCobroId: (data.reciboCobroId as number | null) ?? null,
    }
    return { ...processedRow }
  })

  const processedFindUnique = vi.fn().mockImplementation(async ({ where }: {
    where: { tenantId_mpPaymentId?: { tenantId: number; mpPaymentId: string } }
  }) => {
    const key = where.tenantId_mpPaymentId
    if (!key || !processedRow) return null
    if (processedRow.tenantId === key.tenantId && processedRow.mpPaymentId === key.mpPaymentId) {
      return { ...processedRow }
    }
    return null
  })

  const processedUpdate = vi.fn().mockImplementation(async ({ where, data }: {
    where: { id: number }
    data: Record<string, unknown>
  }) => {
    if (!processedRow || processedRow.id !== where.id) throw new Error('not found')
    processedRow = { ...processedRow, ...data } as typeof processedRow
    return { ...processedRow }
  })

  const processedDelete = vi.fn().mockImplementation(async ({ where }: { where: { id: number } }) => {
    if (processedRow?.id === where.id) processedRow = null
    return {}
  })

  const facturaUpdate = vi.fn().mockResolvedValue({})
  return {
    $executeRaw: vi.fn().mockResolvedValue(undefined),
    mercadoPagoConfig: {
      findMany: vi.fn().mockResolvedValue([
        {
          tenantId: 1,
          webhookSecretEncrypted: encryptFiscalSecret(WEBHOOK_SECRET),
        },
      ]),
      findUnique: vi.fn().mockResolvedValue({
        activo: true,
        accessTokenEncrypted: encryptFiscalSecret('TEST-token'),
        webhookSecretEncrypted: encryptFiscalSecret(WEBHOOK_SECRET),
      }),
    },
    mercadoPagoProcessedPayment: {
      findUnique: processedFindUnique,
      create: processedCreate,
      update: processedUpdate,
      delete: processedDelete,
    },
    reciboCobroForma: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
    factura: {
      findFirst: vi.fn().mockResolvedValue({
        id: 7,
        clienteId: 2,
        tipo: 'A',
        prefijo: '0001',
        numero: 42,
        total: new Decimal('100.00'),
        mpPreferenceId: 'pref-1',
      }),
      update: facturaUpdate,
    },
    reciboCobroImputacion: {
      groupBy: vi.fn().mockResolvedValue([]),
    },
    cliente: {
      findFirst: vi.fn().mockResolvedValue({ rsocial: 'ACME SA' }),
    },
    auditEvent: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
    },
    processedCreate,
    processedFindUnique,
    processedUpdate,
    facturaUpdate,
    getProcessedRow: () => processedRow,
  }
}

describe('MercadoPagoWebhookService (#176 / #446)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    reciboCreateMock.mockResolvedValue({
      ok: true,
      data: { id: 99, numero: 1, clienteId: 2, fecha: '2026-06-17', totalCobrado: '100.00' },
    })
    vi.mocked(fetchMercadoPagoPayment).mockResolvedValue({
      id: 12345678,
      status: 'approved',
      external_reference: '1:7',
      transaction_amount: 100,
      preference_id: 'pref-1',
    })
  })

  it('extracts payment id from webhook payload', () => {
    expect(extractPaymentIdFromPayload({ data: { id: '99' } })).toBe('99')
    expect(extractPaymentIdFromPayload({ id: 88 })).toBe('88')
  })

  it('resolves tenant by valid signature', async () => {
    const prisma = buildPrisma()
    const svc = new MercadoPagoWebhookService(prisma as never)
    const tenantId = await svc.resolveTenantIdBySignature({
      xSignature: buildSignature('12345678', 'req-1'),
      xRequestId: 'req-1',
      dataId: '12345678',
    })
    expect(tenantId).toBe(1)
  })

  it('processes approved payment and creates recibo', async () => {
    const prisma = buildPrisma()
    const svc = new MercadoPagoWebhookService(prisma as never)
    await svc.processPaymentNotification(1, '12345678')

    expect(reciboCreateMock).toHaveBeenCalledTimes(1)
    expect(prisma.facturaUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ mpEstado: 'approved' }),
      }),
    )
    expect(prisma.processedCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          estado: MP_PROCESSED_ESTADO_PROCESSING,
          mpPaymentId: '12345678',
        }),
      }),
    )
    expect(prisma.processedUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ estado: 'approved', reciboCobroId: 99 }),
      }),
    )
    expect(notifyManagers).toHaveBeenCalledWith(
      expect.anything(),
      1,
      'mercadopago_payment_received',
      expect.objectContaining({ facturaId: 7 }),
    )
  })

  it('skips duplicate payment processing when already complete', async () => {
    const prisma = buildPrisma()
    prisma.mercadoPagoProcessedPayment.findUnique = vi.fn().mockResolvedValue({
      id: 1,
      tenantId: 1,
      mpPaymentId: '12345678',
      estado: 'approved',
      reciboCobroId: 99,
    })
    const svc = new MercadoPagoWebhookService(prisma as never)
    await svc.processPaymentNotification(1, '12345678')
    expect(fetchMercadoPagoPayment).not.toHaveBeenCalled()
    expect(reciboCreateMock).not.toHaveBeenCalled()
  })

  it('concurrent notifications create a single recibo (#446)', async () => {
    const prisma = buildPrisma()
    const svc = new MercadoPagoWebhookService(prisma as never)

    await Promise.all([
      svc.processPaymentNotification(1, '12345678'),
      svc.processPaymentNotification(1, '12345678'),
    ])

    expect(reciboCreateMock).toHaveBeenCalledTimes(1)
    expect(prisma.getProcessedRow()?.estado).toBe('approved')
    expect(prisma.getProcessedRow()?.reciboCobroId).toBe(99)
  })

  it('retry after complete does not create another recibo (#446)', async () => {
    const prisma = buildPrisma()
    const svc = new MercadoPagoWebhookService(prisma as never)
    await svc.processPaymentNotification(1, '12345678')
    await svc.processPaymentNotification(1, '12345678')
    expect(reciboCreateMock).toHaveBeenCalledTimes(1)
  })

  it('resumes incomplete processing claim without duplicating recibo (#446)', async () => {
    const prisma = buildPrisma()
    prisma.reciboCobroForma.findFirst = vi
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValue({ reciboCobroId: 99 })

    const svc = new MercadoPagoWebhookService(prisma as never)
    await svc.processPaymentNotification(1, '12345678')

    const row = prisma.getProcessedRow()
    expect(row).toBeTruthy()
    await prisma.mercadoPagoProcessedPayment.update({
      where: { id: row!.id },
      data: { estado: MP_PROCESSED_ESTADO_PROCESSING, reciboCobroId: null },
    })

    await svc.processPaymentNotification(1, '12345678')
    expect(reciboCreateMock).toHaveBeenCalledTimes(1)
    expect(prisma.getProcessedRow()?.estado).toBe('approved')
    expect(prisma.getProcessedRow()?.reciboCobroId).toBe(99)
  })

  it('isolates same mpPaymentId across tenants (#446)', async () => {
    vi.mocked(fetchMercadoPagoPayment).mockResolvedValue({
      id: 555,
      status: 'approved',
      external_reference: null,
      transaction_amount: 100,
      preference_id: 'pref-1',
    })

    const prisma1 = buildPrisma()
    const svc1 = new MercadoPagoWebhookService(prisma1 as never)
    await svc1.processPaymentNotification(1, 'shared-pay')

    const prisma2 = buildPrisma()
    prisma2.factura.findFirst = vi.fn().mockResolvedValue({
      id: 8,
      clienteId: 3,
      tipo: 'A',
      prefijo: '0001',
      numero: 43,
      total: new Decimal('100.00'),
      mpPreferenceId: 'pref-1',
    })
    const svc2 = new MercadoPagoWebhookService(prisma2 as never)
    await svc2.processPaymentNotification(2, 'shared-pay')

    expect(reciboCreateMock).toHaveBeenCalledTimes(2)
    expect(prisma1.getProcessedRow()?.tenantId).toBe(1)
    expect(prisma2.getProcessedRow()?.tenantId).toBe(2)
  })
})
