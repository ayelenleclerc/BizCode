/**
 * @en Capability-only stub adapters must reject every operational call with
 *   `FiscalAdapterNotImplementedError` instead of inventing data (#378, ADR-0018).
 * @es Los adapters stub de capacidades deben rechazar toda operación real con
 *   `FiscalAdapterNotImplementedError` en vez de inventar datos (#378, ADR-0018).
 */

import { beforeEach, describe, expect, it } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { UruguayDgiFiscalAdapter } from '../../../../apps/server/fiscal/stubs/UruguayDgiFiscalAdapter'
import { ChileSiiFiscalAdapter } from '../../../../apps/server/fiscal/stubs/ChileSiiFiscalAdapter'
import { MexicoSatFiscalAdapter } from '../../../../apps/server/fiscal/stubs/MexicoSatFiscalAdapter'
import { FiscalAdapterNotImplementedError } from '../../../../apps/server/fiscal/stubs/FiscalAdapterNotImplementedError'
import type { FiscalProviderAdapter } from '../../../../apps/server/fiscal/FiscalProviderAdapter'

const prisma = {} as unknown as PrismaClient

describe.each([
  { name: 'UruguayDgiFiscalAdapter', Adapter: UruguayDgiFiscalAdapter, provider: 'uruguay_dgi', countryCode: 'UY' },
  { name: 'ChileSiiFiscalAdapter', Adapter: ChileSiiFiscalAdapter, provider: 'chile_sii', countryCode: 'CL' },
  { name: 'MexicoSatFiscalAdapter', Adapter: MexicoSatFiscalAdapter, provider: 'mexico_sat_pac', countryCode: 'MX' },
])('$name (#378 capability stub)', ({ Adapter, provider, countryCode }) => {
  let adapter: FiscalProviderAdapter

  beforeEach(() => {
    adapter = new Adapter(prisma)
  })

  it('declares capabilities as not implemented', () => {
    const capabilities = adapter.getCapabilities()
    expect(capabilities.provider).toBe(provider)
    expect(capabilities.countryCode).toBe(countryCode)
    expect(capabilities.implemented).toBe(false)
    expect(capabilities.supportsInvoice).toBe(false)
    expect(capabilities.supportsCreditNote).toBe(false)
    expect(capabilities.notes).toMatch(/Not evidenced in current codebase/)
  })

  it('validateConfiguration reports not configured without throwing', async () => {
    const result = await adapter.validateConfiguration(1)
    expect(result).toEqual({ ok: true, data: { configured: false } })
  })

  it('authenticate throws FiscalAdapterNotImplementedError', async () => {
    await expect(adapter.authenticate(1)).rejects.toBeInstanceOf(FiscalAdapterNotImplementedError)
  })

  it('authorizeDocument throws FiscalAdapterNotImplementedError', async () => {
    await expect(
      adapter.authorizeDocument({
        tenantId: 1,
        documentType: 'invoice',
        invoiceId: 1,
        idempotencyKey: `${provider}:factura:1`,
      }),
    ).rejects.toBeInstanceOf(FiscalAdapterNotImplementedError)
  })

  it('getDocumentStatus throws FiscalAdapterNotImplementedError', async () => {
    await expect(adapter.getDocumentStatus(1, 'invoice', 1)).rejects.toBeInstanceOf(FiscalAdapterNotImplementedError)
  })

  it('does not implement optional cancel/getLastAuthorizedNumber/healthCheck', () => {
    expect(adapter.cancel).toBeUndefined()
    expect(adapter.getLastAuthorizedNumber).toBeUndefined()
    expect(adapter.healthCheck).toBeUndefined()
  })
})
