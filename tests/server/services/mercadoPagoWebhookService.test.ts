import { beforeEach, describe, expect, it, vi } from 'vitest'
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
  const processedCreate = vi.fn().mockResolvedValue({ id: 1 })
  const facturaUpdate = vi.fn().mockResolvedValue({})
  return {
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
      findUnique: vi.fn().mockResolvedValue(null),
      create: processedCreate,
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
    facturaUpdate,
  }
}

describe('MercadoPagoWebhookService (#176)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

    const reciboMock = reciboCreateMock
    expect(reciboMock).toHaveBeenCalledTimes(1)
    expect(prisma.facturaUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ mpEstado: 'approved' }),
      }),
    )
    expect(prisma.processedCreate).toHaveBeenCalled()
    expect(notifyManagers).toHaveBeenCalledWith(
      expect.anything(),
      1,
      'mercadopago_payment_received',
      expect.objectContaining({ facturaId: 7 }),
    )
  })

  it('skips duplicate payment processing', async () => {
    const prisma = buildPrisma()
    prisma.mercadoPagoProcessedPayment.findUnique = vi.fn().mockResolvedValue({
      id: 1,
      tenantId: 1,
      mpPaymentId: '12345678',
    })
    const svc = new MercadoPagoWebhookService(prisma as never)
    await svc.processPaymentNotification(1, '12345678')
    expect(fetchMercadoPagoPayment).not.toHaveBeenCalled()
    expect(prisma.processedCreate).not.toHaveBeenCalled()
  })
})
