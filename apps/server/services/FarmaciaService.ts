import type { Prisma, PrismaClient } from '@prisma/client'
import type {
  LibroPsicotropicoCreateInput,
  LibroPsicotropicoListFilters,
  LibroPsicotropicoMovimientoRow,
  LibroPsicotropicoTipo,
  RecetaDispensacionCreateInput,
  RecetaDispensacionListFilters,
  RecetaDispensacionRow,
} from '@bizcode/types'
import { modulesInclude, TenantConfigService } from './TenantConfigService'
import {
  buildLibroPsicotropicoCsv,
  evaluateDispensacionGate,
  normalizeLibroInput,
  normalizeRecetaInput,
  normalizeSerialCapture,
  parsePharmacyDateOnly,
} from './farmaciaDispensingMath'
import type { ServiceResult } from './serviceResults'

type TxClient = Prisma.TransactionClient | PrismaClient

const RECETA_INCLUDE = {
  cliente: { select: { id: true, rsocial: true } },
} satisfies Prisma.RecetaDispensacionInclude

const LIBRO_INCLUDE = {
  articulo: { select: { id: true, codigo: true, descripcion: true } },
  lote: { select: { id: true, nroLote: true } },
} satisfies Prisma.LibroPsicotropicoMovimientoInclude

export type FarmaciaSerialInput = {
  serialUnidad?: string | null
  codigoDatamatrix?: string | null
}

export type DispensacionRecordInput = {
  facturaId: number
  recetaId?: number | null
  items: ReadonlyArray<{ articuloId: number; cantidad: number; loteId?: number | null }>
}

function mapReceta(
  row: Prisma.RecetaDispensacionGetPayload<{ include: typeof RECETA_INCLUDE }>,
): RecetaDispensacionRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    facturaId: row.facturaId,
    clienteId: row.clienteId,
    numeroReceta: row.numeroReceta,
    medicoNombre: row.medicoNombre,
    matricula: row.matricula,
    fechaReceta: row.fechaReceta.toISOString().slice(0, 10),
    observaciones: row.observaciones,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    cliente: row.cliente,
  }
}

function mapLibro(
  row: Prisma.LibroPsicotropicoMovimientoGetPayload<{ include: typeof LIBRO_INCLUDE }>,
): LibroPsicotropicoMovimientoRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    articuloId: row.articuloId,
    loteId: row.loteId,
    recetaId: row.recetaId,
    tipo: row.tipo as LibroPsicotropicoTipo,
    cantidad: Number(row.cantidad),
    referencia: row.referencia,
    observaciones: row.observaciones,
    createdAt: row.createdAt.toISOString(),
    articulo: row.articulo,
    lote: row.lote,
  }
}

function dateRangeFilter(
  desde?: string,
  hasta?: string,
): ServiceResult<{ gte?: Date; lte?: Date } | undefined> {
  if (!desde && !hasta) return { ok: true, data: undefined }
  const range: { gte?: Date; lte?: Date } = {}
  if (desde) {
    const parsed = parsePharmacyDateOnly(desde)
    if (!parsed) return { ok: false, status: 400, error: 'desde must be a valid YYYY-MM-DD date' }
    range.gte = parsed
  }
  if (hasta) {
    const parsed = parsePharmacyDateOnly(hasta)
    if (!parsed) return { ok: false, status: 400, error: 'hasta must be a valid YYYY-MM-DD date' }
    range.lte = parsed
  }
  return { ok: true, data: range }
}

/**
 * @en Pharmacy vertical MVP (#204): prescriptions, internal psychotropic book and unit serial capture.
 * @es MVP del vertical farmacia (#204): recetas, libro interno de psicotrópicos y captura de serial unitario.
 * @pt-BR MVP do vertical farmácia (#204): receitas, livro interno de psicotrópicos e captura de serial unitário.
 *
 * @en No ANMAT SNT web service call and no official SEDRONAR filing are performed here.
 * @es No se invoca el webservice del SNT de ANMAT ni se genera la presentación oficial de SEDRONAR.
 * @pt-BR Não há chamada ao webservice do SNT da ANMAT nem geração da declaração oficial do SEDRONAR.
 */
export class FarmaciaService {
  private readonly tenantConfig: TenantConfigService

  constructor(
    private readonly prisma: PrismaClient,
    tenantConfig?: TenantConfigService,
  ) {
    this.tenantConfig = tenantConfig ?? new TenantConfigService(prisma)
  }

  async isPharmacyEnabled(tenantId: number): Promise<boolean> {
    const modules = await this.tenantConfig.getModulesForTenant(tenantId)
    return modulesInclude(modules, 'vertical.pharmacy')
  }

