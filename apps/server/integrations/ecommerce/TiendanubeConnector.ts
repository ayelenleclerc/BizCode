/**
 * @en Tiendanube adapter for the shared ecommerce sync engine (#187).
 * @es Adapter Tiendanube para el motor compartido de sync eCommerce (#187).
 * @pt-BR Adapter Tiendanube para o motor compartilhado de sync eCommerce (#187).
 */

import type { PrismaClient } from '@prisma/client'
import {
  createTiendanubeProduct,
  updateTiendanubeOrder,
  updateTiendanubeProduct,
  updateTiendanubeVariant,
  type TiendanubeOrderResponse,
} from '../tiendanube/tiendanubeApiClient'
import { TiendanubeConfigService } from '../../services/TiendanubeConfigService'
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

function localizedName(title: string): Record<string, string> {
  const t = title.slice(0, 200)
  return { es: t, en: t, pt: t }
}

/**
 * @en Implements EcommerceConnector over Tiendanube products/orders API (#187).
 * @es Implementa EcommerceConnector sobre la API de productos/órdenes Tiendanube (#187).
 * @pt-BR Implementa EcommerceConnector sobre a API de produtos/pedidos Tiendanube (#187).
 */
export class TiendanubeConnector implements EcommerceConnector {
  readonly type = 'tiendanube' as const
  private readonly tnConfig: TiendanubeConfigService

  constructor(
    private readonly prisma: PrismaClient,
    private readonly tenantId: number,
  ) {
    this.tnConfig = new TiendanubeConfigService(prisma)
  }

