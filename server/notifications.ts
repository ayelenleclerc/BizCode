import type { Application, Request, Response } from 'express'
import type { PrismaClient } from '@prisma/client'
import { type AuthenticatedRequest } from './auth'

export const NOTIFICATION_TYPES = [
  'credit_limit_exceeded',
  'invoice_overdue',
  'invoice_due_soon',
  'chat_message',
] as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export type NotificationPayload = {
  clienteId?: number
  facturaId?: number
  rsocial?: string
  amount?: string
  limit?: string
  messageId?: number
  fromUserId?: number
  preview?: string
}

/**
 * @en Creates a notification for a single recipient user.
 * @es Crea una notificación para un usuario destinatario específico.
 * @pt-BR Cria uma notificação para um usuário destinatário específico.
 */
export async function createNotification(
  prisma: PrismaClient,
  tenantId: number,
  userId: number,
  type: NotificationType,
  payload: NotificationPayload,
): Promise<void> {
  await prisma.notification.create({
    data: { tenantId, userId, type, payload },
  })
}

/**
 * @en Notifies all managers of a tenant (used for credit-limit triggers).
 * @es Notifica a todos los managers de un tenant (usado para triggers de límite de crédito).
 * @pt-BR Notifica todos os managers de um tenant (usado para triggers de limite de crédito).
 */
export async function notifyManagers(
  prisma: PrismaClient,
  tenantId: number,
  type: NotificationType,
  payload: NotificationPayload,
): Promise<void> {
  const managers = await prisma.appUser.findMany({
    where: {
      tenantId,
      active: true,
      role: { in: ['owner', 'manager'] },
    },
    select: { id: true },
  })

  if (managers.length === 0) return

  await prisma.notification.createMany({
    data: managers.map((m) => ({ tenantId, userId: m.id, type, payload })),
  })
}

/**
 * @en Registers notification CRUD routes.
 *     All routes require authentication; no specific permission beyond being logged in.
 * @es Registra rutas CRUD de notificaciones.
 *     Todas requieren autenticación; sin permiso específico más allá de estar logueado.
 * @pt-BR Registra rotas CRUD de notificações.
 *     Todas requerem autenticação; sem permissão específica além de estar logado.
 */
export function registerNotificationRoutes(app: Application, prisma: PrismaClient): void {
  // ── GET /api/notifications ──────────────────────────────────────────────────
  // Returns unread notifications for the authenticated user, newest first.

  app.get('/api/notifications', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    if (!authReq.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId: authReq.auth.claims.userId,
          tenantId: authReq.auth.claims.tenantId,
          readAt: null,
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
      res.json({ success: true, data: notifications })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) })
    }
  })

  // ── PUT /api/notifications/read-all ────────────────────────────────────────
  // Must be registered BEFORE /:id to avoid route shadowing.

  app.put('/api/notifications/read-all', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    if (!authReq.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    try {
      const now = new Date()
      const result = await prisma.notification.updateMany({
        where: {
          userId: authReq.auth.claims.userId,
          tenantId: authReq.auth.claims.tenantId,
          readAt: null,
        },
        data: { readAt: now },
      })
      res.json({ success: true, data: { updated: result.count } })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) })
    }
  })

  // ── PUT /api/notifications/:id/read ────────────────────────────────────────

  app.put('/api/notifications/:id/read', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    if (!authReq.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    const id = parseInt(String(req.params.id), 10)
    if (isNaN(id)) {
      res.status(400).json({ success: false, error: 'Invalid notification id' })
      return
    }
    try {
      // Verify ownership before updating
      const existing = await prisma.notification.findFirst({
        where: {
          id,
          userId: authReq.auth.claims.userId,
          tenantId: authReq.auth.claims.tenantId,
        },
      })
      if (!existing) {
        res.status(404).json({ success: false, error: 'Notification not found' })
        return
      }
      const updated = await prisma.notification.update({
        where: { id },
        data: { readAt: new Date() },
      })
      res.json({ success: true, data: updated })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) })
    }
  })
}
