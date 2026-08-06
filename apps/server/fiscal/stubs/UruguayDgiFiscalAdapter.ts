/**
 * @en Capability-only stub for Uruguay's DGI e-invoicing (CFE). No live SOAP/REST client
 *   exists in this codebase; every operational method throws `FiscalAdapterNotImplementedError`
 *   so callers fail loudly instead of receiving invented data (#378).
 * @es Stub de solo capacidades para la facturación electrónica DGI de Uruguay (CFE). No
 *   existe cliente SOAP/REST real en este código; todo método operacional lanza
 *   `FiscalAdapterNotImplementedError` para fallar de forma explícita en vez de inventar datos (#378).
 * @pt-BR Stub apenas de capacidades para a nota fiscal eletrônica DGI do Uruguai (CFE). Não
 *   existe cliente SOAP/REST real neste código; todo método operacional lança
 *   `FiscalAdapterNotImplementedError` para falhar de forma explícita em vez de inventar dados (#378).
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

export class UruguayDgiFiscalAdapter implements FiscalProviderAdapter {
  readonly provider: FiscalProviderCode = 'uruguay_dgi'
  readonly countryCode: FiscalCountryCode = 'UY'

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
      displayName: 'DGI (Uruguay) — CFE',
      implemented: false,
      supportsInvoice: false,
      supportsCreditNote: false,
      supportsCancel: false,
      supportsHealthCheck: false,
      supportsLastAuthorizedNumber: false,
      notes: 'Not evidenced in current codebase — capability stub only (#378).',
    }
  }
}
