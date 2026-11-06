/**
 * @en Chile SII DTE adapter (homologación mock) implementing `FiscalProviderAdapter` (#208).
 * @es Adapter DTE SII Chile (mock de homologación) que implementa `FiscalProviderAdapter` (#208).
 * @pt-BR Adapter DTE SII Chile (mock de homologação) que implementa `FiscalProviderAdapter` (#208).
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
import { ChileSiiService } from './ChileSiiService'

export class ChileSiiFiscalAdapter implements FiscalProviderAdapter {
  readonly provider: FiscalProviderCode = 'chile_sii'
  readonly countryCode: FiscalCountryCode = 'CL'

  private readonly chileSii: ChileSiiService

  constructor(private readonly prisma: PrismaClient) {
    this.chileSii = new ChileSiiService(prisma)
  }

  async validateConfiguration(tenantId: number): Promise<ServiceResult<{ configured: boolean }>> {
    const status = await this.chileSii.getConfigStatus(tenantId)
    return { ok: true, data: { configured: status.configured } }
  }

  async authenticate(tenantId: number): Promise<ServiceResult<FiscalAuthSession>> {
    const result = await this.chileSii.getTa(tenantId)
    if (!result.ok) return result
    return {
      ok: true,
      data: { token: result.data.token, sign: result.data.sign, expiration: result.data.expiration },
    }
  }

  async authorizeDocument(request: FiscalAuthorizeRequest): Promise<ServiceResult<FiscalAuthorizeResult>> {
    if (request.documentType === 'invoice') {
      if (request.invoiceId == null) {
        return { ok: false, status: 400, error: 'INVOICE_ID_REQUIRED' }
      }
      const result = await this.chileSii.authorizeInvoice(request.tenantId, request.invoiceId)
      if (!result.ok) return result
      return {
        ok: true,
        data: {
          status: 'authorized',
          authorizationCode: result.data.authorizationCode,
          authorizationExpiresAt: result.data.authorizationExpiresAt,
          documentNumber: result.data.dteId,
          raw: result.data,
        },
      }
    }

    if (request.notaCreditoId == null) {
      return { ok: false, status: 400, error: 'NOTA_CREDITO_ID_REQUIRED' }
    }
    const result = await this.chileSii.authorizeCreditNote(request.tenantId, request.notaCreditoId)
    if (!result.ok) return result
    return {
      ok: true,
      data: {
        status: 'authorized',
        authorizationCode: result.data.authorizationCode,
        authorizationExpiresAt: result.data.authorizationExpiresAt,
        documentNumber: result.data.dteId,
        raw: result.data,
      },
    }
  }

  async getDocumentStatus(
    tenantId: number,
    documentType: FiscalDocumentType,
    documentId: number,
  ): Promise<ServiceResult<FiscalDocumentStatusResult>> {
    if (documentType === 'invoice') {
      const factura = await this.prisma.factura.findFirst({
        where: { id: documentId, tenantId },
        select: { cae: true, caeVto: true, estadoCae: true },
      })
      if (!factura) return { ok: false, status: 404, error: 'Factura not found' }
      return {
        ok: true,
        data: {
          status: mapEstadoCaeToFiscalStatus(factura.estadoCae),
          authorizationCode: factura.cae ?? undefined,
          authorizationExpiresAt: factura.caeVto ?? undefined,
        },
      }
    }

    const nota = await this.prisma.notaCredito.findFirst({
      where: { id: documentId, tenantId },
      select: { cae: true, caeVto: true, estadoCae: true },
    })
    if (!nota) return { ok: false, status: 404, error: 'NotaCredito not found' }
    return {
      ok: true,
      data: {
        status: mapEstadoCaeToFiscalStatus(nota.estadoCae),
        authorizationCode: nota.cae ?? undefined,
        authorizationExpiresAt: nota.caeVto ?? undefined,
      },
    }
  }

  async healthCheck(tenantId: number): Promise<ServiceResult<{ healthy: boolean }>> {
    const auth = await this.authenticate(tenantId)
    return { ok: true, data: { healthy: auth.ok } }
  }

  getCapabilities(): FiscalProviderCapabilities {
    return {
      provider: this.provider,
      countryCode: this.countryCode,
      displayName: 'SII (Chile) — DTE (mock homologación)',
      implemented: true,
      supportsInvoice: true,
      supportsCreditNote: true,
      supportsCancel: false,
      supportsHealthCheck: true,
      supportsLastAuthorizedNumber: false,
      notes:
        'Homologación mock only (clSiiDteMock.ts); live SII SOAP/REST/XML XAdES and DTE cancel are Not evidenced in current codebase (#208).',
    }
  }
}

function mapEstadoCaeToFiscalStatus(
  estadoCae: string,
): 'pending' | 'authorized' | 'rejected' | 'failed' | 'cancelled' {
  if (estadoCae === 'issued') return 'authorized'
  if (estadoCae === 'pending') return 'pending'
  if (estadoCae === 'cancelled') return 'cancelled'
  if (estadoCae === 'not_required') return 'authorized'
  return 'failed'
}
