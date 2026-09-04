/**
 * @en Uruguay DGI CFE service (homologación mock) — authorizes invoices/credit notes;
 *   no live DGI client (#207). Cancel is Not evidenced (supportsCancel: false on adapter).
 * @es Servicio CFE DGI Uruguay (mock de homologación) — autoriza facturas/NC;
 *   sin cliente DGI real (#207). Cancelación no evidenciada (supportsCancel: false).
 * @pt-BR Serviço CFE DGI Uruguai (mock de homologação) — autoriza faturas/NC;
 *   sem cliente DGI real (#207). Cancelamento não evidenciado (supportsCancel: false).
 */

import type { PrismaClient } from '@prisma/client'
import type { ServiceResult } from '../../services/serviceResults'
import { mockUyDgiAuthenticate, mockUyDgiAuthorize } from './uyDgiCfeMock'

export class UruguayDgiService {
  constructor(private readonly prisma: PrismaClient) {}

  async getConfigStatus(tenantId: number): Promise<{ configured: boolean; rut?: string }> {
    const cfg = await this.prisma.fiscalProviderConfig.findUnique({
      where: { tenantId_providerCode: { tenantId, providerCode: 'uruguay_dgi' } },
    })
    if (!cfg || !cfg.enabled) return { configured: false }
    const rut = cfg.taxIdentifier?.trim()
    return { configured: Boolean(rut), rut: rut || undefined }
  }

  async ensureConfigured(tenantId: number): Promise<ServiceResult<{ rut: string }>> {
    const status = await this.getConfigStatus(tenantId)
    if (!status.configured || !status.rut) {
      return { ok: false, status: 422, error: 'URUGUAY_DGI_NOT_CONFIGURED' }
    }
    return { ok: true, data: { rut: status.rut } }
  }

  async getTa(tenantId: number): Promise<ServiceResult<ReturnType<typeof mockUyDgiAuthenticate>>> {
    const cfg = await this.ensureConfigured(tenantId)
    if (!cfg.ok) return cfg
    return { ok: true, data: mockUyDgiAuthenticate(cfg.data.rut) }
  }

  async authorizeInvoice(
    tenantId: number,
    facturaId: number,
  ): Promise<ServiceResult<ReturnType<typeof mockUyDgiAuthorize>>> {
    const cfg = await this.ensureConfigured(tenantId)
    if (!cfg.ok) return cfg
    const factura = await this.prisma.factura.findFirst({
      where: { id: facturaId, tenantId },
      select: { id: true },
    })
    if (!factura) return { ok: false, status: 404, error: 'Factura not found' }
    try {
      const auth = mockUyDgiAuthorize('invoice', factura.id)
      await this.prisma.factura.update({
        where: { id: factura.id },
        data: {
          cae: auth.authorizationCode,
          caeVto: auth.authorizationExpiresAt,
          estadoCae: 'issued',
        },
      })
      return { ok: true, data: auth }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      return { ok: false, status: 422, error: message }
    }
  }

  async authorizeCreditNote(
    tenantId: number,
    notaCreditoId: number,
  ): Promise<ServiceResult<ReturnType<typeof mockUyDgiAuthorize>>> {
    const cfg = await this.ensureConfigured(tenantId)
    if (!cfg.ok) return cfg
    const nota = await this.prisma.notaCredito.findFirst({
      where: { id: notaCreditoId, tenantId },
      select: { id: true },
    })
    if (!nota) return { ok: false, status: 404, error: 'NotaCredito not found' }
    try {
      const auth = mockUyDgiAuthorize('credit_note', nota.id)
      await this.prisma.notaCredito.update({
        where: { id: nota.id },
        data: {
          cae: auth.authorizationCode,
          caeVto: auth.authorizationExpiresAt,
          estadoCae: 'issued',
        },
      })
      return { ok: true, data: auth }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      return { ok: false, status: 422, error: message }
    }
  }
}
