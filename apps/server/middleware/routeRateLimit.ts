import rateLimit, { type Options, type RateLimitRequestHandler } from 'express-rate-limit'
import type { NextFunction, Request, RequestHandler, Response } from 'express'
import { createRateLimitStore } from '../lib/rateLimitStore'

type AuthClaimsLite = { userId: number; tenantId: number }
type RequestWithAuth = Request & { auth?: { claims: AuthClaimsLite } }

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS
const FIFTEEN_MINUTES_MS = 15 * MINUTE_MS

const API_AUTHENTICATED_DEFAULT = 100
const API_UNAUTH_DEFAULT = 20
const AUTH_DEFAULT = 20
const LOGIN_IP_DEFAULT = 5
const LOGIN_USERNAME_DEFAULT = 10
const REPORTS_DEFAULT = 10
const IMPORT_DEFAULT = 5
const PORTAL_MAGIC_LINK_DEFAULT = 5
const PORTAL_VERIFY_DEFAULT = 30
const SAAS_REGISTER_DEFAULT = 5
const SAAS_BILLING_SUBSCRIBE_DEFAULT = 10
const SAAS_BILLING_WEBHOOK_DEFAULT = 120
const MERCADOPAGO_TEST_DEFAULT = 10
const MERCADOPAGO_PREFERENCE_DEFAULT = 20
const MERCADOPAGO_WEBHOOK_DEFAULT = 120
const MELI_OAUTH_DEFAULT = 10
const MELI_WEBHOOK_DEFAULT = 120
const TIENDANUBE_OAUTH_DEFAULT = 10
const TIENDANUBE_WEBHOOK_DEFAULT = 120
const WOOCOMMERCE_HTTP_DEFAULT = 10
const WOOCOMMERCE_WEBHOOK_DEFAULT = 120
const TWILIO_WHATSAPP_WEBHOOK_DEFAULT = 120

function parsePositiveInt(raw: string | undefined, defaultValue: number): number {
  if (!raw?.trim()) {
    return defaultValue
  }
  const n = Number.parseInt(raw.trim(), 10)
  return Number.isFinite(n) && n >= 1 ? n : defaultValue
}

function skipInTest(): boolean {
  return process.env.NODE_ENV === 'test'
}

function isAuthPath(path: string): boolean {
  return path.startsWith('/api/auth')
}

function isImportPost(req: Request): boolean {
  if (req.method === 'POST' && /^\/api\/[^/]+\/import$/.test(req.path)) return true
  return (
    (req.method === 'POST' || req.method === 'GET') &&
    req.path.startsWith('/api/importaciones/')
  )
}

function isReportOrExportPath(req: Request): boolean {
  if (req.path.startsWith('/api/reportes')) return true
  if (req.path.startsWith('/api/logistica/reporte')) return true
  if (req.path === '/api/logistica/kpis') return true
  if (req.path === '/api/fiscal/retenciones/export') return true
  return false
}

function isGeneralApiPath(req: Request): boolean {
  return (
    req.path.startsWith('/api') &&
    !isAuthPath(req.path) &&
    !isImportPost(req) &&
    !isReportOrExportPath(req)
  )
}

function hasAuth(req: Request): boolean {
  return Boolean((req as RequestWithAuth).auth)
}

function rateLimitHandler(req: Request, res: Response, _next: NextFunction, _optionsUsed: Options): void {
  const resetTime = req.rateLimit?.resetTime
  if (resetTime instanceof Date) {
    const sec = Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000))
    res.setHeader('Retry-After', String(sec))
  }
  res.status(429).json({ success: false, error: 'Too many requests' })
}

