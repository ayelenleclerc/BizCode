/**
 * @en Mercado Libre adapter for the shared ecommerce sync engine (#189).
 * @es Adapter Mercado Libre para el motor compartido de sync eCommerce (#189).
 * @pt-BR Adapter Mercado Livre para o motor compartilhado de sync eCommerce (#189).
 */

import type { PrismaClient } from '@prisma/client'
import {
  createMeliItem,
  updateMeliItem,
  type MeliOrderResponse,
} from '../meli/meliItemsClient'
import { MeliConfigService } from '../../services/MeliConfigService'
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

/**
 * @en Implements EcommerceConnector over MeLi items HTTP client + MeliPublicacion (#189).
 * @es Implementa EcommerceConnector sobre el cliente HTTP de ítems MeLi + MeliPublicacion (#189).
 * @pt-BR Implementa EcommerceConnector sobre o cliente HTTP de itens MeLi + MeliPublicacion (#189).
 */
export class MeliConnector implements EcommerceConnector {
  readonly type = 'meli' as const
  private readonly meliConfig: MeliConfigService

  constructor(
    private readonly prisma: PrismaClient,
    private readonly tenantId: number,
  ) {
    this.meliConfig = new MeliConfigService(prisma)
  }

  async publishProduct(articulo: ConnectorArticuloSnapshot): Promise<ExternalProductId> {
    const tokens = await this.meliConfig.getDecryptedTokens(this.tenantId)
    if (!tokens.ok) throw new Error(tokens.error)

    const pictures = (articulo.pictureUrls ?? []).map((source) => ({ source }))
    if (pictures.length === 0) {
      throw new Error('Mercado Libre requires at least one product photo before publishing')
    }

    const qty = Math.max(1, Math.floor(articulo.availableQuantity || 1))
    const item = await createMeliItem(tokens.data.accessToken, {
      title: articulo.title.slice(0, 60),
      category_id: articulo.categoryId ?? '',
      price: articulo.price,
      currency_id: articulo.currencyId,
      available_quantity: qty,
      pictures,
      attributes: articulo.attributes?.length ? articulo.attributes : undefined,
    })

    if (articulo.publicacionId != null) {
      await this.prisma.meliPublicacion.update({
        where: { id: articulo.publicacionId },
        data: {
          meliItemId: item.id,
          estado: item.status ?? 'active',
          permalink: item.permalink ?? null,
          syncStatus: 'synced',
          syncError: null,
          ultimaSyncAt: new Date(),
        },
      })
    }

    return item.id
  }

  async updateProduct(
    externalId: string,
    changes: Partial<ConnectorArticuloSnapshot>,
  ): Promise<void> {
    const tokens = await this.meliConfig.getDecryptedTokens(this.tenantId)
    if (!tokens.ok) throw new Error(tokens.error)

    const qty =
      changes.availableQuantity != null
        ? Math.max(0, Math.floor(changes.availableQuantity))
        : undefined
    const status =
      changes.active === false || (qty != null && qty <= 0)
        ? 'paused'
        : changes.active === true
          ? 'active'
          : undefined

    const pictures = changes.pictureUrls?.map((source) => ({ source }))
    const item = await updateMeliItem(tokens.data.accessToken, externalId, {
      ...(changes.title != null ? { title: changes.title.slice(0, 60) } : {}),
      ...(changes.price != null ? { price: changes.price } : {}),
      ...(qty != null ? { available_quantity: qty } : {}),
      ...(status != null ? { status } : {}),
      ...(pictures != null ? { pictures } : {}),
      ...(changes.attributes?.length ? { attributes: changes.attributes } : {}),
    })

    if (changes.publicacionId != null) {
      await this.prisma.meliPublicacion.update({
        where: { id: changes.publicacionId },
        data: {
          estado: item.status ?? status ?? undefined,
          permalink: item.permalink ?? undefined,
          syncStatus: 'synced',
          syncError: null,
          ultimaSyncAt: new Date(),
        },
      })
    }
  }

  async pauseProduct(externalId: string): Promise<void> {
    const tokens = await this.meliConfig.getDecryptedTokens(this.tenantId)
    if (!tokens.ok) throw new Error(tokens.error)
    await updateMeliItem(tokens.data.accessToken, externalId, { status: 'paused' })
  }

  async updateStock(externalId: string, quantity: number): Promise<void> {
    const tokens = await this.meliConfig.getDecryptedTokens(this.tenantId)
    if (!tokens.ok) throw new Error(tokens.error)

    const qty = Math.max(0, Math.floor(quantity))
    const status = qty <= 0 ? 'paused' : 'active'
    const item = await updateMeliItem(tokens.data.accessToken, externalId, {
      available_quantity: qty,
      status,
    })

    const pub = await this.prisma.meliPublicacion.findFirst({
      where: { tenantId: this.tenantId, meliItemId: externalId },
      select: { id: true },
    })
    if (pub) {
      await this.prisma.meliPublicacion.update({
        where: { id: pub.id },
        data: {
          estado: item.status ?? status,
          syncStatus: 'synced',
          syncError: null,
          ultimaSyncAt: new Date(),
        },
      })
    }
  }

  parseIncomingOrder(rawPayload: unknown): IncomingOrder {
    const raw = asRecord(rawPayload) as Partial<MeliOrderResponse> & Record<string, unknown>
    const id = raw.id != null ? String(raw.id) : ''
    if (!id) throw new Error('MeLi order payload missing id')
    const orderItems = Array.isArray(raw.order_items) ? raw.order_items : []
    return {
      externalOrderId: id,
      status: typeof raw.status === 'string' ? raw.status : 'unknown',
      buyerNickname:
        raw.buyer && typeof raw.buyer === 'object' && !Array.isArray(raw.buyer)
          ? (raw.buyer as { nickname?: string }).nickname
          : undefined,
      buyerEmail:
        raw.buyer && typeof raw.buyer === 'object' && !Array.isArray(raw.buyer)
          ? (raw.buyer as { email?: string }).email
          : undefined,
      currencyId: typeof raw.currency_id === 'string' ? raw.currency_id : undefined,
      total: typeof raw.total_amount === 'number' ? raw.total_amount : undefined,
      lines: orderItems.map((line) => ({
        externalProductId: String(line.item?.id ?? ''),
        title: line.item?.title,
        quantity: Number(line.quantity ?? 0),
        unitPrice: line.unit_price,
      })),
      raw: rawPayload,
    }
  }

  /**
   * @en Not wired to MeLi shipments API in this codebase; rejects to avoid inventing endpoints (#189).
   * @es No hay API de envíos MeLi en este codebase; rechaza para no inventar endpoints (#189).
   * @pt-BR Sem API de envios MeLi neste codebase; rejeita para não inventar endpoints (#189).
   */
  async markOrderDispatched(_externalOrderId: string, _trackingCode?: string): Promise<void> {
    throw new Error(
      'Mercado Libre markOrderDispatched is not implemented in BizCode (no shipments client evidenced)',
    )
  }
}

/**
 * @en Factory that builds a MeLi connector bound to a tenant (#189).
 * @es Factory que construye un conector MeLi ligado a un tenant (#189).
 * @pt-BR Factory que constrói um conector MeLi ligado a um tenant (#189).
 */
export function createMeliConnector(prisma: PrismaClient, tenantId: number): MeliConnector {
  return new MeliConnector(prisma, tenantId)
}
