import type { Application, Request, Response } from 'express'
import type { PrismaClient, Prisma } from '@prisma/client'
import { type AuthenticatedRequest } from './auth'
import { writeAuditEvent } from './audit'
import { deliverMobilePush } from './services/mobilePushDelivery'

export const NOTIFICATION_TYPES = [
  'credit_limit_exceeded',
  'invoice_overdue',
  'invoice_due_soon',
  'supplier_invoice_due_soon',
  'supplier_invoice_overdue',
  'supplier_invoice_overdue_critical',
  'supplier_credit_limit_exceeded',
  'chat_message',
  'stock_below_minimum',
  'module_trial_expiring',
  'cheque_due_soon',
  'cheque_rechazado',
  'mercadopago_payment_received',
  'mercadopago_payment_failed',
  'mercadopago_chargeback',
  'meli_price_divergence',
  'meli_order_imported',
  'meli_cuit_required',
  'meli_order_cancelled_invoiced',
  'tiendanube_order_imported',
  'tiendanube_cuit_required',
  'tiendanube_order_cancelled_invoiced',
  'woocommerce_order_imported',
  'woocommerce_cuit_required',
  'woocommerce_order_cancelled_invoiced',
  'contract_invoice_generated',
  'contract_adjustment_due',
  'ot_presupuestado',
  'ot_listo',
  'precios_fx_actualizados',
  'loyalty_points_expiring',
  'lot_expiring',
  'security_alert_critical',
  'security_alert_high',
  'shipment_delivered',
  'ruta_parada_postergada',
  'pedido_confirmed',
  'pedido_cancelled',
  'cliente_credit_alert',
  'cliente_payment_received',
  'reparto_sync_conflict',
  'reparto_assigned',
  'reparto_stop_added',
  'reparto_stop_removed',
  'atencion_bot_escalation',
] as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

export type NotificationPayload = {
  clienteId?: number
  facturaId?: number
  proveedorId?: number
  comprobanteCompraId?: number
  facturaRef?: string
  rsocial?: string
  amount?: string
  diasMora?: number
  diasVencido?: number
  diasHastaVencimiento?: number
  limit?: string
  messageId?: number
  fromUserId?: number
  preview?: string
  articuloId?: number
  codigo?: number
  descripcion?: string
  stock?: number
  minimo?: number
  pedidoId?: number
  moduleKey?: string
  expiresAt?: string
  daysRemaining?: number
  chequeId?: number
  chequeNumero?: string
  banco?: string
  mpPaymentId?: string
  mpChargebackId?: string
  contratoId?: number
  contratoNumero?: number
  otId?: number
  otNumero?: number
  loteId?: number
  nroLote?: string
  /** @en Security alert fields (#221). @es Campos de alerta de seguridad (#221). @pt-BR Campos de alerta de segurança (#221). */
  securityEventType?: string
  severity?: string
  sourceTenantId?: number
  action?: string
  resource?: string
  resourceId?: string
  ipAddress?: string
  detail?: string
  username?: string
  ordenEntregaId?: number
  transportista?: string
  nroSeguimiento?: string
  repartoId?: number
  stopCount?: number
  itemId?: number
  addedCount?: number
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
  await deliverMobilePush(prisma, tenantId, userId, type, payload).catch(() => {
    /* push must not break callers */
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
 * @en Notifies all active owners of a tenant (module trial warnings).
 * @es Notifica a todos los owners activos de un tenant (avisos de trial de módulo).
 * @pt-BR Notifica todos os owners ativos de um tenant (avisos de trial de módulo).
 */
export async function notifyTenantOwners(
  prisma: PrismaClient,
  tenantId: number,
  type: NotificationType,
  payload: NotificationPayload,
): Promise<void> {
  const owners = await prisma.appUser.findMany({
    where: {
      tenantId,
      active: true,
      role: 'owner',
    },
    select: { id: true },
  })

  if (owners.length === 0) return

  await prisma.notification.createMany({
    data: owners.map((o) => ({ tenantId, userId: o.id, type, payload })),
  })
}

/**
 * @en Notifies owner, manager, and warehouse_lead for inventory alerts.
 * @es Notifica a owner, manager y warehouse_lead para alertas de inventario.
 * @pt-BR Notifica owner, manager e warehouse_lead para alertas de estoque.
 */
/**
 * @en Notifies finance stakeholders (owner/manager) for supplier payable alerts (#275).
 * @es Notifica a responsables de finanzas (owner/manager) para alertas de proveedores (#275).
 * @pt-BR Notifica responsáveis de finanças (owner/manager) para alertas de fornecedores (#275).
 */
export async function notifyFinanceStakeholders(
  prisma: PrismaClient,
  tenantId: number,
  type: NotificationType,
  payload: NotificationPayload,
): Promise<void> {
  await notifyManagers(prisma, tenantId, type, payload)
}

export async function notifyInventoryStakeholders(
  prisma: PrismaClient,
  tenantId: number,
  type: NotificationType,
  payload: NotificationPayload,
): Promise<void> {
  const users = await prisma.appUser.findMany({
    where: {
      tenantId,
      active: true,
      role: { in: ['owner', 'manager', 'warehouse_lead'] },
    },
    select: { id: true },
  })

  if (users.length === 0) return

  await prisma.notification.createMany({
    data: users.map((u) => ({ tenantId, userId: u.id, type, payload })),
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
      await writeAuditEvent({
        prisma,
        tenantId: authReq.auth.claims.tenantId,
        userId: authReq.auth.claims.userId,
        action: 'notification_read_all',
        resource: 'notification',
        ipAddress: req.ip,
        metadata: { updated: result.count } as Prisma.InputJsonValue,
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
      await writeAuditEvent({
        prisma,
        tenantId: authReq.auth.claims.tenantId,
        userId: authReq.auth.claims.userId,
        action: 'notification_read',
        resource: 'notification',
        resourceId: String(id),
        ipAddress: req.ip,
      })
      res.json({ success: true, data: updated })
    } catch (err: unknown) {
      res.status(500).json({ success: false, error: err instanceof Error ? err.message : String(err) })
    }
  })
}
