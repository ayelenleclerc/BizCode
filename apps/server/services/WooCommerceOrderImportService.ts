/**
 * @en Imports WooCommerce processing/completed orders as Pedidos (#188).
 * @es Importa órdenes WooCommerce en processing/completed como Pedidos (#188).
 * @pt-BR Importa pedidos WooCommerce em processing/completed como Pedidos (#188).
 */

import type { PedidoInvoiceInput } from '@bizcode/types'
import type { PrismaClient } from '@prisma/client'
import {
  getWooCommerceOrder,
  type WooCommerceOrderResponse,
} from '../integrations/woocommerce/woocommerceApiClient'
import { resolveSystemUserId } from '../lib/systemUserId'
import { notifyManagers } from '../notifications'
import { bootstrapEcommerceConnectors } from '../integrations/ecommerce/bootstrapEcommerceConnectors'
import { WooCommerceConfigService } from './WooCommerceConfigService'
import { WooCommerceStockSyncService } from './WooCommerceStockSyncService'
import { PedidoService } from './PedidoService'
import type { ServiceResult } from './serviceResults'
import { StockAjusteService } from './StockAjusteService'
import { EcommerceSyncEngine } from './EcommerceSyncEngine'

export type WooCommerceOrdenListFilter = 'pendiente' | 'facturada' | 'cancelada' | 'all'

