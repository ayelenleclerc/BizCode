/**
 * @en `FiscalDocumentRetryService` tests (#378, ADR-0018): reprocesses `Factura` rows
 *   stuck in `estadoCae = 'pending'` through `FiscalDocumentService`, so each retry is
 *   also recorded on `FiscalDocument`.
 * @es Tests de `FiscalDocumentRetryService` (#378, ADR-0018): reprocesa filas `Factura`
 *   en `estadoCae = 'pending'` a través de `FiscalDocumentService`, para que cada
 *   reintento también quede registrado en `FiscalDocument`.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { FiscalDocumentRetryService } from '../../../apps/server/fiscal/FiscalDocumentRetryService'
import { encryptFiscalSecret } from '../../../apps/server/fiscal/ar/fiscalSecrets'
import { clearFiscalProviderRegistry } from '../../../apps/server/fiscal/fiscalProviderRegistry'
import { resetFiscalProvidersBootstrap } from '../../../apps/server/fiscal/bootstrapFiscalProviders'

function buildPrismaMock(overrides: Partial<Record<string, unknown>> = {}): PrismaClient {
  return {
    fiscalProviderConfig: {
      findFirst: vi.fn().mockResolvedValue(null),
      findUnique: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn(),
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
      findMany: vi.fn().mockResolvedValue([{ id: 9 }, { id: 10 }]),
      findFirst: vi.fn().mockResolvedValue({ id: 9, total: 100, tipo: 'B' }),
      update: vi.fn().mockResolvedValue({}),
    },
    ...overrides,
  } as unknown as PrismaClient
}

describe('FiscalDocumentRetryService', () => {
  let prisma: PrismaClient
  let service: FiscalDocumentRetryService

  beforeEach(() => {
    clearFiscalProviderRegistry()
    resetFiscalProvidersBootstrap()
    prisma = buildPrismaMock()
    service = new FiscalDocumentRetryService(prisma)
  })

  it('queries only pending Facturas for the tenant, capped at 50 rows', async () => {
    await service.retryPending(1)
    expect(prisma.factura.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { tenantId: 1, estadoCae: 'pending' }, take: 50 }),
    )
  })

  it('processes every pending Factura and reports how many were issued', async () => {
    prisma = buildPrismaMock({
      factura: {
        findMany: vi.fn().mockResolvedValue([{ id: 9 }]),
        findFirst: vi.fn().mockResolvedValue({ id: 9, total: 100, tipo: 'B' }),
        update: vi.fn().mockResolvedValue({}),
      },
    })
    service = new FiscalDocumentRetryService(prisma)

    const summary = await service.retryPending(1)
    expect(summary).toEqual({ processed: 1, issued: 1, failed: 0 })
  })

  it('counts unsupported invoice tipos as failed retries', async () => {
    prisma = buildPrismaMock({
      factura: {
        findMany: vi.fn().mockResolvedValue([{ id: 9 }]),
        findFirst: vi.fn().mockResolvedValue({ id: 9, total: 100, tipo: 'X' }),
        update: vi.fn().mockResolvedValue({}),
      },
    })
    service = new FiscalDocumentRetryService(prisma)

    const summary = await service.retryPending(1)
    expect(summary).toEqual({ processed: 1, issued: 0, failed: 1 })
  })

  it('reports zero processed when there are no pending Facturas', async () => {
    prisma = buildPrismaMock({
      factura: { findMany: vi.fn().mockResolvedValue([]), findFirst: vi.fn(), update: vi.fn() },
    })
    service = new FiscalDocumentRetryService(prisma)

    const summary = await service.retryPending(1)
    expect(summary).toEqual({ processed: 0, issued: 0, failed: 0 })
  })
})
