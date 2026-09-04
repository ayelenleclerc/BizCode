/**
 * @en Uruguay DGI CFE adapter (homologación mock) implementing `FiscalProviderAdapter` (#207).
 * @es Adapter CFE DGI Uruguay (mock de homologación) que implementa `FiscalProviderAdapter` (#207).
 * @pt-BR Adapter CFE DGI Uruguai (mock de homologação) que implementa `FiscalProviderAdapter` (#207).
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
import { UruguayDgiService } from './UruguayDgiService'

export class UruguayDgiFiscalAdapter implements FiscalProviderAdapter {
  readonly provider: FiscalProviderCode = 'uruguay_dgi'
  readonly countryCode: FiscalCountryCode = 'UY'

  private readonly uruguayDgi: UruguayDgiService

  constructor(private readonly prisma: PrismaClient) {
    this.uruguayDgi = new UruguayDgiService(prisma)
  }

  async validateConfiguration(tenantId: number): Promise<ServiceResult<{ configured: boolean }>> {
    const status = await this.uruguayDgi.getConfigStatus(tenantId)
    return { ok: true, data: { configured: status.configured } }
  }

  async authenticate(tenantId: number): Promise<ServiceResult<FiscalAuthSession>> {
    const result = await this.uruguayDgi.getTa(tenantId)
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
      const result = await this.uruguayDgi.authorizeInvoice(request.tenantId, request.invoiceId)
      if (!result.ok) return result
      return {
        ok: true,
        data: {
          status: 'authorized',
          authorizationCode: result.data.authorizationCode,
          authorizationExpiresAt: result.data.authorizationExpiresAt,
          documentNumber: result.data.cfeId,
          raw: result.data,
        },
      }
    }

    if (request.notaCreditoId == null) {
      return { ok: false, status: 400, error: 'NOTA_CREDITO_ID_REQUIRED' }
    }
    const result = await this.uruguayDgi.authorizeCreditNote(request.tenantId, request.notaCreditoId)
    if (!result.ok) return result
    return {
      ok: true,
      data: {
        status: 'authorized',
        authorizationCode: result.data.authorizationCode,
        authorizationExpiresAt: result.data.authorizationExpiresAt,
        documentNumber: result.data.cfeId,
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
      displayName: 'DGI (Uruguay) — CFE (mock homologación)',
      implemented: true,
      supportsInvoice: true,
      supportsCreditNote: true,
      supportsCancel: false,
      supportsHealthCheck: true,
      supportsLastAuthorizedNumber: false,
      notes:
        'Homologación mock only (uyDgiCfeMock.ts); live DGI SOAP/REST and CFE cancel are Not evidenced in current codebase (#207).',
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
