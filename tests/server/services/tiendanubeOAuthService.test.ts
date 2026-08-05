/**
 * @en Unit tests for Tiendanube OAuth state and config service (#187).
 * @es Tests unitarios de state OAuth Tiendanube y servicio de config (#187).
 * @pt-BR Testes unitários de state OAuth Tiendanube e serviço de config (#187).
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { encryptFiscalSecret } from '../../../apps/server/fiscal/ar/fiscalSecrets'
import {
  buildTiendanubeAuthorizeUrl,
  resolveTiendanubeAppCredentials,
  resolveTiendanubeUserAgent,
  TiendanubeApiError,
} from '../../../apps/server/integrations/tiendanube/tiendanubeOAuthClient'
import {
  signTiendanubeOAuthState,
  verifyTiendanubeOAuthState,
} from '../../../apps/server/integrations/tiendanube/tiendanubeOAuthState'
import { TiendanubeConfigService } from '../../../apps/server/services/TiendanubeConfigService'
import { TiendanubeOAuthService } from '../../../apps/server/services/TiendanubeOAuthService'

describe('tiendanubeOAuthState', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-tiendanube-oauth'
  })

  it('signs and verifies state', () => {
    const state = signTiendanubeOAuthState(7, 42)
    const payload = verifyTiendanubeOAuthState(state)
    expect(payload).toMatchObject({ tenantId: 7, userId: 42 })
    expect(typeof payload?.nonce).toBe('string')
    expect(payload?.exp).toBeGreaterThan(Date.now())
  })

  it('rejects invalid and expired state', () => {
    expect(verifyTiendanubeOAuthState('not-valid')).toBeNull()
    expect(verifyTiendanubeOAuthState(encryptFiscalSecret('{"tenantId":"x"}'))).toBeNull()
    expect(
      verifyTiendanubeOAuthState(
        encryptFiscalSecret(
          JSON.stringify({
            tenantId: 1,
            userId: 2,
            nonce: 'abc',
            exp: Date.now() - 1000,
          }),
        ),
      ),
    ).toBeNull()
  })
})

describe('tiendanubeOAuthClient helpers', () => {
  it('resolves credentials and user agent from env', () => {
    process.env.TIENDANUBE_CLIENT_ID = 'app-id'
    process.env.TIENDANUBE_CLIENT_SECRET = 'app-secret'
    process.env.TIENDANUBE_USER_AGENT = 'BizCode-Test/1.0'
    const creds = resolveTiendanubeAppCredentials()
    expect(creds.clientId).toBe('app-id')
    expect(creds.clientSecret).toBe('app-secret')
    expect(resolveTiendanubeUserAgent()).toBe('BizCode-Test/1.0')
    expect(buildTiendanubeAuthorizeUrl('app-id', 'state-1')).toContain('/apps/app-id/authorize')
  })

  it('throws when credentials missing', () => {
    delete process.env.TIENDANUBE_CLIENT_ID
    delete process.env.TIENDANUBE_CLIENT_SECRET
    expect(() => resolveTiendanubeAppCredentials()).toThrow(TiendanubeApiError)
  })
})

describe('TiendanubeConfigService', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-tiendanube-oauth'
  })

  it('getStatus never exposes encrypted tokens', async () => {
    const prisma = {
      tiendanubeConfig: {
        findUnique: vi.fn().mockResolvedValue({
          storeId: '817495',
          storeName: 'Demo',
          storeUrl: 'https://demo.mitiendanube.com',
          accessTokenLast4: 'abcd',
          activo: true,
          conectadoAt: new Date('2026-08-01T10:00:00.000Z'),
        }),
      },
    } as unknown as PrismaClient

    const status = await new TiendanubeConfigService(prisma).getStatus(1)
    expect(status.connected).toBe(true)
    expect(status).not.toHaveProperty('accessTokenEncrypted')
    expect(JSON.stringify(status)).not.toMatch(/encrypt|Bearer/i)
  })

  it('returns disconnected when config missing', async () => {
    const prisma = {
      tiendanubeConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    } as unknown as PrismaClient
    await expect(new TiendanubeConfigService(prisma).getStatus(1)).resolves.toEqual({
      connected: false,
    })
  })

  it('upserts tokens, decrypts, disconnects and checks active', async () => {
    const upsert = vi.fn().mockResolvedValue({})
    const deleteMany = vi.fn().mockResolvedValue({ count: 1 })
    const findUnique = vi
      .fn()
      .mockResolvedValueOnce({
        storeId: '817495',
        accessTokenEncrypted: encryptFiscalSecret('access-token-9999'),
      })
      .mockResolvedValueOnce({ activo: true })
      .mockResolvedValueOnce(null)

    const prisma = {
      tiendanubeConfig: { upsert, findUnique, deleteMany },
    } as unknown as PrismaClient
    const svc = new TiendanubeConfigService(prisma)

    await svc.upsertTokens(1, {
      storeId: '817495',
      accessToken: 'access-token-9999',
      storeName: ' Demo ',
      storeUrl: ' https://demo.mitiendanube.com ',
    })
    expect(upsert).toHaveBeenCalledOnce()
    expect(upsert.mock.calls[0][0].create.accessTokenLast4).toBe('9999')

    const token = await svc.getDecryptedToken(1)
    expect(token).toEqual({
      ok: true,
      data: { accessToken: 'access-token-9999', storeId: '817495' },
    })
    await expect(svc.isConnectedAndActive(1)).resolves.toBe(true)
    await svc.deleteConfig(1)
    expect(deleteMany).toHaveBeenCalledWith({ where: { tenantId: 1 } })
    await expect(svc.getDecryptedToken(1)).resolves.toMatchObject({ ok: false, status: 404 })
  })
})

describe('TiendanubeOAuthService', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-for-tiendanube-oauth'
    process.env.TIENDANUBE_CLIENT_ID = 'app-id'
    process.env.TIENDANUBE_CLIENT_SECRET = 'app-secret'
  })

  it('builds authorize URL', () => {
    const prisma = {} as PrismaClient
    const result = new TiendanubeOAuthService(prisma).buildAuthorizeUrl(3, 9)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.authorizationUrl).toContain('/apps/app-id/authorize')
      expect(result.data.authorizationUrl).toContain('state=')
    }
  })

  it('rejects invalid callback state', async () => {
    const prisma = {} as PrismaClient
    const result = await new TiendanubeOAuthService(prisma).handleCallback('code', 'bad-state')
    expect(result).toEqual({ ok: false, status: 400, error: 'Invalid or expired OAuth state' })
  })

  it('disconnects when connected', async () => {
    const prisma = {
      tiendanubeConfig: {
        findUnique: vi.fn().mockResolvedValue({
          storeId: '817495',
          accessTokenEncrypted: encryptFiscalSecret('tok'),
        }),
        deleteMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    } as unknown as PrismaClient
    const result = await new TiendanubeOAuthService(prisma).disconnect(1)
    expect(result).toEqual({ ok: true, data: { disconnected: true } })
  })

  it('disconnect fails when not connected', async () => {
    const prisma = {
      tiendanubeConfig: { findUnique: vi.fn().mockResolvedValue(null) },
    } as unknown as PrismaClient
    const result = await new TiendanubeOAuthService(prisma).disconnect(1)
    expect(result.ok).toBe(false)
  })
})
