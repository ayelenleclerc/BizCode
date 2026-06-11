import type { NextFunction, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import {
  getCookieValue,
  hashPortalToken,
  PORTAL_SESSION_COOKIE_NAME,
} from '../portal/portalTokens'
import type { PortalRequest } from '../portal/portalTypes'

/**
 * @en Loads portal customer session from cookie when present (#240).
 * @es Carga sesión del cliente del portal desde cookie si existe (#240).
 * @pt-BR Carrega sessão do cliente do portal a partir do cookie quando presente (#240).
 */
export function resolvePortalSession(prisma: PrismaClient) {
  return async (req: PortalRequest, _res: Response, next: NextFunction): Promise<void> => {
    if (!req.portalTenant) {
      next()
      return
    }

    if (process.env.NODE_ENV === 'test') {
      const bypassClienteId = process.env.BIZCODE_TEST_PORTAL_CLIENTE_ID?.trim()
      if (bypassClienteId) {
        const portalClienteId = Number.parseInt(bypassClienteId, 10)
        if (Number.isInteger(portalClienteId) && portalClienteId > 0) {
          req.portalAuth = {
            tenantId: req.portalTenant.tenantId,
            tenantSlug: req.portalTenant.tenantSlug,
            portalClienteId,
          }
          next()
          return
        }
      }
    }

    const token = getCookieValue(req.headers.cookie, PORTAL_SESSION_COOKIE_NAME)
    if (!token) {
      next()
      return
    }

    const tokenHash = hashPortalToken(token)
    const session = await prisma.portalSession.findFirst({
      where: {
        tokenHash,
        tenantId: req.portalTenant.tenantId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { cliente: true },
    })
    if (!session || !session.cliente.activo) {
      next()
      return
    }

    req.portalAuth = {
      tenantId: session.tenantId,
      tenantSlug: req.portalTenant.tenantSlug,
      portalClienteId: session.clienteId,
      sessionId: session.id,
    }

    await prisma.portalSession.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    })
    next()
  }
}

export function requirePortalAuth(req: PortalRequest, res: Response, next: NextFunction): void {
  if (!req.portalAuth) {
    res.status(401).json({ success: false, error: 'Portal authentication required' })
    return
  }
  next()
}
