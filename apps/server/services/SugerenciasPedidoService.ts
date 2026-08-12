import type { PrismaClient } from '@prisma/client'
import type {
  SugerenciaHabitual,
  SugerenciaOferta,
  SugerenciasPedido,
} from '@bizcode/types'
import type { ServiceResult } from './serviceResults'
import { getSugerenciasCache, setSugerenciasCache } from '../lib/sugerenciasPedidoCache'
import {
  SUGERENCIAS_TOP_N,
  SUGERENCIAS_WINDOW_MS,
  averagePedidoIntervalDays,
  daysBetween,
  discountPct,
  isFrequencyAnomaly,
  rankHabitualPurchases,
  roundSuggestedQty,
  type HabitualPurchaseEvent,
} from './sugerenciasPedidoAlgo'

type CatalogArticulo = {
  id: number
  descripcion: string
  condIva: string
  activo: boolean
  esPadre: boolean
  tipo: string
  precioLista1: { toString(): string } | number
  stock: { toString(): string } | number
  multiploVenta: { toString(): string } | number | null
}

function toNumber(value: { toString(): string } | number | string | null | undefined): number {
  if (value == null) return 0
  if (typeof value === 'number') return value
  return Number(value.toString())
}

function isSellable(art: CatalogArticulo | undefined | null): art is CatalogArticulo {
  if (!art) return false
  if (!art.activo) return false
  if (art.esPadre) return false
  if (art.tipo === 'servicio') return false
  return true
}

/**
 * @en Builds habituales + ofertas suggestions for a customer (#254).
 * @es Construye sugerencias de habituales + ofertas para un cliente (#254).
 * @pt-BR Constrói sugestões de habituais + ofertas para um cliente (#254).
 */
export class SugerenciasPedidoService {
  constructor(private readonly prisma: PrismaClient) {}

