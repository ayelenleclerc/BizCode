/**
 * @en WooCommerce REST API v3 HTTP client — Basic Auth with consumer key/secret (#188).
 * @es Cliente HTTP de la REST API v3 de WooCommerce — Basic Auth con consumer key/secret (#188).
 * @pt-BR Cliente HTTP da REST API v3 do WooCommerce — Basic Auth com consumer key/secret (#188).
 *
 * Official docs pattern: `{storeUrl}/wp-json/wc/v3/...`, Basic Auth header
 * `Authorization: Basic base64(consumerKey:consumerSecret)`. No OAuth flow (unlike Tiendanube/MeLi).
 */

export class WooCommerceApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'WooCommerceApiError'
  }
}

export type WooCommerceImage = { src: string }

export type WooCommerceProductCreateInput = {
  name: string
  description?: string
  sku?: string
  regular_price?: string
  status?: 'publish' | 'draft' | 'private'
  manage_stock?: boolean
  stock_quantity?: number
  images?: WooCommerceImage[]
}

export type WooCommerceProductResponse = {
  id: number | string
  name?: string
  sku?: string | null
  status?: string
  permalink?: string
  stock_quantity?: number | string | null
  manage_stock?: boolean
  regular_price?: string
  type?: string
}

export type WooCommerceOrderLineItem = {
  product_id?: number | string
  variation_id?: number | string
  name?: string
  quantity?: number | string
  price?: string | number
  total?: string | number
  sku?: string | null
}

export type WooCommerceBilling = {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
}

export type WooCommerceOrderResponse = {
  id: number | string
  status?: string
  currency?: string
  total?: string | number
  billing?: WooCommerceBilling
  line_items?: WooCommerceOrderLineItem[]
}

/**
 * @en Builds the `{storeUrl}/wp-json/wc/v3{path}` URL (#188).
 * @es Construye la URL `{storeUrl}/wp-json/wc/v3{path}` (#188).
 * @pt-BR Constrói a URL `{storeUrl}/wp-json/wc/v3{path}` (#188).
 */
export function woocommerceApiUrl(storeUrl: string, path: string): string {
  const base = storeUrl.trim().replace(/\/+$/, '')
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}/wp-json/wc/v3${normalized}`
}

function basicAuthHeader(consumerKey: string, consumerSecret: string): string {
  const token = Buffer.from(`${consumerKey}:${consumerSecret}`, 'utf8').toString('base64')
  return `Basic ${token}`
}

/**
 * @en Issues an authenticated fetch against a tenant's WooCommerce REST API (#188).
 * @es Realiza un fetch autenticado contra la REST API WooCommerce del tenant (#188).
 * @pt-BR Realiza um fetch autenticado contra a REST API WooCommerce do tenant (#188).
 */
export async function woocommerceFetch(
  storeUrl: string,
  consumerKey: string,
  consumerSecret: string,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers)
  headers.set('Authorization', basicAuthHeader(consumerKey, consumerSecret))
  headers.set('Content-Type', headers.get('Content-Type') ?? 'application/json')
  headers.set('Accept', 'application/json')
  return fetch(woocommerceApiUrl(storeUrl, path), { ...init, headers })
}

async function readJsonOrThrow<T>(res: Response, action: string): Promise<T> {
  if (!res.ok) {
    let detail = ''
    try {
      const body = (await res.json()) as { message?: string }
      detail = body.message ?? ''
    } catch {
      // ignore
    }
    throw new WooCommerceApiError(
      res.status,
      detail
        ? `WooCommerce ${action} failed (${res.status}): ${detail}`
        : `WooCommerce ${action} failed (${res.status})`,
    )
  }
  if (res.status === 204) return {} as T
  return (await res.json()) as T
}

/**
 * @en Verifies credentials with a lightweight `GET /products?per_page=1` call (#188).
 * @es Verifica credenciales con una llamada liviana `GET /products?per_page=1` (#188).
 * @pt-BR Verifica credenciais com uma chamada leve `GET /products?per_page=1` (#188).
 */
export async function verifyWooCommerceConnection(
  storeUrl: string,
  consumerKey: string,
  consumerSecret: string,
): Promise<void> {
  const res = await woocommerceFetch(
    storeUrl,
    consumerKey,
    consumerSecret,
    '/products?per_page=1',
  )
  if (!res.ok) {
    throw new WooCommerceApiError(
      res.status,
      res.status === 401 || res.status === 403
        ? 'Invalid WooCommerce consumer key/secret'
        : `WooCommerce API error (${res.status})`,
    )
  }
}

/**
 * @en Creates a product on WooCommerce (#188).
 * @es Crea un producto en WooCommerce (#188).
 * @pt-BR Cria um produto no WooCommerce (#188).
 */
export async function createWooCommerceProduct(
  storeUrl: string,
  consumerKey: string,
  consumerSecret: string,
  input: WooCommerceProductCreateInput,
): Promise<WooCommerceProductResponse> {
  const res = await woocommerceFetch(storeUrl, consumerKey, consumerSecret, '/products', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return readJsonOrThrow(res, 'create product')
}

/**
 * @en Updates product fields, including `stock_quantity` for simple products (#188).
 * @es Actualiza campos del producto, incluido `stock_quantity` para productos simples (#188).
 * @pt-BR Atualiza campos do produto, incluindo `stock_quantity` para produtos simples (#188).
 */
export async function updateWooCommerceProduct(
  storeUrl: string,
  consumerKey: string,
  consumerSecret: string,
  productId: string,
  patch: Record<string, unknown>,
): Promise<WooCommerceProductResponse> {
  const res = await woocommerceFetch(
    storeUrl,
    consumerKey,
    consumerSecret,
    `/products/${encodeURIComponent(productId)}`,
    { method: 'PUT', body: JSON.stringify(patch) },
  )
  return readJsonOrThrow(res, 'update product')
}

/**
 * @en Fetches a WooCommerce order by id (#188).
 * @es Obtiene una orden WooCommerce por id (#188).
 * @pt-BR Obtém um pedido WooCommerce por id (#188).
 */
export async function getWooCommerceOrder(
  storeUrl: string,
  consumerKey: string,
  consumerSecret: string,
  orderId: string,
): Promise<WooCommerceOrderResponse> {
  const res = await woocommerceFetch(
    storeUrl,
    consumerKey,
    consumerSecret,
    `/orders/${encodeURIComponent(orderId)}`,
  )
  return readJsonOrThrow(res, 'get order')
}

/**
 * @en Updates an order (e.g. `status: 'completed'` on dispatch) (#188).
 * @es Actualiza una orden (p. ej. `status: 'completed'` al despachar) (#188).
 * @pt-BR Atualiza um pedido (ex.: `status: 'completed'` ao despachar) (#188).
 */
export async function updateWooCommerceOrder(
  storeUrl: string,
  consumerKey: string,
  consumerSecret: string,
  orderId: string,
  patch: Record<string, unknown>,
): Promise<WooCommerceOrderResponse> {
  const res = await woocommerceFetch(
    storeUrl,
    consumerKey,
    consumerSecret,
    `/orders/${encodeURIComponent(orderId)}`,
    { method: 'PUT', body: JSON.stringify(patch) },
  )
  return readJsonOrThrow(res, 'update order')
}
