/**
 * @en `FiscalDocumentService` orchestration tests (#378, ADR-0018): persists one
 *   `FiscalDocument` attempt per authorization request and delegates the actual CAE
 *   request to the resolved adapter (ARCA today, via `ArcaService` mocks).
 * @es Tests de orquestación de `FiscalDocumentService` (#378, ADR-0018): persiste un
 *   intento `FiscalDocument` por solicitud de autorización y delega la solicitud real
 *   de CAE al adapter resuelto (ARCA hoy, vía mocks de `ArcaService`).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { FiscalDocumentService } from '../../../apps/server/fiscal/FiscalDocumentService'
import { encryptFiscalSecret } from '../../../apps/server/fiscal/ar/fiscalSecrets'
import { clearFiscalProviderRegistry } from '../../../apps/server/fiscal/fiscalProviderRegistry'
import { resetFiscalProvidersBootstrap } from '../../../apps/server/fiscal/bootstrapFiscalProviders'

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    fiscalProviderConfig: {
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    tenantFiscalConfig: {
      findUnique: vi.fn().mockResolvedValue({
        cuit: '20123456789',
        ambiente: 'homologacion',
        certEncrypted: encryptFiscalSecret('cert'),
        keyEncrypted: encryptFiscalSecret('key'),
      }),
    },
    tenantConfig: {
      findUnique: vi.fn().mockResolvedValue({ jurisdiccionFiscal: 'AR' }),
    },
    fiscalDocument: {
      findUnique: vi.fn().mockResolvedValue(null),
      create: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 1, attemptCount: 1, ...data })),
      update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 1, attemptCount: 1, ...data })),
    },
    factura: {
      findFirst: vi.fn().mockResolvedValue({ id: 9, total: 100, tipo: 'B' }),
      update: vi.fn().mockResolvedValue({}),
    },
    notaCredito: {
      findFirst: vi.fn().mockResolvedValue({ id: 5, monto: 50, estadoCae: 'pending', facturaOrigen: { tipo: 'A' } }),
      update: vi.fn().mockResolvedValue({}),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('FiscalDocumentService', () => {
  let prisma: PrismaClient
  let service: FiscalDocumentService

  beforeEach(() => {
    clearFiscalProviderRegistry()
    resetFiscalProvidersBootstrap()
    prisma = buildPrismaMock()
    service = new FiscalDocumentService(prisma)
  })

  it('authorizeInvoice resolves arca_wsfe from the legacy TenantFiscalConfig row and issues a mock CAE', async () => {
    const result = await service.authorizeInvoice(1, 9)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.provider).toBe('arca_wsfe')
      expect(result.data.status).toBe('authorized')
      expect(result.data.authorizationCode).toMatch(/^\d{14}$/)
    }
    expect(prisma.fiscalDocument.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ invoiceId: 9, providerCode: 'arca_wsfe', status: 'pending' }),
      }),
    )
    expect(prisma.fiscalDocument.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'authorized' }) }),
    )
  })

  it('authorizeInvoice fails with FISCAL_PROVIDER_NOT_CONFIGURED when the tenant has no provider set up', async () => {
    prisma = buildPrismaMock({ tenantFiscalConfig: { findUnique: vi.fn().mockResolvedValue(null) } })
    service = new FiscalDocumentService(prisma)

    const result = await service.authorizeInvoice(1, 9)
    expect(result).toEqual({ ok: false, status: 422, error: 'FISCAL_PROVIDER_NOT_CONFIGURED' })
    expect(prisma.fiscalDocument.create).not.toHaveBeenCalled()
  })

  it('authorizeInvoice is idempotent: returns the existing outcome when already authorized', async () => {
    prisma = buildPrismaMock({
      fiscalDocument: {
        findUnique: vi.fn().mockResolvedValue({
          id: 7,
          status: 'authorized',
          authorizationCode: '70000000000009',
          authorizationExpiresAt: new Date('2026-12-31'),
        }),
        create: vi.fn(),
        update: vi.fn(),
      },
    })
    service = new FiscalDocumentService(prisma)

    const result = await service.authorizeInvoice(1, 9)
    expect(result).toEqual({
      ok: true,
      data: {
        fiscalDocumentId: 7,
        status: 'authorized',
        authorizationCode: '70000000000009',
        authorizationExpiresAt: new Date('2026-12-31'),
        provider: 'arca_wsfe',
      },
    })
    expect(prisma.fiscalDocument.create).not.toHaveBeenCalled()
    expect(prisma.fiscalDocument.update).not.toHaveBeenCalled()
  })

  it('authorizeInvoice re-attempts (does not re-create) a previously failed FiscalDocument row', async () => {
    prisma = buildPrismaMock({
      fiscalDocument: {
        findUnique: vi.fn().mockResolvedValue({ id: 7, status: 'failed', attemptCount: 1 }),
        create: vi.fn(),
        update: vi.fn(async ({ data }: { data: Record<string, unknown> }) => ({ id: 7, attemptCount: 2, ...data })),
      },
    })
    service = new FiscalDocumentService(prisma)

    const result = await service.authorizeInvoice(1, 9)
    expect(result.ok).toBe(true)
    expect(prisma.fiscalDocument.create).not.toHaveBeenCalled()
    expect(prisma.fiscalDocument.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 7 }, data: expect.objectContaining({ attemptCount: 2 }) }),
    )
  })

  it('authorizeInvoice records a failed FiscalDocument attempt when the adapter rejects the request', async () => {
    prisma = buildPrismaMock({
      factura: { findFirst: vi.fn().mockResolvedValue({ id: 9, total: 100, tipo: 'X' }), update: vi.fn() },
    })
    service = new FiscalDocumentService(prisma)

    const result = await service.authorizeInvoice(1, 9)
    expect(result.ok).toBe(false)
    expect(prisma.fiscalDocument.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'failed', nextRetryAt: expect.any(Date) }),
      }),
    )
  })

  it('authorizeCreditNote resolves the default provider and issues a mock CAE for the credit note', async () => {
    const result = await service.authorizeCreditNote(1, 5)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.status).toBe('authorized')
    }
    expect(prisma.fiscalDocument.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ notaCreditoId: 5 }) }),
    )
  })

  it('authorizeInvoice fails with 501 when the resolved provider has no registered adapter', async () => {
    clearFiscalProviderRegistry()
    resetFiscalProvidersBootstrap()
    prisma = buildPrismaMock({
      fiscalProviderConfig: {
        findFirst: vi.fn().mockResolvedValue({ providerCode: 'uruguay_dgi' }),
        findUnique: vi.fn().mockResolvedValue(null),
        updateMany: vi.fn(),
      },
    })
    service = new FiscalDocumentService(prisma)
    // Registry is re-bootstrapped by the constructor above (uruguay_dgi IS registered as a stub),
    // so force an unregistered provider scenario by clearing the registry after construction.
    clearFiscalProviderRegistry()

    const result = await service.authorizeInvoice(1, 9)
    expect(result).toEqual({ ok: false, status: 501, error: 'FISCAL_PROVIDER_ADAPTER_NOT_REGISTERED' })
  })
})