function createRouteLimiter(options: {
  windowMs: number
  limit: number
  skipUnless: (req: Request) => boolean
  storePrefix: string
  keyGenerator?: Options['keyGenerator']
}): RateLimitRequestHandler {
  const store = createRateLimitStore(options.storePrefix)
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.limit,
    standardHeaders: true,
    legacyHeaders: false,
    ...(store ? { store } : {}),
    skip: (req) => skipInTest() || !options.skipUnless(req),
    handler: rateLimitHandler,
    ...(options.keyGenerator
      ? {
          keyGenerator: options.keyGenerator,
          validate: { keyGeneratorIpFallback: false },
        }
      : {}),
  })
}

/**
 * @en Per-IP rate limit for the `/api/auth` router (default 20 req/min; `HTTP_RATE_LIMIT_AUTH_PER_MINUTE`).
 * @es Límite por IP para el router `/api/auth` (20 req/min por defecto; `HTTP_RATE_LIMIT_AUTH_PER_MINUTE`).
 * @pt-BR Limite por IP para o router `/api/auth` (20 req/min padrão; `HTTP_RATE_LIMIT_AUTH_PER_MINUTE`).
 */
export const authRouterHttpRateLimiter = createRouteLimiter({
  windowMs: MINUTE_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_AUTH_PER_MINUTE, AUTH_DEFAULT),
  skipUnless: () => true,
  storePrefix: 'auth-router',
})

/**
 * @en Login POST per-IP limit (default 5 / 15 min; `HTTP_RATE_LIMIT_LOGIN_PER_15_MIN`) (#217).
 * @es Límite POST login por IP (5 / 15 min por defecto; `HTTP_RATE_LIMIT_LOGIN_PER_15_MIN`) (#217).
 * @pt-BR Limite POST login por IP (5 / 15 min padrão; `HTTP_RATE_LIMIT_LOGIN_PER_15_MIN`) (#217).
 */
export const loginIpHttpRateLimiter = createRouteLimiter({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_LOGIN_PER_15_MIN, LOGIN_IP_DEFAULT),
  skipUnless: () => true,
  storePrefix: 'login-ip',
})

/**
 * @en Login POST per tenant+username limit (default 10 / hour; `HTTP_RATE_LIMIT_LOGIN_USERNAME_PER_HOUR`) (#217).
 * @es Límite POST login por tenant+username (10 / hora por defecto; `HTTP_RATE_LIMIT_LOGIN_USERNAME_PER_HOUR`) (#217).
 * @pt-BR Limite POST login por tenant+username (10 / hora padrão; `HTTP_RATE_LIMIT_LOGIN_USERNAME_PER_HOUR`) (#217).
 */
export const loginUsernameHttpRateLimiter = createRouteLimiter({
  windowMs: HOUR_MS,
  limit: parsePositiveInt(
    process.env.HTTP_RATE_LIMIT_LOGIN_USERNAME_PER_HOUR,
    LOGIN_USERNAME_DEFAULT,
  ),
  skipUnless: () => true,
  storePrefix: 'login-username',
  keyGenerator: (req) => {
    const body = req.body as { username?: unknown; tenantSlug?: unknown; tenant?: unknown }
    const username = String(body?.username ?? '')
      .trim()
      .toLowerCase()
    const tenant = String(body?.tenantSlug ?? body?.tenant ?? 'default')
      .trim()
      .toLowerCase()
    return `login-user:${tenant}:${username || 'unknown'}`
  },
})

/**
 * @en Per-IP rate limit for portal magic-link requests (default 5 req/15 min; `HTTP_RATE_LIMIT_PORTAL_MAGIC_LINK`).
 * @es Límite por IP para magic link del portal (5 req/15 min por defecto; `HTTP_RATE_LIMIT_PORTAL_MAGIC_LINK`).
 * @pt-BR Limite por IP para magic link do portal (5 req/15 min padrão; `HTTP_RATE_LIMIT_PORTAL_MAGIC_LINK`).
 */
export const portalMagicLinkHttpRateLimiter = createRouteLimiter({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_PORTAL_MAGIC_LINK, PORTAL_MAGIC_LINK_DEFAULT),
  skipUnless: () => true,
  storePrefix: 'portal-magic',
})

