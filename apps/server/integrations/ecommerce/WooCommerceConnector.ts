/**
 * @en WooCommerce adapter for the shared ecommerce sync engine (#188).
 * @es Adapter WooCommerce para el motor compartido de sync eCommerce (#188).
 * @pt-BR Adapter WooCommerce para o motor compartilhado de sync eCommerce (#188).
 */

import type { PrismaClient } from '@prisma/client'
import {
  createWooCommerceProduct,
  updateWooCommerceOrder,
  updateWooCommerceProduct,
  type WooCommerceOrderResponse,
} from '../woocommerce/woocommerceApiClient'
import { WooCommerceConfigService } from '../../services/WooCommerceConfigService'
import type {
  ConnectorArticuloSnapshot,
  EcommerceConnector,
  ExternalProductId,
  IncomingOrder,
} from './EcommerceConnector'

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function priceString(price: number): string {
  return price.toFixed(2)
}

/**
 * @en Implements EcommerceConnector over the WooCommerce REST v3 products/orders API (#188).
 * @es Implementa EcommerceConnector sobre la API REST v3 de productos/órdenes WooCommerce (#188).
 * @pt-BR Implementa EcommerceConnector sobre a API REST v3 de produtos/pedidos WooCommerce (#188).
 */
export class WooCommerceConnector implements EcommerceConnector {
  readonly type = 'woocommerce' as const
  private readonly wcConfig: WooCommerceConfigService

  constructor(
    private readonly prisma: PrismaClient,
    private readonly tenantId: number,
  ) {
    this.wcConfig = new WooCommerceConfigService(prisma)
  }

  async publishProduct(articulo: ConnectorArticuloSnapshot): Promise<ExternalProductId> {
    const creds = await this.wcConfig.getDecryptedCredentials(this.tenantId)
    if (!creds.ok) throw new Error(creds.error)

    const qty = Math.max(0, Math.floor(articulo.availableQuantity || 0))
    const images = (articulo.pictureUrls ?? []).map((src) => ({ src }))
    const product = await createWooCommerceProduct(
      creds.data.storeUrl,
      creds.data.consumerKey,
      creds.data.consumerSecret,
      {
        name: articulo.title.slice(0, 200),
        description: articulo.description,
        sku: articulo.sku ?? undefined,
        regular_price: priceString(articulo.price),
        manage_stock: true,
        stock_quantity: qty,
        status: articulo.active && qty > 0 ? 'publish' : 'draft',
        images: images.length ? images : undefined,
      },
    )

    const productId = String(product.id)
    const permalink = product.permalink ?? null

    if (articulo.publicacionId != null) {
      await this.prisma.wooCommercePublicacion.update({
        where: { id: articulo.publicacionId },
        data: {
          wcProductId: productId,
          estado: product.status === 'draft' ? 'paused' : 'active',
          permalink,
          syncStatus: 'synced',
          syncError: null,
          ultimaSyncAt: new Date(),
        },
      })
    }

    return productId
  }

  async updateProduct(
    externalId: string,
    changes: Partial<ConnectorArticuloSnapshot>,
  ): Promise<void> {
    const creds = await this.wcConfig.getDecryptedCredentials(this.tenantId)
    if (!creds.ok) throw new Error(creds.error)

    const pub = await this.prisma.wooCommercePublicacion.findFirst({
      where: {
        tenantId: this.tenantId,
        OR: [
          { wcProductId: externalId },
          ...(changes.publicacionId != null ? [{ id: changes.publicacionId }] : []),
        ],
      },
    })

    const patch: Record<string, unknown> = {}
    if (changes.title != null) patch.name = changes.title.slice(0, 200)
    if (changes.description != null) patch.description = changes.description
    if (changes.sku != null) patch.sku = changes.sku
    if (changes.price != null) patch.regular_price = priceString(changes.price)
    if (changes.pictureUrls != null) {
      patch.images = changes.pictureUrls.map((src) => ({ src }))
    }

    const qty =
      changes.availableQuantity != null
        ? Math.max(0, Math.floor(changes.availableQuantity))
        : undefined
    if (qty != null) {
      patch.manage_stock = true
      patch.stock_quantity = qty
    }
    if (changes.active === false || (qty != null && qty <= 0)) {
      patch.status = 'draft'
    } else if (changes.active === true) {
      patch.status = 'publish'
    }

    if (Object.keys(patch).length > 0) {
      await updateWooCommerceProduct(
        creds.data.storeUrl,
        creds.data.consumerKey,
        creds.data.consumerSecret,
        externalId,
        patch,
      )
    }

    if (pub) {
      await this.prisma.wooCommercePublicacion.update({
        where: { id: pub.id },
        data: {
          estado:
            changes.active === false || (qty != null && qty <= 0) ? 'paused' : 'active',
          syncStatus: 'synced',
          syncError: null,
          ultimaSyncAt: new Date(),
        },
      })
    }
  }

