import { beforeEach, describe, expect, it, vi } from 'vitest'
import { revokeAllTenantAuthTokens } from '../../../apps/server/lib/sessionTokens'
import type { PrismaClient } from '@prisma/client'

vi.mock('../../../apps/server/lib/refreshTokenBlacklist', () => ({
  getRefreshTokenBlacklist: () => ({
    add: vi.fn().mockResolvedValue(undefined),
  }),
}))

describe('revokeAllTenantAuthTokens (#222)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('revokes sessions and refresh tokens for all tenant users', async () => {
    const updateManySession = vi.fn().mockResolvedValue({ count: 2 })
    const updateManyRefresh = vi.fn().mockResolvedValue({ count: 2 })
    const prisma = {
      appUser: {
        findMany: vi.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]),
      },
      appRefreshToken: {
        findMany: vi.fn().mockResolvedValue([
          { tokenHash: 'a', expiresAt: new Date(Date.now() + 60_000) },
        ]),
        updateMany: updateManyRefresh,
      },
      appSession: {
        updateMany: updateManySession,
      },
      $transaction: vi.fn().mockImplementation(async (ops: unknown[]) => Promise.all(ops)),
    } as unknown as PrismaClient

    const count = await revokeAllTenantAuthTokens(prisma, 7)
    expect(count).toBe(2)
    expect(prisma.appUser.findMany).toHaveBeenCalledWith({
      where: { tenantId: 7 },
      select: { id: true },
    })
    expect(updateManySession).toHaveBeenCalled()
    expect(updateManyRefresh).toHaveBeenCalled()
  })

  it('returns 0 when tenant has no users', async () => {
    const prisma = {
      appUser: { findMany: vi.fn().mockResolvedValue([]) },
    } as unknown as PrismaClient
    await expect(revokeAllTenantAuthTokens(prisma, 9)).resolves.toBe(0)
  })
})