/**
 * @en Per-IP rate limit for portal magic-link verify (default 30 req/15 min; `HTTP_RATE_LIMIT_PORTAL_VERIFY`).
 * @es Límite por IP para verificación magic link del portal (30 req/15 min por defecto; `HTTP_RATE_LIMIT_PORTAL_VERIFY`).
 * @pt-BR Limite por IP para verificação magic link do portal (30 req/15 min padrão; `HTTP_RATE_LIMIT_PORTAL_VERIFY`).
 */
export const portalVerifyHttpRateLimiter = createRouteLimiter({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_PORTAL_VERIFY, PORTAL_VERIFY_DEFAULT),
  skipUnless: () => true,
  storePrefix: 'portal-verify',
})

/**
 * @en Per-IP rate limit for SaaS self-service register (default 5 / 15 min; `HTTP_RATE_LIMIT_SAAS_REGISTER`) (#180).
 * @es Límite por IP para registro SaaS self-service (5 / 15 min por defecto; `HTTP_RATE_LIMIT_SAAS_REGISTER`) (#180).
 * @pt-BR Limite por IP para registro SaaS self-service (5 / 15 min padrão; `HTTP_RATE_LIMIT_SAAS_REGISTER`) (#180).
 */
export const saasRegisterHttpRateLimiter = createRouteLimiter({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_SAAS_REGISTER, SAAS_REGISTER_DEFAULT),
  skipUnless: () => true,
  storePrefix: 'saas-register',
})

/**
 * @en Per-tenant-user rate limit for SaaS billing subscribe (default 10 / 15 min; `HTTP_RATE_LIMIT_SAAS_BILLING_SUBSCRIBE`) (#182).
 * @es Límite por usuario de tenant para suscribir billing SaaS (10 / 15 min; `HTTP_RATE_LIMIT_SAAS_BILLING_SUBSCRIBE`) (#182).
 * @pt-BR Limite por usuário do tenant para assinar billing SaaS (10 / 15 min; `HTTP_RATE_LIMIT_SAAS_BILLING_SUBSCRIBE`) (#182).
 */
export const saasBillingSubscribeHttpRateLimiter = createRouteLimiter({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: parsePositiveInt(
    process.env.HTTP_RATE_LIMIT_SAAS_BILLING_SUBSCRIBE,
    SAAS_BILLING_SUBSCRIBE_DEFAULT,
  ),
  skipUnless: () => true,
  storePrefix: 'saas-billing-subscribe',
})

/**
 * @en Per-IP rate limit for platform SaaS billing webhook (default 120 / 15 min; `HTTP_RATE_LIMIT_SAAS_BILLING_WEBHOOK`) (#182).
 * @es Límite por IP para webhook de billing SaaS de plataforma (120 / 15 min; `HTTP_RATE_LIMIT_SAAS_BILLING_WEBHOOK`) (#182).
 * @pt-BR Limite por IP para webhook de billing SaaS da plataforma (120 / 15 min; `HTTP_RATE_LIMIT_SAAS_BILLING_WEBHOOK`) (#182).
 */
export const saasBillingWebhookHttpRateLimiter = createRouteLimiter({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: parsePositiveInt(
    process.env.HTTP_RATE_LIMIT_SAAS_BILLING_WEBHOOK,
    SAAS_BILLING_WEBHOOK_DEFAULT,
  ),
  skipUnless: () => true,
  storePrefix: 'saas-billing-webhook',
})

/**
 * @en Per-IP rate limit for Mercado Pago credential test (default 10 req/15 min; `HTTP_RATE_LIMIT_MERCADOPAGO_TEST`).
 * @es Límite por IP para test de credenciales Mercado Pago (10 req/15 min por defecto; `HTTP_RATE_LIMIT_MERCADOPAGO_TEST`).
 * @pt-BR Limite por IP para teste de credenciais Mercado Pago (10 req/15 min padrão; `HTTP_RATE_LIMIT_MERCADOPAGO_TEST`).
 */
