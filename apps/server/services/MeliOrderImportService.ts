/**
 * @en Imports Mercado Libre paid orders as Pedidos and manages cancel transitions (#186).
 * @es Importa órdenes pagadas de Mercado Libre como Pedidos y gestiona cancelaciones (#186).
 * @pt-BR Importa pedidos pagos do Mercado Livre como Pedidos e gerencia cancelamentos (#186).
 */

import type { PedidoInvoiceInput } from '@bizcode/types'
import type { PrismaClient } from '@prisma/client'
import {
  getMeliOrder,
  type MeliOrderResponse,
} from '../integrations/meli/meliItemsClient'
import { sanitizeLogField } from '../lib/sanitizeLogField'
import { resolveSystemUserId } from '../lib/systemUserId'
import { notifyManagers } from '../notifications'
import { MeliConfigService } from './MeliConfigService'
import { MeliStockSyncService } from './MeliStockSyncService'
import { PedidoService } from './PedidoService'
import type { ServiceResult } from './serviceResults'
import { StockAjusteService } from './StockAjusteService'

/**
 * @en Extracts order/item id from MeLi `resource` path (#185/#186).
 * @es Extrae id de orden/ítem del path `resource` MeLi (#185/#186).
 * @pt-BR Extrai id de pedido/item do path `resource` MeLi (#185/#186).
 */
