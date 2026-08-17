import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../default-client', () => ({
  api: {
    get: vi.fn(),
  },
}))

import { api } from '../default-client'
import { createRepartosAPI } from './repartos'

describe('createRepartosAPI (#160)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getMiReparto calls GET /repartos/mi-reparto', async () => {
    vi.mocked(api.get).mockResolvedValue({
      data: { success: true, data: { id: 1, choferId: 2, items: [] } },
    })
    const client = createRepartosAPI(api as never)
    const row = await client.getMiReparto({ fecha: '2026-05-20' })
    expect(row?.id).toBe(1)
    expect(api.get).toHaveBeenCalledWith('/repartos/mi-reparto', { params: { fecha: '2026-05-20' } })
  })
})
