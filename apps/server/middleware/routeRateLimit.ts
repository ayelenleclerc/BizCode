import rateLimit from 'express-rate-limit'
import type { NextFunction, Request, RequestHandler, Response } from 'express'

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS

const API_GENERAL_DEFAULT = 100
const AUTH_DEFAULT = 20
const IMPORT_DEFAULT = 5
const PORTAL_MAGIC_LINK_DEFAULT = 5
const PORTAL_VERIFY_DEFAULT = 30
const MERCADOPAGO_TEST_DEFAULT = 10
const MERCADOPAGO_PREFERENCE_DEFAULT = 20
const MERCADOPAGO_WEBHOOK_DEFAULT = 120
const FIFTEEN_MINUTES_MS = 15 * MINUTE_MS

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

function isGeneralApiPath(req: Request): boolean {
  return req.path.startsWith('/api') && !isAuthPath(req.path) && !isImportPost(req)
}

function rateLimitHandler(_req: Request, res: Response): void {
  res.status(429).json({ success: false, error: 'Too many requests' })
}

function createRouteLimiter(options: {
  windowMs: number
  limit: number
  skipUnless: (req: Request) => boolean
}): RequestHandler {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.limit,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => skipInTest() || !options.skipUnless(req),
    handler: rateLimitHandler,
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
})

/**
 * @en Per-IP rate limit for other `/api/*` routes (default 100 req/min; `HTTP_RATE_LIMIT_PER_MINUTE`).
 * @es Límite por IP para el resto de `/api/*` (100 req/min por defecto; `HTTP_RATE_LIMIT_PER_MINUTE`).
 * @pt-BR Limite por IP para demais rotas `/api/*` (100 req/min padrão; `HTTP_RATE_LIMIT_PER_MINUTE`).
 */
export const apiHttpRateLimiter = createRouteLimiter({
  windowMs: MINUTE_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_PER_MINUTE, API_GENERAL_DEFAULT),
  skipUnless: (req) => isGeneralApiPath(req),
})

/**
 * @en Per-IP rate limit for deposit/transfer mutations (#236); visible to CodeQL on route handlers.
 * @es Límite por IP para mutaciones de depósitos/transferencias (#236); visible a CodeQL en los handlers.
 * @pt-BR Limite por IP para mutações de depósitos/transferências (#236); visível ao CodeQL nos handlers.
 */
export const depositosMutationHttpRateLimiter = createRouteLimiter({
  windowMs: MINUTE_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_PER_MINUTE, API_GENERAL_DEFAULT),
  skipUnless: () => true,
})

/**
 * @en Per-IP rate limit for commission mutations (#237); visible to CodeQL on route handlers.
 * @es Límite por IP para mutaciones de comisiones (#237); visible a CodeQL en los handlers.
 * @pt-BR Limite por IP para mutações de comissões (#237); visível ao CodeQL nos handlers.
 */
export const comisionesMutationHttpRateLimiter = createRouteLimiter({
  windowMs: MINUTE_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_PER_MINUTE, API_GENERAL_DEFAULT),
  skipUnless: () => true,
})

/**
 * @en Per-IP rate limit for bulk import mutations and SSE (#238); visible to CodeQL.
 * @es Límite por IP para mutaciones/SSE de importación masiva (#238); visible a CodeQL.
 * @pt-BR Limite por IP para mutações/SSE de importação em massa (#238); visível ao CodeQL.
 */
export const importacionesMutationHttpRateLimiter = createRouteLimiter({
  windowMs: MINUTE_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_PER_MINUTE, API_GENERAL_DEFAULT),
  skipUnless: () => true,
})

/**
 * @en Per-IP rate limit for FX rate mutations (#243); visible to CodeQL.
 * @es Límite por IP para mutaciones de tipo de cambio (#243); visible a CodeQL.
 * @pt-BR Limite por IP para mutações de câmbio (#243); visível ao CodeQL.
 */
export const tiposCambioMutationHttpRateLimiter = createRouteLimiter({
  windowMs: MINUTE_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_PER_MINUTE, API_GENERAL_DEFAULT),
  skipUnless: () => true,
})

/**
 * @en Per-IP rate limit for BOM formula mutations (#248); visible to CodeQL.
 * @es Límite por IP para mutaciones de fórmulas BOM (#248); visible a CodeQL.
 * @pt-BR Limite por IP para mutações de fórmulas BOM (#248); visível ao CodeQL.
 */
export const formulasProduccionMutationHttpRateLimiter = createRouteLimiter({
  windowMs: MINUTE_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_PER_MINUTE, API_GENERAL_DEFAULT),
  skipUnless: () => true,
})

/**
 * @en Per-IP rate limit for production order mutations (#249); visible to CodeQL.
 * @es Límite por IP para mutaciones de órdenes de producción (#249); visible a CodeQL.
 * @pt-BR Limite por IP para mutações de ordens de produção (#249); visível ao CodeQL.
 */
export const ordenesProduccionMutationHttpRateLimiter = createRouteLimiter({
  windowMs: MINUTE_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_PER_MINUTE, API_GENERAL_DEFAULT),
  skipUnless: () => true,
})

/**
 * @en Per-IP rate limit for loyalty config/ajuste mutations (#250); visible to CodeQL.
 * @es Límite por IP para mutaciones de fidelización (#250); visible a CodeQL.
 * @pt-BR Limite por IP para mutações de fidelização (#250); visível ao CodeQL.
 */
export const fidelizacionMutationHttpRateLimiter = createRouteLimiter({
  windowMs: MINUTE_MS,
  limit: parsePositiveInt(process.env.HTTP_RATE_LIMIT_PER_MINUTE, API_GENERAL_DEFAULT),
  skipUnless: () => true,
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
  limiters[index](req, res, (err: unknown) => {
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
 * @en Applies auth, import, and general API rate limits without double-counting a request.
 * @es Aplica límites auth, import y API general sin contar dos veces la misma petición.
 * @pt-BR Aplica limites auth, import e API geral sem contar a mesma requisição duas vezes.
 */
export function routeHttpRateLimiter(req: Request, res: Response, next: NextFunction): void {
  // `/api/auth/*` is rate-limited on the auth router (`registerAuthRoutes`) so CodeQL can see it.
  runLimiterChain(req, res, next, [importHttpRateLimiter, apiHttpRateLimiter], 0)
}
