import rateLimit from 'express-rate-limit'
import type { NextFunction, Request, RequestHandler, Response } from 'express'

const MINUTE_MS = 60_000
const HOUR_MS = 60 * MINUTE_MS

const API_GENERAL_DEFAULT = 100
const AUTH_DEFAULT = 20
const IMPORT_DEFAULT = 5
const PORTAL_MAGIC_LINK_DEFAULT = 5
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
  return req.method === 'POST' && /^\/api\/[^/]+\/import$/.test(req.path)
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
