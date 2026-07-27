import type { Prisma, PrismaClient } from '@prisma/client'
import type {
  ConfigFefoRow,
  ConfigFefoUpsertInput,
  FefoAllocation,
  LoteRow,
  LoteTrazabilidad,
} from '@bizcode/types'
import { notifyManagers } from '../notifications'
import { modulesInclude, TenantConfigService } from './TenantConfigService'
import type { ServiceResult } from './serviceResults'
import { roundQty } from '../lib/uom'

type TxClient = Prisma.TransactionClient | PrismaClient

const LOTE_INCLUDE = {
  articulo: { select: { id: true, codigo: true, descripcion: true } },
  deposito: { select: { id: true, codigo: true, nombre: true } },
} satisfies Prisma.LoteInclude

export type LoteListFilters = {
  articuloId?: number
  depositoId?: number
  soloActivos?: boolean
  porVencer?: boolean
}

export type LoteInboundInput = {
  articuloId: number
  depositoId: number
  nroLote: string
  fechaVencimiento: string
  cantidad: number
  proveedorId?: number | null
  userId?: number | null
}

export type LoteCreateInput = {
  articuloId: number
  depositoId: number
  nroLote: string
  fechaVencimiento: string
  proveedorId?: number | null
  stockInicial?: number
}

function parseDateOnly(value: string): Date | null {
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
}

function mapConfig(row: {
  id: number
  tenantId: number
  diasAlertaVencimiento: number
  createdAt: Date
  updatedAt: Date
}): ConfigFefoRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    diasAlertaVencimiento: row.diasAlertaVencimiento,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

function mapLote(row: Prisma.LoteGetPayload<{ include: typeof LOTE_INCLUDE }>): LoteRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    articuloId: row.articuloId,
    depositoId: row.depositoId,
    proveedorId: row.proveedorId,
    nroLote: row.nroLote,
    fechaVencimiento: row.fechaVencimiento.toISOString().slice(0, 10),
    fechaIngreso: row.fechaIngreso.toISOString(),
    stockInicial: Number(row.stockInicial),
    stockActual: Number(row.stockActual),
    activo: row.activo,
    preavisoEnviadoAt: row.preavisoEnviadoAt ? row.preavisoEnviadoAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    articulo: row.articulo,
    deposito: row.deposito,
  }
}

/**
 * @en Pure FEFO allocation from available lots (expiry ASC, id ASC).
 * @es Asignación FEFO pura desde lotes disponibles (vencimiento ASC, id ASC).
 * @pt-BR Alocação FEFO pura a partir de lotes disponíveis (vencimento ASC, id ASC).
 */
export function allocateFefoFromLots(
  lots: Array<{ id: number; nroLote: string; fechaVencimiento: Date; stockActual: number }>,
  quantity: number,
): ServiceResult<FefoAllocation[]> {
  if (!Number.isFinite(quantity) || quantity <= 0) {
    return { ok: false, status: 400, error: 'quantity must be a positive finite number' }
  }
  let remaining = roundQty(quantity)
  const allocations: FefoAllocation[] = []
  for (const lot of lots) {
    if (remaining <= 0) break
    if (lot.stockActual <= 0) continue
    const take = roundQty(Math.min(lot.stockActual, remaining))
    allocations.push({
      loteId: lot.id,
      nroLote: lot.nroLote,
      fechaVencimiento: lot.fechaVencimiento.toISOString().slice(0, 10),
      cantidad: take,
    })
    remaining = roundQty(remaining - take)
  }
  if (remaining > 0) {
    return { ok: false, status: 422, error: 'INSUFFICIENT_LOT_STOCK' }
  }
  return { ok: true, data: allocations }
}

/**
 * @en FEFO lots: config, inbound/outbound, expiry alerts, traceability (#202).
 * @es Lotes FEFO: config, entrada/salida, alertas de vencimiento, trazabilidad (#202).
 * @pt-BR Lotes FEFO: config, entrada/saída, alertas de vencimento, rastreabilidade (#202).
 */
export class LoteService {
  private readonly tenantConfig: TenantConfigService

  constructor(
    private readonly prisma: PrismaClient,
    tenantConfig?: TenantConfigService,
  ) {
    this.tenantConfig = tenantConfig ?? new TenantConfigService(prisma)
  }

  async isFefoEnabled(tenantId: number): Promise<boolean> {
    const modules = await this.tenantConfig.getModulesForTenant(tenantId)
    return modulesInclude(modules, 'inventory.fefo')
  }

