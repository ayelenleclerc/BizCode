import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../default-client', () => ({
  api: {
    post: vi.fn(),
  },
}))

import { api } from '../default-client'
import { createVoiceAPI } from './voice'

describe('createVoiceAPI (#266)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('posts multipart transcribe and returns text', async () => {
    vi.mocked(api.post).mockResolvedValue({
      data: { success: true, data: { text: 'three boxes' } },
    })
    const client = createVoiceAPI(api as never)
    const text = await client.transcribe({ uri: 'file://clip.m4a', name: 'clip.m4a', type: 'audio/mp4' }, 'en')
    expect(text).toBe('three boxes')
    expect(api.post).toHaveBeenCalled()
  })

  it('propagates handleError when the request fails', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('network'))
    const client = createVoiceAPI(api as never)
    await expect(
      client.transcribe({ uri: 'file://clip.m4a', name: 'clip.m4a', type: 'audio/mp4' }),
    ).rejects.toBeTruthy()
  })
})
