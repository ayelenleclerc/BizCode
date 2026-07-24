import type { Prisma, PrismaClient } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'
import type {
  MonedaFx,
  RecalcFxResult,
  TipoCambioManualInput,
  TipoCambioRow,
  TipoCambioTipo,
} from '@bizcode/types'
import { fetchBcraUsdOficial } from '../integrations/bcraTipoCambio'
import { notifyManagers } from '../notifications'
import { parseListPagination } from './listPagination'

function toNumber(value: Decimal | number | string): number {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number.parseFloat(value)
  return value.toNumber()
}

function mapRow(row: {
  id: number
  tenantId: number
  moneda: string
  tipo: string
  valor: Decimal
  fecha: Date
  fuente: string
  createdById: number | null
  createdAt: Date
}): TipoCambioRow {
  return {
    id: row.id,
    tenantId: row.tenantId,
    moneda: row.moneda as MonedaFx,
    tipo: row.tipo as TipoCambioTipo,
    valor: toNumber(row.valor),
    fecha: row.fecha.toISOString(),
    fuente: row.fuente as TipoCambioRow['fuente'],
    createdById: row.createdById,
    createdAt: row.createdAt.toISOString(),
  }
}

/**
 * @en Rounds ARS money to 2 decimals using half-up.
 * @es Redondea montos ARS a 2 decimales (half-up).
 * @pt-BR Arredonda valores ARS para 2 casas (half-up).
 */
export function arsFromFx(origen: number, tipoCambio: number): number {
  return Math.round(origen * tipoCambio * 100) / 100
}

/**
 * @en Exchange-rate CRUD, BCRA sync and FX catalog price recalculation (#243).
 * @es CRUD de TC, sync BCRA y recálculo de precios FX de catálogo (#243).
 * @pt-BR CRUD de câmbio, sync BCRA e recálculo de preços FX de catálogo (#243).
 */
export class TipoCambioService {
  constructor(private readonly prisma: PrismaClient) {}

  async getPreferido(tenantId: number): Promise<TipoCambioTipo> {
    const cfg = await this.prisma.tenantConfig.findUnique({
      where: { tenantId },
      select: { tipoCambioPreferido: true },
    })
    const v = cfg?.tipoCambioPreferido
    if (v === 'oficial' || v === 'mep' || v === 'ccl' || v === 'blue' || v === 'manual') return v
    return 'oficial'
  }

  async setPreferido(
    tenantId: number,
    tipoCambioPreferido: TipoCambioTipo,
  ): Promise<{ ok: true; data: { tipoCambioPreferido: TipoCambioTipo } } | { ok: false; status: number; error: string }> {
    const existing = await this.prisma.tenantConfig.findUnique({ where: { tenantId } })
    if (!existing) return { ok: false, status: 404, error: 'Tenant config not found' }
    await this.prisma.tenantConfig.update({
      where: { tenantId },
      data: { tipoCambioPreferido },
    })
    return { ok: true, data: { tipoCambioPreferido } }
  }

  async list(
    tenantId: number,
    reqLike: { query: Record<string, unknown> },
  ): Promise<{ items: TipoCambioRow[]; total: number; limit: number; offset: number }> {
    const { take, skip } = parseListPagination(reqLike as Parameters<typeof parseListPagination>[0])
    const moneda = typeof reqLike.query.moneda === 'string' ? reqLike.query.moneda : undefined
    const tipo = typeof reqLike.query.tipo === 'string' ? reqLike.query.tipo : undefined
    const where: Prisma.TipoCambioWhereInput = {
      tenantId,
      ...(moneda ? { moneda } : {}),
      ...(tipo ? { tipo } : {}),
    }
    const [total, rows] = await Promise.all([
      this.prisma.tipoCambio.count({ where }),
      this.prisma.tipoCambio.findMany({
        where,
        orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
        skip,
        take,
      }),
    ])
    return { items: rows.map(mapRow), total, limit: take, offset: skip }
  }

  async getVigente(
    tenantId: number,
    moneda: MonedaFx,
    tipo?: TipoCambioTipo,
  ): Promise<{ ok: true; data: TipoCambioRow } | { ok: false; status: number; error: string }> {
    const resolvedTipo = tipo ?? (await this.getPreferido(tenantId))
    const row = await this.prisma.tipoCambio.findFirst({
      where: { tenantId, moneda, tipo: resolvedTipo },
      orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
    })
    if (!row) return { ok: false, status: 404, error: 'No exchange rate found' }
    return { ok: true, data: mapRow(row) }
  }

