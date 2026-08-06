/**
 * @en Fiscal provider adapter that wraps the existing `ArcaService` (homologación mock
 *   WSAA/WSFE) as the first implementation of `FiscalProviderAdapter` (#378, ADR-0018).
 *   Does NOT create a second WSAA/WSFE client: every call delegates to `ArcaService`.
 * @es Adapter de proveedor fiscal que envuelve el `ArcaService` existente (mock de
 *   homologación WSAA/WSFE) como primera implementación de `FiscalProviderAdapter`
 *   (#378, ADR-0018). No crea un segundo cliente WSAA/WSFE: cada llamada delega en `ArcaService`.
 * @pt-BR Adapter de provedor fiscal que envolve o `ArcaService` existente (mock de
 *   homologação WSAA/WSFE) como primeira implementação de `FiscalProviderAdapter`
 *   (#378, ADR-0018). Não cria um segundo cliente WSAA/WSFE: cada chamada delega ao `ArcaService`.
 */

import type { PrismaClient } from '@prisma/client'
import type { ServiceResult } from '../../services/serviceResults'
import { ArcaService } from '../ar/ArcaService'
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

export class ArcaFiscalAdapter implements FiscalProviderAdapter {
  readonly provider: FiscalProviderCode = 'arca_wsfe'
  readonly countryCode: FiscalCountryCode = 'AR'

  private readonly arca: ArcaService

  constructor(private readonly prisma: PrismaClient) {
    this.arca = new ArcaService(prisma)
  }

  async validateConfiguration(tenantId: number): Promise<ServiceResult<{ configured: boolean }>> {
    const status = await this.arca.getConfigStatus(tenantId)
    return { ok: true, data: { configured: status.configured } }
  }

  async authenticate(tenantId: number): Promise<ServiceResult<FiscalAuthSession>> {
    const result = await this.arca.getTa(tenantId)
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
      const result = await this.arca.requestCaeForFactura(request.tenantId, request.invoiceId)
      if (!result.ok) return result
      return {
        ok: true,
        data: {
          status: 'authorized',
          authorizationCode: result.data.cae,
          authorizationExpiresAt: result.data.caeVto,
          raw: result.data,
        },
      }
    }

    if (request.notaCreditoId == null) {
      return { ok: false, status: 400, error: 'NOTA_CREDITO_ID_REQUIRED' }
    }
    const result = await this.arca.requestCaeForNotaCredito(request.tenantId, request.notaCreditoId)
    if (!result.ok) return result
    return {
      ok: true,
      data: {
        status: 'authorized',
        authorizationCode: result.data.cae,
        authorizationExpiresAt: result.data.caeVto,
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

  /**
   * @en Last issued invoice number for a point of sale (`prefijo`) and type (`tipo`),
   *   read from already-authorized `Factura` rows. AFIP's real `FECompUltimoAutorizado`
   *   SOAP call is Not evidenced in current codebase (mocks only); this is a best-effort
   *   local reconstruction from persisted CAE results.
   * @es Último número de factura emitido para un punto de venta (`prefijo`) y tipo (`tipo`),
   *   leído de filas `Factura` ya autorizadas. La llamada SOAP real `FECompUltimoAutorizado`
   *   de AFIP no está evidenciada en el código actual (solo mocks); esto es una
   *   reconstrucción local best-effort a partir de resultados CAE persistidos.
   * @pt-BR Último número de fatura emitido para um ponto de venda (`prefijo`) e tipo (`tipo`),
   *   lido de linhas `Factura` já autorizadas. A chamada SOAP real `FECompUltimoAutorizado`
   *   da AFIP não está evidenciada no código atual (apenas mocks); isso é uma
   *   reconstrução local best-effort a partir de resultados CAE persistidos.
   */
  async getLastAuthorizedNumber(
    tenantId: number,
    pointOfSale: string,
    documentType: FiscalDocumentType,
  ): Promise<ServiceResult<{ number: number }>> {
    if (documentType !== 'invoice') {
      return { ok: false, status: 422, error: 'ARCA_LAST_NUMBER_ONLY_SUPPORTS_INVOICE' }
    }
    const last = await this.prisma.factura.findFirst({
      where: { tenantId, prefijo: pointOfSale, estadoCae: 'issued' },
      orderBy: { numero: 'desc' },
      select: { numero: true },
    })
    return { ok: true, data: { number: last?.numero ?? 0 } }
  }

  async healthCheck(tenantId: number): Promise<ServiceResult<{ healthy: boolean }>> {
    const auth = await this.authenticate(tenantId)
    return { ok: true, data: { healthy: auth.ok } }
  }

  getCapabilities(): FiscalProviderCapabilities {
    return {
      provider: this.provider,
      countryCode: this.countryCode,
      displayName: 'ARCA / AFIP (Argentina) — WSFE',
      implemented: true,
      supportsInvoice: true,
      supportsCreditNote: true,
      supportsCancel: false,
      supportsHealthCheck: true,
      supportsLastAuthorizedNumber: true,
      notes: 'Homologación mock only (arcaWsfeMock.ts); live SOAP AFIP is Not evidenced in current codebase.',
    }
  }
}

function mapEstadoCaeToFiscalStatus(estadoCae: string): 'pending' | 'authorized' | 'rejected' | 'failed' {
  if (estadoCae === 'issued') return 'authorized'
  if (estadoCae === 'pending') return 'pending'
  if (estadoCae === 'not_required') return 'authorized'
  return 'failed'
}
