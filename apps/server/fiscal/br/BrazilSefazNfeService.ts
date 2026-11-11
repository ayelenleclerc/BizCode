/**
 * @en Brazil SEFAZ NF-e service (homologación mock) — authorizes invoices/credit notes;
 *   no live SEFAZ client (#211). Cancel is Not evidenced (supportsCancel: false on adapter).
 * @es Servicio NF-e SEFAZ Brasil (mock de homologación) — autoriza facturas/NC;
 *   sin cliente SEFAZ real (#211). Cancelación no evidenciada (supportsCancel: false).
 * @pt-BR Serviço NF-e SEFAZ Brasil (mock de homologação) — autoriza faturas/NC;
 *   sem cliente SEFAZ real (#211). Cancelamento não evidenciado (supportsCancel: false).
 */

import type { PrismaClient } from '@prisma/client'
import type { ServiceResult } from '../../services/serviceResults'
import { mockBrSefazAuthenticate, mockBrSefazAuthorize } from './brSefazNfeMock'

export class BrazilSefazNfeService {
  constructor(private readonly prisma: PrismaClient) {}

  async getConfigStatus(tenantId: number): Promise<{ configured: boolean; cnpj?: string }> {
    const cfg = await this.prisma.fiscalProviderConfig.findUnique({
      where: { tenantId_providerCode: { tenantId, providerCode: 'brazil_sefaz_nfe' } },
    })
    if (!cfg || !cfg.enabled) return { configured: false }
    const cnpj = cfg.taxIdentifier?.trim()
    return { configured: Boolean(cnpj), cnpj: cnpj || undefined }
  }

  async ensureConfigured(tenantId: number): Promise<ServiceResult<{ cnpj: string }>> {
    const status = await this.getConfigStatus(tenantId)
    if (!status.configured || !status.cnpj) {
      return { ok: false, status: 422, error: 'BRAZIL_SEFAZ_NOT_CONFIGURED' }
    }
    return { ok: true, data: { cnpj: status.cnpj } }
  }

  async getTa(tenantId: number): Promise<ServiceResult<ReturnType<typeof mockBrSefazAuthenticate>>> {
    const cfg = await this.ensureConfigured(tenantId)
    if (!cfg.ok) return cfg
    return { ok: true, data: mockBrSefazAuthenticate(cfg.data.cnpj) }
  }

  async authorizeInvoice(
    tenantId: number,
    facturaId: number,
  ): Promise<ServiceResult<ReturnType<typeof mockBrSefazAuthorize>>> {
    const cfg = await this.ensureConfigured(tenantId)
    if (!cfg.ok) return cfg
    const factura = await this.prisma.factura.findFirst({
      where: { id: facturaId, tenantId },
      select: { id: true },
    })
    if (!factura) return { ok: false, status: 404, error: 'Factura not found' }
    try {
      const auth = mockBrSefazAuthorize('invoice', factura.id)
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
  ): Promise<ServiceResult<ReturnType<typeof mockBrSefazAuthorize>>> {
    const cfg = await this.ensureConfigured(tenantId)
    if (!cfg.ok) return cfg
    const nota = await this.prisma.notaCredito.findFirst({
      where: { id: notaCreditoId, tenantId },
      select: { id: true },
    })
    if (!nota) return { ok: false, status: 404, error: 'NotaCredito not found' }
    try {
      const auth = mockBrSefazAuthorize('credit_note', nota.id)
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
