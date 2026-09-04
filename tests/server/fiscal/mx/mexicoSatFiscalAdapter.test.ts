/**
 * @en Mexico SAT CFDI homologación mock adapter tests (#210).
 * @es Tests del adapter mock de homologación CFDI SAT México (#210).
 * @pt-BR Testes do adapter mock de homologação CFDI SAT México (#210).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { MexicoSatFiscalAdapter } from '../../../../apps/server/fiscal/mx/MexicoSatFiscalAdapter'
import { mockMxSatCancel, mockMxSatStamp } from '../../../../apps/server/fiscal/mx/mxSatPacMock'
import { SAT_CFDI_CANCEL_REASON_CODES } from '../../../../apps/server/fiscal/mx/satCatalogFixtures'

function createPrismaMock() {
  return {
    fiscalProviderConfig: {
      findUnique: vi.fn(),
    },
    factura: {
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    notaCredito: {
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    fiscalDocument: {
      findFirst: vi.fn(),
    },
  }
}

describe('mxSatPacMock (#210)', () => {
  it('stamps a deterministic UUID for invoices', () => {
    const stamp = mockMxSatStamp('invoice', 42)
    expect(stamp.uuid).toMatch(/^a1/)
    expect(stamp.authorizationCode).toHaveLength(16)
  })

  it('rejects invalid cancel reasons', () => {
    expect(() => mockMxSatCancel('a100002a-0000-4000-8000-00000000002a', '99')).toThrow(
      /MOCK_PAC_INVALID_CANCEL_REASON/,
    )
  })

  it('accepts the four SAT cancel reasons', () => {
    for (const reason of SAT_CFDI_CANCEL_REASON_CODES) {
      expect(mockMxSatCancel('uuid-ok-enough', reason).reasonCode).toBe(reason)
    }
  })
})

describe('MexicoSatFiscalAdapter (#210)', () => {
  let prisma: ReturnType<typeof createPrismaMock>
  let adapter: MexicoSatFiscalAdapter

  beforeEach(() => {
    prisma = createPrismaMock()
    adapter = new MexicoSatFiscalAdapter(prisma as unknown as PrismaClient)
  })

  it('declares implemented CFDI capabilities including cancel', () => {
    const caps = adapter.getCapabilities()
    expect(caps.provider).toBe('mexico_sat_pac')
    expect(caps.countryCode).toBe('MX')
    expect(caps.implemented).toBe(true)
    expect(caps.supportsInvoice).toBe(true)
    expect(caps.supportsCreditNote).toBe(true)
    expect(caps.supportsCancel).toBe(true)
    expect(caps.notes).toMatch(/Homologación mock/)
  })

  it('validateConfiguration is false without provider config', async () => {
    prisma.fiscalProviderConfig.findUnique.mockResolvedValue(null)
    await expect(adapter.validateConfiguration(1)).resolves.toEqual({
      ok: true,
      data: { configured: false },
    })
  })

  it('authorizeDocument stamps an invoice when configured', async () => {
    prisma.fiscalProviderConfig.findUnique.mockResolvedValue({
      enabled: true,
      taxIdentifier: 'XEXX010101000',
    })
    prisma.factura.findFirst.mockResolvedValue({ id: 7, total: 100 })
    prisma.factura.update.mockResolvedValue({})

    const result = await adapter.authorizeDocument({
      tenantId: 1,
      documentType: 'invoice',
      invoiceId: 7,
      idempotencyKey: 'mexico_sat_pac:factura:7',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.status).toBe('authorized')
      expect(result.data.authorizationCode).toBeTruthy()
      expect(result.data.documentNumber).toMatch(/^a1/)
    }
  })

  it('cancel requires a SAT reason code', async () => {
    prisma.fiscalProviderConfig.findUnique.mockResolvedValue({
      enabled: true,
      taxIdentifier: 'XEXX010101000',
    })
    const result = await adapter.cancel(1, 'invoice', 7)
    expect(result).toEqual({ ok: false, status: 400, error: 'SAT_CANCEL_REASON_REQUIRED' })
  })

  it('cancel updates factura estadoCae when authorized fiscal document exists', async () => {
    prisma.fiscalProviderConfig.findUnique.mockResolvedValue({
      enabled: true,
      taxIdentifier: 'XEXX010101000',
    })
    prisma.fiscalDocument.findFirst.mockResolvedValue({
      documentNumber: 'a1000007-0000-4000-8000-000000000007',
      authorizationCode: 'A100000700004000',
    })
    prisma.factura.updateMany.mockResolvedValue({ count: 1 })

    const result = await adapter.cancel(1, 'invoice', 7, { reasonCode: '02' })
    expect(result.ok).toBe(true)
    expect(prisma.factura.updateMany).toHaveBeenCalledWith({
      where: { id: 7, tenantId: 1 },
      data: { estadoCae: 'cancelled' },
    })
  })
})