export const mercadopagoTestHttpRateLimiter = createRouteLimiter({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_MERCADOPAGO_TEST, MERCADOPAGO_TEST_DEFAULT),
  skipUnless: () => true,
  storePrefix: 'mp-test',
})

/**
 * @en Per-IP rate limit for Mercado Pago preference creation (default 20 req/15 min; `HTTP_RATE_LIMIT_MERCADOPAGO_PREFERENCE`).
 * @es Límite por IP para creación de preference Mercado Pago (20 req/15 min por defecto; `HTTP_RATE_LIMIT_MERCADOPAGO_PREFERENCE`).
 * @pt-BR Limite por IP para criação de preference Mercado Pago (20 req/15 min padrão; `HTTP_RATE_LIMIT_MERCADOPAGO_PREFERENCE`).
 */
export const mercadopagoPreferenceHttpRateLimiter = createRouteLimiter({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: parsePositiveInt(
    process.env.HTTP_RATE_LIMIT_MERCADOPAGO_PREFERENCE,
    MERCADOPAGO_PREFERENCE_DEFAULT,
  ),
  skipUnless: () => true,
  storePrefix: 'mp-pref',
})

/**
 * @en Per-IP rate limit for Mercado Pago webhooks (default 120 req/15 min; `HTTP_RATE_LIMIT_MERCADOPAGO_WEBHOOK`).
 * @es Límite por IP para webhooks de Mercado Pago (120 req/15 min por defecto; `HTTP_RATE_LIMIT_MERCADOPAGO_WEBHOOK`).
 * @pt-BR Limite por IP para webhooks do Mercado Pago (120 req/15 min padrão; `HTTP_RATE_LIMIT_MERCADOPAGO_WEBHOOK`).
 */
export const mercadopagoWebhookHttpRateLimiter = createRouteLimiter({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: parsePositiveInt(
    process.env.HTTP_RATE_LIMIT_MERCADOPAGO_WEBHOOK,
    MERCADOPAGO_WEBHOOK_DEFAULT,
  ),
  skipUnless: () => true,
  storePrefix: 'mp-webhook',
})

/**
 * @en Per-IP rate limit for Mercado Libre OAuth authorize/callback/disconnect (default 10 req/15 min; `HTTP_RATE_LIMIT_MELI_OAUTH`).
 * @es Límite por IP para OAuth Mercado Libre authorize/callback/disconnect (10 req/15 min; `HTTP_RATE_LIMIT_MELI_OAUTH`).
 * @pt-BR Limite por IP para OAuth Mercado Livre authorize/callback/disconnect (10 req/15 min; `HTTP_RATE_LIMIT_MELI_OAUTH`).
 */
export const meliOAuthHttpRateLimiter = createRouteLimiter({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_MELI_OAUTH, MELI_OAUTH_DEFAULT),
  skipUnless: () => true,
  storePrefix: 'meli-oauth',
})

/**
 * @en Per-IP rate limit for Mercado Libre webhooks (default 120 req/15 min; `HTTP_RATE_LIMIT_MELI_WEBHOOK`).
 * @es Límite por IP para webhooks de Mercado Libre (120 req/15 min; `HTTP_RATE_LIMIT_MELI_WEBHOOK`).
 * @pt-BR Limite por IP para webhooks do Mercado Livre (120 req/15 min; `HTTP_RATE_LIMIT_MELI_WEBHOOK`).
 */
export const meliWebhookHttpRateLimiter = createRouteLimiter({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_MELI_WEBHOOK, MELI_WEBHOOK_DEFAULT),
  skipUnless: () => true,
  storePrefix: 'meli-webhook',
})

