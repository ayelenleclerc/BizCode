/**
 * Route-group HTTP rate limiters (#87 / #217): behavior when not skipped (non-test NODE_ENV).
 */
import express from 'express'
import request from 'supertest'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('routeHttpRateLimiter', () => {
  const prevNodeEnv = process.env.NODE_ENV
  const prevApiLimit = process.env.HTTP_RATE_LIMIT_PER_MINUTE
  const prevUnauthLimit = process.env.HTTP_RATE_LIMIT_UNAUTH_PER_MINUTE
  const prevAuthLimit = process.env.HTTP_RATE_LIMIT_AUTH_PER_MINUTE
  const prevImportLimit = process.env.HTTP_RATE_LIMIT_IMPORT_PER_HOUR
  const prevLoginIpLimit = process.env.HTTP_RATE_LIMIT_LOGIN_PER_15_MIN
  const prevLoginUserLimit = process.env.HTTP_RATE_LIMIT_LOGIN_USERNAME_PER_HOUR
  const prevRedis = process.env.REDIS_URL

  afterEach(() => {
    process.env.NODE_ENV = prevNodeEnv
    process.env.HTTP_RATE_LIMIT_PER_MINUTE = prevApiLimit
    process.env.HTTP_RATE_LIMIT_UNAUTH_PER_MINUTE = prevUnauthLimit
    process.env.HTTP_RATE_LIMIT_AUTH_PER_MINUTE = prevAuthLimit
    process.env.HTTP_RATE_LIMIT_IMPORT_PER_HOUR = prevImportLimit
    process.env.HTTP_RATE_LIMIT_LOGIN_PER_15_MIN = prevLoginIpLimit
    process.env.HTTP_RATE_LIMIT_LOGIN_USERNAME_PER_HOUR = prevLoginUserLimit
    process.env.REDIS_URL = prevRedis
    vi.resetModules()
  })

  it('returns 429 for unauthenticated /api routes when unauth per-minute limit is exceeded', async () => {
    process.env.NODE_ENV = 'development'
    process.env.HTTP_RATE_LIMIT_UNAUTH_PER_MINUTE = '2'
    delete process.env.REDIS_URL
    vi.resetModules()

    const { routeHttpRateLimiter } = await import('../../apps/server/middleware/routeRateLimit')

    const app = express()
    app.use(routeHttpRateLimiter)
    app.get('/api/health', (_req, res) => res.status(200).json({ ok: true }))

    await request(app).get('/api/health').expect(200)
    await request(app).get('/api/health').expect(200)
    const res = await request(app).get('/api/health').expect(429)
    expect(res.body).toEqual({ success: false, error: 'Too many requests' })
    expect(res.headers['ratelimit-reset']).toBeDefined()
    expect(res.headers['retry-after']).toBeDefined()
  })

  it('returns 429 for authenticated /api routes when per-user limit is exceeded (#217)', async () => {
    process.env.NODE_ENV = 'development'
    process.env.HTTP_RATE_LIMIT_PER_MINUTE = '2'
    delete process.env.REDIS_URL
    vi.resetModules()

    const { routeHttpRateLimiter } = await import('../../apps/server/middleware/routeRateLimit')

    const app = express()
    app.use((req, _res, next) => {
      ;(req as { auth?: { claims: { userId: number; tenantId: number } } }).auth = {
        claims: { userId: 42, tenantId: 1 },
      }
      next()
    })
    app.use(routeHttpRateLimiter)
    app.get('/api/health', (_req, res) => res.status(200).json({ ok: true }))

    await request(app).get('/api/health').expect(200)
    await request(app).get('/api/health').expect(200)
    const res = await request(app).get('/api/health').expect(429)
    expect(res.body).toEqual({ success: false, error: 'Too many requests' })
    expect(res.headers['retry-after']).toBeDefined()
  })

  it('returns 429 for /api/auth when auth per-minute limit is exceeded', async () => {
    process.env.NODE_ENV = 'development'
    process.env.HTTP_RATE_LIMIT_AUTH_PER_MINUTE = '2'
    delete process.env.REDIS_URL
    vi.resetModules()

    const { authRouterHttpRateLimiter } = await import('../../apps/server/middleware/routeRateLimit')

    const app = express()
    const authRouter = express.Router()
    authRouter.use(authRouterHttpRateLimiter)
    authRouter.post('/login', (_req, res) => res.status(200).json({ ok: true }))
    app.use('/api/auth', authRouter)

    await request(app).post('/api/auth/login').expect(200)
    await request(app).post('/api/auth/login').expect(200)
    const res = await request(app).post('/api/auth/login').expect(429)
    expect(res.body).toEqual({ success: false, error: 'Too many requests' })
    expect(res.headers['ratelimit-reset']).toBeDefined()
  })

  it('returns 429 for login IP limiter after 5 attempts / 15 min window (#217)', async () => {
    process.env.NODE_ENV = 'development'
    process.env.HTTP_RATE_LIMIT_LOGIN_PER_15_MIN = '2'
    delete process.env.REDIS_URL
    vi.resetModules()

    const { loginIpHttpRateLimiter } = await import('../../apps/server/middleware/routeRateLimit')

    const app = express()
    app.post('/api/auth/login', loginIpHttpRateLimiter, (_req, res) => res.status(200).json({ ok: true }))

    await request(app).post('/api/auth/login').expect(200)
    await request(app).post('/api/auth/login').expect(200)
    const res = await request(app).post('/api/auth/login').expect(429)
    expect(res.headers['retry-after']).toBeDefined()
  })

  it('returns 429 for login username limiter independent of IP (#217)', async () => {
    process.env.NODE_ENV = 'development'
    process.env.HTTP_RATE_LIMIT_LOGIN_USERNAME_PER_HOUR = '2'
    delete process.env.REDIS_URL
    vi.resetModules()

    const { loginUsernameHttpRateLimiter } = await import('../../apps/server/middleware/routeRateLimit')

    const app = express()
    app.use(express.json())
    app.post('/api/auth/login', loginUsernameHttpRateLimiter, (_req, res) =>
      res.status(200).json({ ok: true }),
    )

    const body = { tenantSlug: 'demo', username: 'alice', password: 'x' }
    await request(app).post('/api/auth/login').send(body).expect(200)
    await request(app).post('/api/auth/login').send(body).expect(200)
    const res = await request(app).post('/api/auth/login').send(body).expect(429)
    expect(res.body.error).toBe('Too many requests')
  })

  it('returns 429 for POST /api/*/import when hourly import limit is exceeded', async () => {
    process.env.NODE_ENV = 'development'
    process.env.HTTP_RATE_LIMIT_IMPORT_PER_HOUR = '2'
    delete process.env.REDIS_URL
    vi.resetModules()

    const { routeHttpRateLimiter } = await import('../../apps/server/middleware/routeRateLimit')

    const app = express()
    app.use(routeHttpRateLimiter)
    app.post('/api/clientes/import', (_req, res) => res.status(200).json({ ok: true }))

    await request(app).post('/api/clientes/import').expect(200)
    await request(app).post('/api/clientes/import').expect(200)
    const res = await request(app).post('/api/clientes/import').expect(429)
    expect(res.body).toEqual({ success: false, error: 'Too many requests' })
    expect(res.headers['ratelimit-reset']).toBeDefined()
  })

  it('resets the unauthenticated API limit after the window elapses', async () => {
    vi.useFakeTimers()
    try {
      process.env.NODE_ENV = 'development'
      process.env.HTTP_RATE_LIMIT_UNAUTH_PER_MINUTE = '1'
      delete process.env.REDIS_URL
      vi.resetModules()

      const { routeHttpRateLimiter } = await import('../../apps/server/middleware/routeRateLimit')

      const app = express()
      app.use(routeHttpRateLimiter)
      app.get('/api/health', (_req, res) => res.status(200).json({ ok: true }))

      await request(app).get('/api/health').expect(200)
      await request(app).get('/api/health').expect(429)

      await vi.advanceTimersByTimeAsync(60_001)

      await request(app).get('/api/health').expect(200)
    } finally {
      vi.useRealTimers()
    }
  })
})

describe('webhookIpAllowlist', () => {
  const prevAllow = process.env.WEBHOOK_IP_ALLOWLIST

  afterEach(() => {
    process.env.WEBHOOK_IP_ALLOWLIST = prevAllow
    vi.resetModules()
  })

  it('allows all IPs when allowlist is empty', async () => {
    delete process.env.WEBHOOK_IP_ALLOWLIST
    vi.resetModules()
    const { webhookIpAllowlist } = await import('../../apps/server/middleware/webhookIpAllowlist')
    const app = express()
    app.post('/hook', webhookIpAllowlist, (_req, res) => res.status(200).json({ ok: true }))
    await request(app).post('/hook').expect(200)
  })

  it('rejects IP not on allowlist with 403', async () => {
    process.env.WEBHOOK_IP_ALLOWLIST = '203.0.113.10'
    vi.resetModules()
    const { webhookIpAllowlist } = await import('../../apps/server/middleware/webhookIpAllowlist')
    const app = express()
    app.post('/hook', webhookIpAllowlist, (_req, res) => res.status(200).json({ ok: true }))
    const res = await request(app).post('/hook').expect(403)
    expect(res.body).toEqual({ success: false, error: 'Forbidden' })
  })
})