  async isLotsEnabled(tenantId: number): Promise<boolean> {
    const modules = await this.tenantConfig.getModulesForTenant(tenantId)
    return modulesInclude(modules, 'inventory.lots')
  }

  async getConfig(tenantId: number): Promise<ConfigFefoRow> {
    const existing = await this.prisma.configFefo.findUnique({ where: { tenantId } })
    if (existing) return mapConfig(existing)
    const created = await this.prisma.configFefo.create({ data: { tenantId } })
    return mapConfig(created)
  }

  async upsertConfig(
    tenantId: number,
    input: ConfigFefoUpsertInput,
  ): Promise<ServiceResult<ConfigFefoRow>> {
    if (
      !Number.isInteger(input.diasAlertaVencimiento) ||
      input.diasAlertaVencimiento < 1 ||
      input.diasAlertaVencimiento > 365
    ) {
      return { ok: false, status: 400, error: 'diasAlertaVencimiento must be an integer 1..365' }
    }
    const row = await this.prisma.configFefo.upsert({
      where: { tenantId },
      create: { tenantId, diasAlertaVencimiento: input.diasAlertaVencimiento },
      update: { diasAlertaVencimiento: input.diasAlertaVencimiento },
    })
    return { ok: true, data: mapConfig(row) }
  }

  async list(tenantId: number, filters: LoteListFilters = {}): Promise<LoteRow[]> {
    const soloActivos = filters.soloActivos !== false
    let fechaMax: Date | undefined
    if (filters.porVencer) {
      const config = await this.getConfig(tenantId)
      const max = new Date()
      max.setUTCDate(max.getUTCDate() + config.diasAlertaVencimiento)
      fechaMax = new Date(Date.UTC(max.getUTCFullYear(), max.getUTCMonth(), max.getUTCDate()))
    }
    const rows = await this.prisma.lote.findMany({
      where: {
        tenantId,
        ...(filters.articuloId != null ? { articuloId: filters.articuloId } : {}),
        ...(filters.depositoId != null ? { depositoId: filters.depositoId } : {}),
        ...(soloActivos ? { activo: true } : {}),
        ...(fechaMax
          ? {
              stockActual: { gt: 0 },
              fechaVencimiento: { lte: fechaMax },
            }
          : {}),
      },
      include: LOTE_INCLUDE,
      orderBy: [{ fechaVencimiento: 'asc' }, { id: 'asc' }],
    })
    return rows.map(mapLote)
  }

  async listExpiring(tenantId: number): Promise<LoteRow[]> {
    return this.list(tenantId, { soloActivos: true, porVencer: true })
  }

