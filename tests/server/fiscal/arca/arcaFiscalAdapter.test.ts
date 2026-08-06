/**
 * @en `ArcaFiscalAdapter` unit tests (#378, ADR-0018): wraps the existing `ArcaService`
 *   (homologación mock) — no second WSAA/WSFE client is created.
 * @es Tests unitarios de `ArcaFiscalAdapter` (#378, ADR-0018): envuelve el `ArcaService`
 *   existente (mock de homologación) — no se crea un segundo cliente WSAA/WSFE.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { ArcaFiscalAdapter } from '../../../../apps/server/fiscal/arca/ArcaFiscalAdapter'
import { encryptFiscalSecret } from '../../../../apps/server/fiscal/ar/fiscalSecrets'

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    tenantFiscalConfig: {
      findUnique: vi.fn().mockResolvedValue({
        cuit: '20123456789',
        ambiente: 'homologacion',
        certEncrypted: encryptFiscalSecret('cert'),
        keyEncrypted: encryptFiscalSecret('key'),
      }),
    },
    factura: {
      findFirst: vi.fn().mockResolvedValue({ id: 9, total: 100, tipo: 'B', cae: null, caeVto: null, estadoCae: 'pending' }),
      findMany: vi.fn().mockResolvedValue([]),
      update: vi.fn().mockResolvedValue({}),
    },
    notaCredito: {
      findFirst: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue({}),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('ArcaFiscalAdapter', () => {
  let prisma: PrismaClient
  let adapter: ArcaFiscalAdapter

  beforeEach(() => {
    prisma = buildPrismaMock()
    adapter = new ArcaFiscalAdapter(prisma)
  })

  it('declares provider identity and capabilities as implemented', () => {
    expect(adapter.provider).toBe('arca_wsfe')
    expect(adapter.countryCode).toBe('AR')
    const capabilities = adapter.getCapabilities()
    expect(capabilities.implemented).toBe(true)
    expect(capabilities.supportsInvoice).toBe(true)
    expect(capabilities.supportsCreditNote).toBe(true)
    expect(capabilities.notes).toMatch(/Not evidenced/)
  })

  it('validateConfiguration reflects ArcaService.getConfigStatus', async () => {
    const result = await adapter.validateConfiguration(1)
    expect(result).toEqual({ ok: true, data: { configured: true } })
  })

  it('validateConfiguration reports not configured when TenantFiscalConfig is missing', async () => {
    prisma = buildPrismaMock({ tenantFiscalConfig: { findUnique: vi.fn().mockResolvedValue(null) } })
    adapter = new ArcaFiscalAdapter(prisma)
    const result = await adapter.validateConfiguration(1)
    expect(result).toEqual({ ok: true, data: { configured: false } })
  })

  it('authenticate returns a normalized FiscalAuthSession from ArcaService.getTa', async () => {
    const result = await adapter.authenticate(1)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.token).toMatch(/^MOCK-TA-/)
      expect(result.data.sign).toBe('MOCK-SIGN')
      expect(result.data.expiration).toBeInstanceOf(Date)
    }
  })

  it('authenticate propagates the failure when there is no fiscal config', async () => {
    prisma = buildPrismaMock({ tenantFiscalConfig: { findUnique: vi.fn().mockResolvedValue(null) } })
    adapter = new ArcaFiscalAdapter(prisma)
    const result = await adapter.authenticate(1)
    expect(result).toEqual({ ok: false, status: 404, error: 'FISCAL_CONFIG_NOT_FOUND' })
  })

  it('authorizeDocument(invoice) delegates to ArcaService.requestCaeForFactura', async () => {
    const result = await adapter.authorizeDocument({
      tenantId: 1,
      documentType: 'invoice',
      invoiceId: 9,
      idempotencyKey: 'arca_wsfe:factura:9',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.status).toBe('authorized')
      expect(result.data.authorizationCode).toMatch(/^\d{14}$/)
    }
    expect(prisma.factura.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ estadoCae: 'issued' }) }),
    )
  })

  it('authorizeDocument(invoice) requires invoiceId', async () => {
    const result = await adapter.authorizeDocument({
      tenantId: 1,
      documentType: 'invoice',
      idempotencyKey: 'arca_wsfe:factura:0',
    })
    expect(result).toEqual({ ok: false, status: 400, error: 'INVOICE_ID_REQUIRED' })
  })

  it('authorizeDocument(credit_note) requires notaCreditoId', async () => {
    const result = await adapter.authorizeDocument({
      tenantId: 1,
      documentType: 'credit_note',
      idempotencyKey: 'arca_wsfe:nota_credito:0',
    })
    expect(result).toEqual({ ok: false, status: 400, error: 'NOTA_CREDITO_ID_REQUIRED' })
  })

  it('authorizeDocument(credit_note) delegates to ArcaService.requestCaeForNotaCredito', async () => {
    prisma = buildPrismaMock({
      notaCredito: {
        findFirst: vi.fn().mockResolvedValue({
          id: 5,
          monto: 50,
          estadoCae: 'pending',
          facturaOrigen: { tipo: 'A' },
        }),
        update: vi.fn().mockResolvedValue({}),
      },
    })
    adapter = new ArcaFiscalAdapter(prisma)
    const result = await adapter.authorizeDocument({
      tenantId: 1,
      documentType: 'credit_note',
      notaCreditoId: 5,
      idempotencyKey: 'arca_wsfe:nota_credito:5',
    })
    expect(result.ok).toBe(true)
    expect(prisma.notaCredito.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ estadoCae: 'issued' }) }),
    )
  })

  it('getDocumentStatus(invoice) maps estadoCae to a normalized fiscal status', async () => {
    prisma = buildPrismaMock({
      factura: {
        findFirst: vi.fn().mockResolvedValue({ cae: '70000000000009', caeVto: new Date(), estadoCae: 'issued' }),
        update: vi.fn(),
      },
    })
    adapter = new ArcaFiscalAdapter(prisma)
    const result = await adapter.getDocumentStatus(1, 'invoice', 9)
    expect(result).toEqual({
      ok: true,
      data: expect.objectContaining({ status: 'authorized', authorizationCode: '70000000000009' }),
    })
  })

  it('getDocumentStatus(invoice) returns 404 when the invoice does not belong to the tenant', async () => {
    prisma = buildPrismaMock({ factura: { findFirst: vi.fn().mockResolvedValue(null), update: vi.fn() } })
    adapter = new ArcaFiscalAdapter(prisma)
    const result = await adapter.getDocumentStatus(1, 'invoice', 999)
    expect(result).toEqual({ ok: false, status: 404, error: 'Factura not found' })
  })

  it('getDocumentStatus(credit_note) reads from NotaCredito', async () => {
    prisma = buildPrismaMock({
      notaCredito: {
        findFirst: vi.fn().mockResolvedValue({ cae: '70000000000005', caeVto: null, estadoCae: 'pending' }),
        update: vi.fn(),
      },
    })
    adapter = new ArcaFiscalAdapter(prisma)
    const result = await adapter.getDocumentStatus(1, 'credit_note', 5)
    expect(result).toEqual({
      ok: true,
      data: expect.objectContaining({ status: 'pending', authorizationCode: '70000000000005' }),
    })
  })

  it('getLastAuthorizedNumber rejects credit notes (ARCA only supports invoices)', async () => {
    const result = await adapter.getLastAuthorizedNumber(1, '0001', 'credit_note')
    expect(result).toEqual({ ok: false, status: 422, error: 'ARCA_LAST_NUMBER_ONLY_SUPPORTS_INVOICE' })
  })

  it('getLastAuthorizedNumber reads the highest issued Factura number for the point of sale', async () => {
    prisma = buildPrismaMock({
      factura: { findFirst: vi.fn().mockResolvedValue({ numero: 42 }), findMany: vi.fn(), update: vi.fn() },
    })
    adapter = new ArcaFiscalAdapter(prisma)
    const result = await adapter.getLastAuthorizedNumber(1, '0001', 'invoice')
    expect(result).toEqual({ ok: true, data: { number: 42 } })
  })

  it('getLastAuthorizedNumber defaults to 0 when there is no issued invoice yet', async () => {
    prisma = buildPrismaMock({
      factura: { findFirst: vi.fn().mockResolvedValue(null), findMany: vi.fn(), update: vi.fn() },
    })
    adapter = new ArcaFiscalAdapter(prisma)
    const result = await adapter.getLastAuthorizedNumber(1, '0001', 'invoice')
    expect(result).toEqual({ ok: true, data: { number: 0 } })
  })

  it('healthCheck is healthy when authenticate succeeds', async () => {
    const result = await adapter.healthCheck(1)
    expect(result).toEqual({ ok: true, data: { healthy: true } })
  })

  it('healthCheck is unhealthy when authenticate fails', async () => {
    prisma = buildPrismaMock({ tenantFiscalConfig: { findUnique: vi.fn().mockResolvedValue(null) } })
    adapter = new ArcaFiscalAdapter(prisma)
    const result = await adapter.healthCheck(1)
    expect(result).toEqual({ ok: true, data: { healthy: false } })
  })
})
