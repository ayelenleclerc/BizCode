import { describe, expect, it, vi } from 'vitest'
import { assertNoControlLoteArticles } from '../../../apps/server/lib/controlLoteGuard'

describe('assertNoControlLoteArticles (#202)', () => {
  it('allows empty id list', async () => {
    const prisma = { articulo: { findFirst: vi.fn() } }
    const result = await assertNoControlLoteArticles(prisma as never, 1, [])
    expect(result.ok).toBe(true)
    expect(prisma.articulo.findFirst).not.toHaveBeenCalled()
  })

  it('returns LOT_CONTROL_UNSUPPORTED when a controlled article is present', async () => {
    const prisma = {
      articulo: {
        findFirst: vi.fn().mockResolvedValue({ id: 9, codigo: 100, controlLote: true }),
      },
    }
    const result = await assertNoControlLoteArticles(prisma as never, 1, [9, 10])
    expect(result).toEqual({ ok: false, status: 422, error: 'LOT_CONTROL_UNSUPPORTED' })
  })

  it('passes when no controlled articles match', async () => {
    const prisma = {
      articulo: {
        findFirst: vi.fn().mockResolvedValue(null),
      },
    }
    const result = await assertNoControlLoteArticles(prisma as never, 1, [1, 2])
    expect(result.ok).toBe(true)
  })
})
