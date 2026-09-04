/**
 * @en Mexico SAT CFDI service (homologación mock PAC) — stamps invoices/credit notes and
 *   cancels with SAT reason codes; no live PAC client (#210).
 * @es Servicio CFDI SAT México (mock PAC de homologación) — timbra facturas/NC y cancela
 *   con motivos SAT; sin cliente PAC real (#210).
 * @pt-BR Serviço CFDI SAT México (mock PAC de homologação) — timbra faturas/NC e cancela
 *   com motivos SAT; sem cliente PAC real (#210).
 */

import type { PrismaClient } from '@prisma/client'
import type { ServiceResult } from '../../services/serviceResults'
import { mockMxSatAuthenticate, mockMxSatCancel, mockMxSatStamp } from './mxSatPacMock'
import { isSatCfdiCancelReasonCode, type SatCfdiCancelReasonCode } from './satCatalogFixtures'

export class MexicoSatService {
  constructor(private readonly prisma: PrismaClient) {}

  async getConfigStatus(tenantId: number): Promise<{ configured: boolean; rfc?: string }> {
    const cfg = await this.prisma.fiscalProviderConfig.findUnique({
      where: { tenantId_providerCode: { tenantId, providerCode: 'mexico_sat_pac' } },
    })
    if (!cfg || !cfg.enabled) return { configured: false }
    const rfc = cfg.taxIdentifier?.trim()
    return { configured: Boolean(rfc), rfc: rfc || undefined }
  }

  async ensureConfigured(tenantId: number): Promise<ServiceResult<{ rfc: string }>> {
    const status = await this.getConfigStatus(tenantId)
    if (!status.configured || !status.rfc) {
      return { ok: false, status: 422, error: 'MEXICO_SAT_PAC_NOT_CONFIGURED' }
    }
    return { ok: true, data: { rfc: status.rfc } }
  }

  async getTa(tenantId: number): Promise<ServiceResult<ReturnType<typeof mockMxSatAuthenticate>>> {
    const cfg = await this.ensureConfigured(tenantId)
    if (!cfg.ok) return cfg
    return { ok: true, data: mockMxSatAuthenticate(cfg.data.rfc) }
  }

  async stampInvoice(
    tenantId: number,
    facturaId: number,
  ): Promise<ServiceResult<ReturnType<typeof mockMxSatStamp>>> {
    const cfg = await this.ensureConfigured(tenantId)
    if (!cfg.ok) return cfg
    const factura = await this.prisma.factura.findFirst({
      where: { id: facturaId, tenantId },
      select: { id: true, total: true },
    })
    if (!factura) return { ok: false, status: 404, error: 'Factura not found' }
    try {
      const stamp = mockMxSatStamp('invoice', factura.id)
      await this.prisma.factura.update({
        where: { id: factura.id },
        data: {
          cae: stamp.authorizationCode,
          caeVto: stamp.authorizationExpiresAt,
          estadoCae: 'issued',
        },
      })
      return { ok: true, data: stamp }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      return { ok: false, status: 422, error: message }
    }
  }

  async stampCreditNote(
    tenantId: number,
    notaCreditoId: number,
  ): Promise<ServiceResult<ReturnType<typeof mockMxSatStamp>>> {
    const cfg = await this.ensureConfigured(tenantId)
    if (!cfg.ok) return cfg
    const nota = await this.prisma.notaCredito.findFirst({
      where: { id: notaCreditoId, tenantId },
      select: { id: true },
    })
    if (!nota) return { ok: false, status: 404, error: 'NotaCredito not found' }
    try {
      const stamp = mockMxSatStamp('credit_note', nota.id)
      await this.prisma.notaCredito.update({
        where: { id: nota.id },
        data: {
          cae: stamp.authorizationCode,
          caeVto: stamp.authorizationExpiresAt,
          estadoCae: 'issued',
        },
      })
      return { ok: true, data: stamp }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      return { ok: false, status: 422, error: message }
    }
  }

  async cancelStampedDocument(
    tenantId: number,
    uuid: string,
    reasonCode: string,
  ): Promise<ServiceResult<{ uuid: string; reasonCode: SatCfdiCancelReasonCode; cancelledAt: Date }>> {
    const cfg = await this.ensureConfigured(tenantId)
    if (!cfg.ok) return cfg
    if (!isSatCfdiCancelReasonCode(reasonCode)) {
      return { ok: false, status: 400, error: 'INVALID_SAT_CANCEL_REASON' }
    }
    try {
      const result = mockMxSatCancel(uuid, reasonCode)
      return { ok: true, data: result }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      return { ok: false, status: 422, error: message }
    }
  }
}