export type WooCommerceOrdenRow = {
  id: number
  wcOrderId: string
  status: string
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

/** @en Statuses that trigger stock decrement + Pedido creation (#188). */
function isStockDecrementStatus(status: string): boolean {
  const s = status.toLowerCase()
  return s === 'processing' || s === 'completed'
}

function isCancelledStatus(status: string): boolean {
  const s = status.toLowerCase()
  return s === 'cancelled' || s === 'refunded' || s === 'failed'
}

function buyerDisplayName(order: WooCommerceOrderResponse): string {
  const name = [order.billing?.first_name, order.billing?.last_name]
    .filter((v): v is string => Boolean(v?.trim()))
    .join(' ')
    .trim()
  if (name) return name.slice(0, 30)
  return 'Comprador WooCommerce'
}

function buyerEmail(order: WooCommerceOrderResponse): string | null {
  const email = order.billing?.email?.trim().toLowerCase()
  if (!email || !email.includes('@')) return null
  return email.slice(0, 50)
}

export class WooCommerceOrderImportService {
  private readonly wcConfig: WooCommerceConfigService
  private readonly stockAjuste: StockAjusteService
  private readonly stockSync: WooCommerceStockSyncService
  private readonly pedidos: PedidoService
  private readonly syncEngine: EcommerceSyncEngine

  constructor(private readonly prisma: PrismaClient) {
    bootstrapEcommerceConnectors()
    this.wcConfig = new WooCommerceConfigService(prisma)
    this.stockAjuste = new StockAjusteService(prisma)
    this.stockSync = new WooCommerceStockSyncService(prisma)
    this.pedidos = new PedidoService(prisma)
    this.syncEngine = new EcommerceSyncEngine(prisma)
  }

  async processOrderNotification(tenantId: number, orderId: string): Promise<void> {
    const creds = await this.wcConfig.getDecryptedCredentials(tenantId)
    if (!creds.ok) {
      console.warn('[woocommerce-order-import] no_credentials', 'tenant', tenantId)
      return
    }

    let order: WooCommerceOrderResponse
    try {
      order = await getWooCommerceOrder(
        creds.data.storeUrl,
        creds.data.consumerKey,
        creds.data.consumerSecret,
        orderId,
      )
    } catch {
      console.warn('[woocommerce-order-import] order_fetch_error tenant', tenantId)
      return
    }

    await this.applyOrderSnapshot(tenantId, orderId, order)
  }

  async applyOrderSnapshot(
    tenantId: number,
    wcOrderId: string,
    order: WooCommerceOrderResponse,
  ): Promise<void> {
    const status = (order.status ?? 'unknown').slice(0, 40)
    const buyerNickname = buyerDisplayName(order).slice(0, 120)

    const existing = await this.prisma.wooCommerceOrden.findUnique({
      where: { tenantId_wcOrderId: { tenantId, wcOrderId } },
    })

    const row = existing
      ? await this.prisma.wooCommerceOrden.update({
          where: { id: existing.id },
          data: { status, buyerNickname, lastSyncedAt: new Date() },
        })
      : await this.prisma.wooCommerceOrden.create({
          data: {
            tenantId,
            wcOrderId,
            status,
            buyerNickname,
            lastSyncedAt: new Date(),
          },
        })

    if (isStockDecrementStatus(status)) {
      await this.handlePaid(tenantId, row.id, wcOrderId, order)
      return
    }
    if (isCancelledStatus(status)) {
      await this.handleCancelled(tenantId, row.id)
    }
  }

  private async handlePaid(
    tenantId: number,
    wcOrdenId: number,
    wcOrderId: string,
    order: WooCommerceOrderResponse,
  ): Promise<void> {
    const row = await this.prisma.wooCommerceOrden.findUniqueOrThrow({ where: { id: wcOrdenId } })
    const systemUserId = resolveSystemUserId()

    if (!row.stockAppliedAt) {
      await this.applyStockOnce(tenantId, order, systemUserId)
      await this.prisma.wooCommerceOrden.update({
        where: { id: wcOrdenId },
        data: { stockAppliedAt: new Date() },
      })
    }

    if (row.pedidoId != null) return

    const created = await this.createPedidoFromOrder(tenantId, order)
    if (!created.ok) {
      // Numeric tenant only — skip order id / error text (CodeQL js/log-injection).
      console.warn('[woocommerce-order-import] pedido_create_failed tenant', tenantId)
      return
    }

    await this.prisma.wooCommerceOrden.update({
      where: { id: wcOrdenId },
      data: {
        pedidoId: created.data.pedidoId,
        cuitPending: created.data.cuitPending,
      },
    })

    await notifyManagers(this.prisma, tenantId, 'woocommerce_order_imported', {
      resource: wcOrderId,
      pedidoId: created.data.pedidoId,
      detail: `Nueva venta en WooCommerce: orden ${wcOrderId}`,
      rsocial: created.data.clienteRsocial,
      amount: String(created.data.total),
    })

    if (created.data.cuitPending) {
      await notifyManagers(this.prisma, tenantId, 'woocommerce_cuit_required', {
        resource: wcOrderId,
        pedidoId: created.data.pedidoId,
        clienteId: created.data.clienteId,
        detail: `Completar CUIT del cliente antes de facturar A (orden WC ${wcOrderId})`,
      })
    }
  }

  private async applyStockOnce(
    tenantId: number,
    order: WooCommerceOrderResponse,
    systemUserId: number,
  ): Promise<void> {
    for (const line of order.line_items ?? []) {
      const productId = line.product_id != null ? String(line.product_id) : ''
      const qty = Number(line.quantity)
      if (!productId || !Number.isFinite(qty) || qty <= 0) continue

      const pub = await this.prisma.wooCommercePublicacion.findFirst({
        where: { tenantId, wcProductId: productId },
        select: { articuloId: true },
      })
      if (!pub) continue

      const result = await this.stockAjuste.adjust(tenantId, pub.articuloId, systemUserId, {
        cantidad: -Math.floor(qty),
        motivo: 'venta_woocommerce',
      })
      if (!result.ok) {
        console.warn(
          '[woocommerce-order-import] stock_adjust_failed tenant',
          tenantId,
          'articulo',
          pub.articuloId,
        )
      } else {
        void this.stockSync.syncStockToWooCommerce(tenantId, pub.articuloId).catch(() => undefined)
      }
    }
  }

  private async createPedidoFromOrder(
    tenantId: number,
    order: WooCommerceOrderResponse,
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

    for (const line of order.line_items ?? []) {
      const productId = line.product_id != null ? String(line.product_id) : ''
      const qty = Math.floor(Number(line.quantity))
      const unitPrice = Number(line.price ?? 0)
      if (!productId || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(unitPrice)) continue

      const pub = await this.prisma.wooCommercePublicacion.findFirst({
        where: { tenantId, wcProductId: productId },
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
        descripcion: (line.name ?? articulo.descripcion).slice(0, 120),
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
        error: 'No linked WooCommerce listings found for order products',
      }
    }

    const total = Math.round(lines.reduce((acc, l) => acc + l.subtotal, 0) * 100) / 100
    const pedido = await this.prisma.pedido.create({
      data: {
        tenantId,
        clienteId: cliente.data.id,
        vendedorId: null,
        estado: 'confirmed',
        origen: 'woocommerce',
        total,
        items: { create: lines },
      },
      select: { id: true },
    })

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
    order: WooCommerceOrderResponse,
  ): Promise<ServiceResult<{ id: number; rsocial: string; cuitPending: boolean }>> {
    const email = buyerEmail(order)
    if (email) {
      const found = await this.prisma.cliente.findFirst({
        where: { tenantId, email: { equals: email, mode: 'insensitive' } },
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
        fantasia: rsocial.slice(0, 30),
      },
      select: { id: true, rsocial: true },
    })

    return {
      ok: true,
      data: { id: created.id, rsocial: created.rsocial, cuitPending: true },
    }
  }

  private async handleCancelled(tenantId: number, wcOrdenId: number): Promise<void> {
    const row = await this.prisma.wooCommerceOrden.findUniqueOrThrow({
      where: { id: wcOrdenId },
      include: {
        pedido: { select: { id: true, estado: true, facturaId: true } },
      },
    })

    if (!row.pedidoId || !row.pedido) return

    if (row.pedido.estado === 'invoiced' || row.pedido.facturaId != null) {
      await notifyManagers(this.prisma, tenantId, 'woocommerce_order_cancelled_invoiced', {
        resource: row.wcOrderId,
        pedidoId: row.pedidoId,
        facturaId: row.pedido.facturaId ?? undefined,
        detail: `Orden WC ${row.wcOrderId} cancelada pero el pedido #${row.pedidoId} ya está facturado — revisión manual`,
      })
      return
    }

    if (row.pedido.estado === 'confirmed' || row.pedido.estado === 'draft') {
      const cancelled = await this.pedidos.cancel(tenantId, row.pedidoId)
      if (!cancelled.ok) {
        console.warn(
          '[woocommerce-order-import] pedido_cancel_failed tenant',
          tenantId,
          'pedido',
          row.pedidoId,
        )
      }
    }

    if (row.stockAppliedAt) {
      await this.restoreStockFromOrder(tenantId, row.wcOrderId)
      await this.prisma.wooCommerceOrden.update({
        where: { id: wcOrdenId },
        data: { stockAppliedAt: null },
      })
    }
  }

  private async restoreStockFromOrder(tenantId: number, wcOrderId: string): Promise<void> {
    const creds = await this.wcConfig.getDecryptedCredentials(tenantId)
    if (!creds.ok) return
    let order: WooCommerceOrderResponse
    try {
      order = await getWooCommerceOrder(
        creds.data.storeUrl,
        creds.data.consumerKey,
        creds.data.consumerSecret,
        wcOrderId,
      )
    } catch {
      return
    }
    const systemUserId = resolveSystemUserId()
    for (const line of order.line_items ?? []) {
      const productId = line.product_id != null ? String(line.product_id) : ''
      const qty = Math.floor(Number(line.quantity))
      if (!productId || qty <= 0) continue
      const pub = await this.prisma.wooCommercePublicacion.findFirst({
        where: { tenantId, wcProductId: productId },
        select: { articuloId: true },
      })
      if (!pub) continue
      const result = await this.stockAjuste.adjust(tenantId, pub.articuloId, systemUserId, {
        cantidad: qty,
        motivo: 'cancelacion_woocommerce',
      })
      if (result.ok) {
        void this.stockSync.syncStockToWooCommerce(tenantId, pub.articuloId).catch(() => undefined)
      }
    }
  }

  /**
   * @en Enqueues mark_dispatched for a WooCommerce-origin Pedido (#188).
   * @es Encola mark_dispatched para un Pedido con origen WooCommerce (#188).
   * @pt-BR Enfileira mark_dispatched para um Pedido com origem WooCommerce (#188).
   */
  async enqueueMarkDispatched(tenantId: number, pedidoId: number): Promise<void> {
    const row = await this.prisma.wooCommerceOrden.findFirst({
      where: { tenantId, pedidoId },
      select: { wcOrderId: true },
    })
    if (!row) return
    const job = await this.syncEngine.enqueue({
      tenantId,
      connectorType: 'woocommerce',
      operation: 'mark_dispatched',
      idempotencyKey: `wc:dispatch:${tenantId}:${row.wcOrderId}`,
      payload: { externalOrderId: row.wcOrderId },
    })
    void this.syncEngine.processJobById(job.id).catch(() => undefined)
  }

  async list(
    tenantId: number,
    filter: WooCommerceOrdenListFilter,
    take: number,
    skip: number,
  ): Promise<{ total: number; ordenes: WooCommerceOrdenRow[] }> {
    const where =
      filter === 'pendiente'
        ? {
            tenantId,
            status: { notIn: ['cancelled', 'refunded', 'failed'] },
            pedido: { estado: { in: ['confirmed', 'draft'] } },
          }
        : filter === 'facturada'
          ? { tenantId, pedido: { estado: 'invoiced' } }
          : filter === 'cancelada'
            ? {
                tenantId,
                OR: [
                  { status: { in: ['cancelled', 'refunded', 'failed'] } },
                  { pedido: { estado: 'cancelled' } },
                ],
              }
            : { tenantId }

    const [total, rows] = await Promise.all([
      this.prisma.wooCommerceOrden.count({ where }),
      this.prisma.wooCommerceOrden.findMany({
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
        wcOrderId: r.wcOrderId,
        status: r.status,
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
    wcOrderId: string,
    invoiceInput: PedidoInvoiceInput,
    userId: number,
  ): Promise<ServiceResult<{ pedidoId: number; facturaId: number }>> {
    const row = await this.prisma.wooCommerceOrden.findUnique({
      where: { tenantId_wcOrderId: { tenantId, wcOrderId } },
      include: {
        pedido: {
          include: { cliente: { select: { id: true, cuit: true, condIva: true } } },
        },
      },
    })
    if (!row?.pedido) {
      return { ok: false, status: 404, error: 'WooCommerce order or linked pedido not found' }
    }
    if (isCancelledStatus(row.status) || row.pedido.estado === 'cancelled') {
      return { ok: false, status: 409, error: 'ORDER_CANCELLED' }
    }
    if (row.pedido.estado === 'invoiced') {
      return { ok: false, status: 409, error: 'ALREADY_INVOICED' }
    }

    const tipo = invoiceInput.tipo.toUpperCase()
    if (tipo === 'A' && !row.pedido.cliente.cuit?.trim()) {
      return { ok: false, status: 422, error: 'CUIT_REQUIRED_FOR_FACTURA_A' }
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
      data: { pedidoId: row.pedido.id, facturaId },
    }
  }
}
