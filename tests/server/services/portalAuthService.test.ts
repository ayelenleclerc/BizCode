import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { PortalAuthService } from '../../../server/services/PortalAuthService'
import { PortalConfigService } from '../../../server/services/PortalConfigService'
import { initializeAppConfig, resetAppConfigCache } from '../../../server/config/env'
import { createPortalToken, hashPortalToken } from '../../../server/portal/portalTokens'

vi.mock('../../../server/channels', () => ({
  sendPortalMagicLinkEmail: vi.fn().mockResolvedValue(undefined),
}))

import { sendPortalMagicLinkEmail } from '../../../server/channels'

function buildPrisma(): PrismaClient {
  return {
    cliente: {
      findFirst: vi.fn().mockResolvedValue({
        id: 10,
        email: 'cliente@example.com',
        activo: true,
        codigo: 1,
        rsocial: 'Cliente SA',
        fantasia: null,
        telef: null,
        domicilio: null,
        localidad: null,
      }),
    },
    portalMagicLink: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    portalSession: {
      create: vi.fn().mockResolvedValue({ id: 1 }),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    pedido: {
      findFirst: vi.fn().mockResolvedValue(null),
    },
    $transaction: vi.fn(async (ops: unknown[]) => {
      for (const op of ops) {
        await op
      }
    }),
  } as unknown as PrismaClient
}

function buildPortalConfig(): PortalConfigService {
  return {
    getBrandingForSlug: vi.fn().mockResolvedValue({
      tenantId: 1,
      tenantName: 'Demo SA',
      branding: { enabled: true, showPedidos: true, logoUrl: null, primaryColor: null, footerText: null },
    }),
  } as unknown as PortalConfigService
}

describe('PortalAuthService', () => {
  beforeEach(() => {
    resetAppConfigCache()
    process.env.NODE_ENV = 'test'
    process.env.JWT_SECRET = 'portal-test-jwt-secret-32chars!!'
    initializeAppConfig()
    vi.mocked(sendPortalMagicLinkEmail).mockClear()
  })

  it('requestMagicLink rejects empty email', async () => {
    const service = new PortalAuthService(buildPrisma(), buildPortalConfig())
    const result = await service.requestMagicLink('demo', '   ')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.status).toBe(400)
    }
  })

  it('requestMagicLink returns sent for matching cliente', async () => {
    const service = new PortalAuthService(buildPrisma(), buildPortalConfig())
    const result = await service.requestMagicLink('demo', 'cliente@example.com')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.sent).toBe(true)
    }
    expect(sendPortalMagicLinkEmail).toHaveBeenCalled()
  })

  it('requestMagicLink anti-enumeration when email unknown', async () => {
    const prisma = buildPrisma()
    vi.mocked(prisma.cliente.findFirst).mockResolvedValueOnce(null)
    const service = new PortalAuthService(prisma, buildPortalConfig())
    const result = await service.requestMagicLink('demo', 'unknown@example.com')
    expect(result.ok).toBe(true)
    expect(sendPortalMagicLinkEmail).not.toHaveBeenCalled()
  })

  it('logout revokes active session', async () => {
    const prisma = buildPrisma()
    const service = new PortalAuthService(prisma, buildPortalConfig())
    await service.logout(99)
    expect(prisma.portalSession.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 99, revokedAt: null } }),
    )
  })

  it('verifyMagicLink creates session for valid token', async () => {
    const token = createPortalToken()
    const prisma = buildPrisma()
    vi.mocked(prisma.portalMagicLink.findFirst).mockResolvedValueOnce({
      id: 5,
      clienteId: 10,
      cliente: {
        id: 10,
        activo: true,
        codigo: 1,
        rsocial: 'Cliente SA',
        fantasia: null,
        email: 'cliente@example.com',
        telef: null,
        domicilio: null,
        localidad: null,
      },
    } as never)

    const service = new PortalAuthService(prisma, buildPortalConfig())
    const result = await service.verifyMagicLink('demo', token)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.me.rsocial).toBe('Cliente SA')
      expect(result.data.sessionToken).toHaveLength(64)
    }
    expect(hashPortalToken(token)).toHaveLength(64)
    expect(prisma.portalSession.create).toHaveBeenCalled()
  })
})
