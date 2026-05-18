import type { PrismaClient } from '@prisma/client'
import type { ServiceResult } from '../../services/serviceResults'
import { decryptFiscalSecret, encryptFiscalSecret } from './fiscalSecrets'
import { mockRequestCae, mockRequestTa, type AfipTaResult } from './afipWsfeMock'

export type FiscalConfigInput = {
  cuit: string
  certificate: string
  privateKey: string
  ambiente?: 'homologacion' | 'produccion'
}

const taCache = new Map<number, AfipTaResult>()

/** @en Argentina AFIP CAE (homologación mock). */
export class AfipService {
  constructor(private readonly prisma: PrismaClient) {}

  async upsertConfig(tenantId: number, input: FiscalConfigInput): Promise<ServiceResult<{ id: number }>> {
    const row = await this.prisma.tenantFiscalConfig.upsert({
      where: { tenantId },
      create: {
        tenantId,
        cuit: input.cuit.trim(),
        certEncrypted: encryptFiscalSecret(input.certificate),
        keyEncrypted: encryptFiscalSecret(input.privateKey),
        ambiente: input.ambiente ?? 'homologacion',
      },
      update: {
        cuit: input.cuit.trim(),
        certEncrypted: encryptFiscalSecret(input.certificate),
        keyEncrypted: encryptFiscalSecret(input.privateKey),
        ambiente: input.ambiente ?? 'homologacion',
      },
      select: { id: true },
    })
    return { ok: true, data: row }
  }

  async getTa(tenantId: number): Promise<ServiceResult<AfipTaResult>> {
    const config = await this.prisma.tenantFiscalConfig.findUnique({ where: { tenantId } })
    if (!config) return { ok: false, status: 404, error: 'FISCAL_CONFIG_NOT_FOUND' }
    const cached = taCache.get(tenantId)
    if (cached && cached.expiration > new Date()) return { ok: true, data: cached }
    void decryptFiscalSecret(config.certEncrypted)
    void decryptFiscalSecret(config.keyEncrypted)
    const ta = mockRequestTa(config.cuit)
    taCache.set(tenantId, ta)
    return { ok: true, data: ta }
  }

  async requestCaeForFactura(tenantId: number, facturaId: number): Promise<ServiceResult<{ cae: string; caeVto: Date }>> {
    const factura = await this.prisma.factura.findFirst({
      where: { id: facturaId, tenantId },
      select: { id: true, total: true },
    })
    if (!factura) return { ok: false, status: 404, error: 'Factura not found' }

    const config = await this.prisma.tenantFiscalConfig.findUnique({ where: { tenantId } })
    if (!config) {
      await this.prisma.factura.update({ where: { id: facturaId }, data: { estadoCae: 'failed' } })
      return { ok: false, status: 422, error: 'FISCAL_CONFIG_NOT_FOUND' }
    }

    const taResult = await this.getTa(tenantId)
    if (!taResult.ok) {
      await this.prisma.factura.update({ where: { id: facturaId }, data: { estadoCae: 'failed' } })
      return taResult
    }

    try {
      void taResult.data
      const { cae, caeVto } = mockRequestCae(facturaId, Number(factura.total))
      await this.prisma.factura.update({ where: { id: facturaId }, data: { cae, caeVto, estadoCae: 'issued' } })
      return { ok: true, data: { cae, caeVto } }
    } catch {
      await this.prisma.factura.update({ where: { id: facturaId }, data: { estadoCae: 'failed' } })
      return { ok: false, status: 502, error: 'AFIP_CAE_REQUEST_FAILED' }
    }
  }

  async retryPending(tenantId: number): Promise<{ processed: number; issued: number; failed: number }> {
    const pending = await this.prisma.factura.findMany({
      where: { tenantId, estadoCae: 'pending' },
      select: { id: true },
      take: 50,
    })
    let issued = 0
    let failed = 0
    for (const row of pending) {
      const result = await this.requestCaeForFactura(tenantId, row.id)
      if (result.ok) issued += 1
      else failed += 1
    }
    return { processed: pending.length, issued, failed }
  }
}