/**
 * @en Per-IP rate limit for Tiendanube OAuth authorize/callback/disconnect (default 10 req/15 min; `HTTP_RATE_LIMIT_TIENDANUBE_OAUTH`).
 * @es Límite por IP para OAuth Tiendanube authorize/callback/disconnect (10 req/15 min; `HTTP_RATE_LIMIT_TIENDANUBE_OAUTH`).
 * @pt-BR Limite por IP para OAuth Tiendanube authorize/callback/disconnect (10 req/15 min; `HTTP_RATE_LIMIT_TIENDANUBE_OAUTH`).
 */
export const tiendanubeOAuthHttpRateLimiter = createRouteLimiter({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_TIENDANUBE_OAUTH, TIENDANUBE_OAUTH_DEFAULT),
  skipUnless: () => true,
  storePrefix: 'tn-oauth',
})

/**
 * @en Per-IP rate limit for Tiendanube webhooks (default 120 req/15 min; `HTTP_RATE_LIMIT_TIENDANUBE_WEBHOOK`).
 * @es Límite por IP para webhooks Tiendanube (120 req/15 min; `HTTP_RATE_LIMIT_TIENDANUBE_WEBHOOK`).
 * @pt-BR Limite por IP para webhooks Tiendanube (120 req/15 min; `HTTP_RATE_LIMIT_TIENDANUBE_WEBHOOK`).
 */
export const tiendanubeWebhookHttpRateLimiter = createRouteLimiter({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_TIENDANUBE_WEBHOOK, TIENDANUBE_WEBHOOK_DEFAULT),
  skipUnless: () => true,
  storePrefix: 'tn-webhook',
})

/**
 * @en Per-IP rate limit for WooCommerce config/verify writes (default 10 req/15 min; `HTTP_RATE_LIMIT_WOOCOMMERCE`).
 * @es Límite por IP para escrituras de config/verificación WooCommerce (10 req/15 min; `HTTP_RATE_LIMIT_WOOCOMMERCE`).
 * @pt-BR Limite por IP para escritas de config/verificação WooCommerce (10 req/15 min; `HTTP_RATE_LIMIT_WOOCOMMERCE`).
 */
export const woocommerceHttpRateLimiter = createRouteLimiter({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_WOOCOMMERCE, WOOCOMMERCE_HTTP_DEFAULT),
  skipUnless: () => true,
  storePrefix: 'wc-http',
})

/**
 * @en Per-IP rate limit for WooCommerce webhooks (default 120 req/15 min; `HTTP_RATE_LIMIT_WOOCOMMERCE_WEBHOOK`).
 * @es Límite por IP para webhooks WooCommerce (120 req/15 min; `HTTP_RATE_LIMIT_WOOCOMMERCE_WEBHOOK`).
 * @pt-BR Limite por IP para webhooks WooCommerce (120 req/15 min; `HTTP_RATE_LIMIT_WOOCOMMERCE_WEBHOOK`).
 */
export const woocommerceWebhookHttpRateLimiter = createRouteLimiter({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: parsePositiveInt(
    process.env.HTTP_RATE_LIMIT_WOOCOMMERCE_WEBHOOK,
    WOOCOMMERCE_WEBHOOK_DEFAULT,
  ),
  skipUnless: () => true,
  storePrefix: 'wc-webhook',
})

/**
 * @en Per-IP rate limit for Twilio WhatsApp inbound webhook (#201; default 120 req/15 min).
 * @es Límite por IP para webhook inbound Twilio WhatsApp (#201; 120 req/15 min por defecto).
 * @pt-BR Limite por IP para webhook inbound Twilio WhatsApp (#201; 120 req/15 min padrão).
 */
export const twilioWhatsAppWebhookHttpRateLimiter = createRouteLimiter({
  windowMs: FIFTEEN_MINUTES_MS,
  limit: parsePositiveInt(
    process.env.HTTP_RATE_LIMIT_TWILIO_WHATSAPP_WEBHOOK,
    TWILIO_WHATSAPP_WEBHOOK_DEFAULT,
  ),
  skipUnless: () => true,
  storePrefix: 'twilio-wa-webhook',
})

