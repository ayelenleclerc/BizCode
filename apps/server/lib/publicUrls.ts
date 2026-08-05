import { resolvePortalPublicBaseUrl } from '../portal/portalTokens'

/**
 * @en Public API base URL for webhooks and external callbacks (#175).
 * @es URL pública del API para webhooks y callbacks externos (#175).
 * @pt-BR URL pública da API para webhooks e callbacks externos (#175).
 */
export function resolveApiPublicBaseUrl(): string {
  const fromEnv = process.env.API_PUBLIC_URL?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '')
  }
  return 'http://localhost:3001'
}

/**
 * @en Mercado Pago checkout return URLs scoped to the tenant portal (#175).
 * @es URLs de retorno del checkout Mercado Pago en el portal del tenant (#175).
 * @pt-BR URLs de retorno do checkout Mercado Pago no portal do tenant (#175).
 */
export function resolveMercadoPagoBackUrls(tenantSlug: string): {
  success: string
  failure: string
  pending: string
} {
  const base = resolvePortalPublicBaseUrl()
  const facturasPath = `${base}/portal/${encodeURIComponent(tenantSlug)}/facturas`
  return {
    success: facturasPath,
    failure: facturasPath,
    pending: facturasPath,
  }
}

/**
 * @en Webhook URL registered on Mercado Pago preferences (#175, handler in #176).
 * @es URL de webhook registrada en preferences de Mercado Pago (#175, handler en #176).
 * @pt-BR URL de webhook registrada em preferences do Mercado Pago (#175, handler em #176).
 */
export function resolveMercadoPagoNotificationUrl(): string {
  return `${resolveApiPublicBaseUrl()}/api/webhooks/mercadopago`
}

/**
 * @en Mercado Libre notifications webhook URL (#185).
 * @es URL del webhook de notificaciones Mercado Libre (#185).
 * @pt-BR URL do webhook de notificações Mercado Livre (#185).
 */
export function resolveMeliNotificationUrl(): string {
  return `${resolveApiPublicBaseUrl()}/api/webhooks/meli`
}

/**
 * @en Mercado Libre OAuth redirect URI (#183).
 * @es URI de redirección OAuth Mercado Libre (#183).
 * @pt-BR URI de redirecionamento OAuth Mercado Livre (#183).
 */
export function resolveMeliOAuthRedirectUri(): string {
  const fromEnv = process.env.MELI_REDIRECT_URI?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '')
  }
  return `${resolveApiPublicBaseUrl()}/api/oauth/meli/callback`
}

/**
 * @en Tiendanube notifications webhook URL (#187).
 * @es URL del webhook de notificaciones Tiendanube (#187).
 * @pt-BR URL do webhook de notificações Tiendanube (#187).
 */
export function resolveTiendanubeNotificationUrl(): string {
  return `${resolveApiPublicBaseUrl()}/api/webhooks/tiendanube`
}

/**
 * @en Tiendanube OAuth redirect URI (#187).
 * @es URI de redirección OAuth Tiendanube (#187).
 * @pt-BR URI de redirecionamento OAuth Tiendanube (#187).
 */
export function resolveTiendanubeOAuthRedirectUri(): string {
  const fromEnv = process.env.TIENDANUBE_REDIRECT_URI?.trim()
  if (fromEnv) {
    return fromEnv.replace(/\/$/, '')
  }
  return `${resolveApiPublicBaseUrl()}/api/oauth/tiendanube/callback`
}