  async createManual(
    tenantId: number,
    userId: number | null,
    input: TipoCambioManualInput,
    options?: { recalc?: boolean },
  ): Promise<{ ok: true; data: TipoCambioRow; recalc?: RecalcFxResult } | { ok: false; status: number; error: string }> {
    if (!(input.valor > 0)) return { ok: false, status: 400, error: 'valor must be positive' }
    const fecha = input.fecha ? new Date(input.fecha) : new Date()
    if (Number.isNaN(fecha.getTime())) return { ok: false, status: 400, error: 'Invalid fecha' }
    const row = await this.prisma.tipoCambio.create({
      data: {
        tenantId,
        moneda: input.moneda,
        tipo: input.tipo,
        valor: new Decimal(input.valor),
        fecha,
        fuente: 'manual',
        createdById: userId,
      },
    })
    let recalc: RecalcFxResult | undefined
    if (options?.recalc !== false) {
      const preferido = await this.getPreferido(tenantId)
      if (preferido === input.tipo) {
        recalc = await this.recalcArticulosFx(tenantId, input.moneda, input.tipo, input.valor)
      }
    }
    return { ok: true, data: mapRow(row), recalc }
  }

  async syncBcraOficial(
    tenantId: number,
    userId: number | null,
    moneda: MonedaFx = 'USD',
  ): Promise<{ ok: true; data: TipoCambioRow; recalc: RecalcFxResult } | { ok: false; status: number; error: string }> {
    if (moneda !== 'USD') {
      return { ok: false, status: 400, error: 'BCRA sync currently supports USD only' }
    }
    let fetched: { valor: number; fecha: Date }
    try {
      fetched = await fetchBcraUsdOficial()
    } catch (err: unknown) {
      return {
        ok: false,
        status: 502,
        error: err instanceof Error ? err.message : 'BCRA sync failed',
      }
    }
    const row = await this.prisma.tipoCambio.create({
      data: {
        tenantId,
        moneda: 'USD',
        tipo: 'oficial',
        valor: new Decimal(fetched.valor),
        fecha: fetched.fecha,
        fuente: 'bcra_api',
        createdById: userId,
      },
    })
    const preferido = await this.getPreferido(tenantId)
    const recalc =
      preferido === 'oficial'
        ? await this.recalcArticulosFx(tenantId, 'USD', 'oficial', fetched.valor)
        : { updatedCount: 0, moneda: 'USD' as const, tipo: 'oficial' as const, valor: fetched.valor }
    return { ok: true, data: mapRow(row), recalc }
  }

  async recalcArticulosFx(
    tenantId: number,
    moneda: MonedaFx,
    tipo: TipoCambioTipo,
    valor: number,
  ): Promise<RecalcFxResult> {
    const articulos = await this.prisma.articulo.findMany({
      where: { tenantId, monedaPrecio: moneda, precioEnMonedaOrigen: { not: null } },
      select: { id: true, precioEnMonedaOrigen: true },
    })
    let updatedCount = 0
    for (const art of articulos) {
      const origen = art.precioEnMonedaOrigen ? toNumber(art.precioEnMonedaOrigen) : null
      if (origen == null || !(origen > 0)) continue
      const ars = arsFromFx(origen, valor)
      await this.prisma.articulo.update({
        where: { id: art.id },
        data: { precioLista1: new Decimal(ars) },
      })
      updatedCount += 1
    }
    if (updatedCount > 0) {
      await notifyManagers(this.prisma, tenantId, 'precios_fx_actualizados', {
        amount: String(updatedCount),
        preview: `${moneda} ${tipo} ${valor}`,
      })
    }
    return { updatedCount, moneda, tipo, valor }
  }

  /**
   * @en Daily BCRA sync for all tenants with catalog.multicurrency enabled.
   * @es Sync diario BCRA para tenants con catalog.multicurrency activo.
   * @pt-BR Sync diário BCRA para tenants com catalog.multicurrency ativo.
   */
  async runDailyJob(tenantId?: number): Promise<{ tenants: number; synced: number; errors: string[] }> {
    const configs = await this.prisma.tenantConfig.findMany({
      where: tenantId != null ? { tenantId } : undefined,
      select: { tenantId: true, modules: true },
    })
    const errors: string[] = []
    let synced = 0
    let tenants = 0
    for (const cfg of configs) {
      if (!cfg.modules.includes('catalog.multicurrency')) continue
      tenants += 1
      const result = await this.syncBcraOficial(cfg.tenantId, null, 'USD')
      if (!result.ok) {
        errors.push(`tenant ${cfg.tenantId}: ${result.error}`)
        continue
      }
      synced += 1
    }
    return { tenants, synced, errors }
  }
}
