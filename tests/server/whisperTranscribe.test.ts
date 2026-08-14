import { describe, expect, it, vi } from 'vitest'
import {
  isOpenAiConfigured,
  transcribeAudioWithWhisper,
  OPENAI_TRANSCRIPTIONS_URL,
} from '../../apps/server/lib/whisperTranscribe'

describe('whisperTranscribe (#266)', () => {
  it('isOpenAiConfigured requires a non-empty key', () => {
    expect(isOpenAiConfigured({} as NodeJS.ProcessEnv)).toBe(false)
    expect(isOpenAiConfigured({ OPENAI_API_KEY: '  ' } as NodeJS.ProcessEnv)).toBe(false)
    expect(isOpenAiConfigured({ OPENAI_API_KEY: 'sk-test' } as NodeJS.ProcessEnv)).toBe(true)
  })

  it('posts multipart to Whisper and returns text', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ text: '  tres cajas  ' }),
    })
    const text = await transcribeAudioWithWhisper({
      buffer: Buffer.from('audio'),
      filename: 'clip.m4a',
      mime: 'audio/mp4',
      apiKey: 'sk-test',
      locale: 'es-AR',
      fetchImpl: fetchImpl as unknown as typeof fetch,
    })
    expect(text).toBe('tres cajas')
    expect(fetchImpl).toHaveBeenCalledWith(
      OPENAI_TRANSCRIPTIONS_URL,
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('throws on Whisper HTTP errors', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'invalid key' } }),
    })
    await expect(
      transcribeAudioWithWhisper({
        buffer: Buffer.from('x'),
        filename: 'a.m4a',
        mime: 'audio/mp4',
        apiKey: 'bad',
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toThrow('invalid key')
  })

  it('throws when Whisper returns empty text', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ text: '   ' }),
    })
    await expect(
      transcribeAudioWithWhisper({
        buffer: Buffer.from('x'),
        filename: 'a.m4a',
        mime: 'audio/mp4',
        apiKey: 'sk',
        locale: 'fr',
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toThrow('empty text')
  })

  it('throws a status message when Whisper error has no message', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 429,
      json: async () => ({}),
    })
    await expect(
      transcribeAudioWithWhisper({
        buffer: Buffer.from('x'),
        filename: 'a.m4a',
        mime: 'audio/mp4',
        apiKey: 'sk',
        fetchImpl: fetchImpl as unknown as typeof fetch,
      }),
    ).rejects.toThrow('Whisper HTTP 429')
  })
})
