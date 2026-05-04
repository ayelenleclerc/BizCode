/**
 * Global HTTP rate limiter (#86 / #87): behavior when not skipped (non-test NODE_ENV).
 */
import express from 'express'
import request from 'supertest'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('globalHttpRateLimiter', () => {
  const prevNodeEnv = process.env.NODE_ENV
  const prevLimit = process.env.HTTP_RATE_LIMIT_PER_MINUTE

  afterEach(() => {
    process.env.NODE_ENV = prevNodeEnv
    process.env.HTTP_RATE_LIMIT_PER_MINUTE = prevLimit
    vi.resetModules()
  })

  it('returns 429 when request count exceeds configured per-minute limit', async () => {
    process.env.NODE_ENV = 'development'
    process.env.HTTP_RATE_LIMIT_PER_MINUTE = '2'
    vi.resetModules()

    const { globalHttpRateLimiter } = await import('../../server/middleware/globalRateLimit')

    const app = express()
    app.use(globalHttpRateLimiter)
    app.get('/ok', (_req, res) => res.status(200).json({ ok: true }))

    await request(app).get('/ok').expect(200)
    await request(app).get('/ok').expect(200)
    const res = await request(app).get('/ok').expect(429)
    expect(res.body).toEqual({ success: false, error: 'Too many requests' })
  })
})
