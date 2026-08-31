/**
 * @en Capability-only stub for Chile's SII e-invoicing (DTE). No live SOAP/REST client exists in
 *   this codebase — issuing a DTE requires a digital certificate and SII homologation — so every
 *   operational method throws `FiscalAdapterNotImplementedError` and callers fail loudly instead
 *   of receiving invented data (#208).
 * @es Stub de solo capacidades para la facturacion electronica del SII de Chile (DTE). No existe
 *   cliente SOAP/REST real en este codigo —emitir un DTE exige certificado digital y homologacion
 *   ante el SII—, asi que todo metodo operacional lanza `FiscalAdapterNotImplementedError` para
 *   fallar de forma explicita en vez de inventar datos (#208).
 * @pt-BR Stub apenas de capacidades para a nota fiscal eletronica do SII do Chile (DTE). Nao existe
 *   cliente SOAP/REST real neste codigo —emitir um DTE exige certificado digital e homologacao
 *   junto ao SII—, portanto todo metodo operacional lanca `FiscalAdapterNotImplementedError` para
 *   falhar de forma explicita em vez de inventar dados (#208).
 */

import type { PrismaClient } from '@prisma/client'
import type { ServiceResult } from '../../services/serviceResults'
import type { FiscalProviderAdapter } from '../FiscalProviderAdapter'
import type {
  FiscalAuthorizeRequest,
  FiscalAuthorizeResult,
  FiscalAuthSession,
  FiscalCountryCode,
  FiscalDocumentStatusResult,
  FiscalDocumentType,
  FiscalProviderCapabilities,
  FiscalProviderCode,
} from '../types'
import { FiscalAdapterNotImplementedError } from './FiscalAdapterNotImplementedError'

export class ChileSiiFiscalAdapter implements FiscalProviderAdapter {
  readonly provider: FiscalProviderCode = 'chile_sii'
  readonly countryCode: FiscalCountryCode = 'CL'

  /** @en `prisma` kept for interface parity with `ArcaFiscalAdapter`'s factory signature; unused by design. */
  constructor(private readonly prisma: PrismaClient) {
    void this.prisma
  }

  async validateConfiguration(_tenantId: number): Promise<ServiceResult<{ configured: boolean }>> {
    return { ok: true, data: { configured: false } }
  }

  async authenticate(_tenantId: number): Promise<ServiceResult<FiscalAuthSession>> {
    throw new FiscalAdapterNotImplementedError(this.provider, 'authenticate')
  }

  async authorizeDocument(_request: FiscalAuthorizeRequest): Promise<ServiceResult<FiscalAuthorizeResult>> {
    throw new FiscalAdapterNotImplementedError(this.provider, 'authorizeDocument')
  }

  async getDocumentStatus(
    _tenantId: number,
    _documentType: FiscalDocumentType,
    _documentId: number,
  ): Promise<ServiceResult<FiscalDocumentStatusResult>> {
    throw new FiscalAdapterNotImplementedError(this.provider, 'getDocumentStatus')
  }

  getCapabilities(): FiscalProviderCapabilities {
    return {
      provider: this.provider,
      countryCode: this.countryCode,
      displayName: 'SII (Chile) — DTE',
      implemented: false,
      supportsInvoice: false,
      supportsCreditNote: false,
      supportsCancel: false,
      supportsHealthCheck: false,
      supportsLastAuthorizedNumber: false,
      notes: 'Not evidenced in current codebase — capability stub only (#208).',
    }
  }
}