/**
 * @en Per-IP rate limit for CSV `POST /api/{entity}/import` (default 5 req/hour; `HTTP_RATE_LIMIT_IMPORT_PER_HOUR`).
 * @es Límite por IP para import CSV `POST /api/{entity}/import` (5 req/h por defecto; `HTTP_RATE_LIMIT_IMPORT_PER_HOUR`).
 * @pt-BR Limite por IP para import CSV `POST /api/{entity}/import` (5 req/h padrão; `HTTP_RATE_LIMIT_IMPORT_PER_HOUR`).
 */
export const importHttpRateLimiter = createRouteLimiter({
  windowMs: HOUR_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_IMPORT_PER_HOUR, IMPORT_DEFAULT),
  skipUnless: (req) => isImportPost(req),
  storePrefix: 'import',
})

/**
 * @en Unauthenticated `/api/*` limit per IP (default 20/min; `HTTP_RATE_LIMIT_UNAUTH_PER_MINUTE`) (#217).
 * @es Límite `/api/*` no autenticado por IP (20/min por defecto; `HTTP_RATE_LIMIT_UNAUTH_PER_MINUTE`) (#217).
 * @pt-BR Limite `/api/*` não autenticado por IP (20/min padrão; `HTTP_RATE_LIMIT_UNAUTH_PER_MINUTE`) (#217).
 */
export const unauthenticatedApiHttpRateLimiter = createRouteLimiter({
  windowMs: MINUTE_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_UNAUTH_PER_MINUTE, API_UNAUTH_DEFAULT),
  skipUnless: (req) => isGeneralApiPath(req) && !hasAuth(req),
  storePrefix: 'api-unauth',
})

/**
 * @en Authenticated `/api/*` limit per user (default 100/min; `HTTP_RATE_LIMIT_PER_MINUTE`) (#217).
 * @es Límite `/api/*` autenticado por usuario (100/min por defecto; `HTTP_RATE_LIMIT_PER_MINUTE`) (#217).
 * @pt-BR Limite `/api/*` autenticado por usuário (100/min padrão; `HTTP_RATE_LIMIT_PER_MINUTE`) (#217).
 */
export const authenticatedApiHttpRateLimiter = createRouteLimiter({
  windowMs: MINUTE_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_PER_MINUTE, API_AUTHENTICATED_DEFAULT),
  skipUnless: (req) => isGeneralApiPath(req) && hasAuth(req),
  storePrefix: 'api-auth',
  keyGenerator: (req) => {
    const userId = (req as RequestWithAuth).auth?.claims.userId
    return `user:${userId ?? 'unknown'}`
  },
})

/**
 * @en Alias of {@link unauthenticatedApiHttpRateLimiter} for #87 test compatibility.
 * @es Alias de {@link unauthenticatedApiHttpRateLimiter} para compatibilidad de tests #87.
 * @pt-BR Alias de {@link unauthenticatedApiHttpRateLimiter} para compatibilidade de testes #87.
 */
export const apiHttpRateLimiter = unauthenticatedApiHttpRateLimiter

/**
 * @en Costly reports/exports per tenant (default 10/hour; `HTTP_RATE_LIMIT_REPORTS_PER_HOUR`) (#217).
 * @es Reportes/exports costosos por tenant (10/hora por defecto; `HTTP_RATE_LIMIT_REPORTS_PER_HOUR`) (#217).
 * @pt-BR Relatórios/exports caros por tenant (10/hora padrão; `HTTP_RATE_LIMIT_REPORTS_PER_HOUR`) (#217).
 */
export const reportsTenantHttpRateLimiter = createRouteLimiter({
  windowMs: HOUR_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_REPORTS_PER_HOUR, REPORTS_DEFAULT),
  skipUnless: (req) => isReportOrExportPath(req),
  storePrefix: 'reports-tenant',
  keyGenerator: (req) => {
    const tenantId = (req as RequestWithAuth).auth?.claims.tenantId
    return `tenant:${tenantId ?? 'anon'}:${req.ip ?? 'unknown'}`
  },
})

