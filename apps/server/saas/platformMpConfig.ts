/**
 * @en Platform Mercado Pago credentials for BizCode SaaS billing (#182). Not tenant MP config.
 * @es Credenciales Mercado Pago de plataforma para billing SaaS (#182). No es config MP del tenant.
 * @pt-BR Credenciais Mercado Pago da plataforma para billing SaaS (#182). Não é config MP do tenant.
 */

export const BIZCODE_SAAS_MP_ACCESS_TOKEN_ENV = 'BIZCODE_SAAS_MP_ACCESS_TOKEN'
export const BIZCODE_SAAS_MP_WEBHOOK_SECRET_ENV = 'BIZCODE_SAAS_MP_WEBHOOK_SECRET'
export const BIZCODE_SAAS_MP_BACK_URL_ENV = 'BIZCODE_SAAS_MP_BACK_URL'

export function getPlatformMpAccessToken(): string | null {
  const raw = process.env[BIZCODE_SAAS_MP_ACCESS_TOKEN_ENV]?.trim()
  return raw ? raw : null
}

export function isPlatformMpConfigured(): boolean {
  return getPlatformMpAccessToken() !== null
}

export function getPlatformMpWebhookSecret(): string | null {
  const raw = process.env[BIZCODE_SAAS_MP_WEBHOOK_SECRET_ENV]?.trim()
  return raw ? raw : null
}

export function getPlatformMpBackUrl(): string {
  const raw = process.env[BIZCODE_SAAS_MP_BACK_URL_ENV]?.trim()
  return raw && raw.length > 0 ? raw : 'https://localhost:5173/configuracion/billing'
}
