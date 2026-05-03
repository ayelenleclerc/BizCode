import rateLimit from 'express-rate-limit'

const PER_MINUTE_DEFAULT = 300

function maxFromEnv(): number {
  const raw = process.env.HTTP_RATE_LIMIT_PER_MINUTE?.trim()
  if (!raw) {
    return PER_MINUTE_DEFAULT
  }
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n >= 1 ? n : PER_MINUTE_DEFAULT
}

/**
 * @en Global HTTP rate limit for the API (skipped in `NODE_ENV=test`).
 * @es Límite global de peticiones HTTP (omitido en tests).
 */
export const globalHttpRateLimiter = rateLimit({
  windowMs: 60_000,
  limit: maxFromEnv(),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  handler: (_req, res): void => {
    res.status(429).json({ success: false, error: 'Too many requests' })
  },
})