  async pauseProduct(externalId: string): Promise<void> {
    const creds = await this.wcConfig.getDecryptedCredentials(this.tenantId)
    if (!creds.ok) throw new Error(creds.error)
    await updateWooCommerceProduct(
      creds.data.storeUrl,
      creds.data.consumerKey,
      creds.data.consumerSecret,
      externalId,
      { status: 'draft' },
    )
  }

  async updateStock(externalId: string, quantity: number): Promise<void> {
    const creds = await this.wcConfig.getDecryptedCredentials(this.tenantId)
    if (!creds.ok) throw new Error(creds.error)

    const qty = Math.max(0, Math.floor(quantity))
    const pub = await this.prisma.wooCommercePublicacion.findFirst({
      where: { tenantId: this.tenantId, wcProductId: externalId },
    })

    await updateWooCommerceProduct(
      creds.data.storeUrl,
      creds.data.consumerKey,
      creds.data.consumerSecret,
      externalId,
      { manage_stock: true, stock_quantity: qty, status: qty <= 0 ? 'draft' : 'publish' },
    )

    if (pub) {
      await this.prisma.wooCommercePublicacion.update({
        where: { id: pub.id },
        data: {
          estado: qty <= 0 ? 'paused' : 'active',
          syncStatus: 'synced',
          syncError: null,
          ultimaSyncAt: new Date(),
        },
      })
    }
  }

  parseIncomingOrder(rawPayload: unknown): IncomingOrder {
    const raw = asRecord(rawPayload) as Partial<WooCommerceOrderResponse> &
      Record<string, unknown>
    const id = raw.id != null ? String(raw.id) : ''
    if (!id) throw new Error('WooCommerce order payload missing id')
    const lines = Array.isArray(raw.line_items) ? raw.line_items : []
    const billing = raw.billing
    const buyerName = [billing?.first_name, billing?.last_name]
      .filter((part): part is string => Boolean(part?.trim()))
      .join(' ')
      .trim()

    return {
      externalOrderId: id,
      status: typeof raw.status === 'string' ? raw.status : 'unknown',
      buyerNickname: buyerName || undefined,
      buyerEmail: billing?.email,
      currencyId: typeof raw.currency === 'string' ? raw.currency : undefined,
      total: raw.total != null ? Number(raw.total) : undefined,
      lines: lines.map((line) => ({
        externalProductId: String(line.product_id ?? ''),
        sku: line.sku ?? undefined,
        title: line.name,
        quantity: Number(line.quantity ?? 0),
        unitPrice: line.price != null ? Number(line.price) : undefined,
      })),
      raw: rawPayload,
    }
  }

  /**
   * @en Marks the WooCommerce order as `completed` (core REST API has no shipment-tracking field).
   * @es Marca la orden WooCommerce como `completed` (la API REST core no tiene campo de tracking).
   * @pt-BR Marca o pedido WooCommerce como `completed` (a API REST core não tem campo de rastreio).
   */
  async markOrderDispatched(externalOrderId: string, _trackingCode?: string): Promise<void> {
    const creds = await this.wcConfig.getDecryptedCredentials(this.tenantId)
    if (!creds.ok) throw new Error(creds.error)
    await updateWooCommerceOrder(
      creds.data.storeUrl,
      creds.data.consumerKey,
      creds.data.consumerSecret,
      externalOrderId,
      { status: 'completed' },
    )
  }
}

/**
 * @en Factory that builds a WooCommerce connector bound to a tenant (#188).
 * @es Factory que construye un conector WooCommerce ligado a un tenant (#188).
 * @pt-BR Factory que constrói um conector WooCommerce ligado a um tenant (#188).
 */
export function createWooCommerceConnector(
  prisma: PrismaClient,
  tenantId: number,
): EcommerceConnector {
  return new WooCommerceConnector(prisma, tenantId)
}