  async getByCliente(
    tenantId: number,
    clienteId: number,
    opts?: { limit?: number; offset?: number; now?: Date },
  ): Promise<ServiceResult<SugerenciasPedido>> {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: clienteId, tenantId },
      select: { id: true },
    })
    if (!cliente) {
      return { ok: false, status: 404, error: 'Cliente not found' }
    }

    const limit = Math.min(
      Math.max(opts?.limit ?? SUGERENCIAS_TOP_N, 1),
      SUGERENCIAS_TOP_N,
    )
    const offset = Math.max(opts?.offset ?? 0, 0)
    const now = opts?.now ?? new Date()

    // Cache only the default first page (offset 0)
    if (offset === 0) {
      const cached = await getSugerenciasCache(tenantId, clienteId)
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as SugerenciasPedido
          return {
            ok: true,
            data: {
              ...parsed,
              habituales: parsed.habituales.slice(0, limit),
            },
          }
        } catch {
          // recompute
        }
      }
    }

    const data = await this.compute(tenantId, clienteId, now)
    if (offset === 0) {
      await setSugerenciasCache(tenantId, clienteId, JSON.stringify(data))
    }
    return {
      ok: true,
      data: {
        ...data,
        habituales: data.habituales.slice(offset, offset + limit),
      },
    }
  }

  private async compute(
    tenantId: number,
    clienteId: number,
    now: Date,
  ): Promise<SugerenciasPedido> {
    const since = new Date(now.getTime() - SUGERENCIAS_WINDOW_MS)
    const pedidos = await this.prisma.pedido.findMany({
      where: {
        tenantId,
        clienteId,
        estado: { not: 'cancelled' },
        createdAt: { gte: since },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        createdAt: true,
        items: {
          select: {
            articuloId: true,
            cantidad: true,
          },
        },
      },
    })

    const ofertaRows = await this.prisma.articuloOferta.findMany({
      where: {
        tenantId,
        activa: true,
        vigenciaDesde: { lte: now },
        vigenciaHasta: { gte: now },
        articulo: {
          tenantId,
          activo: true,
          esPadre: false,
          tipo: { not: 'servicio' },
        },
      },
      orderBy: { precioOferta: 'asc' },
      select: {
        articuloId: true,
        precioOferta: true,
        vigenciaHasta: true,
        articulo: {
          select: {
            id: true,
            descripcion: true,
            condIva: true,
            activo: true,
            esPadre: true,
            tipo: true,
            precioLista1: true,
            stock: true,
            multiploVenta: true,
          },
        },
      },
    })

    if (pedidos.length === 0) {
      return {
        source: 'vacio',
        habituales: [],
        ofertas: this.mapOfertas(ofertaRows, new Set()),
      }
    }

    const articuloIds = new Set<number>()
    for (const p of pedidos) {
      for (const it of p.items) {
        if (it.articuloId != null && it.articuloId >= 1) articuloIds.add(it.articuloId)
      }
    }
    for (const o of ofertaRows) articuloIds.add(o.articuloId)

    const catalog =
      articuloIds.size > 0
        ? await this.prisma.articulo.findMany({
            where: { tenantId, id: { in: [...articuloIds] } },
            select: {
              id: true,
              descripcion: true,
              condIva: true,
              activo: true,
              esPadre: true,
              tipo: true,
              precioLista1: true,
              stock: true,
              multiploVenta: true,
            },
          })
        : []
    const byId = new Map(catalog.map((a) => [a.id, a as CatalogArticulo]))

    const ofertaByArticulo = new Map<number, { precioOferta: number; vigenciaHasta: Date }>()
    for (const o of ofertaRows) {
      if (!ofertaByArticulo.has(o.articuloId)) {
        ofertaByArticulo.set(o.articuloId, {
          precioOferta: toNumber(o.precioOferta),
          vigenciaHasta: o.vigenciaHasta,
        })
      }
    }

    const frecuenciaDias = averagePedidoIntervalDays(pedidos.map((p) => p.createdAt))

    if (pedidos.length < 2) {
      const last = pedidos[0]
      const habituales: SugerenciaHabitual[] = []
      const seen = new Set<number>()
      for (const it of last.items) {
        if (it.articuloId == null) continue
        if (seen.has(it.articuloId)) continue
        const art = byId.get(it.articuloId)
        if (!isSellable(art)) continue
        seen.add(it.articuloId)
        habituales.push(
          this.mapHabitual({
            art,
            cantidadSugerida: roundSuggestedQty(
              toNumber(it.cantidad),
              art.multiploVenta != null ? toNumber(art.multiploVenta) : null,
            ),
            diasDesdeUltima: daysBetween(now, last.createdAt),
            frecuenciaDias: null,
            oferta: ofertaByArticulo.get(art.id) ?? null,
          }),
        )
      }
      const habitualIds = new Set(habituales.map((h) => h.articuloId))
      return {
        source: 'ultimo_pedido',
        habituales: habituales.slice(0, SUGERENCIAS_TOP_N),
        ofertas: this.mapOfertas(ofertaRows, habitualIds),
      }
    }

    const events: HabitualPurchaseEvent[] = []
    for (const p of pedidos) {
      for (const it of p.items) {
        if (it.articuloId == null) continue
        const art = byId.get(it.articuloId)
        if (!isSellable(art)) continue
        events.push({
          articuloId: it.articuloId,
          pedidoId: p.id,
          cantidad: toNumber(it.cantidad),
          createdAt: p.createdAt,
        })
      }
    }

    const ranked = rankHabitualPurchases(events).slice(0, SUGERENCIAS_TOP_N)
    const habituales: SugerenciaHabitual[] = []
    for (const row of ranked) {
      const art = byId.get(row.articuloId)
      if (!isSellable(art)) continue
      const avg =
        row.recentCantidades.length > 0
          ? row.recentCantidades.reduce((a, b) => a + b, 0) / row.recentCantidades.length
          : 1
      const diasDesdeUltima = daysBetween(now, row.lastBoughtAt)
      habituales.push(
        this.mapHabitual({
          art,
          cantidadSugerida: roundSuggestedQty(
            avg,
            art.multiploVenta != null ? toNumber(art.multiploVenta) : null,
          ),
          diasDesdeUltima,
          frecuenciaDias,
          oferta: ofertaByArticulo.get(art.id) ?? null,
        }),
      )
    }

    const habitualIds = new Set(habituales.map((h) => h.articuloId))
    return {
      source: 'historial',
      habituales,
      ofertas: this.mapOfertas(ofertaRows, habitualIds),
    }
  }

  private mapHabitual(input: {
    art: CatalogArticulo
    cantidadSugerida: number
    diasDesdeUltima: number
    frecuenciaDias: number | null
    oferta: { precioOferta: number; vigenciaHasta: Date } | null
  }): SugerenciaHabitual {
    const lista = toNumber(input.art.precioLista1)
    const useOferta = input.oferta != null && input.oferta.precioOferta > 0
    return {
      articuloId: input.art.id,
      descripcion: input.art.descripcion,
      cantidadSugerida: input.cantidadSugerida,
      diasDesdeUltima: input.diasDesdeUltima,
      frecuenciaDias:
        input.frecuenciaDias != null
          ? Math.round(input.frecuenciaDias * 10) / 10
          : null,
      anomalia: isFrequencyAnomaly(input.diasDesdeUltima, input.frecuenciaDias),
      precio: useOferta ? input.oferta!.precioOferta : lista,
      stock: toNumber(input.art.stock),
      condIva: input.art.condIva,
      origenPrecio: useOferta ? 'oferta' : 'lista',
    }
  }

  private mapOfertas(
    rows: Array<{
      articuloId: number
      precioOferta: { toString(): string } | number
      vigenciaHasta: Date
      articulo: CatalogArticulo
    }>,
    excludeIds: Set<number>,
  ): SugerenciaOferta[] {
    const seen = new Set<number>()
    const out: SugerenciaOferta[] = []
    for (const row of rows) {
      if (excludeIds.has(row.articuloId) || seen.has(row.articuloId)) continue
      if (!isSellable(row.articulo)) continue
      seen.add(row.articuloId)
      const precioLista = toNumber(row.articulo.precioLista1)
      const precioOferta = toNumber(row.precioOferta)
      out.push({
        articuloId: row.articuloId,
        descripcion: row.articulo.descripcion,
        precioOferta,
        precioLista,
        descuentoPct: discountPct(precioLista, precioOferta),
        stock: toNumber(row.articulo.stock),
        condIva: row.articulo.condIva,
        vigenciaHasta: row.vigenciaHasta.toISOString(),
      })
    }
    return out
  }
}
