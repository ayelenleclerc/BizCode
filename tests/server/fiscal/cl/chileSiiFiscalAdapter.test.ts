/**
 * @en Chile SII DTE homologación mock adapter tests (#208).
 * @es Tests del adapter mock de homologación DTE SII Chile (#208).
 * @pt-BR Testes do adapter mock de homologação DTE SII Chile (#208).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { ChileSiiFiscalAdapter } from '../../../../apps/server/fiscal/cl/ChileSiiFiscalAdapter'
import { mockClSiiAuthorize } from '../../../../apps/server/fiscal/cl/clSiiDteMock'

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
      findFirst: vi.fn().mockResolvedValue({ id: 9, total: 100 }),
      update: vi.fn().mockResolvedValue({}),
    },
    notaCredito: {
      findFirst: vi.fn().mockResolvedValue({ id: 3 }),
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
})
