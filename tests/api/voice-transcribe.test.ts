import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import request from 'supertest'
import type { PrismaClient } from '@prisma/client'
import { createApp } from '../../apps/server/createApp'
import { assertMatchesOpenApi } from './validate-openapi-response'

vi.mock('../../apps/server/lib/whisperTranscribe', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../apps/server/lib/whisperTranscribe')>()
  return {
    ...actual,
    transcribeAudioWithWhisper: vi.fn(),
  }
})

import { transcribeAudioWithWhisper } from '../../apps/server/lib/whisperTranscribe'

function buildPrismaMock(): PrismaClient {
  return {
    tenant: { findUnique: vi.fn().mockResolvedValue({ id: 1, slug: 'demo', name: 'Acme SA', active: true }) },
    appUser: { findFirst: vi.fn().mockResolvedValue(null) },
    appSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      update: vi.fn().mockResolvedValue({ id: 1 }),
    },
    $queryRawUnsafe: vi.fn().mockResolvedValue([{ ok: 1 }]),
  } as unknown as PrismaClient
}

describe('POST /api/voice/transcribe (#266)', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    process.env.BIZCODE_TEST_AUTH_BYPASS = 'true'
    process.env.BIZCODE_TEST_ROLE = 'seller'
    delete process.env.OPENAI_API_KEY
    vi.mocked(transcribeAudioWithWhisper).mockReset()
  })

  afterEach(() => {
    delete process.env.OPENAI_API_KEY
  })

  it('returns 503 when OPENAI_API_KEY is missing', async () => {
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/voice/transcribe')
      .attach('file', Buffer.from('audio-bytes'), { filename: 'clip.m4a', contentType: 'audio/mp4' })
    expect(res.status).toBe(503)
    expect(res.body.error).toMatch(/not configured/i)
  })

  it('returns transcript text and matches OpenAPI', async () => {
    process.env.OPENAI_API_KEY = 'sk-test'
    vi.mocked(transcribeAudioWithWhisper).mockResolvedValue('tres cajas de aceite')
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/voice/transcribe')
      .field('locale', 'es')
      .attach('file', Buffer.from('audio-bytes'), { filename: 'clip.m4a', contentType: 'audio/mp4' })
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true, data: { text: 'tres cajas de aceite' } })
    await assertMatchesOpenApi('/api/voice/transcribe', 'post', '200', res.body)
  })

  it('returns 400 without file', async () => {
    process.env.OPENAI_API_KEY = 'sk-test'
    const app = createApp(buildPrismaMock())
    const res = await request(app).post('/api/voice/transcribe')
    expect(res.status).toBe(400)
  })

  it('returns 400 when the file is not audio', async () => {
    process.env.OPENAI_API_KEY = 'sk-test'
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/voice/transcribe')
      .attach('file', Buffer.from('not-audio'), { filename: 'note.txt', contentType: 'text/plain' })
    expect(res.status).toBe(400)
  })

  it('returns 502 when Whisper fails', async () => {
    process.env.OPENAI_API_KEY = 'sk-test'
    vi.mocked(transcribeAudioWithWhisper).mockRejectedValue(new Error('upstream'))
    const app = createApp(buildPrismaMock())
    const res = await request(app)
      .post('/api/voice/transcribe')
      .attach('file', Buffer.from('audio-bytes'), { filename: 'clip.m4a', contentType: 'audio/mp4' })
    expect(res.status).toBe(502)
  })
})
