/**
 * Unit coverage for validateBody middleware (#86).
 */
import express from 'express'
import request from 'supertest'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { errorHandler } from '../../apps/server/middleware/errorHandler'
import { validateBody } from '../../apps/server/middleware/validateBody'
import * as loggerMod from '../../apps/server/logger'

const sampleBodySchema = z.object({
  name: z.string().min(3, 'name must be at least 3 characters'),
})

describe('validateBody middleware', () => {
  beforeEach(() => {
    vi.spyOn(loggerMod.logger, 'warn').mockImplementation(() => {})
  })

  it('rewrites req.body with parsed data on success', async () => {
    const app = express()
    app.use(express.json())
    app.post('/ok', validateBody(sampleBodySchema), (req, res) => {
      const body = req.body as { name: string }
      res.status(200).json({ name: body.name })
    })
    app.use(errorHandler)

    await request(app).post('/ok').send({ name: 'abcd' }).expect(200).expect({ name: 'abcd' })
  })

  it('forwards ValidationAppError to errorHandler when body fails Zod', async () => {
    const app = express()
    app.use(express.json())
    app.post('/bad', validateBody(sampleBodySchema), (_req, res) => {
      res.status(200).json({ ok: true })
    })
    app.use(errorHandler)

    const res = await request(app).post('/bad').send({ name: 'ab' }).expect(400)

    expect(res.body).toEqual({ success: false, error: 'name must be at least 3 characters' })
    expect(loggerMod.logger.warn).toHaveBeenCalled()
  })
})
