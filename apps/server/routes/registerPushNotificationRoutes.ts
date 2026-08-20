import type { Application, Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import { type AuthenticatedRequest } from '../auth'
import { writeAuditEvent } from '../audit'
import {
  getMuteablePushTypesForRole,
  isMuteablePushType,
} from '../services/mobilePushDelivery'

/**
 * @en Registers authenticated user's push token and mute preference routes (#172).
 * @es Registra rutas de token push y preferencias de silencio del usuario (#172).
 * @pt-BR Registra rotas de token push e preferências de silêncio do usuário (#172).
 */
export function registerPushNotificationRoutes(app: Application, prisma: PrismaClient): void {
  app.post('/api/users/me/push-token', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    if (!authReq.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    const body = (req.body ?? {}) as { token?: unknown; platform?: unknown }
    const token = typeof body.token === 'string' ? body.token.trim() : ''
    if (token.length < 8 || token.length > 255) {
      res.status(400).json({ success: false, error: 'token must be between 8 and 255 characters' })
      return
    }
    const platform =
      typeof body.platform === 'string' && body.platform.trim().length > 0
        ? body.platform.trim().slice(0, 20)
        : null

    const tenantId = authReq.auth.claims.tenantId
    const userId = authReq.auth.claims.userId

    try {
      const row = await prisma.devicePushToken.upsert({
        where: { token },
        create: { tenantId, userId, token, platform },
        update: { tenantId, userId, platform, updatedAt: new Date() },
      })
      await writeAuditEvent({
        prisma,
        tenantId,
        userId,
        action: 'push_token_register',
        resource: 'device_push_token',
        resourceId: String(row.id),
        ipAddress: req.ip,
      })
      res.status(200).json({
        success: true,
        data: { token: row.token, platform: row.platform },
      })
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  })

  app.delete('/api/users/me/push-token', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    if (!authReq.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    const body = (req.body ?? {}) as { token?: unknown }
    const token = typeof body.token === 'string' ? body.token.trim() : ''
    if (token.length < 8) {
      res.status(400).json({ success: false, error: 'token is required' })
      return
    }

    const tenantId = authReq.auth.claims.tenantId
    const userId = authReq.auth.claims.userId

    try {
      const result = await prisma.devicePushToken.deleteMany({
        where: { token, tenantId, userId },
      })
      res.json({ success: true, data: { deleted: result.count } })
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  })

  app.get('/api/users/me/push-preferences', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    if (!authReq.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    const tenantId = authReq.auth.claims.tenantId
    const userId = authReq.auth.claims.userId
    const role = authReq.auth.claims.role
    const muteableTypes = getMuteablePushTypesForRole(role)
    try {
      const row = await prisma.pushNotificationPreference.findUnique({
        where: { tenantId_userId: { tenantId, userId } },
      })
      res.json({
        success: true,
        data: {
          mutedTypes: row?.mutedTypes ?? [],
          muteableTypes: [...muteableTypes],
        },
      })
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  })

  app.put('/api/users/me/push-preferences', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    if (!authReq.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    const body = (req.body ?? {}) as { mutedTypes?: unknown }
    if (!Array.isArray(body.mutedTypes)) {
      res.status(400).json({ success: false, error: 'mutedTypes must be an array' })
      return
    }
    const tenantId = authReq.auth.claims.tenantId
    const userId = authReq.auth.claims.userId
    const role = authReq.auth.claims.role
    const muteableTypes = getMuteablePushTypesForRole(role)

    const mutedTypes: string[] = []
    for (const raw of body.mutedTypes) {
      if (typeof raw !== 'string' || !isMuteablePushType(raw, role)) {
        res.status(400).json({
          success: false,
          error: `invalid muted type: ${String(raw)}`,
        })
        return
      }
      if (!mutedTypes.includes(raw)) {
        mutedTypes.push(raw)
      }
    }

    try {
      const row = await prisma.pushNotificationPreference.upsert({
        where: { tenantId_userId: { tenantId, userId } },
        create: { tenantId, userId, mutedTypes },
        update: { mutedTypes },
      })
      res.json({
        success: true,
        data: {
          mutedTypes: row.mutedTypes,
          muteableTypes: [...muteableTypes],
        },
      })
    } catch (err: unknown) {
      res.status(500).json({
        success: false,
        error: err instanceof Error ? err.message : String(err),
      })
    }
  })
}
