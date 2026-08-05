/**
 * @en Tiendanube products/orders HTTP client (#187).
 * @es Cliente HTTP de productos/órdenes Tiendanube (#187).
 * @pt-BR Cliente HTTP de produtos/pedidos Tiendanube (#187).
 */

import { TiendanubeApiError, tiendanubeFetch } from './tiendanubeOAuthClient'

export type TiendanubeLocalizedString = Record<string, string>

export type TiendanubeVariantInput = {
  price: string | number
  stock?: number | string
  sku?: string | null
  stock_management?: boolean
}

export type TiendanubeProductCreateInput = {
  name: TiendanubeLocalizedString
  description?: TiendanubeLocalizedString
  published?: boolean
  images?: Array<{ src: string }>
  variants: TiendanubeVariantInput[]
}

export type TiendanubeProductResponse = {
  id: number | string
  published?: boolean
  visibility?: string
  canonical_url?: string
  variants?: Array<{
    id: number | string
    stock?: number | string | null
    price?: string | number
    sku?: string | null
  }>
}

export type TiendanubeOrderProduct = {
  product_id?: number | string
  variant_id?: number | string
  name?: string
  quantity?: number | string
  price?: string | number
}

export type TiendanubeOrderResponse = {
  id: number | string
  payment_status?: string
  shipping_status?: string
  status?: string
  contact_name?: string | null
  contact_email?: string | null
  contact_identification?: string | null
  customer?: { name?: string; email?: string; identification?: string } | null
  currency?: string
  total?: string | number
  products?: TiendanubeOrderProduct[]
}

async function readJsonOrThrow<T>(res: Response, action: string): Promise<T> {
  if (!res.ok) {
    let detail = ''
    try {
      const body = (await res.json()) as { description?: string; message?: string }
      detail = body.description ?? body.message ?? ''
    } catch {
      // ignore
    }
    throw new TiendanubeApiError(
      res.status,
      detail
        ? `Tiendanube ${action} failed (${res.status}): ${detail}`
        : `Tiendanube ${action} failed (${res.status})`,
    )
  }
  if (res.status === 204) return {} as T
  return (await res.json()) as T
}

/**
 * @en Creates a product on Tiendanube (#187).
 * @es Crea un producto en Tiendanube (#187).
 * @pt-BR Cria um produto na Tiendanube (#187).
 */
export async function createTiendanubeProduct(
  storeId: string,
  accessToken: string,
  input: TiendanubeProductCreateInput,
): Promise<TiendanubeProductResponse> {
  const res = await tiendanubeFetch(storeId, accessToken, '/products', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return readJsonOrThrow(res, 'create product')
}

/**
 * @en Updates product fields (e.g. published) (#187).
 * @es Actualiza campos del producto (p. ej. published) (#187).
 * @pt-BR Atualiza campos do produto (ex.: published) (#187).
 */
export async function updateTiendanubeProduct(
  storeId: string,
  accessToken: string,
  productId: string,
  patch: Record<string, unknown>,
): Promise<TiendanubeProductResponse> {
  const res = await tiendanubeFetch(
    storeId,
    accessToken,
    `/products/${encodeURIComponent(productId)}`,
    { method: 'PUT', body: JSON.stringify(patch) },
  )
  return readJsonOrThrow(res, 'update product')
}

/**
 * @en Updates a product variant (stock/price) (#187).
 * @es Actualiza una variante de producto (stock/precio) (#187).
 * @pt-BR Atualiza uma variante de produto (estoque/preço) (#187).
 */
export async function updateTiendanubeVariant(
  storeId: string,
  accessToken: string,
  productId: string,
  variantId: string,
  patch: Record<string, unknown>,
): Promise<{ id?: number | string; stock?: number | string | null }> {
  const res = await tiendanubeFetch(
    storeId,
    accessToken,
    `/products/${encodeURIComponent(productId)}/variants/${encodeURIComponent(variantId)}`,
    { method: 'PUT', body: JSON.stringify(patch) },
  )
  return readJsonOrThrow(res, 'update variant')
}

/**
 * @en Fetches a Tiendanube order by id (#187).
 * @es Obtiene una orden Tiendanube por id (#187).
 * @pt-BR Obtém um pedido Tiendanube por id (#187).
 */
export async function getTiendanubeOrder(
  storeId: string,
  accessToken: string,
  orderId: string,
): Promise<TiendanubeOrderResponse> {
  const res = await tiendanubeFetch(
    storeId,
    accessToken,
    `/orders/${encodeURIComponent(orderId)}`,
  )
  return readJsonOrThrow(res, 'get order')
}

/**
 * @en Updates an order (fulfillment / shipping_status) (#187).
 * @es Actualiza una orden (fulfillment / shipping_status) (#187).
 * @pt-BR Atualiza um pedido (fulfillment / shipping_status) (#187).
 */
export async function updateTiendanubeOrder(
  storeId: string,
  accessToken: string,
  orderId: string,
  patch: Record<string, unknown>,
): Promise<TiendanubeOrderResponse> {
  const res = await tiendanubeFetch(
    storeId,
    accessToken,
    `/orders/${encodeURIComponent(orderId)}`,
    { method: 'PUT', body: JSON.stringify(patch) },
  )
  return readJsonOrThrow(res, 'update order')
}

/**
 * @en Registers order/paid webhook when API_PUBLIC_URL is reachable (#187).
 * @es Registra webhook order/paid cuando API_PUBLIC_URL es alcanzable (#187).
 * @pt-BR Registra webhook order/paid quando API_PUBLIC_URL é alcançável (#187).
 */
export async function ensureTiendanubeOrderPaidWebhook(
  storeId: string,
  accessToken: string,
  url: string,
): Promise<void> {
  const res = await tiendanubeFetch(storeId, accessToken, '/webhooks', {
    method: 'POST',
    body: JSON.stringify({ event: 'order/paid', url }),
  })
  // 422 if already exists or invalid URL (localhost) — non-fatal
  if (!res.ok && res.status !== 422 && res.status !== 409) {
    await readJsonOrThrow(res, 'create webhook')
  }
}
