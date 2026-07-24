import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchBcraUsdOficial } from '../../../apps/server/integrations/bcraTipoCambio'

describe('fetchBcraUsdOficial (#243)', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('returns the latest positive BCRA rate', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          results: [
            { fecha: '2026-07-20', valor: 1200 },
            { fecha: '2026-07-24', valor: '1250.5' },
          ],
        }),
      }),
    )

    const result = await fetchBcraUsdOficial(new Date('2026-07-24T15:00:00.000Z'))
    expect(result.valor).toBe(1250.5)
    expect(result.rawFecha).toBe('2026-07-24')
    expect(result.fecha.toISOString()).toContain('2026-07-24')
  })

  it('throws on HTTP failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      }),
    )
    await expect(fetchBcraUsdOficial()).rejects.toThrow(/BCRA API HTTP 503/)
  })

  it('throws when results are empty', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      }),
    )
    await expect(fetchBcraUsdOficial()).rejects.toThrow(/no rates/)
  })

  it('throws when rate value is invalid', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [{ fecha: '2026-07-24', valor: 0 }] }),
      }),
    )
    await expect(fetchBcraUsdOficial()).rejects.toThrow(/invalid rate/)
  })
})