export function extractMeliResourceId(resource: string): string | null {
  const trimmed = resource.trim()
  if (!trimmed) return null
  const parts = trimmed.replace(/^\//, '').split('/').filter(Boolean)
  const last = parts[parts.length - 1]
  return last && last.length > 0 ? last : null
}

export type MeliOrdenListFilter = 'pendiente' | 'facturada' | 'cancelada' | 'all'

export type MeliOrdenRow = {
  id: number
  meliOrderId: string
  status: string
  shippingId: string | null
  isFulfillment: boolean
  buyerNickname: string | null
  cuitPending: boolean
  stockAppliedAt: string | null
  lastSyncedAt: string
  pedidoId: number | null
  pedidoEstado: string | null
  pedidoTotal: string | null
  facturaId: number | null
  clienteId: number | null
  clienteRsocial: string | null
  clienteCuit: string | null
}

function isPaidStatus(status: string): boolean {
  return status.toLowerCase() === 'paid'
}

function isCancelledStatus(status: string): boolean {
  const s = status.toLowerCase()
  return s === 'cancelled' || s === 'canceled'
}

function detectFulfillment(order: MeliOrderResponse): boolean {
  const logistic = order.shipping?.logistic_type?.toLowerCase() ?? ''
  if (logistic === 'fulfillment' || logistic.includes('fulfillment')) return true
  const tags = order.tags ?? []
  return tags.some((t) => t.toLowerCase().includes('fulfillment') || t.toLowerCase() === 'mshops')
}

function buyerDisplayName(order: MeliOrderResponse): string {
  const nick = order.buyer?.nickname?.trim()
  if (nick) return nick.slice(0, 30)
  const first = order.buyer?.first_name?.trim() ?? ''
  const last = order.buyer?.last_name?.trim() ?? ''
  const full = `${first} ${last}`.trim()
  if (full) return full.slice(0, 30)
  return 'Comprador Mercado Libre'
}

function buyerEmail(order: MeliOrderResponse): string | null {
  const email = order.buyer?.email?.trim().toLowerCase()
  if (!email || !email.includes('@')) return null
  return email.slice(0, 50)
}

/**
 * @en MeLi order import / lifecycle service (#186).
 * @es Servicio de importación / ciclo de vida de órdenes MeLi (#186).
 * @pt-BR Serviço de importação / ciclo de vida de pedidos MeLi (#186).
 */
export class MeliOrderImportService {
  private readonly meliConfig: MeliConfigService
  private readonly stockAjuste: StockAjusteService
  private readonly stockSync: MeliStockSyncService
  private readonly pedidos: PedidoService

  constructor(private readonly prisma: PrismaClient) {
    this.meliConfig = new MeliConfigService(prisma)
    this.stockAjuste = new StockAjusteService(prisma)
    this.stockSync = new MeliStockSyncService(prisma)
    this.pedidos = new PedidoService(prisma)
  }

  /**
   * @en Processes an orders_v2 notification: re-fetch order and apply transitions (#186).
   * @es Procesa notificación orders_v2: re-consulta la orden y aplica transiciones (#186).
   * @pt-BR Processa notificação orders_v2: reconsulta o pedido e aplica transições (#186).
   */
  async processOrderNotification(tenantId: number, resource: string): Promise<void> {
    const orderId = extractMeliResourceId(resource)
    if (!orderId) return

    const tokens = await this.meliConfig.getDecryptedTokens(tenantId)
    if (!tokens.ok) {
      console.warn('[meli-order-import] no_tokens', 'tenant', tenantId)
      return
    }

    let order: MeliOrderResponse
    try {
      order = await getMeliOrder(tokens.data.accessToken, orderId)
    } catch (err: unknown) {
      console.warn(
        '[meli-order-import] order_fetch_error',
        'tenant',
        tenantId,
        'order',
        sanitizeLogField(orderId),
        'detail',
        err instanceof Error ? err.message : err,
      )
      return
    }

    await this.applyOrderSnapshot(tenantId, orderId, order)
  }

  async applyOrderSnapshot(
    tenantId: number,
    meliOrderId: string,
    order: MeliOrderResponse,
  ): Promise<void> {
    const status = (order.status ?? 'unknown').slice(0, 40)
    const shippingId =
      order.shipping?.id != null ? String(order.shipping.id).slice(0, 40) : null
    const isFulfillment = detectFulfillment(order)
    const buyerNickname = (order.buyer?.nickname ?? buyerDisplayName(order)).slice(0, 120)

    const existing = await this.prisma.meliOrden.findUnique({
      where: { tenantId_meliOrderId: { tenantId, meliOrderId } },
    })

    const row = existing
      ? await this.prisma.meliOrden.update({
          where: { id: existing.id },
          data: {
            status,
            shippingId,
            isFulfillment,
            buyerNickname,
            lastSyncedAt: new Date(),
          },
        })
      : await this.prisma.meliOrden.create({
          data: {
            tenantId,
            meliOrderId,
            status,
            shippingId,
            isFulfillment,
            buyerNickname,
            lastSyncedAt: new Date(),
          },
        })

    if (isPaidStatus(status)) {
      await this.handlePaid(tenantId, row.id, meliOrderId, order)
      return
    }
    if (isCancelledStatus(status)) {
      await this.handleCancelled(tenantId, row.id)
    }
  }

  private async handlePaid(
    tenantId: number,
    meliOrdenId: number,
    meliOrderId: string,
    order: MeliOrderResponse,
  ): Promise<void> {
    const row = await this.prisma.meliOrden.findUniqueOrThrow({ where: { id: meliOrdenId } })
    const systemUserId = resolveSystemUserId()

    if (!row.stockAppliedAt) {
      await this.applyStockOnce(tenantId, order, systemUserId)
      await this.prisma.meliOrden.update({
        where: { id: meliOrdenId },
        data: { stockAppliedAt: new Date() },
      })
    }

    if (row.pedidoId != null) return

    const created = await this.createPedidoFromOrder(tenantId, meliOrderId, order, systemUserId)
    if (!created.ok) {
      console.warn(
        '[meli-order-import] pedido_create_failed',
        'tenant',
        tenantId,
        'order',
        sanitizeLogField(meliOrderId),
        'error',
        sanitizeLogField(created.error),
      )
      return
    }

    await this.prisma.meliOrden.update({
      where: { id: meliOrdenId },
      data: {
        pedidoId: created.data.pedidoId,
        cuitPending: created.data.cuitPending,
      },
    })

    await notifyManagers(this.prisma, tenantId, 'meli_order_imported', {
      resource: meliOrderId,
      pedidoId: created.data.pedidoId,
      detail: `Nueva venta en ML: orden ${meliOrderId}`,
      rsocial: created.data.clienteRsocial,
      amount: String(created.data.total),
    })

    if (created.data.cuitPending) {
      await notifyManagers(this.prisma, tenantId, 'meli_cuit_required', {
        resource: meliOrderId,
        pedidoId: created.data.pedidoId,
        clienteId: created.data.clienteId,
        detail: `Completar CUIT del cliente antes de facturar A (orden ML ${meliOrderId})`,
      })
    }
  }

  private async applyStockOnce(
    tenantId: number,
    order: MeliOrderResponse,
    systemUserId: number,
  ): Promise<void> {
    for (const line of order.order_items ?? []) {
      const itemId = line.item?.id?.trim()
      const qty = Number(line.quantity)
      if (!itemId || !Number.isFinite(qty) || qty <= 0) continue

      const pub = await this.prisma.meliPublicacion.findFirst({
        where: { tenantId, meliItemId: itemId },
        select: { articuloId: true },
      })
      if (!pub) continue

      const result = await this.stockAjuste.adjust(tenantId, pub.articuloId, systemUserId, {
        cantidad: -Math.floor(qty),
        motivo: 'venta_meli',
      })
      if (!result.ok) {
        console.warn(
          '[meli-order-import] stock_adjust_failed',
          'tenant',
          tenantId,
          'articulo',
          pub.articuloId,
          'error',
          sanitizeLogField(result.error),
        )
      }
    }
  }

  private async createPedidoFromOrder(
    tenantId: number,
    _meliOrderId: string,
    order: MeliOrderResponse,
    systemUserId: number,
  ): Promise<
    ServiceResult<{
      pedidoId: number
      clienteId: number
      clienteRsocial: string
      total: number
      cuitPending: boolean
    }>
  > {
    const cliente = await this.resolveOrCreateCliente(tenantId, order)
    if (!cliente.ok) return cliente

    const lines: Array<{
      articuloId: number
      descripcion: string
      condIva: string
      unidadServicio: string | null
      cantidad: number
      precio: number
      dscto: number
      subtotal: number
    }> = []

    for (const line of order.order_items ?? []) {
      const itemId = line.item?.id?.trim()
      const qty = Math.floor(Number(line.quantity))
      const unitPrice = Number(line.unit_price ?? 0)
      if (!itemId || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(unitPrice)) continue

      const pub = await this.prisma.meliPublicacion.findFirst({
        where: { tenantId, meliItemId: itemId },
        select: { articuloId: true },
      })
      if (!pub) continue

      const articulo = await this.prisma.articulo.findFirst({
        where: { id: pub.articuloId, tenantId },
        select: {
          id: true,
          descripcion: true,
          condIva: true,
          unidadServicio: true,
          tipo: true,
          esPadre: true,
        },
      })
      if (!articulo || articulo.esPadre || articulo.tipo === 'servicio') continue

      const precio = Math.round(unitPrice * 100) / 100
      const subtotal = Math.round(precio * qty * 100) / 100
      lines.push({
        articuloId: articulo.id,
        descripcion: (line.item.title ?? articulo.descripcion).slice(0, 120),
        condIva: articulo.condIva,
        unidadServicio: articulo.unidadServicio,
        cantidad: qty,
        precio,
        dscto: 0,
        subtotal,
      })
    }

    if (lines.length === 0) {
      return {
        ok: false,
        status: 422,
        error: 'No linked Mercado Libre listings found for order items',
      }
    }

    const total = Math.round(lines.reduce((acc, l) => acc + l.subtotal, 0) * 100) / 100
    const pedido = await this.prisma.pedido.create({
      data: {
        tenantId,
        clienteId: cliente.data.id,
        vendedorId: null,
        estado: 'confirmed',
        origen: 'meli',
        total,
        items: { create: lines },
      },
      select: { id: true },
    })

    void systemUserId

    return {
      ok: true,
      data: {
        pedidoId: pedido.id,
        clienteId: cliente.data.id,
        clienteRsocial: cliente.data.rsocial,
        total,
        cuitPending: cliente.data.cuitPending,
      },
    }
  }

  private async resolveOrCreateCliente(
    tenantId: number,
    order: MeliOrderResponse,
  ): Promise<ServiceResult<{ id: number; rsocial: string; cuitPending: boolean }>> {
    const email = buyerEmail(order)
    if (email) {
      const found = await this.prisma.cliente.findFirst({
        where: {
          tenantId,
          email: { equals: email, mode: 'insensitive' },
        },
        select: { id: true, rsocial: true, cuit: true },
      })
      if (found) {
        return {
          ok: true,
          data: {
            id: found.id,
            rsocial: found.rsocial,
            cuitPending: !found.cuit?.trim(),
          },
        }
      }
    }

    const maxCodigo = await this.prisma.cliente.aggregate({
      where: { tenantId },
      _max: { codigo: true },
    })
    const codigo = (maxCodigo._max.codigo ?? 0) + 1
    const rsocial = buyerDisplayName(order)
    const created = await this.prisma.cliente.create({
      data: {
        tenantId,
        codigo,
        rsocial,
        condIva: 'CF',
        activo: true,
        email,
        cuit: null,
        fantasia: order.buyer?.nickname?.slice(0, 30) ?? null,
      },
      select: { id: true, rsocial: true },
    })

    return {
      ok: true,
      data: { id: created.id, rsocial: created.rsocial, cuitPending: true },
    }
  }

  private async handleCancelled(tenantId: number, meliOrdenId: number): Promise<void> {
    const row = await this.prisma.meliOrden.findUniqueOrThrow({
      where: { id: meliOrdenId },
      include: {
        pedido: { select: { id: true, estado: true, facturaId: true } },
      },
    })

    if (!row.pedidoId || !row.pedido) return

    if (row.pedido.estado === 'invoiced' || row.pedido.facturaId != null) {
      await notifyManagers(this.prisma, tenantId, 'meli_order_cancelled_invoiced', {
        resource: row.meliOrderId,
        pedidoId: row.pedidoId,
        facturaId: row.pedido.facturaId ?? undefined,
        detail: `Orden ML ${row.meliOrderId} cancelada pero el pedido #${row.pedidoId} ya está facturado — revisión manual`,
      })
      return
    }

    if (row.pedido.estado === 'confirmed' || row.pedido.estado === 'draft') {
      const cancelled = await this.pedidos.cancel(tenantId, row.pedidoId)
      if (!cancelled.ok) {
        console.warn(
          '[meli-order-import] pedido_cancel_failed',
          'pedido',
          row.pedidoId,
          sanitizeLogField(cancelled.error),
        )
      }
    }

    if (row.stockAppliedAt) {
      await this.restoreStockFromOrder(tenantId, row.meliOrderId)
      await this.prisma.meliOrden.update({
        where: { id: meliOrdenId },
        data: { stockAppliedAt: null },
      })
    }
  }

  private async restoreStockFromOrder(tenantId: number, meliOrderId: string): Promise<void> {
    const tokens = await this.meliConfig.getDecryptedTokens(tenantId)
    if (!tokens.ok) return
    let order: MeliOrderResponse
    try {
      order = await getMeliOrder(tokens.data.accessToken, meliOrderId)
    } catch {
      return
    }
    const systemUserId = resolveSystemUserId()
    for (const line of order.order_items ?? []) {
      const itemId = line.item?.id?.trim()
      const qty = Math.floor(Number(line.quantity))
      if (!itemId || qty <= 0) continue
      const pub = await this.prisma.meliPublicacion.findFirst({
        where: { tenantId, meliItemId: itemId },
        select: { articuloId: true },
      })
      if (!pub) continue
      const result = await this.stockAjuste.adjust(tenantId, pub.articuloId, systemUserId, {
        cantidad: qty,
        motivo: 'cancelacion_meli',
      })
      if (result.ok) {
        void this.stockSync.syncStockToMeli(tenantId, pub.articuloId).catch(() => undefined)
      }
    }
  }

  async list(
    tenantId: number,
    filter: MeliOrdenListFilter,
    take: number,
    skip: number,
  ): Promise<{ total: number; ordenes: MeliOrdenRow[] }> {
    const where =
      filter === 'pendiente'
        ? {
            tenantId,
            status: { notIn: ['cancelled', 'canceled'] },
            pedido: { estado: { in: ['confirmed', 'draft'] } },
          }
        : filter === 'facturada'
          ? { tenantId, pedido: { estado: 'invoiced' } }
          : filter === 'cancelada'
            ? {
                tenantId,
                OR: [
                  { status: { in: ['cancelled', 'canceled'] } },
                  { pedido: { estado: 'cancelled' } },
                ],
              }
            : { tenantId }

    const [total, rows] = await Promise.all([
      this.prisma.meliOrden.count({ where }),
      this.prisma.meliOrden.findMany({
        where,
        include: {
          pedido: {
            select: {
              id: true,
              estado: true,
              total: true,
              facturaId: true,
              clienteId: true,
              cliente: { select: { rsocial: true, cuit: true } },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take,
        skip,
      }),
    ])

    return {
      total,
      ordenes: rows.map((r) => ({
        id: r.id,
        meliOrderId: r.meliOrderId,
        status: r.status,
        shippingId: r.shippingId,
        isFulfillment: r.isFulfillment,
        buyerNickname: r.buyerNickname,
        cuitPending: r.cuitPending,
        stockAppliedAt: r.stockAppliedAt?.toISOString() ?? null,
        lastSyncedAt: r.lastSyncedAt.toISOString(),
        pedidoId: r.pedidoId,
        pedidoEstado: r.pedido?.estado ?? null,
        pedidoTotal: r.pedido != null ? String(r.pedido.total) : null,
        facturaId: r.pedido?.facturaId ?? null,
        clienteId: r.pedido?.clienteId ?? null,
        clienteRsocial: r.pedido?.cliente.rsocial ?? null,
        clienteCuit: r.pedido?.cliente.cuit ?? null,
      })),
    }
  }

  async facturar(
    tenantId: number,
    meliOrderId: string,
    invoiceInput: PedidoInvoiceInput,
    userId: number,
  ): Promise<ServiceResult<{ pedidoId: number; facturaId: number }>> {
    const row = await this.prisma.meliOrden.findUnique({
      where: { tenantId_meliOrderId: { tenantId, meliOrderId } },
      include: {
        pedido: {
          include: { cliente: { select: { id: true, cuit: true, condIva: true } } },
        },
      },
    })
    if (!row?.pedido) {
      return { ok: false, status: 404, error: 'Mercado Libre order or linked pedido not found' }
    }
    if (isCancelledStatus(row.status) || row.pedido.estado === 'cancelled') {
      return { ok: false, status: 409, error: 'ORDER_CANCELLED' }
    }
    if (row.pedido.estado === 'invoiced') {
      return { ok: false, status: 409, error: 'ALREADY_INVOICED' }
    }

    const tipo = invoiceInput.tipo.toUpperCase()
    if (tipo === 'A' && !row.pedido.cliente.cuit?.trim()) {
      return {
        ok: false,
        status: 422,
        error: 'CUIT_REQUIRED_FOR_FACTURA_A',
      }
    }

    if (row.pedido.estado === 'draft') {
      const confirmed = await this.pedidos.confirm(tenantId, row.pedido.id)
      if (!confirmed.ok) return confirmed
    }

    const invoiced = await this.pedidos.invoice(tenantId, row.pedido.id, invoiceInput, userId)
    if (!invoiced.ok) return invoiced

    const facturaId = invoiced.data.facturaId
    if (facturaId == null) {
      return { ok: false, status: 500, error: 'Invoice created without factura id' }
    }

    return {
      ok: true,
      data: {
        pedidoId: row.pedido.id,
        facturaId,
      },
    }
  }
}