/**
 * @en Per-IP rate limit for deposit/transfer mutations (#236); visible to CodeQL on route handlers.
 * @es Límite por IP para mutaciones de depósitos/transferencias (#236); visible a CodeQL en los handlers.
 * @pt-BR Limite por IP para mutações de depósitos/transferências (#236); visível ao CodeQL nos handlers.
 */
export const depositosMutationHttpRateLimiter = createRouteLimiter({
  windowMs: MINUTE_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_PER_MINUTE, API_AUTHENTICATED_DEFAULT),
  skipUnless: () => true,
  storePrefix: 'mut-depositos',
})

/**
 * @en Per-IP rate limit for commission mutations (#237); visible to CodeQL on route handlers.
 * @es Límite por IP para mutaciones de comisiones (#237); visible a CodeQL en los handlers.
 * @pt-BR Limite por IP para mutações de comissões (#237); visível ao CodeQL nos handlers.
 */
export const comisionesMutationHttpRateLimiter = createRouteLimiter({
  windowMs: MINUTE_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_PER_MINUTE, API_AUTHENTICATED_DEFAULT),
  skipUnless: () => true,
  storePrefix: 'mut-comisiones',
})

/**
 * @en Per-IP rate limit for bulk import mutations and SSE (#238); visible to CodeQL.
 * @es Límite por IP para mutaciones/SSE de importación masiva (#238); visible a CodeQL.
 * @pt-BR Limite por IP para mutações/SSE de importação em massa (#238); visível ao CodeQL.
 */
export const importacionesMutationHttpRateLimiter = createRouteLimiter({
  windowMs: MINUTE_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_PER_MINUTE, API_AUTHENTICATED_DEFAULT),
  skipUnless: () => true,
  storePrefix: 'mut-importaciones',
})

/**
 * @en Per-IP rate limit for FX rate mutations (#243); visible to CodeQL.
 * @es Límite por IP para mutaciones de tipo de cambio (#243); visible a CodeQL.
 * @pt-BR Limite por IP para mutações de câmbio (#243); visível ao CodeQL.
 */
export const tiposCambioMutationHttpRateLimiter = createRouteLimiter({
  windowMs: MINUTE_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_PER_MINUTE, API_AUTHENTICATED_DEFAULT),
  skipUnless: () => true,
  storePrefix: 'mut-tipos-cambio',
})

/**
 * @en Per-IP rate limit for BOM formula mutations (#248); visible to CodeQL.
 * @es Límite por IP para mutaciones de fórmulas BOM (#248); visible a CodeQL.
 * @pt-BR Limite por IP para mutações de fórmulas BOM (#248); visível ao CodeQL.
 */
export const formulasProduccionMutationHttpRateLimiter = createRouteLimiter({
  windowMs: MINUTE_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_PER_MINUTE, API_AUTHENTICATED_DEFAULT),
  skipUnless: () => true,
  storePrefix: 'mut-formulas',
})

/**
 * @en Per-IP rate limit for production order mutations (#249); visible to CodeQL.
 * @es Límite por IP para mutaciones de órdenes de producción (#249); visible a CodeQL.
 * @pt-BR Limite por IP para mutações de ordens de produção (#249); visível ao CodeQL.
 */
export const ordenesProduccionMutationHttpRateLimiter = createRouteLimiter({
  windowMs: MINUTE_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_PER_MINUTE, API_AUTHENTICATED_DEFAULT),
  skipUnless: () => true,
  storePrefix: 'mut-ordenes-prod',
})

/**
 * @en Per-IP rate limit for loyalty config/ajuste mutations (#250); visible to CodeQL.
 * @es Límite por IP para mutaciones de fidelización (#250); visible a CodeQL.
 * @pt-BR Limite por IP para mutações de fidelização (#250); visível ao CodeQL.
 */
