/**
 * @en Capability-only stub for Mexico's SAT CFDI e-invoicing via a PAC (Proveedor
 *   Autorizado de Certificación). No live PAC client exists in this codebase; every
 *   operational method throws `FiscalAdapterNotImplementedError` (#378).
 * @es Stub de solo capacidades para CFDI del SAT de México vía un PAC (Proveedor
 *   Autorizado de Certificación). No existe cliente PAC real en este código; todo
 *   método operacional lanza `FiscalAdapterNotImplementedError` (#378).
 * @pt-BR Stub apenas de capacidades para CFDI do SAT do México via um PAC (Proveedor
 *   Autorizado de Certificación). Não existe cliente PAC real neste código; todo
 *   método operacional lança `FiscalAdapterNotImplementedError` (#378).
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

export class MexicoSatFiscalAdapter implements FiscalProviderAdapter {
  readonly provider: FiscalProviderCode = 'mexico_sat_pac'
  readonly countryCode: FiscalCountryCode = 'MX'

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
      displayName: 'SAT (México) — CFDI vía PAC',
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
