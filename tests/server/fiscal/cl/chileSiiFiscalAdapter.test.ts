/**
 * @en Chile SII DTE homologación mock adapter tests (#208).
 * @es Tests del adapter mock de homologación DTE SII Chile (#208).
 * @pt-BR Testes do adapter mock de homologação DTE SII Chile (#208).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { ChileSiiFiscalAdapter } from '../../../../apps/server/fiscal/cl/ChileSiiFiscalAdapter'
import { ChileSiiService } from '../../../../apps/server/fiscal/cl/ChileSiiService'
import { mockClSiiAuthenticate, mockClSiiAuthorize } from '../../../../apps/server/fiscal/cl/clSiiDteMock'

const VALID_RUT_CL = '123456785'

function buildPrismaMock() {
  return {
    fiscalProviderConfig: {
      findUnique: vi.fn().mockResolvedValue({
        enabled: true,
        taxIdentifier: VALID_RUT_CL,
      }),
    },
    factura: {
      findFirst: vi.fn().mockResolvedValue({ id: 9, total: 100, cae: 'DTE3300000009', caeVto: new Date('2027-01-01'), estadoCae: 'issued' }),
      update: vi.fn().mockResolvedValue({}),
    },
    notaCredito: {
      findFirst: vi.fn().mockResolvedValue({ id: 3, cae: null, caeVto: null, estadoCae: 'pending' }),
      update: vi.fn().mockResolvedValue({}),
    },
  }
}

describe('clSiiDteMock (#208)', () => {
  it('returns deterministic authorization codes', () => {
    const a = mockClSiiAuthorize('invoice', 9)
    const b = mockClSiiAuthorize('invoice', 9)
    expect(a.authorizationCode).toBe(b.authorizationCode)
    expect(a.dteId).toContain('DTE-33')
    expect(mockClSiiAuthorize('credit_note', 3).dteId).toContain('DTE-61')
  })

  it('rejects invalid document ids', () => {
    expect(() => mockClSiiAuthorize('invoice', 0)).toThrow('MOCK_SII_INVALID_DOCUMENT')
  })

  it('builds a deterministic mock TA from a formatted RUT', () => {
    const session = mockClSiiAuthenticate('12.345.678-5')
    expect(session.token).toBe('MOCK-SII-TOKEN-123456785')
    expect(session.sign).toBe('MOCK-SII-SIGN')
    expect(session.expiration.getTime()).toBeGreaterThan(Date.now())
  })
})

describe('ChileSiiService (#208)', () => {
  let prisma: ReturnType<typeof buildPrismaMock>
  let service: ChileSiiService

  beforeEach(() => {
    prisma = buildPrismaMock()
    service = new ChileSiiService(prisma as unknown as PrismaClient)
  })

  it('getTa returns CHILE_SII_NOT_CONFIGURED when the provider is disabled', async () => {
    prisma.fiscalProviderConfig.findUnique.mockResolvedValueOnce({ enabled: false, taxIdentifier: VALID_RUT_CL })
    const result = await service.getTa(1)
    expect(result).toEqual({ ok: false, status: 422, error: 'CHILE_SII_NOT_CONFIGURED' })
  })

  it('authorizeInvoice returns 404 when the factura is missing', async () => {
    prisma.factura.findFirst.mockResolvedValueOnce(null)
    const result = await service.authorizeInvoice(1, 9)
    expect(result).toEqual({ ok: false, status: 404, error: 'Factura not found' })
  })

  it('authorizeCreditNote stamps a nota via the mock', async () => {
    const result = await service.authorizeCreditNote(1, 3)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.dteId).toContain('DTE-61')
    expect(prisma.notaCredito.update).toHaveBeenCalled()
  })

  it('authorizeCreditNote returns 404 when the nota is missing', async () => {
    prisma.notaCredito.findFirst.mockResolvedValueOnce(null)
    const result = await service.authorizeCreditNote(1, 3)
    expect(result).toEqual({ ok: false, status: 404, error: 'NotaCredito not found' })
  })

  it('authorizeInvoice maps mock authorize errors to 422', async () => {
    prisma.factura.findFirst.mockResolvedValueOnce({ id: 0 })
    const result = await service.authorizeInvoice(1, 0)
    expect(result).toEqual({ ok: false, status: 422, error: 'MOCK_SII_INVALID_DOCUMENT' })
  })
})

describe('ChileSiiFiscalAdapter (#208)', () => {
  let prisma: ReturnType<typeof buildPrismaMock>
  let adapter: ChileSiiFiscalAdapter

  beforeEach(() => {
    prisma = buildPrismaMock()
    adapter = new ChileSiiFiscalAdapter(prisma as unknown as PrismaClient)
  })

  it('reports implemented capabilities without cancel', () => {
    const caps = adapter.getCapabilities()
    expect(caps.implemented).toBe(true)
    expect(caps.supportsInvoice).toBe(true)
    expect(caps.supportsCreditNote).toBe(true)
    expect(caps.supportsCancel).toBe(false)
    expect(caps.notes).toMatch(/Not evidenced/)
  })

  it('validateConfiguration is false without tax identifier', async () => {
    prisma.fiscalProviderConfig.findUnique.mockResolvedValueOnce({ enabled: true, taxIdentifier: null })
    const result = await adapter.validateConfiguration(1)
    expect(result).toEqual({ ok: true, data: { configured: false } })
  })

  it('authenticate returns a mock TA when configured', async () => {
    const result = await adapter.authenticate(1)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.token).toContain('MOCK-SII-TOKEN')
    expect(result.data.sign).toBe('MOCK-SII-SIGN')
  })

  it('authorizeDocument stamps an invoice via the mock', async () => {
    const result = await adapter.authorizeDocument({
      tenantId: 1,
      documentType: 'invoice',
      invoiceId: 9,
      idempotencyKey: 'cl:factura:9',
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.status).toBe('authorized')
    expect(result.data.authorizationCode).toMatch(/^DTE33/)
    expect(prisma.factura.update).toHaveBeenCalled()
  })

  it('authorizeDocument requires invoiceId for invoices', async () => {
    const result = await adapter.authorizeDocument({
      tenantId: 1,
      documentType: 'invoice',
      idempotencyKey: 'cl:factura:missing',
    })
    expect(result).toEqual({ ok: false, status: 400, error: 'INVOICE_ID_REQUIRED' })
  })

  it('authorizeDocument stamps a credit note via the mock', async () => {
    const result = await adapter.authorizeDocument({
      tenantId: 1,
      documentType: 'credit_note',
      notaCreditoId: 3,
      idempotencyKey: 'cl:nc:3',
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.documentNumber).toContain('DTE-61')
    expect(prisma.notaCredito.update).toHaveBeenCalled()
  })

  it('getDocumentStatus maps factura and nota estadoCae values', async () => {
    const invoice = await adapter.getDocumentStatus(1, 'invoice', 9)
    expect(invoice.ok).toBe(true)
    if (invoice.ok) expect(invoice.data.status).toBe('authorized')

    const note = await adapter.getDocumentStatus(1, 'credit_note', 3)
    expect(note.ok).toBe(true)
    if (note.ok) expect(note.data.status).toBe('pending')
  })

  it('healthCheck is healthy when authenticate succeeds', async () => {
    const result = await adapter.healthCheck(1)
    expect(result).toEqual({ ok: true, data: { healthy: true } })
  })
})
