import type { Application, Request, Response } from 'express'
import type { PrismaClient, Prisma } from '@prisma/client'
import type { AuthenticatedRequest } from './auth'
import { writeAuditEvent } from './audit'

const CHAT_PAGE_SIZE_DEFAULT = 50
const CHAT_PAGE_SIZE_MAX = 100

function parsePositiveInt(value: unknown, fallback: number): number {
  const parsed = parseInt(String(value ?? ''), 10)
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback
  }
  return parsed
}

function toPreview(content: string): string {
  return content.trim().slice(0, 160)
}

export function registerChatRoutes(app: Application, prisma: PrismaClient): void {
  app.get('/api/chat/conversations', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    if (!authReq.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    const me = authReq.auth.claims
    const limit = Math.min(parsePositiveInt(req.query.limit, 20), CHAT_PAGE_SIZE_MAX)
    try {
      const users = await prisma.appUser.findMany({
        where: { tenantId: me.tenantId, active: true, id: { not: me.userId } },
        select: { id: true, username: true, role: true },
        orderBy: { username: 'asc' },
        take: limit,
      })

      const unreadNotifications = await prisma.notification.findMany({
        where: {
          tenantId: me.tenantId,
          userId: me.userId,
          readAt: null,
          type: 'chat_message',
        },
        select: { payload: true },
      })

      const unreadByUser = new Map<number, number>()
      for (const notification of unreadNotifications) {
        const payload = notification.payload as Record<string, unknown>
        const fromUserId = Number(payload.fromUserId)
        if (!Number.isInteger(fromUserId) || fromUserId <= 0) continue
        unreadByUser.set(fromUserId, (unreadByUser.get(fromUserId) ?? 0) + 1)
      }

      const conversations = await Promise.all(
        users.map(async (user) => {
          const lastMessage = await prisma.chatMessage.findFirst({
            where: {
              tenantId: me.tenantId,
              OR: [
                { fromUserId: me.userId, toUserId: user.id },
                { fromUserId: user.id, toUserId: me.userId },
              ],
            },
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              fromUserId: true,
              toUserId: true,
              content: true,
              createdAt: true,
            },
          })
          return {
            user: {
              id: user.id,
              username: user.username,
              role: user.role,
            },
            unreadCount: unreadByUser.get(user.id) ?? 0,
            lastMessage:
              lastMessage == null
                ? null
                : {
                    id: lastMessage.id,
                    fromUserId: lastMessage.fromUserId,
                    toUserId: lastMessage.toUserId,
                    preview: toPreview(lastMessage.content),
                    createdAt: lastMessage.createdAt,
                  },
          }
        }),
      )

      res.json({ success: true, data: conversations })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) })
    }
  })

  app.get('/api/chat/messages/:userId', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    if (!authReq.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    const me = authReq.auth.claims
    const otherUserId = parsePositiveInt(req.params.userId, 0)
    if (otherUserId <= 0) {
      res.status(400).json({ success: false, error: 'Invalid user id' })
      return
    }
    const take = Math.min(parsePositiveInt(req.query.limit, CHAT_PAGE_SIZE_DEFAULT), CHAT_PAGE_SIZE_MAX)
    const beforeId = parsePositiveInt(req.query.before, 0)
    try {
      const otherUser = await prisma.appUser.findFirst({
        where: {
          id: otherUserId,
          tenantId: me.tenantId,
          active: true,
        },
        select: { id: true },
      })
      if (!otherUser) {
        res.status(404).json({ success: false, error: 'User not found' })
        return
      }

      const rows = await prisma.chatMessage.findMany({
        where: {
          tenantId: me.tenantId,
          OR: [
            { fromUserId: me.userId, toUserId: otherUserId },
            { fromUserId: otherUserId, toUserId: me.userId },
          ],
          ...(beforeId > 0 && { id: { lt: beforeId } }),
        },
        orderBy: { id: 'desc' },
        take,
      })

      const messages = [...rows].reverse()

      await prisma.notification.updateMany({
        where: {
          tenantId: me.tenantId,
          userId: me.userId,
          readAt: null,
          type: 'chat_message',
          payload: {
            path: ['fromUserId'],
            equals: otherUserId,
          },
        },
        data: { readAt: new Date() },
      })

      res.json({ success: true, data: messages })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) })
    }
  })

  app.post('/api/chat/messages', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest
    if (!authReq.auth) {
      res.status(401).json({ success: false, error: 'Authentication required' })
      return
    }
    const me = authReq.auth.claims
    const body = (req.body ?? {}) as { toUserId?: number; content?: string }
    const toUserId = Number(body.toUserId)
    const content = typeof body.content === 'string' ? body.content.trim() : ''
    if (!Number.isInteger(toUserId) || toUserId <= 0) {
      res.status(400).json({ success: false, error: 'toUserId must be a positive integer' })
      return
    }
    if (toUserId === me.userId) {
      res.status(400).json({ success: false, error: 'Cannot send a message to yourself' })
      return
    }
    if (content.length === 0 || content.length > 1000) {
      res.status(400).json({ success: false, error: 'content must be between 1 and 1000 characters' })
      return
    }
    try {
      const recipient = await prisma.appUser.findFirst({
        where: {
          id: toUserId,
          tenantId: me.tenantId,
          active: true,
        },
        select: { id: true },
      })
      if (!recipient) {
        res.status(404).json({ success: false, error: 'Recipient not found' })
        return
      }

      const message = await prisma.chatMessage.create({
        data: {
          tenantId: me.tenantId,
          fromUserId: me.userId,
          toUserId,
          content,
        },
      })

      await prisma.notification.create({
        data: {
          tenantId: me.tenantId,
          userId: toUserId,
          type: 'chat_message',
          payload: {
            messageId: message.id,
            fromUserId: me.userId,
            preview: toPreview(content),
          },
        },
      })

      await writeAuditEvent({
        prisma,
        tenantId: me.tenantId,
        userId: me.userId,
        action: 'chat_message_create',
        resource: 'chat_message',
        resourceId: String(message.id),
        ipAddress: req.ip,
        metadata: { toUserId } as Prisma.InputJsonValue,
      })

      res.status(201).json({ success: true, data: message })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) })
    }
  })
}

