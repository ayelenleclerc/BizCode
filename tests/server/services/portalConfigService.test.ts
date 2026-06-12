import { describe, expect, it, vi } from 'vitest'
import type { PrismaClient } from '@prisma/client'
import { PortalConfigService } from '../../../server/services/PortalConfigService'

function buildPrisma(): PrismaClient {
  const portalConfig = {
    upsert: vi.fn().mockResolvedValue({
      tenantId: 1,
      enabled: true,
      showPedidos: true,
      logoUrl: 'https://logo',
      primaryColor: '#111111',
      footerText: 'Footer',
    }),
  }
  const tenant = {
    findUnique: vi.fn().mockResolvedValue({
      id: 1,
      slug: 'demo',
      name: 'Demo SA',
      active: true,
      portalConfig: {
        enabled: true,
        showPedidos: false,
        logoUrl: null,
        primaryColor: '#2563eb',
        footerText: null,
      },
    }),
  }
  return { portalConfig, tenant } as unknown as PrismaClient
}

describe('PortalConfigService', () => {
  it('getOrCreate returns portal config dto', async () => {
    const prisma = buildPrisma()
    const service = new PortalConfigService(prisma)
    const dto = await service.getOrCreate(1)
    expect(dto.enabled).toBe(true)
    expect(dto.logoUrl).toBe('https://logo')
  })

  it('update upserts portal config fields', async () => {
    const prisma = buildPrisma()
    const service = new PortalConfigService(prisma)
    const dto = await service.update(1, { enabled: false, showPedidos: false })
    expect(prisma.portalConfig.upsert).toHaveBeenCalled()
    expect(dto.enabled).toBe(true)
  })

  it('getBrandingForSlug returns tenant branding when active', async () => {
    const prisma = buildPrisma()
    const service = new PortalConfigService(prisma)
    const branding = await service.getBrandingForSlug('demo')
    expect(branding?.tenantName).toBe('Demo SA')
    expect(branding?.branding.showPedidos).toBe(false)
  })

  it('getBrandingForSlug returns null for missing tenant', async () => {
    const prisma = buildPrisma()
    vi.mocked(prisma.tenant.findUnique).mockResolvedValueOnce(null)
    const service = new PortalConfigService(prisma)
    await expect(service.getBrandingForSlug('missing')).resolves.toBeNull()
  })

  it('getBrandingForSlug returns null for inactive tenant', async () => {
    const prisma = buildPrisma()
    vi.mocked(prisma.tenant.findUnique).mockResolvedValueOnce({
      id: 1,
      slug: 'demo',
      name: 'Demo SA',
      active: false,
      portalConfig: null,
    } as never)
    const service = new PortalConfigService(prisma)
    await expect(service.getBrandingForSlug('demo')).resolves.toBeNull()
  })
})
