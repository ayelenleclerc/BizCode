/**
 * @en Brazil SEFAZ NF-e homologación mock adapter tests (#211).
 * @es Tests del adapter mock de homologación NF-e SEFAZ Brasil (#211).
 * @pt-BR Testes do adapter mock de homologação NF-e SEFAZ Brasil (#211).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { BrazilSefazNfeFiscalAdapter } from '../../../../apps/server/fiscal/br/BrazilSefazNfeFiscalAdapter'
import { BrazilSefazNfeService } from '../../../../apps/server/fiscal/br/BrazilSefazNfeService'
import {
  mockBrSefazAuthenticate,
  mockBrSefazAuthorize,
} from '../../../../apps/server/fiscal/br/brSefazNfeMock'

const VALID_CNPJ = '11222333000181'

function buildPrismaMock() {
  return {
    fiscalProviderConfig: {
      findUnique: vi.fn().mockResolvedValue({
        enabled: true,
        taxIdentifier: VALID_CNPJ,
      }),
    },
    factura: {
      findFirst: vi
        .fn()
        .mockResolvedValue({
          id: 9,
          total: 100,
          cae: 'NFe5500000009',
          caeVto: new Date('2027-01-01'),
          estadoCae: 'issued',
        }),
      update: vi.fn().mockResolvedValue({}),
    },
    notaCredito: {
      findFirst: vi.fn().mockResolvedValue({ id: 3, cae: null, caeVto: null, estadoCae: 'pending' }),
      update: vi.fn().mockResolvedValue({}),
    },
  }
}

describe('brSefazNfeMock (#211)', () => {
  it('returns deterministic authorization codes', () => {
    const a = mockBrSefazAuthorize('invoice', 9)
    const b = mockBrSefazAuthorize('invoice', 9)
    expect(a.authorizationCode).toBe(b.authorizationCode)
    expect(a.nfeId).toContain('NFe-55')
    expect(mockBrSefazAuthorize('credit_note', 3).nfeId).toContain('NFe-DEV')
  })

  it('rejects invalid document ids', () => {
    expect(() => mockBrSefazAuthorize('invoice', 0)).toThrow('MOCK_SEFAZ_INVALID_DOCUMENT')
  })

  it('builds a deterministic mock session from a formatted CNPJ', () => {
    const session = mockBrSefazAuthenticate('11.222.333/0001-81')
    expect(session.token).toBe('MOCK-SEFAZ-TOKEN-11222333000181')
    expect(session.sign).toBe('MOCK-SEFAZ-SIGN')
    expect(session.expiration.getTime()).toBeGreaterThan(Date.now())
  })
})

describe('BrazilSefazNfeService (#211)', () => {
  let prisma: ReturnType<typeof buildPrismaMock>
  let service: BrazilSefazNfeService

  beforeEach(() => {
    prisma = buildPrismaMock()
    service = new BrazilSefazNfeService(prisma as unknown as PrismaClient)
  })

  it('getTa returns BRAZIL_SEFAZ_NOT_CONFIGURED when the provider is disabled', async () => {
    prisma.fiscalProviderConfig.findUnique.mockResolvedValueOnce({
      enabled: false,
      taxIdentifier: VALID_CNPJ,
    })
    const result = await service.getTa(1)
    expect(result).toEqual({ ok: false, status: 422, error: 'BRAZIL_SEFAZ_NOT_CONFIGURED' })
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
    expect(result.data.nfeId).toContain('NFe-DEV')
    expect(prisma.notaCredito.update).toHaveBeenCalled()
  })

  it('authorizeInvoice maps mock authorize errors to 422', async () => {
    prisma.factura.findFirst.mockResolvedValueOnce({ id: 0 })
    const result = await service.authorizeInvoice(1, 0)
    expect(result).toEqual({ ok: false, status: 422, error: 'MOCK_SEFAZ_INVALID_DOCUMENT' })
  })
})

describe('BrazilSefazNfeFiscalAdapter (#211)', () => {
  let prisma: ReturnType<typeof buildPrismaMock>
  let adapter: BrazilSefazNfeFiscalAdapter

  beforeEach(() => {
    prisma = buildPrismaMock()
    adapter = new BrazilSefazNfeFiscalAdapter(prisma as unknown as PrismaClient)
  })

  it('reports implemented mock capabilities without cancel', () => {
    const caps = adapter.getCapabilities()
    expect(caps.provider).toBe('brazil_sefaz_nfe')
    expect(caps.countryCode).toBe('BR')
    expect(caps.implemented).toBe(true)
    expect(caps.supportsCancel).toBe(false)
  })

  it('authorizeDocument stamps an invoice', async () => {
    const result = await adapter.authorizeDocument({
      tenantId: 1,
      documentType: 'invoice',
      invoiceId: 9,
      idempotencyKey: 'brazil_sefaz_nfe:invoice:9',
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.status).toBe('authorized')
    expect(result.data.documentNumber).toContain('NFe-55')
  })

  it('getDocumentStatus maps issued factura to authorized', async () => {
    const result = await adapter.getDocumentStatus(1, 'invoice', 9)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.data.status).toBe('authorized')
  })
})
