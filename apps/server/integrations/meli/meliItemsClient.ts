/**
 * @en Mercado Libre items and categories HTTP client (#184).
 * @es Cliente HTTP de ítems y categorías Mercado Libre (#184).
 * @pt-BR Cliente HTTP de itens e categorias Mercado Livre (#184).
 */

import { MeliApiError } from './meliOAuthClient'

const MELI_API_BASE = 'https://api.mercadolibre.com'

export type MeliPictureInput = { source: string }

export type MeliAttributeInput = {
  id: string
  value_name?: string
  value_id?: string
}

export type MeliCreateItemInput = {
  title: string
  category_id: string
  price: number
  currency_id: string
  available_quantity: number
  buying_mode?: string
  listing_type_id?: string
  condition?: string
  pictures: MeliPictureInput[]
  attributes?: MeliAttributeInput[]
}

export type MeliItemResponse = {
  id: string
  title?: string
  price?: number
  currency_id?: string
  status?: string
  permalink?: string
  category_id?: string
  available_quantity?: number
}

export type MeliCategorySearchHit = {
  category_id: string
  category_name: string
  domain_id?: string
  domain_name?: string
}

export type MeliCategoryAttribute = {
  id: string
  name: string
  tags?: {
    required?: boolean
    catalog_required?: boolean
  }
  value_type?: string
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as { message?: string; error?: string }
    if (typeof body.message === 'string' && body.message.trim()) return body.message
    if (typeof body.error === 'string' && body.error.trim()) return body.error
  } catch {
    // ignore parse errors
  }
  return `Mercado Libre API error (${res.status})`
}

async function meliFetch<T>(
  accessToken: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(`${MELI_API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  })
  if (!res.ok) {
    throw new MeliApiError(res.status, await readErrorMessage(res))
  }
  if (res.status === 204) {
    return undefined as T
  }
  return (await res.json()) as T
}

/**
 * @en Creates a Mercado Libre listing (#184).
 * @es Crea una publicación en Mercado Libre (#184).
 * @pt-BR Cria um anúncio no Mercado Livre (#184).
 */
export async function createMeliItem(
  accessToken: string,
  body: MeliCreateItemInput,
): Promise<MeliItemResponse> {
  return meliFetch<MeliItemResponse>(accessToken, '/items', {
    method: 'POST',
    body: JSON.stringify({
      buying_mode: 'buy_it_now',
      listing_type_id: 'gold_special',
      condition: 'new',
      ...body,
    }),
  })
}

/**
 * @en Updates an existing Mercado Libre listing (#184).
 * @es Actualiza una publicación existente en Mercado Libre (#184).
 * @pt-BR Atualiza um anúncio existente no Mercado Livre (#184).
 */
export async function updateMeliItem(
  accessToken: string,
  itemId: string,
  patch: Partial<{
    title: string
    price: number
    status: 'active' | 'paused' | 'closed'
    available_quantity: number
    pictures: MeliPictureInput[]
    attributes: MeliAttributeInput[]
  }>,
): Promise<MeliItemResponse> {
  return meliFetch<MeliItemResponse>(accessToken, `/items/${encodeURIComponent(itemId)}`, {
    method: 'PUT',
    body: JSON.stringify(patch),
  })
}

/**
 * @en Searches Mercado Libre categories by free text (#184).
 * @es Busca categorías de Mercado Libre por texto (#184).
 * @pt-BR Busca categorias do Mercado Livre por texto (#184).
 */
export async function searchMeliCategories(
  accessToken: string,
  siteId: string,
  query: string,
): Promise<MeliCategorySearchHit[]> {
  const q = query.trim()
  if (!q) return []
  const site = siteId.trim() || 'MLA'
  const data = await meliFetch<{
    domain_id?: string
    domain_name?: string
    category_id?: string
    category_name?: string
  } | Array<{
    domain_id?: string
    domain_name?: string
    category_id?: string
    category_name?: string
  }>>(
    accessToken,
    `/sites/${encodeURIComponent(site)}/domain_discovery/search?limit=8&q=${encodeURIComponent(q)}`,
  )
  const rows = Array.isArray(data) ? data : data ? [data] : []
  return rows
    .filter((row) => typeof row.category_id === 'string' && typeof row.category_name === 'string')
    .map((row) => ({
      category_id: row.category_id as string,
      category_name: row.category_name as string,
      domain_id: row.domain_id,
      domain_name: row.domain_name,
    }))
}

/**
 * @en Loads category attribute definitions (#184).
 * @es Carga definiciones de atributos de una categoría (#184).
 * @pt-BR Carrega definições de atributos de uma categoria (#184).
 */
export async function fetchMeliCategoryAttributes(
  accessToken: string,
  categoryId: string,
): Promise<MeliCategoryAttribute[]> {
  return meliFetch<MeliCategoryAttribute[]>(
    accessToken,
    `/categories/${encodeURIComponent(categoryId)}/attributes`,
  )
}
