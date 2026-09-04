/**
 * @en Uruguay DGI CFE homologación mock adapter tests (#207).
 * @es Tests del adapter mock de homologación CFE DGI Uruguay (#207).
 * @pt-BR Testes do adapter mock de homologação CFE DGI Uruguai (#207).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { UruguayDgiFiscalAdapter } from '../../../../apps/server/fiscal/uy/UruguayDgiFiscalAdapter'
import { mockUyDgiAuthorize } from '../../../../apps/server/fiscal/uy/uyDgiCfeMock'

const VALID_RUT = '012345678908'

function buildPrismaMock() {
  return {
    fiscalProviderConfig: {
      findUnique: vi.fn().mockResolvedValue({
        enabled: true,
        taxIdentifier: VALID_RUT,
      }),
    },
    factura: {
      findFirst: vi.fn().mockResolvedValue({ id: 9, total: 100 }),
      update: vi.fn().mockResolvedValue({}),
    },
    notaCredito: {
      findFirst: vi.fn().mockResolvedValue({ id: 3 }),
      update: vi.fn().mockResolvedValue({}),
    },
  }
}

describe('uyDgiCfeMock (#207)', () => {
  it('returns deterministic authorization codes', () => {
    const a = mockUyDgiAuthorize('invoice', 9)
    const b = mockUyDgiAuthorize('invoice', 9)
    expect(a.authorizationCode).toBe(b.authorizationCode)
    expect(a.cfeId).toContain('CFE-EF')
    expect(mockUyDgiAuthorize('credit_note', 3).cfeId).toContain('CFE-NC')
  })

  it('rejects invalid document ids', () => {
    expect(() => mockUyDgiAuthorize('invoice', 0)).toThrow('MOCK_DGI_INVALID_DOCUMENT')
  })
})

describe('UruguayDgiFiscalAdapter (#207)', () => {
  let prisma: ReturnType<typeof buildPrismaMock>
  let adapter: UruguayDgiFiscalAdapter

  beforeEach(() => {
    prisma = buildPrismaMock()
    adapter = new UruguayDgiFiscalAdapter(prisma as unknown as PrismaClient)
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

  it('authorizeDocument stamps an invoice via the mock', async () => {
    const result = await adapter.authorizeDocument({
      tenantId: 1,
      documentType: 'invoice',
      invoiceId: 9,
      idempotencyKey: 'uy:factura:9',
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.status).toBe('authorized')
    expect(result.data.authorizationCode).toMatch(/^CFEEF/)
    expect(prisma.factura.update).toHaveBeenCalled()
  })
})
