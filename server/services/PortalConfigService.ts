import type { PortalConfig, PrismaClient } from '@prisma/client'
import type { PortalBrandingDto } from '../portal/portalTypes'

export type PortalConfigInput = {
  enabled?: boolean
  showPedidos?: boolean
  logoUrl?: string | null
  primaryColor?: string | null
  footerText?: string | null
}

export type PortalConfigDto = {
  enabled: boolean
  showPedidos: boolean
  logoUrl: string | null
  primaryColor: string | null
  footerText: string | null
}

function toDto(row: PortalConfig): PortalConfigDto {
  return {
    enabled: row.enabled,
    showPedidos: row.showPedidos,
    logoUrl: row.logoUrl,
    primaryColor: row.primaryColor,
    footerText: row.footerText,
  }
}

/**
 * @en Tenant portal branding and feature toggles (#240).
 * @es Configuración de branding y secciones del portal por tenant (#240).
 * @pt-BR Configuração de branding e seções do portal por tenant (#240).
 */
export class PortalConfigService {
  constructor(private readonly prisma: PrismaClient) {}

  async getOrCreate(tenantId: number): Promise<PortalConfigDto> {
    const row = await this.prisma.portalConfig.upsert({
      where: { tenantId },
      create: { tenantId },
      update: {},
    })
    return toDto(row)
  }

  async update(tenantId: number, input: PortalConfigInput): Promise<PortalConfigDto> {
    const row = await this.prisma.portalConfig.upsert({
      where: { tenantId },
      create: {
        tenantId,
        enabled: input.enabled ?? false,
        showPedidos: input.showPedidos ?? true,
        logoUrl: input.logoUrl ?? null,
        primaryColor: input.primaryColor ?? null,
        footerText: input.footerText ?? null,
      },
      update: {
        ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
        ...(input.showPedidos !== undefined ? { showPedidos: input.showPedidos } : {}),
        ...(input.logoUrl !== undefined ? { logoUrl: input.logoUrl } : {}),
        ...(input.primaryColor !== undefined ? { primaryColor: input.primaryColor } : {}),
        ...(input.footerText !== undefined ? { footerText: input.footerText } : {}),
      },
    })
    return toDto(row)
  }

  async getBrandingForSlug(
    tenantSlug: string,
  ): Promise<{ tenantId: number; tenantName: string; branding: PortalBrandingDto } | null> {
    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      include: { portalConfig: true },
    })
    if (!tenant || !tenant.active) {
      return null
    }
    const config = tenant.portalConfig ?? {
      enabled: false,
      showPedidos: true,
      logoUrl: null,
      primaryColor: null,
      footerText: null,
    }
    return {
      tenantId: tenant.id,
      tenantName: tenant.name,
      branding: {
        tenantName: tenant.name,
        tenantSlug: tenant.slug,
        enabled: config.enabled,
        showPedidos: config.showPedidos,
        logoUrl: config.logoUrl,
        primaryColor: config.primaryColor,
        footerText: config.footerText,
      },
    }
  }
}
