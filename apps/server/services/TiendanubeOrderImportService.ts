/**
 * @en Imports Tiendanube paid orders as Pedidos (#187).
 * @es Importa órdenes pagadas de Tiendanube como Pedidos (#187).
 * @pt-BR Importa pedidos pagos da Tiendanube como Pedidos (#187).
 */

import type { PedidoInvoiceInput } from '@bizcode/types'
import type { PrismaClient } from '@prisma/client'
import {
  getTiendanubeOrder,
  type TiendanubeOrderResponse,
} from '../integrations/tiendanube/tiendanubeApiClient'
import { sanitizeLogField } from '../lib/sanitizeLogField'
import { resolveSystemUserId } from '../lib/systemUserId'
import { notifyManagers } from '../notifications'
import { bootstrapEcommerceConnectors } from '../integrations/ecommerce/bootstrapEcommerceConnectors'
import { TiendanubeConfigService } from './TiendanubeConfigService'
import { TiendanubeStockSyncService } from './TiendanubeStockSyncService'
import { PedidoService } from './PedidoService'
import type { ServiceResult } from './serviceResults'
import { StockAjusteService } from './StockAjusteService'
import { EcommerceSyncEngine } from './EcommerceSyncEngine'

export type TiendanubeOrdenListFilter = 'pendiente' | 'facturada' | 'cancelada' | 'all'

