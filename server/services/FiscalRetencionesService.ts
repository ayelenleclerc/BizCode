import type { Prisma, PrismaClient } from '@prisma/client'
import type { FiscalRetencionesConfigInput } from '../createApp.types'
import {
  previewRetencionesStub,
  type RetencionPreviewInput,
  type RetencionPreviewLine,
} from '../fiscal/ar/retencionesPreviewStub'

export type FiscalRetencionesConfigDto = {
  esAgenteRetencionGanancias: boolean
  esAgenteRetencionIVA: boolean
  esAgenteRetencionIIBB: boolean
}

export type RetencionAplicadaDto = {
  id: number
  regimenId: number
  regimenNombre: string
  tipo: string
  entidadTipo: string
  entidadId: number
  facturaId: number | null
  cobroId: number | null
  reciboPagoId: number | null
  baseImponible: string
  alicuota: string
  importe: string
  constanciaNum: string | null
  createdAt: string
}

const DEFAULT_CONFIG: FiscalRetencionesConfigDto = {
  esAgenteRetencionGanancias: false,
  esAgenteRetencionIVA: false,
  esAgenteRetencionIIBB: false,
}

export type RetencionAplicadaListFilters = {
  from?: Date
  to?: Date
  tipo?: string
}

/**
 * @en Tenant withholding config, applied history and preview stub (#228).
 * @es Config de agente de retención, historial y preview stub (#228).
 * @pt-BR Config de agente de retenção, histórico e preview stub (#228).
 */
export class FiscalRetencionesService {
  constructor(private readonly prisma: PrismaClient) {}

  async getConfig(tenantId: number): Promise<FiscalRetencionesConfigDto> {
    const row = await this.prisma.fiscalRetencionesConfig.findUnique({ where: { tenantId } })
    if (row == null) return { ...DEFAULT_CONFIG }
    return {
      esAgenteRetencionGanancias: row.esAgenteRetencionGanancias,
      esAgenteRetencionIVA: row.esAgenteRetencionIVA,
      esAgenteRetencionIIBB: row.esAgenteRetencionIIBB,
    }
  }

  async upsertConfig(
    tenantId: number,
    input: FiscalRetencionesConfigInput,
  ): Promise<FiscalRetencionesConfigDto> {
    const row = await this.prisma.fiscalRetencionesConfig.upsert({
      where: { tenantId },
      create: {
        tenantId,
        esAgenteRetencionGanancias: input.esAgenteRetencionGanancias ?? false,
        esAgenteRetencionIVA: input.esAgenteRetencionIVA ?? false,
        esAgenteRetencionIIBB: input.esAgenteRetencionIIBB ?? false,
      },
      update: {
        ...(input.esAgenteRetencionGanancias != null
          ? { esAgenteRetencionGanancias: input.esAgenteRetencionGanancias }
          : {}),
        ...(input.esAgenteRetencionIVA != null
          ? { esAgenteRetencionIVA: input.esAgenteRetencionIVA }
          : {}),
        ...(input.esAgenteRetencionIIBB != null
          ? { esAgenteRetencionIIBB: input.esAgenteRetencionIIBB }
          : {}),
      },
    })
    return {
      esAgenteRetencionGanancias: row.esAgenteRetencionGanancias,
      esAgenteRetencionIVA: row.esAgenteRetencionIVA,
      esAgenteRetencionIIBB: row.esAgenteRetencionIIBB,
    }
  }

  async listAplicadas(
    tenantId: number,
    filters: RetencionAplicadaListFilters,
    take: number,
    skip: number,
  ): Promise<{ total: number; items: RetencionAplicadaDto[] }> {
    const where: Prisma.RetencionAplicadaWhereInput = { tenantId }
    if (filters.tipo != null && filters.tipo.trim().length > 0) {
      where.tipo = filters.tipo.trim()
    }
    if (filters.from != null || filters.to != null) {
      where.createdAt = {}
      if (filters.from != null) where.createdAt.gte = filters.from
      if (filters.to != null) where.createdAt.lte = filters.to
    }
    const [total, rows] = await Promise.all([
      this.prisma.retencionAplicada.count({ where }),
      this.prisma.retencionAplicada.findMany({
        where,
        include: { regimen: { select: { nombre: true } } },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      }),
    ])
    return {
      total,
      items: rows.map((row) => ({
        id: row.id,
        regimenId: row.regimenId,
        regimenNombre: row.regimen.nombre,
        tipo: row.tipo,
        entidadTipo: row.entidadTipo,
        entidadId: row.entidadId,
        facturaId: row.facturaId,
        cobroId: row.cobroId,
        reciboPagoId: row.reciboPagoId,
        baseImponible: row.baseImponible.toString(),
        alicuota: row.alicuota.toString(),
        importe: row.importe.toString(),
        constanciaNum: row.constanciaNum,
        createdAt: row.createdAt.toISOString(),
      })),
    }
  }

  preview(input: RetencionPreviewInput): { retenciones: RetencionPreviewLine[] } {
    return { retenciones: previewRetencionesStub(input) }
  }
}
