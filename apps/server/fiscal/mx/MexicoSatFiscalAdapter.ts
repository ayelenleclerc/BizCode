/**
 * @en Mexico SAT CFDI adapter (homologación mock PAC) implementing `FiscalProviderAdapter` (#210).
 * @es Adapter CFDI SAT México (mock PAC de homologación) que implementa `FiscalProviderAdapter` (#210).
 * @pt-BR Adapter CFDI SAT México (mock PAC de homologação) que implementa `FiscalProviderAdapter` (#210).
 */

import type { PrismaClient } from '@prisma/client'
import type { ServiceResult } from '../../services/serviceResults'
import type { FiscalProviderAdapter } from '../FiscalProviderAdapter'
import type {
  FiscalAuthorizeRequest,
  FiscalAuthorizeResult,
  FiscalAuthSession,
  FiscalCancelOptions,
  FiscalCountryCode,
  FiscalDocumentStatusResult,
  FiscalDocumentType,
  FiscalProviderCapabilities,
  FiscalProviderCode,
} from '../types'
import { MexicoSatService } from './MexicoSatService'

export class MexicoSatFiscalAdapter implements FiscalProviderAdapter {
  readonly provider: FiscalProviderCode = 'mexico_sat_pac'
  readonly countryCode: FiscalCountryCode = 'MX'

  private readonly mexicoSat: MexicoSatService

  constructor(private readonly prisma: PrismaClient) {
    this.mexicoSat = new MexicoSatService(prisma)
  }

  async validateConfiguration(tenantId: number): Promise<ServiceResult<{ configured: boolean }>> {
    const status = await this.mexicoSat.getConfigStatus(tenantId)
    return { ok: true, data: { configured: status.configured } }
  }

  async authenticate(tenantId: number): Promise<ServiceResult<FiscalAuthSession>> {
    const result = await this.mexicoSat.getTa(tenantId)
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
      const result = await this.mexicoSat.stampInvoice(request.tenantId, request.invoiceId)
      if (!result.ok) return result
      return {
        ok: true,
        data: {
          status: 'authorized',
          authorizationCode: result.data.authorizationCode,
          authorizationExpiresAt: result.data.authorizationExpiresAt,
          documentNumber: result.data.uuid,
          raw: result.data,
        },
      }
    }

    if (request.notaCreditoId == null) {
      return { ok: false, status: 400, error: 'NOTA_CREDITO_ID_REQUIRED' }
    }
    const result = await this.mexicoSat.stampCreditNote(request.tenantId, request.notaCreditoId)
    if (!result.ok) return result
    return {
      ok: true,
      data: {
        status: 'authorized',
        authorizationCode: result.data.authorizationCode,
        authorizationExpiresAt: result.data.authorizationExpiresAt,
        documentNumber: result.data.uuid,
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

  async cancel(
    tenantId: number,
    documentType: FiscalDocumentType,
    documentId: number,
    options?: FiscalCancelOptions,
  ): Promise<ServiceResult<void>> {
    const reasonCode = options?.reasonCode
    if (!reasonCode) {
      return { ok: false, status: 400, error: 'SAT_CANCEL_REASON_REQUIRED' }
    }

    const fiscalDoc = await this.prisma.fiscalDocument.findFirst({
      where: {
        tenantId,
        documentType,
        ...(documentType === 'invoice' ? { invoiceId: documentId } : { notaCreditoId: documentId }),
        status: 'authorized',
      },
      orderBy: { id: 'desc' },
    })
    if (!fiscalDoc?.documentNumber && !fiscalDoc?.authorizationCode) {
      return { ok: false, status: 404, error: 'FISCAL_DOCUMENT_NOT_AUTHORIZED' }
    }
    const uuid = fiscalDoc.documentNumber ?? fiscalDoc.authorizationCode ?? ''
    const result = await this.mexicoSat.cancelStampedDocument(tenantId, uuid, reasonCode)
    if (!result.ok) return result

    if (documentType === 'invoice') {
      await this.prisma.factura.updateMany({
        where: { id: documentId, tenantId },
        data: { estadoCae: 'cancelled' },
      })
    } else {
      await this.prisma.notaCredito.updateMany({
        where: { id: documentId, tenantId },
        data: { estadoCae: 'cancelled' },
      })
    }

    return { ok: true, data: undefined }
  }

  async healthCheck(tenantId: number): Promise<ServiceResult<{ healthy: boolean }>> {
    const auth = await this.authenticate(tenantId)
    return { ok: true, data: { healthy: auth.ok } }
  }

  getCapabilities(): FiscalProviderCapabilities {
    return {
      provider: this.provider,
      countryCode: this.countryCode,
      displayName: 'SAT (México) — CFDI vía PAC (mock homologación)',
      implemented: true,
      supportsInvoice: true,
      supportsCreditNote: true,
      supportsCancel: true,
      supportsHealthCheck: true,
      supportsLastAuthorizedNumber: false,
      notes:
        'Homologación mock only (mxSatPacMock.ts); live PAC/SAT REST is Not evidenced in current codebase (#210).',
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
