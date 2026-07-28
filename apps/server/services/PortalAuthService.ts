import type { PrismaClient } from '@prisma/client'
import type { ServiceResult } from './serviceResults'
import {
  createPortalToken,
  hashPortalToken,
  portalTokenHashCandidates,
  PORTAL_MAGIC_LINK_TTL_MS,
  PORTAL_SESSION_DURATION_MS,
  resolvePortalPublicBaseUrl,
} from '../portal/portalTokens'
import { sendPortalMagicLinkEmail } from '../channels'
import type { PortalConfigService } from './PortalConfigService'

export type PortalMeDto = {
  clienteId: number
  codigo: number
  rsocial: string
  fantasia: string | null
  email: string | null
  telef: string | null
  domicilio: string | null
  localidad: string | null
  vendedor: { id: number; username: string } | null
}

export type PortalVerifyResult = {
  sessionToken: string
  me: PortalMeDto
}

/**
 * @en Magic-link authentication for the B2B customer portal (#240).
 * @es Autenticación por magic link para el portal B2B del cliente (#240).
 * @pt-BR Autenticação por magic link para o portal B2B do cliente (#240).
 */
export class PortalAuthService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly portalConfig: PortalConfigService,
  ) {}

  async requestMagicLink(tenantSlug: string, email: string): Promise<ServiceResult<{ sent: true }>> {
    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      return { ok: false, status: 400, error: 'email is required' }
    }

    const brandingResult = await this.portalConfig.getBrandingForSlug(tenantSlug)
    if (!brandingResult || !brandingResult.branding.enabled) {
      return { ok: true, data: { sent: true } }
    }

    const cliente = await this.prisma.cliente.findFirst({
      where: {
        tenantId: brandingResult.tenantId,
        activo: true,
        email: { equals: normalizedEmail, mode: 'insensitive' },
      },
    })
    if (!cliente?.email) {
      return { ok: true, data: { sent: true } }
    }

    const token = createPortalToken()
    const tokenHash = hashPortalToken(token)
    const expiresAt = new Date(Date.now() + PORTAL_MAGIC_LINK_TTL_MS)

    await this.prisma.portalMagicLink.create({
      data: {
        tenantId: brandingResult.tenantId,
        clienteId: cliente.id,
        tokenHash,
        expiresAt,
      },
    })

    const verifyUrl = `${resolvePortalPublicBaseUrl()}/portal/${tenantSlug}/auth/verify?token=${encodeURIComponent(token)}`
    await sendPortalMagicLinkEmail(cliente.email, brandingResult.tenantName, verifyUrl)

    return { ok: true, data: { sent: true } }
  }

  async verifyMagicLink(
    tenantSlug: string,
    token: string,
  ): Promise<ServiceResult<PortalVerifyResult>> {
    const brandingResult = await this.portalConfig.getBrandingForSlug(tenantSlug)
    if (!brandingResult || !brandingResult.branding.enabled) {
      return { ok: false, status: 404, error: 'Portal not available' }
    }

    const tokenHashCandidates = portalTokenHashCandidates(token.trim())
    const link = await this.prisma.portalMagicLink.findFirst({
      where: {
        tenantId: brandingResult.tenantId,
        tokenHash: { in: tokenHashCandidates },
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { cliente: true },
    })
    if (!link || !link.cliente.activo) {
      return { ok: false, status: 401, error: 'Invalid or expired token' }
    }

    const sessionToken = createPortalToken()
    const sessionHash = hashPortalToken(sessionToken)
    const expiresAt = new Date(Date.now() + PORTAL_SESSION_DURATION_MS)

    await this.prisma.$transaction([
      this.prisma.portalMagicLink.update({
        where: { id: link.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.portalSession.create({
        data: {
          tenantId: brandingResult.tenantId,
          clienteId: link.clienteId,
          tokenHash: sessionHash,
          expiresAt,
        },
      }),
    ])

    const me = await this.buildMeDto(brandingResult.tenantId, link.clienteId)
    if (!me) {
      return { ok: false, status: 404, error: 'Cliente not found' }
    }

    return { ok: true, data: { sessionToken, me } }
  }

  async getMe(tenantId: number, clienteId: number): Promise<PortalMeDto | null> {
    return this.buildMeDto(tenantId, clienteId)
  }

  async logout(sessionId: number): Promise<void> {
    await this.prisma.portalSession.updateMany({
      where: { id: sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    })
  }

  private async buildMeDto(tenantId: number, clienteId: number): Promise<PortalMeDto | null> {
    const cliente = await this.prisma.cliente.findFirst({
      where: { id: clienteId, tenantId, activo: true },
    })
    if (!cliente) {
      return null
    }

    const lastPedido = await this.prisma.pedido.findFirst({
      where: { tenantId, clienteId, vendedorId: { not: null } },
      orderBy: { createdAt: 'desc' },
      include: { vendedor: { select: { id: true, username: true } } },
    })

    return {
      clienteId: cliente.id,
      codigo: cliente.codigo,
      rsocial: cliente.rsocial,
      fantasia: cliente.fantasia,
      email: cliente.email,
      telef: cliente.telef,
      domicilio: cliente.domicilio,
      localidad: cliente.localidad,
      vendedor: lastPedido?.vendedor ?? null,
    }
  }
}
