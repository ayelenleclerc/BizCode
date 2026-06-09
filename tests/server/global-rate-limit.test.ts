/**
 * Route-group HTTP rate limiters (#87): behavior when not skipped (non-test NODE_ENV).
 */
import express from 'express'
import request from 'supertest'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('routeHttpRateLimiter', () => {
  const prevNodeEnv = process.env.NODE_ENV
  const prevApiLimit = process.env.HTTP_RATE_LIMIT_PER_MINUTE
  const prevAuthLimit = process.env.HTTP_RATE_LIMIT_AUTH_PER_MINUTE
  const prevImportLimit = process.env.HTTP_RATE_LIMIT_IMPORT_PER_HOUR

  afterEach(() => {
    process.env.NODE_ENV = prevNodeEnv
    process.env.HTTP_RATE_LIMIT_PER_MINUTE = prevApiLimit
    process.env.HTTP_RATE_LIMIT_AUTH_PER_MINUTE = prevAuthLimit
    process.env.HTTP_RATE_LIMIT_IMPORT_PER_HOUR = prevImportLimit
    vi.resetModules()
  })

  it('returns 429 for general /api routes when per-minute limit is exceeded', async () => {
    process.env.NODE_ENV = 'development'
    process.env.HTTP_RATE_LIMIT_PER_MINUTE = '2'
    vi.resetModules()

    const { routeHttpRateLimiter } = await import('../../server/middleware/routeRateLimit')

    const app = express()
    app.use(routeHttpRateLimiter)
    app.get('/api/health', (_req, res) => res.status(200).json({ ok: true }))

    await request(app).get('/api/health').expect(200)
    await request(app).get('/api/health').expect(200)
    const res = await request(app).get('/api/health').expect(429)
    expect(res.body).toEqual({ success: false, error: 'Too many requests' })
    expect(res.headers['ratelimit-reset']).toBeDefined()
  })

  it('returns 429 for /api/auth when auth per-minute limit is exceeded', async () => {
    process.env.NODE_ENV = 'development'
    process.env.HTTP_RATE_LIMIT_AUTH_PER_MINUTE = '2'
    vi.resetModules()

    const { authRouterHttpRateLimiter } = await import('../../server/middleware/routeRateLimit')

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

  it('returns 429 for POST /api/*/import when hourly import limit is exceeded', async () => {
    process.env.NODE_ENV = 'development'
    process.env.HTTP_RATE_LIMIT_IMPORT_PER_HOUR = '2'
    vi.resetModules()

    const { routeHttpRateLimiter } = await import('../../server/middleware/routeRateLimit')

    const app = express()
    app.use(routeHttpRateLimiter)
    app.post('/api/clientes/import', (_req, res) => res.status(200).json({ ok: true }))

    await request(app).post('/api/clientes/import').expect(200)
    await request(app).post('/api/clientes/import').expect(200)
    const res = await request(app).post('/api/clientes/import').expect(429)
    expect(res.body).toEqual({ success: false, error: 'Too many requests' })
    expect(res.headers['ratelimit-reset']).toBeDefined()
  })

  it('resets the general API limit after the window elapses', async () => {
    vi.useFakeTimers()
    try {
      process.env.NODE_ENV = 'development'
      process.env.HTTP_RATE_LIMIT_PER_MINUTE = '1'
      vi.resetModules()

      const { routeHttpRateLimiter } = await import('../../server/middleware/routeRateLimit')

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
