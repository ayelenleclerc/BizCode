/**
 * @en Shared ecommerce connector contract for catalog, stock and orders (#189).
 * @es Contrato compartido de conectores eCommerce para catálogo, stock y órdenes (#189).
 * @pt-BR Contrato compartilhado de conectores eCommerce para catálogo, estoque e pedidos (#189).
 */

export type EcommerceConnectorType = 'meli' | 'tiendanube' | 'woocommerce'

export type EcommerceSyncOperation =
  | 'publish_product'
  | 'update_product'
  | 'pause_product'
  | 'update_stock'
  | 'mark_dispatched'

export type ExternalProductId = string

/**
 * @en Neutral catalog snapshot passed to connector publish/update (#189).
 * @es Snapshot neutro de catálogo para publish/update del conector (#189).
 * @pt-BR Snapshot neutro de catálogo para publish/update do conector (#189).
 */
export type ConnectorArticuloSnapshot = {
  articuloId: number
  publicacionId?: number
  title: string
  description?: string
  sku?: string
  price: number
  currencyId: string
  availableQuantity: number
  active: boolean
  categoryId?: string
  pictureUrls?: string[]
  attributes?: Array<{ id: string; value_name?: string; value_id?: string }>
  /** Platform-specific extras (e.g. MeLi permalink bookkeeping). */
  extras?: Record<string, unknown>
}

export type IncomingOrderLine = {
  externalProductId: string
  sku?: string
  title?: string
  quantity: number
  unitPrice?: number
}

export type IncomingOrder = {
  externalOrderId: string
  status: string
  buyerNickname?: string
  buyerEmail?: string
  currencyId?: string
  total?: number
  lines: IncomingOrderLine[]
  raw?: unknown
}

export interface EcommerceConnector {
  readonly type: EcommerceConnectorType

  publishProduct(articulo: ConnectorArticuloSnapshot): Promise<ExternalProductId>
  updateProduct(externalId: string, changes: Partial<ConnectorArticuloSnapshot>): Promise<void>
  pauseProduct(externalId: string): Promise<void>
  updateStock(externalId: string, quantity: number): Promise<void>
  parseIncomingOrder(rawPayload: unknown): IncomingOrder
  markOrderDispatched(externalOrderId: string, trackingCode?: string): Promise<void>
}