  async publishProduct(articulo: ConnectorArticuloSnapshot): Promise<ExternalProductId> {
    const tokens = await this.tnConfig.getDecryptedToken(this.tenantId)
    if (!tokens.ok) throw new Error(tokens.error)

    const qty = Math.max(0, Math.floor(articulo.availableQuantity || 0))
    const images = (articulo.pictureUrls ?? []).map((src) => ({ src }))
    const product = await createTiendanubeProduct(tokens.data.storeId, tokens.data.accessToken, {
      name: localizedName(articulo.title),
      description: articulo.description
        ? localizedName(articulo.description)
        : undefined,
      published: articulo.active && qty > 0,
      images: images.length ? images : undefined,
      variants: [
        {
          price: articulo.price,
          stock: qty,
          sku: articulo.sku ?? null,
          stock_management: true,
        },
      ],
    })

    const productId = String(product.id)
    const variantId =
      product.variants?.[0]?.id != null ? String(product.variants[0].id) : null
    const permalink =
      typeof product.canonical_url === 'string' ? product.canonical_url : null

    if (articulo.publicacionId != null) {
      await this.prisma.tiendanubePublicacion.update({
        where: { id: articulo.publicacionId },
        data: {
          tnProductId: productId,
          tnVariantId: variantId,
          estado: product.published === false ? 'paused' : 'active',
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
    const tokens = await this.tnConfig.getDecryptedToken(this.tenantId)
    if (!tokens.ok) throw new Error(tokens.error)

    const pub = await this.prisma.tiendanubePublicacion.findFirst({
      where: {
        tenantId: this.tenantId,
        OR: [
          { tnProductId: externalId },
          ...(changes.publicacionId != null ? [{ id: changes.publicacionId }] : []),
        ],
      },
    })

    const patch: Record<string, unknown> = {}
    if (changes.title != null) patch.name = localizedName(changes.title)
    if (changes.description != null) patch.description = localizedName(changes.description)
    if (changes.pictureUrls != null) {
      patch.images = changes.pictureUrls.map((src) => ({ src }))
    }

    const qty =
      changes.availableQuantity != null
        ? Math.max(0, Math.floor(changes.availableQuantity))
        : undefined
    if (changes.active === false || (qty != null && qty <= 0)) {
      patch.published = false
    } else if (changes.active === true) {
      patch.published = true
    }

    if (Object.keys(patch).length > 0) {
      await updateTiendanubeProduct(
        tokens.data.storeId,
        tokens.data.accessToken,
        externalId,
        patch,
      )
    }

    if (pub?.tnVariantId && (qty != null || changes.price != null || changes.sku != null)) {
      const variantPatch: Record<string, unknown> = {}
      if (qty != null) variantPatch.stock = qty
      if (changes.price != null) variantPatch.price = changes.price
      if (changes.sku != null) variantPatch.sku = changes.sku
      await updateTiendanubeVariant(
        tokens.data.storeId,
        tokens.data.accessToken,
        externalId,
        pub.tnVariantId,
        variantPatch,
      )
    }

    if (pub) {
      await this.prisma.tiendanubePublicacion.update({
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
    const tokens = await this.tnConfig.getDecryptedToken(this.tenantId)
    if (!tokens.ok) throw new Error(tokens.error)
    await updateTiendanubeProduct(tokens.data.storeId, tokens.data.accessToken, externalId, {
      published: false,
    })
  }

  async updateStock(externalId: string, quantity: number): Promise<void> {
    const tokens = await this.tnConfig.getDecryptedToken(this.tenantId)
    if (!tokens.ok) throw new Error(tokens.error)

    const qty = Math.max(0, Math.floor(quantity))
    const pub = await this.prisma.tiendanubePublicacion.findFirst({
      where: { tenantId: this.tenantId, tnProductId: externalId },
    })
    if (!pub?.tnVariantId) {
      throw new Error('Tiendanube publication missing variant id for stock update')
    }

    await updateTiendanubeVariant(
      tokens.data.storeId,
      tokens.data.accessToken,
      externalId,
      pub.tnVariantId,
      { stock: qty },
    )
    if (qty <= 0) {
      await updateTiendanubeProduct(tokens.data.storeId, tokens.data.accessToken, externalId, {
        published: false,
      })
    }

    await this.prisma.tiendanubePublicacion.update({
      where: { id: pub.id },
      data: {
        estado: qty <= 0 ? 'paused' : 'active',
        syncStatus: 'synced',
        syncError: null,
        ultimaSyncAt: new Date(),
      },
    })
  }

  parseIncomingOrder(rawPayload: unknown): IncomingOrder {
    const raw = asRecord(rawPayload) as Partial<TiendanubeOrderResponse> & Record<string, unknown>
    const id = raw.id != null ? String(raw.id) : ''
    if (!id) throw new Error('Tiendanube order payload missing id')
    const products = Array.isArray(raw.products) ? raw.products : []
    return {
      externalOrderId: id,
      status:
        typeof raw.payment_status === 'string'
          ? raw.payment_status
          : typeof raw.status === 'string'
            ? raw.status
            : 'unknown',
      buyerNickname:
        typeof raw.contact_name === 'string'
          ? raw.contact_name
          : raw.customer?.name,
      buyerEmail:
        typeof raw.contact_email === 'string'
          ? raw.contact_email
          : raw.customer?.email,
      currencyId: typeof raw.currency === 'string' ? raw.currency : undefined,
      total: raw.total != null ? Number(raw.total) : undefined,
      lines: products.map((line) => ({
        externalProductId: String(line.product_id ?? ''),
        sku: undefined,
        title: line.name,
        quantity: Number(line.quantity ?? 0),
        unitPrice: line.price != null ? Number(line.price) : undefined,
      })),
      raw: rawPayload,
    }
  }

  async markOrderDispatched(externalOrderId: string, _trackingCode?: string): Promise<void> {
    const tokens = await this.tnConfig.getDecryptedToken(this.tenantId)
    if (!tokens.ok) throw new Error(tokens.error)
    // Official PUT /orders/{id} accepts shipping_status; "shipped" means fulfilled.
    await updateTiendanubeOrder(
      tokens.data.storeId,
      tokens.data.accessToken,
      externalOrderId,
      { shipping_status: 'shipped' },
    )
  }
}

/**
 * @en Factory that builds a Tiendanube connector bound to a tenant (#187).
 * @es Factory que construye un conector Tiendanube ligado a un tenant (#187).
 * @pt-BR Factory que constrói um conector Tiendanube ligado a um tenant (#187).
 */
export function createTiendanubeConnector(
  prisma: PrismaClient,
  tenantId: number,
): EcommerceConnector {
  return new TiendanubeConnector(prisma, tenantId)
}