export type TiendanubeOrdenRow = {
  id: number
  tnOrderId: string
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

function isPaidStatus(status: string): boolean {
  return status.toLowerCase() === 'paid'
}

function isCancelledStatus(status: string): boolean {
  const s = status.toLowerCase()
  return s === 'cancelled' || s === 'canceled' || s === 'voided'
}

function buyerDisplayName(order: TiendanubeOrderResponse): string {
  const name = order.contact_name?.trim() || order.customer?.name?.trim()
  if (name) return name.slice(0, 30)
  return 'Comprador Tiendanube'
}

function buyerEmail(order: TiendanubeOrderResponse): string | null {
  const email = (order.contact_email ?? order.customer?.email)?.trim().toLowerCase()
  if (!email || !email.includes('@')) return null
  return email.slice(0, 50)
}

export class TiendanubeOrderImportService {
  private readonly tnConfig: TiendanubeConfigService
  private readonly stockAjuste: StockAjusteService
  private readonly stockSync: TiendanubeStockSyncService
  private readonly pedidos: PedidoService
  private readonly syncEngine: EcommerceSyncEngine

  constructor(private readonly prisma: PrismaClient) {
    bootstrapEcommerceConnectors()
    this.tnConfig = new TiendanubeConfigService(prisma)
    this.stockAjuste = new StockAjusteService(prisma)
    this.stockSync = new TiendanubeStockSyncService(prisma)
    this.pedidos = new PedidoService(prisma)
    this.syncEngine = new EcommerceSyncEngine(prisma)
  }

  async processOrderNotification(tenantId: number, orderId: string): Promise<void> {
    const tokens = await this.tnConfig.getDecryptedToken(tenantId)
    if (!tokens.ok) {
      console.warn('[tiendanube-order-import] no_tokens', 'tenant', tenantId)
      return
    }

    let order: TiendanubeOrderResponse
    try {
      order = await getTiendanubeOrder(tokens.data.storeId, tokens.data.accessToken, orderId)
    } catch (err: unknown) {
      console.warn(
        '[tiendanube-order-import] order_fetch_error',
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
    tnOrderId: string,
    order: TiendanubeOrderResponse,
  ): Promise<void> {
    const status = (order.payment_status ?? order.status ?? 'unknown').slice(0, 40)
    const buyerNickname = buyerDisplayName(order).slice(0, 120)

    const existing = await this.prisma.tiendanubeOrden.findUnique({
      where: { tenantId_tnOrderId: { tenantId, tnOrderId } },
    })

    const row = existing
      ? await this.prisma.tiendanubeOrden.update({
          where: { id: existing.id },
          data: { status, buyerNickname, lastSyncedAt: new Date() },
        })
      : await this.prisma.tiendanubeOrden.create({
          data: {
            tenantId,
            tnOrderId,
            status,
            buyerNickname,
            lastSyncedAt: new Date(),
          },
        })

    if (isPaidStatus(status)) {
      await this.handlePaid(tenantId, row.id, tnOrderId, order)
      return
    }
    if (isCancelledStatus(status)) {
      await this.handleCancelled(tenantId, row.id)
    }
  }

  private async handlePaid(
    tenantId: number,
    tnOrdenId: number,
    tnOrderId: string,
    order: TiendanubeOrderResponse,
  ): Promise<void> {
    const row = await this.prisma.tiendanubeOrden.findUniqueOrThrow({ where: { id: tnOrdenId } })
    const systemUserId = resolveSystemUserId()

    if (!row.stockAppliedAt) {
      await this.applyStockOnce(tenantId, order, systemUserId)
      await this.prisma.tiendanubeOrden.update({
        where: { id: tnOrdenId },
        data: { stockAppliedAt: new Date() },
      })
    }

    if (row.pedidoId != null) return

    const created = await this.createPedidoFromOrder(tenantId, order)
    if (!created.ok) {
      console.warn(
        '[tiendanube-order-import] pedido_create_failed',
        'tenant',
        tenantId,
        'order',
        sanitizeLogField(tnOrderId),
        'error',
        sanitizeLogField(created.error),
      )
      return
    }

    await this.prisma.tiendanubeOrden.update({
      where: { id: tnOrdenId },
      data: {
        pedidoId: created.data.pedidoId,
        cuitPending: created.data.cuitPending,
      },
    })

    await notifyManagers(this.prisma, tenantId, 'tiendanube_order_imported', {
      resource: tnOrderId,
      pedidoId: created.data.pedidoId,
      detail: `Nueva venta en Tiendanube: orden ${tnOrderId}`,
      rsocial: created.data.clienteRsocial,
      amount: String(created.data.total),
    })

    if (created.data.cuitPending) {
      await notifyManagers(this.prisma, tenantId, 'tiendanube_cuit_required', {
        resource: tnOrderId,
        pedidoId: created.data.pedidoId,
        clienteId: created.data.clienteId,
        detail: `Completar CUIT del cliente antes de facturar A (orden TN ${tnOrderId})`,
      })
    }
  }

  private async applyStockOnce(
    tenantId: number,
    order: TiendanubeOrderResponse,
    systemUserId: number,
  ): Promise<void> {
    for (const line of order.products ?? []) {
      const productId = line.product_id != null ? String(line.product_id) : ''
      const qty = Number(line.quantity)
      if (!productId || !Number.isFinite(qty) || qty <= 0) continue

      const pub = await this.prisma.tiendanubePublicacion.findFirst({
        where: { tenantId, tnProductId: productId },
        select: { articuloId: true },
      })
      if (!pub) continue

      const result = await this.stockAjuste.adjust(tenantId, pub.articuloId, systemUserId, {
        cantidad: -Math.floor(qty),
        motivo: 'venta_tiendanube',
      })
      if (!result.ok) {
        console.warn(
          '[tiendanube-order-import] stock_adjust_failed',
          'tenant',
          tenantId,
          'articulo',
          pub.articuloId,
          'error',
          sanitizeLogField(result.error),
        )
      } else {
        void this.stockSync.syncStockToTiendanube(tenantId, pub.articuloId).catch(() => undefined)
      }
    }
  }

  private async createPedidoFromOrder(
    tenantId: number,
    order: TiendanubeOrderResponse,
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

    for (const line of order.products ?? []) {
      const productId = line.product_id != null ? String(line.product_id) : ''
      const qty = Math.floor(Number(line.quantity))
      const unitPrice = Number(line.price ?? 0)
      if (!productId || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(unitPrice)) continue

      const pub = await this.prisma.tiendanubePublicacion.findFirst({
        where: { tenantId, tnProductId: productId },
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
        error: 'No linked Tiendanube listings found for order products',
      }
    }

    const total = Math.round(lines.reduce((acc, l) => acc + l.subtotal, 0) * 100) / 100
    const pedido = await this.prisma.pedido.create({
      data: {
        tenantId,
        clienteId: cliente.data.id,
        vendedorId: null,
        estado: 'confirmed',
        origen: 'tiendanube',
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
    order: TiendanubeOrderResponse,
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

  private async handleCancelled(tenantId: number, tnOrdenId: number): Promise<void> {
    const row = await this.prisma.tiendanubeOrden.findUniqueOrThrow({
      where: { id: tnOrdenId },
      include: {
        pedido: { select: { id: true, estado: true, facturaId: true } },
      },
    })

    if (!row.pedidoId || !row.pedido) return

    if (row.pedido.estado === 'invoiced' || row.pedido.facturaId != null) {
      await notifyManagers(this.prisma, tenantId, 'tiendanube_order_cancelled_invoiced', {
        resource: row.tnOrderId,
        pedidoId: row.pedidoId,
        facturaId: row.pedido.facturaId ?? undefined,
        detail: `Orden TN ${row.tnOrderId} cancelada pero el pedido #${row.pedidoId} ya está facturado — revisión manual`,
      })
      return
    }

    if (row.pedido.estado === 'confirmed' || row.pedido.estado === 'draft') {
      const cancelled = await this.pedidos.cancel(tenantId, row.pedidoId)
      if (!cancelled.ok) {
        console.warn(
          '[tiendanube-order-import] pedido_cancel_failed',
          'pedido',
          row.pedidoId,
          sanitizeLogField(cancelled.error),
        )
      }
    }

    if (row.stockAppliedAt) {
      await this.restoreStockFromOrder(tenantId, row.tnOrderId)
      await this.prisma.tiendanubeOrden.update({
        where: { id: tnOrdenId },
        data: { stockAppliedAt: null },
      })
    }
  }

  private async restoreStockFromOrder(tenantId: number, tnOrderId: string): Promise<void> {
    const tokens = await this.tnConfig.getDecryptedToken(tenantId)
    if (!tokens.ok) return
    let order: TiendanubeOrderResponse
    try {
      order = await getTiendanubeOrder(tokens.data.storeId, tokens.data.accessToken, tnOrderId)
    } catch {
      return
    }
    const systemUserId = resolveSystemUserId()
    for (const line of order.products ?? []) {
      const productId = line.product_id != null ? String(line.product_id) : ''
      const qty = Math.floor(Number(line.quantity))
      if (!productId || qty <= 0) continue
      const pub = await this.prisma.tiendanubePublicacion.findFirst({
        where: { tenantId, tnProductId: productId },
        select: { articuloId: true },
      })
      if (!pub) continue
      const result = await this.stockAjuste.adjust(tenantId, pub.articuloId, systemUserId, {
        cantidad: qty,
        motivo: 'cancelacion_tiendanube',
      })
      if (result.ok) {
        void this.stockSync.syncStockToTiendanube(tenantId, pub.articuloId).catch(() => undefined)
      }
    }
  }

  /**
   * @en Enqueues mark_dispatched for a Tiendanube-origin Pedido (#187).
   * @es Encola mark_dispatched para un Pedido con origen Tiendanube (#187).
   * @pt-BR Enfileira mark_dispatched para um Pedido com origem Tiendanube (#187).
   */
  async enqueueMarkDispatched(tenantId: number, pedidoId: number): Promise<void> {
    const row = await this.prisma.tiendanubeOrden.findFirst({
      where: { tenantId, pedidoId },
      select: { tnOrderId: true },
    })
    if (!row) return
    const job = await this.syncEngine.enqueue({
      tenantId,
      connectorType: 'tiendanube',
      operation: 'mark_dispatched',
      idempotencyKey: `tn:dispatch:${tenantId}:${row.tnOrderId}`,
      payload: { externalOrderId: row.tnOrderId },
    })
    void this.syncEngine.processJobById(job.id).catch(() => undefined)
  }

  async list(
    tenantId: number,
    filter: TiendanubeOrdenListFilter,
    take: number,
    skip: number,
  ): Promise<{ total: number; ordenes: TiendanubeOrdenRow[] }> {
    const where =
      filter === 'pendiente'
        ? {
            tenantId,
            status: { notIn: ['cancelled', 'canceled', 'voided'] },
            pedido: { estado: { in: ['confirmed', 'draft'] } },
          }
        : filter === 'facturada'
          ? { tenantId, pedido: { estado: 'invoiced' } }
          : filter === 'cancelada'
            ? {
                tenantId,
                OR: [
                  { status: { in: ['cancelled', 'canceled', 'voided'] } },
                  { pedido: { estado: 'cancelled' } },
                ],
              }
            : { tenantId }

    const [total, rows] = await Promise.all([
      this.prisma.tiendanubeOrden.count({ where }),
      this.prisma.tiendanubeOrden.findMany({
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
        tnOrderId: r.tnOrderId,
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
    tnOrderId: string,
    invoiceInput: PedidoInvoiceInput,
    userId: number,
  ): Promise<ServiceResult<{ pedidoId: number; facturaId: number }>> {
    const row = await this.prisma.tiendanubeOrden.findUnique({
      where: { tenantId_tnOrderId: { tenantId, tnOrderId } },
      include: {
        pedido: {
          include: { cliente: { select: { id: true, cuit: true, condIva: true } } },
        },
      },
    })
    if (!row?.pedido) {
      return { ok: false, status: 404, error: 'Tiendanube order or linked pedido not found' }
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
