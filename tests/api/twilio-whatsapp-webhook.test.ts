/**
 * @en API tests for Twilio WhatsApp inbound webhook (#201).
 * @es Tests API del webhook inbound Twilio WhatsApp (#201).
 * @pt-BR Testes API do webhook inbound Twilio WhatsApp (#201).
 */

import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'

const validateRequestMock = vi.hoisted(() => vi.fn(() => true))
const handleInboundMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue({ handled: true, reply: 'ok' }),
)

vi.mock('twilio', () => ({
  default: Object.assign(
    vi.fn(() => ({
      messages: { create: vi.fn().mockResolvedValue({ sid: 'SM1' }) },
    })),
    { validateRequest: validateRequestMock },
  ),
}))

vi.mock('../../apps/server/services/AtencionBotService', () => ({
  AtencionBotService: class {
    handleInbound = handleInboundMock
  },
}))

function buildPrismaMock(): PrismaClient {
  return {
    atencionBotSession: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  } as unknown as PrismaClient
}

describe('POST /api/webhooks/twilio/whatsapp (#201)', () => {
  const prev = {
    sid: process.env.TWILIO_ACCOUNT_SID,
    token: process.env.TWILIO_AUTH_TOKEN,
    from: process.env.TWILIO_WHATSAPP_FROM,
  }

  afterAll(() => {
    if (prev.sid === undefined) delete process.env.TWILIO_ACCOUNT_SID
    else process.env.TWILIO_ACCOUNT_SID = prev.sid
    if (prev.token === undefined) delete process.env.TWILIO_AUTH_TOKEN
    else process.env.TWILIO_AUTH_TOKEN = prev.token
    if (prev.from === undefined) delete process.env.TWILIO_WHATSAPP_FROM
    else process.env.TWILIO_WHATSAPP_FROM = prev.from
  })

  beforeEach(() => {
    vi.clearAllMocks()
    validateRequestMock.mockReturnValue(true)
    handleInboundMock.mockResolvedValue({ handled: true, reply: 'ok' })
    process.env.TWILIO_ACCOUNT_SID = 'ACtest'
    process.env.TWILIO_AUTH_TOKEN = 'auth-token-test'
    process.env.TWILIO_WHATSAPP_FROM = '+14155550100'
  })

  it('returns 503 when Twilio is not configured', async () => {
    delete process.env.TWILIO_ACCOUNT_SID
    delete process.env.TWILIO_AUTH_TOKEN
    delete process.env.TWILIO_WHATSAPP_FROM
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/webhooks/twilio/whatsapp')
      .type('form')
      .send({ From: 'whatsapp:+5491155551234', Body: 'saldo' })
    expect(res.status).toBe(503)
    expect(res.body.error).toMatch(/Twilio/i)
    expect(handleInboundMock).not.toHaveBeenCalled()
  })

  it('returns 403 when Twilio signature is invalid', async () => {
    validateRequestMock.mockReturnValue(false)
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/webhooks/twilio/whatsapp')
      .set('X-Twilio-Signature', 'bad')
      .type('form')
      .send({ From: 'whatsapp:+5491155551234', Body: 'saldo' })
    expect(res.status).toBe(403)
    expect(handleInboundMock).not.toHaveBeenCalled()
  })

  it('returns 200 and invokes bot when signature is valid', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/webhooks/twilio/whatsapp')
      .set('X-Twilio-Signature', 'valid')
      .type('form')
      .send({ From: 'whatsapp:+5491155551234', Body: 'saldo' })
    expect(res.status).toBe(200)
    expect(handleInboundMock).toHaveBeenCalledWith({
      fromRaw: 'whatsapp:+5491155551234',
      body: 'saldo',
    })
  })
})
