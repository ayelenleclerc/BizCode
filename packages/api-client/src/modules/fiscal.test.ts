/**
 * @en `fiscalAPI` client tests (#378, ADR-0018) — multi-organism fiscal provider config,
 *   capabilities and document authorization.
 * @es Tests de `fiscalAPI` (#378, ADR-0018) — config/capacidades de proveedor fiscal
 *   multi-organismo y autorización de documentos.
 */
import { afterEach, describe, expect, it, vi } from 'vitest'
import { api } from '../default-client'
import { fiscalAPI, type FiscalProviderStatusEntry } from './rest'

const arcaStatus: FiscalProviderStatusEntry = {
  provider: 'arca_wsfe',
  countryCode: 'AR',
  capabilities: {
    provider: 'arca_wsfe',
    countryCode: 'AR',
    displayName: 'ARCA / AFIP (Argentina) — WSFE',
    implemented: true,
    supportsInvoice: true,
    supportsCreditNote: true,
    supportsCancel: false,
    supportsHealthCheck: true,
    supportsLastAuthorizedNumber: true,
  },
  configured: true,
  enabled: true,
  isDefault: true,
  environment: 'homologacion',
  taxIdentifier: '20123456789',
}

describe('fiscalAPI', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('getProvidersConfig returns the tenant status list', async () => {
    vi.spyOn(api, 'get').mockResolvedValueOnce({ data: { success: true, data: [arcaStatus] } })
    await expect(fiscalAPI.getProvidersConfig()).resolves.toEqual([arcaStatus])
    expect(api.get).toHaveBeenCalledWith('/fiscal/providers/config')
  })

  it('putProvidersConfig sends the provider payload', async () => {
    vi.spyOn(api, 'put').mockResolvedValueOnce({ data: { success: true, data: { configured: true } } })
    await expect(
      fiscalAPI.putProvidersConfig({
        provider: 'arca_wsfe',
        cuit: '20123456789',
        certificate: 'cert',
        privateKey: 'key',
        ambiente: 'homologacion',
      }),
    ).resolves.toEqual({ configured: true })
    expect(api.put).toHaveBeenCalledWith('/fiscal/providers/config', {
      provider: 'arca_wsfe',
      cuit: '20123456789',
      certificate: 'cert',
      privateKey: 'key',
      ambiente: 'homologacion',
    })
  })

  it('validateProvider posts the provider code', async () => {
    vi.spyOn(api, 'post').mockResolvedValueOnce({ data: { success: true, data: { configured: true } } })
    await expect(fiscalAPI.validateProvider('arca_wsfe')).resolves.toEqual({ configured: true })
    expect(api.post).toHaveBeenCalledWith('/fiscal/providers/validate', { provider: 'arca_wsfe' })
  })

  it('getCapabilities lists every registered provider', async () => {
    vi.spyOn(api, 'get').mockResolvedValueOnce({
      data: { success: true, data: [arcaStatus.capabilities] },
    })
    await expect(fiscalAPI.getCapabilities()).resolves.toEqual([arcaStatus.capabilities])
    expect(api.get).toHaveBeenCalledWith('/fiscal/providers/capabilities')
  })

  it('authorizeDocument posts to the facturaId-scoped endpoint', async () => {
    vi.spyOn(api, 'post').mockResolvedValueOnce({
      data: {
        success: true,
        data: { fiscalDocumentId: 1, status: 'authorized', authorizationCode: '7000...', provider: 'arca_wsfe' },
      },
    })
    await expect(fiscalAPI.authorizeDocument(9)).resolves.toMatchObject({
      status: 'authorized',
      provider: 'arca_wsfe',
    })
    expect(api.post).toHaveBeenCalledWith('/fiscal/documents/9/authorize')
  })
})
