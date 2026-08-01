/**
 * @en Unit tests for Mercado Libre OAuth state signing and config service (#183).
 * @es Tests unitarios de firma state OAuth ML y servicio de config (#183).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { encryptFiscalSecret } from '../../../apps/server/fiscal/ar/fiscalSecrets'
import { signMeliOAuthState, verifyMeliOAuthState } from '../../../apps/server/integrations/meli/meliOAuthState'
import { MeliConfigService } from '../../../apps/server/services/MeliConfigService'
import { MeliOAuthService } from '../../../apps/server/services/MeliOAuthService'

vi.mock('../../../apps/server/integrations/meli/meliOAuthClient', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../../apps/server/integrations/meli/meliOAuthClient')>()
  return {
    ...actual,
    refreshMeliAccessToken: vi.fn(),
  }
})

import { refreshMeliAccessToken } from '../../../apps/server/integrations/meli/meliOAuthClient'

describe('meliOAuthState', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-meli-oauth'
  })

  it('signs and verifies state', () => {
    const state = signMeliOAuthState(7, 42)
    const payload = verifyMeliOAuthState(state)
    expect(payload).toMatchObject({ tenantId: 7, userId: 42 })
  })

  it('rejects tampered state', () => {
    const state = signMeliOAuthState(1, 1)
    // Node Buffer base64 decode ignores some trailing junk; flip bytes in the middle instead.
    const mid = Math.floor(state.length / 2)
    const tampered = `${state.slice(0, mid)}XXXX${state.slice(mid + 4)}`
    expect(verifyMeliOAuthState(tampered)).toBeNull()
    expect(verifyMeliOAuthState('not-valid')).toBeNull()
  })
})

describe('MeliConfigService', () => {
  it('getStatus never exposes encrypted tokens', async () => {
    const prisma = {
      meliConfig: {
        findUnique: vi.fn().mockResolvedValue({
          meliUserId: '9',
          sellerId: '9',
          sitio: 'MLA',
          nickname: 'NICK',
          tokenExpiresAt: new Date('2026-08-01T12:00:00.000Z'),
          accessTokenLast4: 'abcd',
          activo: true,
          conectadoAt: new Date('2026-08-01T10:00:00.000Z'),
        }),
      },
    } as unknown as PrismaClient

    const status = await new MeliConfigService(prisma).getStatus(1)
    expect(status.connected).toBe(true)
    expect(status).not.toHaveProperty('accessTokenEncrypted')
    expect(status).not.toHaveProperty('refreshTokenEncrypted')
    expect(JSON.stringify(status)).not.toMatch(/encrypt|Bearer/i)
  })
})

describe('MeliOAuthService.refreshTenantIfNeeded', () => {
  beforeEach(() => {
    process.env.MELI_CLIENT_ID = 'app'
    process.env.MELI_CLIENT_SECRET = 'secret'
    vi.mocked(refreshMeliAccessToken).mockReset()
  })

  it('refreshes and rotates tokens when near expiry', async () => {
    const upsert = vi.fn().mockResolvedValue({})
    const prisma = {
      meliConfig: {
        findUnique: vi.fn().mockResolvedValue({
          tenantId: 1,
          meliUserId: '55',
          sellerId: '55',
          sitio: 'MLA',
          nickname: 'N',
          activo: true,
          tokenExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
          accessTokenEncrypted: encryptFiscalSecret('old-access'),
          refreshTokenEncrypted: encryptFiscalSecret('old-refresh'),
          accessTokenLast4: 'cess',
        }),
        upsert,
      },
    } as unknown as PrismaClient

    vi.mocked(refreshMeliAccessToken).mockResolvedValue({
      access_token: 'new-access-9999',
      token_type: 'bearer',
      expires_in: 21600,
      user_id: 55,
      refresh_token: 'new-refresh',
    })

    const result = await new MeliOAuthService(prisma).refreshTenantIfNeeded(1, true)
    expect(result.refreshed).toBe(true)
    expect(upsert).toHaveBeenCalledOnce()
  })
})