  async create(tenantId: number, input: LoteCreateInput): Promise<ServiceResult<LoteRow>> {
    const fecha = parseDateOnly(input.fechaVencimiento)
    if (!fecha) {
      return { ok: false, status: 400, error: 'fechaVencimiento must be a valid date' }
    }
    const nroLote = input.nroLote.trim()
    if (!nroLote) {
      return { ok: false, status: 400, error: 'nroLote is required' }
    }
    const articulo = await this.prisma.articulo.findFirst({
      where: { id: input.articuloId, tenantId },
      select: { id: true, controlLote: true, tipo: true },
    })
    if (!articulo) return { ok: false, status: 404, error: 'Articulo not found' }
    if (articulo.tipo === 'servicio') {
      return { ok: false, status: 422, error: 'SERVICE_NO_STOCK' }
    }
    if (!articulo.controlLote) {
      return { ok: false, status: 422, error: 'ARTICLE_NO_LOT_CONTROL' }
    }
    const deposito = await this.prisma.deposito.findFirst({
      where: { id: input.depositoId, tenantId, activo: true },
      select: { id: true },
    })
    if (!deposito) {
      return { ok: false, status: 400, error: 'depositoId is not valid for this tenant' }
    }
    const stockInicial = input.stockInicial ?? 0
    if (!Number.isFinite(stockInicial) || stockInicial < 0) {
      return { ok: false, status: 400, error: 'stockInicial must be a non-negative finite number' }
    }
    try {
      const created = await this.prisma.lote.create({
        data: {
          tenantId,
          articuloId: input.articuloId,
          depositoId: input.depositoId,
          proveedorId: input.proveedorId ?? null,
          nroLote,
          fechaVencimiento: fecha,
          stockInicial,
          stockActual: stockInicial,
        },
        include: LOTE_INCLUDE,
      })
      return { ok: true, data: mapLote(created) }
    } catch (err) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code?: string }).code === 'P2002'
      ) {
        return { ok: false, status: 409, error: 'LOTE_ALREADY_EXISTS' }
      }
      throw err
    }
  }

  /**
   * @en Upserts lot and increments stockActual on purchase receive (same TX as deposit stock).
   * @es Crea/actualiza lote e incrementa stockActual en recepción OC (misma TX que stock depósito).
   * @pt-BR Cria/atualiza lote e incrementa stockAtual na recepção OC (mesma TX do estoque depósito).
   */
  async applyInbound(tx: TxClient, tenantId: number, input: LoteInboundInput): Promise<ServiceResult<{ loteId: number }>> {
    const fecha = parseDateOnly(input.fechaVencimiento)
    if (!fecha) {
      return { ok: false, status: 400, error: 'fechaVencimiento must be a valid date' }
    }
    const nroLote = input.nroLote.trim()
    if (!nroLote) {
      return { ok: false, status: 400, error: 'nroLote is required' }
    }
    if (!Number.isFinite(input.cantidad) || input.cantidad <= 0) {
      return { ok: false, status: 400, error: 'cantidad must be a positive finite number' }
    }

    const existing = await tx.lote.findUnique({
      where: {
        tenantId_articuloId_depositoId_nroLote: {
          tenantId,
          articuloId: input.articuloId,
          depositoId: input.depositoId,
          nroLote,
        },
      },
    })
    if (existing) {
      await tx.lote.update({
        where: { id: existing.id },
        data: {
          stockActual: { increment: input.cantidad },
          activo: true,
          ...(input.proveedorId != null ? { proveedorId: input.proveedorId } : {}),
        },
      })
      return { ok: true, data: { loteId: existing.id } }
    }
    const created = await tx.lote.create({
      data: {
        tenantId,
        articuloId: input.articuloId,
        depositoId: input.depositoId,
        proveedorId: input.proveedorId ?? null,
        nroLote,
        fechaVencimiento: fecha,
        stockInicial: input.cantidad,
        stockActual: input.cantidad,
      },
    })
    return { ok: true, data: { loteId: created.id } }
  }

  async allocateFefo(
    client: TxClient,
    tenantId: number,
    articuloId: number,
    depositoId: number,
    quantity: number,
  ): Promise<ServiceResult<FefoAllocation[]>> {
    const lots = await client.lote.findMany({
      where: {
        tenantId,
        articuloId,
        depositoId,
        activo: true,
        stockActual: { gt: 0 },
      },
      orderBy: [{ fechaVencimiento: 'asc' }, { id: 'asc' }],
      select: { id: true, nroLote: true, fechaVencimiento: true, stockActual: true },
    })
    const normalizedLots = lots.map((l) => ({ ...l, stockActual: Number(l.stockActual) }))
    return allocateFefoFromLots(normalizedLots, quantity)
  }

  async previewFefo(
    tenantId: number,
    articuloId: number,
    depositoId: number,
    quantity: number,
  ): Promise<ServiceResult<FefoAllocation[]>> {
    return this.allocateFefo(this.prisma, tenantId, articuloId, depositoId, quantity)
  }

  /**
   * @en Decrements lot stockActual for FEFO outbound allocations (same TX as deposit stock).
   * @es Decrementa stockActual de lotes en salidas FEFO (misma TX que stock depósito).
   * @pt-BR Decrementa stockAtual dos lotes nas saídas FEFO (mesma TX do estoque depósito).
   */
  async applyOutbound(tx: TxClient, tenantId: number, allocations: FefoAllocation[]): Promise<ServiceResult<void>> {
    for (const alloc of allocations) {
      const lot = await tx.lote.findFirst({
        where: { id: alloc.loteId, tenantId },
        select: { id: true, stockActual: true },
      })
      if (!lot || Number(lot.stockActual) < alloc.cantidad) {
        return { ok: false, status: 422, error: 'INSUFFICIENT_LOT_STOCK' }
      }
      await tx.lote.update({
        where: { id: lot.id },
        data: { stockActual: { decrement: alloc.cantidad } },
      })
    }
    return { ok: true, data: undefined }
  }

  /**
   * @en Applies signed quantity to a lot during manual stock adjustment.
   * @es Aplica cantidad con signo a un lote en ajuste manual de stock.
   * @pt-BR Aplica quantidade com sinal a um lote no ajuste manual de estoque.
   */
  async applyAjuste(
    tx: TxClient,
    tenantId: number,
    params: {
      loteId: number
      articuloId: number
      depositoId: number
      cantidad: number
    },
  ): Promise<ServiceResult<void>> {
    const lot = await tx.lote.findFirst({
      where: { id: params.loteId, tenantId },
    })
    if (!lot) {
      return { ok: false, status: 404, error: 'Lote not found' }
    }
    if (lot.articuloId !== params.articuloId || lot.depositoId !== params.depositoId) {
      return { ok: false, status: 422, error: 'LOTE_MISMATCH' }
    }
    if (!lot.activo) {
      return { ok: false, status: 422, error: 'LOTE_INACTIVE' }
    }
    const next = roundQty(Number(lot.stockActual) + params.cantidad)
    if (next < 0) {
      return { ok: false, status: 422, error: 'INSUFFICIENT_LOT_STOCK' }
    }
    await tx.lote.update({
      where: { id: lot.id },
      data: { stockActual: next },
    })
    return { ok: true, data: undefined }
  }

  async getTrazabilidad(
    tenantId: number,
    articuloId: number,
    loteId: number,
  ): Promise<ServiceResult<LoteTrazabilidad>> {
    const lote = await this.prisma.lote.findFirst({
      where: { id: loteId, tenantId, articuloId },
      include: LOTE_INCLUDE,
    })
    if (!lote) {
      return { ok: false, status: 404, error: 'Lote not found' }
    }
    const items = await this.prisma.facturaItem.findMany({
      where: { loteId, articuloId, factura: { tenantId } },
      include: {
        factura: {
          select: {
            id: true,
            tipo: true,
            prefijo: true,
            numero: true,
            fecha: true,
            clienteId: true,
            cliente: { select: { rsocial: true } },
          },
        },
      },
      orderBy: { id: 'asc' },
    })
    return {
      ok: true,
      data: {
        lote: mapLote(lote),
        facturas: items.map((it) => ({
          facturaId: it.factura.id,
          facturaItemId: it.id,
          tipo: it.factura.tipo,
          prefijo: it.factura.prefijo,
          numero: it.factura.numero,
          fecha: it.factura.fecha.toISOString().slice(0, 10),
          cantidad: Number(it.cantidad),
          clienteId: it.factura.clienteId,
          clienteRsocial: it.factura.cliente?.rsocial ?? null,
        })),
      },
    }
  }

  /**
   * @en Daily lot expiry alert job (#202). Cron: `0 8 * * *`.
   * @es Job diario de alerta de vencimiento de lotes (#202). Cron: `0 8 * * *`.
   * @pt-BR Job diário de alerta de vencimento de lotes (#202). Cron: `0 8 * * *`.
   */
  async runDailyExpiryAlertJob(tenantId: number): Promise<{ notified: number }> {
    const modules = await this.tenantConfig.getModulesForTenant(tenantId)
    if (!modulesInclude(modules, 'inventory.fefo')) {
      return { notified: 0 }
    }
    const config = await this.getConfig(tenantId)
    const max = new Date()
    max.setUTCDate(max.getUTCDate() + config.diasAlertaVencimiento)
    const fechaMax = new Date(Date.UTC(max.getUTCFullYear(), max.getUTCMonth(), max.getUTCDate()))
    const today = new Date()
    const fechaHoy = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))

    const lots = await this.prisma.lote.findMany({
      where: {
        tenantId,
        activo: true,
        stockActual: { gt: 0 },
        fechaVencimiento: { lte: fechaMax },
        preavisoEnviadoAt: null,
      },
      include: {
        articulo: { select: { id: true, codigo: true, descripcion: true } },
      },
      orderBy: [{ fechaVencimiento: 'asc' }, { id: 'asc' }],
      take: 200,
    })

    let notified = 0
    for (const lot of lots) {
      const expiresAt = lot.fechaVencimiento.toISOString().slice(0, 10)
      const daysRemaining = Math.max(
        0,
        Math.round((lot.fechaVencimiento.getTime() - fechaHoy.getTime()) / (24 * 60 * 60 * 1000)),
      )
      await notifyManagers(this.prisma, tenantId, 'lot_expiring', {
        articuloId: lot.articuloId,
        codigo: lot.articulo.codigo,
        descripcion: lot.articulo.descripcion,
        loteId: lot.id,
        nroLote: lot.nroLote,
        expiresAt,
        daysRemaining,
        stock: Number(lot.stockActual),
      })
      await this.prisma.lote.update({
        where: { id: lot.id },
        data: { preavisoEnviadoAt: new Date() },
      })
      notified += 1
    }
    return { notified }
  }
}
