import type { Prisma, PrismaClient } from '@prisma/client'
import { NotFoundAppError } from '../errors/AppError'
import type { FiscalRetencionesConfigInput } from '@bizcode/types'
import { previewRetencionesClienteCobro } from '../fiscal/ar/retencionesClienteCobro'
import { previewPercepcionesClienteFactura } from '../fiscal/ar/retencionesClientePercepcion'
import { previewRetencionesProveedorPago } from '../fiscal/ar/retencionesProveedorPago'
import type { RetencionPreviewInput, RetencionPreviewLine } from '../fiscal/ar/retencionesPreviewStub'
import { loadPresentacionRetencionRows } from '../fiscal/ar/presentacionRetencionesLoader'
import { buildSicoreRetencionesExport } from '../fiscal/ar/sicoreRetencionesExport'
import { buildSifereRetencionesExport } from '../fiscal/ar/sifereRetencionesExport'
import { validateCUIT } from '../../web/src/lib/validators/cuit'

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

export type RetencionConstanciaPdfData = {
  retencion: RetencionAplicadaDto
  empresa: { nombre: string; cuit: string; domicilio: string | null }
  contraparte: { rsocial: string; cuit: string | null }
  fechaPago: string
}

/**
 * @en Tenant withholding config, applied history and preview (#228, #276).
 * @es Config de agente de retención, historial y preview (#228, #276).
 * @pt-BR Config de agente de retenção, histórico e preview (#228, #276).
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
    const where: Prisma.RetencionAplicadaWhereInput = {
      tenantId,
      OR: [{ reciboPagoId: null }, { reciboPago: { estado: 'emitido' } }],
    }
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

  async preview(
    tenantId: number,
    input: RetencionPreviewInput,
  ): Promise<{ retenciones: RetencionPreviewLine[] }> {
    if (input.entidadTipo === 'proveedor') {
      const proveedor = await this.prisma.proveedor.findFirst({
        where: { id: input.entidadId, tenantId },
        select: { condIva: true },
      })
      if (proveedor == null) {
        throw new NotFoundAppError('Proveedor not found')
      }
      const [config, regimenes] = await Promise.all([
        this.prisma.fiscalRetencionesConfig.findUnique({ where: { tenantId } }),
        this.prisma.regimenRetencion.findMany({
          where: { tenantId, activo: true, subtipo: 'retencion' },
        }),
      ])
      return {
        retenciones: previewRetencionesProveedorPago({
          proveedor,
          config,
          regimenes,
          montoBruto: input.monto,
        }),
      }
    }
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: input.entidadId, tenantId },
      select: { condIva: true },
    })
    if (cliente == null) {
      throw new NotFoundAppError('Cliente not found')
    }
    const [config, regimenesRetencion, regimenesPercepcion] = await Promise.all([
      this.prisma.fiscalRetencionesConfig.findUnique({ where: { tenantId } }),
      this.prisma.regimenRetencion.findMany({
        where: { tenantId, activo: true, subtipo: 'retencion' },
      }),
      this.prisma.regimenRetencion.findMany({
        where: { tenantId, activo: true, subtipo: 'percepcion' },
      }),
    ])
    const contexto = input.contexto ?? 'cobro'
    if (contexto === 'factura') {
      return {
        retenciones: previewPercepcionesClienteFactura({
          cliente,
          config,
          regimenes: regimenesPercepcion,
          neto1: input.neto1 ?? 0,
          neto2: input.neto2 ?? 0,
          neto3: input.neto3 ?? 0,
        }),
      }
    }
    return {
      retenciones: previewRetencionesClienteCobro({
        cliente,
        config,
        regimenes: regimenesRetencion,
        montoBruto: input.monto,
      }),
    }
  }

  async getConstanciaPdfData(
    tenantId: number,
    retencionId: number,
  ): Promise<RetencionConstanciaPdfData | null> {
    const row = await this.prisma.retencionAplicada.findFirst({
      where: {
        id: retencionId,
        tenantId,
        OR: [{ reciboPagoId: null }, { reciboPago: { estado: 'emitido' } }],
      },
      include: {
        regimen: { select: { nombre: true, tipo: true } },
        reciboPago: { select: { fecha: true, proveedorId: true } },
        cobro: { select: { fecha: true, clienteId: true } },
      },
    })
    if (row == null || row.tipo !== 'retencion') return null
    if (row.entidadTipo !== 'proveedor' && row.entidadTipo !== 'cliente') return null

    const [empresa, contraparte] = await Promise.all([
      this.prisma.paramEmpresa.findFirst({
        where: { tenantId },
        select: { nombre: true, cuit: true, domicilio: true },
      }),
      row.entidadTipo === 'proveedor'
        ? this.prisma.proveedor.findFirst({
            where: { id: row.entidadId, tenantId },
            select: { rsocial: true, cuit: true },
          })
        : this.prisma.cliente.findFirst({
            where: { id: row.entidadId, tenantId },
            select: { rsocial: true, cuit: true },
          }),
    ])
    if (contraparte == null) return null

    const dto: RetencionAplicadaDto = {
      id: row.id,
      regimenId: row.regimenId,
      regimenNombre: row.regimen.nombre,
      tipo: row.regimen.tipo,
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
    }

    return {
      retencion: dto,
      empresa: {
        nombre: empresa?.nombre ?? 'Empresa',
        cuit: empresa?.cuit ?? '',
        domicilio: empresa?.domicilio ?? null,
      },
      contraparte,
      fechaPago: (row.reciboPago?.fecha ?? row.cobro?.fecha ?? row.createdAt).toISOString(),
    }
  }

  async buildExportTxt(
    tenantId: number,
    format: 'sicore' | 'sifere',
    from?: Date,
    to?: Date,
  ): Promise<string> {
    const rangeFrom = from ?? new Date(0)
    const rangeTo = to ?? new Date(8640000000000000)
    const rows = await loadPresentacionRetencionRows(
      this.prisma,
      tenantId,
      format,
      rangeFrom,
      rangeTo,
    )
    const validRows = rows.filter(
      (r) => r.importe !== 0 && r.cuitRetenido && validateCUIT(r.cuitRetenido),
    )

    if (format === 'sicore') {
      return buildSicoreRetencionesExport(
        validRows.map((r) => ({
          fecha: r.fecha,
          cuitRetenido: r.cuitRetenido,
          denominacion: r.denominacion,
          regimenTipo: r.regimenTipo,
          regimenNombre: r.regimenNombre,
          operacionTipo: r.operacionTipo,
          baseImponible: r.baseImponible,
          importe: r.importe,
        })),
      )
    }
    return buildSifereRetencionesExport(
      validRows.map((r) => ({
        fecha: r.fecha,
        cuitRetenido: r.cuitRetenido,
        provincia: r.provincia,
        baseImponible: r.baseImponible,
        alicuota: r.alicuota,
        importe: r.importe,
      })),
    )
  }
}
