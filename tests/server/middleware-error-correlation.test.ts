/**
 * Unit coverage for server middleware (#86): correlationId + errorHandler envelopes.
 */
import express, { type NextFunction, type Request, type Response } from 'express'
import request from 'supertest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ConflictAppError, NotFoundAppError, ValidationAppError } from '../../server/errors/AppError'
import { correlationId } from '../../server/middleware/correlationId'
import { errorHandler } from '../../server/middleware/errorHandler'
import * as loggerMod from '../../server/logger'

describe('correlationId middleware', () => {
  const app = express()
  app.use(correlationId)
  app.get('/ping', (_req: Request, res: Response) => {
    res.status(200).json({ ok: true })
  })

  it('rejects oversized X-Request-Id and generates a UUID instead', async () => {
    const longId = 'x'.repeat(129)
    expect(longId.length).toBeGreaterThan(128)

    const res = await request(app).get('/ping').set('X-Request-Id', longId).expect(200)

    expect(res.headers['x-request-id']).toBeDefined()
    expect(String(res.headers['x-request-id'])).toMatch(
      /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i,
    )
    expect(res.headers['x-request-id']).not.toBe(longId)
  })

  it('uses first value when X-Request-Id is an array header', async () => {
    const appWithArray = express()
    appWithArray.use((req: Request, _res: Response, next: NextFunction) => {
      req.headers['x-request-id'] = ['first-id', 'second-id'] as unknown as string
      next()
    })
    appWithArray.use(correlationId)
    appWithArray.get('/p', (_req, res) => res.status(200).send('ok'))

    const res = await request(appWithArray).get('/p').expect(200)
    expect(res.headers['x-request-id']).toBe('first-id')
  })
})

describe('errorHandler middleware', () => {
  const prevEnv = process.env.NODE_ENV

  beforeEach(() => {
    vi.spyOn(loggerMod.logger, 'warn').mockImplementation(() => {})
    vi.spyOn(loggerMod.logger, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    process.env.NODE_ENV = prevEnv
    vi.restoreAllMocks()
  })

  it('maps ValidationAppError to 400 JSON envelope', async () => {
    process.env.NODE_ENV = 'development'

    const app = express()
    app.get('/boom', (_req, _res, next) => {
      next(new ValidationAppError('bad field'))
    })
    app.use(errorHandler)

    await request(app).get('/boom').expect(400).expect({ success: false, error: 'bad field' })
    expect(loggerMod.logger.warn).toHaveBeenCalled()
  })

  it('maps NotFoundAppError to 404', async () => {
    process.env.NODE_ENV = 'development'

    const app = express()
    app.get('/nf', (_req, _res, next) => {
      next(new NotFoundAppError('missing'))
    })
    app.use(errorHandler)

    await request(app).get('/nf').expect(404).expect({ success: false, error: 'missing' })
  })

  it('maps ConflictAppError to 409', async () => {
    process.env.NODE_ENV = 'development'

    const app = express()
    app.get('/cf', (_req, _res, next) => {
      next(new ConflictAppError('dup'))
    })
    app.use(errorHandler)

    await request(app).get('/cf').expect(409).expect({ success: false, error: 'dup' })
  })

  it('returns generic message in production for non-AppError', async () => {
    process.env.NODE_ENV = 'production'

    const app = express()
    app.get('/x', (_req, _res, next) => {
      next(new Error('secret stack detail'))
    })
    app.use(errorHandler)

    await request(app)
      .get('/x')
      .expect(500)
      .expect({ success: false, error: 'Internal server error' })
    expect(loggerMod.logger.error).toHaveBeenCalled()
  })

  it('returns early when response headers were already sent', () => {
    process.env.NODE_ENV = 'development'

    const req = { path: '/x' } as Request
    const status = vi.fn()
    const json = vi.fn()
    const res = { headersSent: true, status, json } as unknown as Response
    const next = vi.fn() as NextFunction

    errorHandler(new Error('late'), req, res, next)

    expect(status).not.toHaveBeenCalled()
    expect(json).not.toHaveBeenCalled()
  })
})