export const fidelizacionMutationHttpRateLimiter = createRouteLimiter({
  windowMs: MINUTE_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_PER_MINUTE, API_AUTHENTICATED_DEFAULT),
  skipUnless: () => true,
  storePrefix: 'mut-fidelizacion',
})

/**
 * @en Per-IP rate limit for FEFO config/lote mutations (#202); visible to CodeQL.
 * @es Límite por IP para mutaciones FEFO/lotes (#202); visible a CodeQL.
 * @pt-BR Limite por IP para mutações FEFO/lotes (#202); visível ao CodeQL.
 */
export const fefoMutationHttpRateLimiter = createRouteLimiter({
  windowMs: MINUTE_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_PER_MINUTE, API_AUTHENTICATED_DEFAULT),
  skipUnless: () => true,
  storePrefix: 'mut-fefo',
})

/**
 * @en Per-IP rate limit for pharmacy prescription/book mutations (#204); visible to CodeQL.
 * @es Límite por IP para mutaciones de recetas/libro de farmacia (#204); visible a CodeQL.
 * @pt-BR Limite por IP para mutações de receitas/livro da farmácia (#204); visível ao CodeQL.
 */
export const farmaciaMutationHttpRateLimiter = createRouteLimiter({
  windowMs: MINUTE_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_PER_MINUTE, API_AUTHENTICATED_DEFAULT),
  skipUnless: () => true,
  storePrefix: 'mut-farmacia',
})

/**
 * @en Per-IP rate limit for fiscal/ARCA authorize & auth mutations (#378); visible to CodeQL.
 * @es Límite por IP para mutaciones de autorización fiscal/ARCA (#378); visible a CodeQL.
 * @pt-BR Limite por IP para mutações de autorização fiscal/ARCA (#378); visível ao CodeQL.
 */
export const fiscalMutationHttpRateLimiter = createRouteLimiter({
  windowMs: MINUTE_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_PER_MINUTE, API_AUTHENTICATED_DEFAULT),
  skipUnless: () => true,
  storePrefix: 'mut-fiscal',
})

/**
 * @en Per-IP rate limit for payment provider config/checkout mutations (#377); visible to CodeQL.
 * @es Límite por IP para mutaciones de config/checkout de pagos (#377); visible a CodeQL.
 * @pt-BR Limite por IP para mutações de config/checkout de pagamentos (#377); visível ao CodeQL.
 */
export const paymentsMutationHttpRateLimiter = createRouteLimiter({
  windowMs: MINUTE_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_PER_MINUTE, API_AUTHENTICATED_DEFAULT),
  skipUnless: () => true,
  storePrefix: 'mut-payments',
})

function runLimiterChain(
  req: Request,
  res: Response,
  next: NextFunction,
  limiters: RequestHandler[],
  index: number,
): void {
  if (index >= limiters.length) {
    next()
    return
  }
  limiters[index](req, res, (err?: unknown) => {
    if (err) {
      next(err)
      return
    }
    if (res.headersSent) {
      return
    }
    runLimiterChain(req, res, next, limiters, index + 1)
  })
}

/**
 * @en Applies import, report, unauth-IP and auth-user API rate limits without double-counting (#217).
 * @es Aplica límites import, reportes, IP no auth y user auth sin doble conteo (#217).
 * @pt-BR Aplica limites import, relatórios, IP não auth e user auth sem contagem dupla (#217).
 */
export function routeHttpRateLimiter(req: Request, res: Response, next: NextFunction): void {
  // `/api/auth/*` is rate-limited on the auth router (`registerAuthRoutes`) so CodeQL can see it.
  runLimiterChain(
    req,
    res,
    next,
    [
      importHttpRateLimiter,
      reportsTenantHttpRateLimiter,
      unauthenticatedApiHttpRateLimiter,
      authenticatedApiHttpRateLimiter,
    ],
    0,
  )
}
