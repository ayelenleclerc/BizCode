/**
 * @en Tiendanube / Nuvemshop OAuth HTTP client (#187).
 * @es Cliente HTTP OAuth Tiendanube / Nuvemshop (#187).
 * @pt-BR Cliente HTTP OAuth Tiendanube / Nuvemshop (#187).
 */

import { resolveTiendanubeOAuthRedirectUri } from '../../lib/publicUrls'

const TN_TOKEN_URL = 'https://www.tiendanube.com/apps/authorize/token'
const TN_API_BASE = 'https://api.tiendanube.com/v1'

export type TiendanubeTokenResponse = {
  access_token: string
  token_type: string
  scope?: string
  user_id: number | string
}

export type TiendanubeStore = {
  id?: number | string
  name?: string
  original_domain?: string
  url_with_protocol?: string
}

export class TiendanubeApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'TiendanubeApiError'
  }
}

export type TiendanubeAppCredentials = {
  clientId: string
  clientSecret: string
  redirectUri: string
}

/**
 * @en Reads platform Tiendanube app credentials from env (#187).
 * @es Lee credenciales de la app Tiendanube de plataforma desde env (#187).
 * @pt-BR Lê credenciais do app Tiendanube da plataforma a partir do env (#187).
 */
export function resolveTiendanubeAppCredentials(): TiendanubeAppCredentials {
  const clientId = process.env.TIENDANUBE_CLIENT_ID?.trim()
  const clientSecret = process.env.TIENDANUBE_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) {
    throw new TiendanubeApiError(503, 'Tiendanube app credentials are not configured')
  }
  return {
    clientId,
    clientSecret,
    redirectUri: resolveTiendanubeOAuthRedirectUri(),
  }
}

/**
 * @en User-Agent required by Tiendanube API (#187).
 * @es User-Agent exigido por la API Tiendanube (#187).
 * @pt-BR User-Agent exigido pela API Tiendanube (#187).
 */
export function resolveTiendanubeUserAgent(): string {
  const fromEnv = process.env.TIENDANUBE_USER_AGENT?.trim()
  if (fromEnv) return fromEnv
  return 'BizCode (https://github.com/ayelenleclerc/BizCode)'
}

/**
 * @en Builds the Tiendanube Partner Portal authorize URL (#187).
 * @es Construye la URL de autorización Partner Portal Tiendanube (#187).
 * @pt-BR Monta a URL de autorização do Partner Portal Tiendanube (#187).
 */
export function buildTiendanubeAuthorizeUrl(clientId: string, state: string): string {
  const url = new URL(`https://www.tiendanube.com/apps/${encodeURIComponent(clientId)}/authorize`)
  url.searchParams.set('state', state)
  return url.toString()
}

async function parseTokenResponse(res: Response): Promise<TiendanubeTokenResponse> {
  if (!res.ok) {
    throw new TiendanubeApiError(
      res.status,
      res.status === 401 || res.status === 403
        ? 'Invalid Tiendanube OAuth credentials'
        : `Tiendanube OAuth error (${res.status})`,
    )
  }
  const body = (await res.json()) as Partial<TiendanubeTokenResponse>
  if (!body.access_token || body.user_id == null) {
    throw new TiendanubeApiError(502, 'Tiendanube OAuth response missing required token fields')
  }
  return body as TiendanubeTokenResponse
}

/**
 * @en Exchanges an authorization code for a long-lived access token (#187).
 * @es Intercambia un code de autorización por un access token de larga duración (#187).
 * @pt-BR Troca um code de autorização por um access token de longa duração (#187).
 */
export async function exchangeTiendanubeAuthorizationCode(
  credentials: TiendanubeAppCredentials,
  code: string,
): Promise<TiendanubeTokenResponse> {
  const res = await fetch(TN_TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'User-Agent': resolveTiendanubeUserAgent(),
    },
    body: JSON.stringify({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      grant_type: 'authorization_code',
      code,
    }),
  })
  return parseTokenResponse(res)
}

export function tiendanubeApiUrl(storeId: string, path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${TN_API_BASE}/${encodeURIComponent(storeId)}${normalized}`
}

export async function tiendanubeFetch(
  storeId: string,
  accessToken: string,
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const headers = new Headers(init?.headers)
  headers.set('Authorization', `bearer ${accessToken}`)
  headers.set('Content-Type', headers.get('Content-Type') ?? 'application/json')
  headers.set('Accept', 'application/json')
  headers.set('User-Agent', resolveTiendanubeUserAgent())
  return fetch(tiendanubeApiUrl(storeId, path), { ...init, headers })
}

/**
 * @en Fetches store profile for name/url enrichment (#187).
 * @es Obtiene el perfil de la tienda para enriquecer nombre/url (#187).
 * @pt-BR Obtém o perfil da loja para enriquecer nome/url (#187).
 */
export async function fetchTiendanubeStore(
  storeId: string,
  accessToken: string,
): Promise<TiendanubeStore> {
  const res = await tiendanubeFetch(storeId, accessToken, '/store')
  if (!res.ok) {
    throw new TiendanubeApiError(
      res.status,
      res.status === 401 || res.status === 403
        ? 'Invalid Tiendanube access token'
        : `Tiendanube API error (${res.status})`,
    )
  }
  return (await res.json()) as TiendanubeStore
}