  async listRecetas(
    tenantId: number,
    filters: RecetaDispensacionListFilters = {},
  ): Promise<ServiceResult<RecetaDispensacionRow[]>> {
    const range = dateRangeFilter(filters.desde, filters.hasta)
    if (!range.ok) return range
    const rows = await this.prisma.recetaDispensacion.findMany({
      where: {
        tenantId,
        ...(filters.facturaId != null ? { facturaId: filters.facturaId } : {}),
        ...(filters.clienteId != null ? { clienteId: filters.clienteId } : {}),
        ...(range.data ? { fechaReceta: range.data } : {}),
      },
      include: RECETA_INCLUDE,
      orderBy: [{ fechaReceta: 'desc' }, { id: 'desc' }],
      take: 200,
    })
    return { ok: true, data: rows.map(mapReceta) }
  }

  async getReceta(tenantId: number, id: number): Promise<ServiceResult<RecetaDispensacionRow>> {
    const row = await this.prisma.recetaDispensacion.findFirst({
      where: { id, tenantId },
      include: RECETA_INCLUDE,
    })
    if (!row) return { ok: false, status: 404, error: 'Receta not found' }
    return { ok: true, data: mapReceta(row) }
  }

  async createReceta(
    tenantId: number,
    input: RecetaDispensacionCreateInput,
  ): Promise<ServiceResult<RecetaDispensacionRow>> {
    const normalized = normalizeRecetaInput(input)
    if (!normalized.ok) return normalized
    const data = normalized.data

    if (data.facturaId != null) {
      const factura = await this.prisma.factura.findFirst({
        where: { id: data.facturaId, tenantId },
        select: { id: true },
      })
      if (!factura) return { ok: false, status: 400, error: 'facturaId is not valid for this tenant' }
    }
    if (data.clienteId != null) {
      const cliente = await this.prisma.cliente.findFirst({
        where: { id: data.clienteId, tenantId },
        select: { id: true },
      })
      if (!cliente) return { ok: false, status: 400, error: 'clienteId is not valid for this tenant' }
    }

    try {
      const created = await this.prisma.recetaDispensacion.create({
        data: { tenantId, ...data },
        include: RECETA_INCLUDE,
      })
      return { ok: true, data: mapReceta(created) }
    } catch (err) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code?: string }).code === 'P2002'
      ) {
        return { ok: false, status: 409, error: 'RECETA_ALREADY_EXISTS' }
      }
      throw err
    }
  }

  async listLibro(
    tenantId: number,
    filters: LibroPsicotropicoListFilters = {},
  ): Promise<ServiceResult<LibroPsicotropicoMovimientoRow[]>> {
    const range = dateRangeFilter(filters.desde, filters.hasta)
    if (!range.ok) return range
    const rows = await this.prisma.libroPsicotropicoMovimiento.findMany({
      where: {
        tenantId,
        ...(filters.articuloId != null ? { articuloId: filters.articuloId } : {}),
        ...(filters.tipo != null ? { tipo: filters.tipo } : {}),
        ...(range.data ? { createdAt: range.data } : {}),
      },
      include: LIBRO_INCLUDE,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: 500,
    })
    return { ok: true, data: rows.map(mapLibro) }
  }

  async exportLibroCsv(
    tenantId: number,
    filters: LibroPsicotropicoListFilters = {},
  ): Promise<ServiceResult<string>> {
    const rows = await this.listLibro(tenantId, filters)
    if (!rows.ok) return rows
    return { ok: true, data: buildLibroPsicotropicoCsv(rows.data) }
  }

  async createLibroMovimiento(
    tenantId: number,
    input: LibroPsicotropicoCreateInput,
  ): Promise<ServiceResult<LibroPsicotropicoMovimientoRow>> {
    const normalized = normalizeLibroInput(input)
    if (!normalized.ok) return normalized
    const data = normalized.data

    const articulo = await this.prisma.articulo.findFirst({
      where: { id: data.articuloId, tenantId },
      select: { id: true, esPsicotropico: true },
    })
    if (!articulo) return { ok: false, status: 400, error: 'articuloId is not valid for this tenant' }
    if (!articulo.esPsicotropico) {
      return { ok: false, status: 422, error: 'ARTICLE_NOT_PSYCHOTROPIC' }
    }
    if (data.loteId != null) {
      const lote = await this.prisma.lote.findFirst({
        where: { id: data.loteId, tenantId, articuloId: data.articuloId },
        select: { id: true },
      })
      if (!lote) return { ok: false, status: 400, error: 'loteId is not valid for this articulo' }
    }
    if (data.recetaId != null) {
      const receta = await this.prisma.recetaDispensacion.findFirst({
        where: { id: data.recetaId, tenantId },
        select: { id: true },
      })
      if (!receta) return { ok: false, status: 400, error: 'recetaId is not valid for this tenant' }
    }

    const created = await this.prisma.libroPsicotropicoMovimiento.create({
      data: { tenantId, ...data },
      include: LIBRO_INCLUDE,
    })
    return { ok: true, data: mapLibro(created) }
  }

  /**
   * @en Stores the operator-entered unit serial / DataMatrix payload on a lot (#204).
   * @es Guarda el serial unitario / DataMatrix ingresado por el operador en un lote (#204).
   * @pt-BR Salva o serial unitário / DataMatrix informado pelo operador em um lote (#204).
   */
  async setLoteSerial(
    tenantId: number,
    loteId: number,
    input: FarmaciaSerialInput,
  ): Promise<ServiceResult<{ id: number; serialUnidad: string | null; codigoDatamatrix: string | null }>> {
    const normalized = normalizeSerialCapture(input)
    if (!normalized.ok) return normalized
    const lote = await this.prisma.lote.findFirst({
      where: { id: loteId, tenantId },
      select: { id: true },
    })
    if (!lote) return { ok: false, status: 404, error: 'Lote not found' }
    const updated = await this.prisma.lote.update({
      where: { id: lote.id },
      data: normalized.data,
      select: { id: true, serialUnidad: true, codigoDatamatrix: true },
    })
    return { ok: true, data: updated }
  }

  /**
   * @en Blocks invoicing of prescription-only articles when no prescription is linked (#204).
   * @es Bloquea la facturación de artículos bajo receta cuando no hay receta asociada (#204).
   * @pt-BR Bloqueia o faturamento de artigos sob receita quando não há receita associada (#204).
   */
  async assertDispensacionAllowed(
    tenantId: number,
    articulos: ReadonlyArray<{ id: number; requiereReceta: boolean }>,
    recetaId: number | null | undefined,
  ): Promise<ServiceResult<void>> {
    if (!articulos.some((a) => a.requiereReceta)) {
      return { ok: true, data: undefined }
    }
    if (!(await this.isPharmacyEnabled(tenantId))) {
      return { ok: true, data: undefined }
    }
    let prescriptionCount = 0
    if (recetaId != null) {
      const receta = await this.prisma.recetaDispensacion.findFirst({
        where: { id: recetaId, tenantId },
        select: { id: true },
      })
      if (!receta) return { ok: false, status: 400, error: 'recetaId is not valid for this tenant' }
      prescriptionCount = 1
    }
    const gate = evaluateDispensacionGate(
      articulos.map((a) => ({ articuloId: a.id, requiereReceta: a.requiereReceta })),
      prescriptionCount,
    )
    if (gate.ok) return { ok: true, data: undefined }
    return {
      ok: false,
      status: 422,
      error: `PRESCRIPTION_REQUIRED:${gate.articuloIds.join(',')}`,
    }
  }

  /**
   * @en Links the prescription to the invoice and books psychotropic outflows (#204); best-effort after create.
   * @es Asocia la receta a la factura y registra egresos de psicotrópicos (#204); best-effort tras el alta.
   * @pt-BR Associa a receita à fatura e registra saídas de psicotrópicos (#204); best-effort após a criação.
   */
  async recordDispensacion(
    tenantId: number,
    input: DispensacionRecordInput,
    client: TxClient = this.prisma,
  ): Promise<{ recetaLinked: boolean; movimientos: number }> {
    let recetaLinked = false
    if (input.recetaId != null) {
      const updated = await client.recetaDispensacion.updateMany({
        where: { id: input.recetaId, tenantId },
        data: { facturaId: input.facturaId },
      })
      recetaLinked = updated.count > 0
    }

    const articuloIds = [...new Set(input.items.map((it) => it.articuloId))]
    if (articuloIds.length === 0) return { recetaLinked, movimientos: 0 }
    const psicotropicos = await client.articulo.findMany({
      where: { tenantId, id: { in: articuloIds }, esPsicotropico: true },
      select: { id: true },
    })
    const psicotropicoIds = new Set(psicotropicos.map((a) => a.id))
    if (psicotropicoIds.size === 0) return { recetaLinked, movimientos: 0 }

    let movimientos = 0
    for (const item of input.items) {
      if (!psicotropicoIds.has(item.articuloId)) continue
      await client.libroPsicotropicoMovimiento.create({
        data: {
          tenantId,
          articuloId: item.articuloId,
          loteId: item.loteId ?? null,
          recetaId: recetaLinked ? (input.recetaId ?? null) : null,
          tipo: 'egreso',
          cantidad: Math.abs(item.cantidad),
          referencia: `factura:${input.facturaId}`,
        },
      })
      movimientos += 1
    }
    return { recetaLinked, movimientos }
  }
}
