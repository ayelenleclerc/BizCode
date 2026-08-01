/**
 * @en Mercado Libre OAuth HTTP client (#183).
 * @es Cliente HTTP OAuth de Mercado Libre (#183).
 * @pt-BR Cliente HTTP OAuth do Mercado Livre (#183).
 */

import { resolveMeliOAuthRedirectUri } from '../../lib/publicUrls'

const MELI_AUTH_BASE = 'https://auth.mercadolibre.com.ar/authorization'
const MELI_TOKEN_URL = 'https://api.mercadolibre.com/oauth/token'
const MELI_USERS_ME_URL = 'https://api.mercadolibre.com/users/me'

export type MeliTokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
  scope?: string
  user_id: number
  refresh_token: string
}

export type MeliUserMe = {
  id?: number
  nickname?: string
  site_id?: string
  email?: string
}

export class MeliApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'MeliApiError'
  }
}

export type MeliAppCredentials = {
  clientId: string
  clientSecret: string
  redirectUri: string
}

/**
 * @en Reads platform Mercado Libre app credentials from env (#183).
 * @es Lee credenciales de la app ML de plataforma desde env (#183).
 * @pt-BR Lê credenciais do app ML da plataforma a partir do env (#183).
 */
export function resolveMeliAppCredentials(): MeliAppCredentials {
  const clientId = process.env.MELI_CLIENT_ID?.trim()
  const clientSecret = process.env.MELI_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) {
    throw new MeliApiError(503, 'Mercado Libre app credentials are not configured')
  }
  const redirectUri = resolveMeliOAuthRedirectUri()
  return { clientId, clientSecret, redirectUri }
}

/**
 * @en Builds the Mercado Libre authorization URL (#183).
 * @es Construye la URL de autorización de Mercado Libre (#183).
 * @pt-BR Monta a URL de autorização do Mercado Livre (#183).
 */
export function buildMeliAuthorizeUrl(clientId: string, redirectUri: string, state: string): string {
  const url = new URL(MELI_AUTH_BASE)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('state', state)
  return url.toString()
}

async function parseTokenResponse(res: Response): Promise<MeliTokenResponse> {
  if (!res.ok) {
    throw new MeliApiError(
      res.status,
      res.status === 401 || res.status === 403
        ? 'Invalid Mercado Libre OAuth credentials'
        : `Mercado Libre OAuth error (${res.status})`,
    )
  }
  const body = (await res.json()) as Partial<MeliTokenResponse>
  if (!body.access_token || !body.refresh_token || body.user_id == null || body.expires_in == null) {
    throw new MeliApiError(502, 'Mercado Libre OAuth response missing required token fields')
  }
  return body as MeliTokenResponse
}

/**
 * @en Exchanges an authorization code for access and refresh tokens (#183).
 * @es Intercambia un code de autorización por access y refresh tokens (#183).
 * @pt-BR Troca um code de autorização por access e refresh tokens (#183).
 */
export async function exchangeMeliAuthorizationCode(
  credentials: MeliAppCredentials,
  code: string,
): Promise<MeliTokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    code,
    redirect_uri: credentials.redirectUri,
  })
  const res = await fetch(MELI_TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })
  return parseTokenResponse(res)
}

/**
 * @en Refreshes a Mercado Libre access token (#183).
 * @es Renueva un access token de Mercado Libre (#183).
 * @pt-BR Renova um access token do Mercado Livre (#183).
 */
export async function refreshMeliAccessToken(
  credentials: MeliAppCredentials,
  refreshToken: string,
): Promise<MeliTokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: credentials.clientId,
    client_secret: credentials.clientSecret,
    refresh_token: refreshToken,
  })
  const res = await fetch(MELI_TOKEN_URL, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  })
  return parseTokenResponse(res)
}

/**
 * @en Fetches the authenticated Mercado Libre user profile (#183).
 * @es Obtiene el perfil del usuario autenticado de Mercado Libre (#183).
 * @pt-BR Obtém o perfil do usuário autenticado do Mercado Livre (#183).
 */
export async function fetchMeliUserMe(accessToken: string): Promise<MeliUserMe> {
  const res = await fetch(MELI_USERS_ME_URL, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })
  if (!res.ok) {
    throw new MeliApiError(
      res.status,
      res.status === 401 || res.status === 403
        ? 'Invalid Mercado Libre access token'
        : `Mercado Libre API error (${res.status})`,
    )
  }
  return (await res.json()) as MeliUserMe
}

/**
 * @en Revokes the BizCode application for the Mercado Libre user (#183).
 * @es Revoca la aplicación BizCode para el usuario de Mercado Libre (#183).
 * @pt-BR Revoga o aplicativo BizCode para o usuário do Mercado Livre (#183).
 */
export async function revokeMeliApplication(
  accessToken: string,
  meliUserId: string,
  clientId: string,
): Promise<void> {
  const url = `https://api.mercadolibre.com/users/${encodeURIComponent(meliUserId)}/applications/${encodeURIComponent(clientId)}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })
  if (!res.ok && res.status !== 404) {
    throw new MeliApiError(res.status, `Mercado Libre revoke failed (${res.status})`)
  }
}
