/**
 * @en Dispatches security alerts to platform super_admin users via BizCode channels (#221).
 * @es Despacha alertas de seguridad a super_admin de plataforma vía canales BizCode (#221).
 * @pt-BR Despacha alertas de segurança a super_admin da plataforma via canais BizCode (#221).
 */

import type { PrismaClient } from '@prisma/client'
import type { NotificationPayload, NotificationType } from '../notifications'
import { createNotification } from '../notifications'
import { dispatchSecurityAlertChannels } from '../channels'
import type { SecurityEventType, SecuritySeverity } from './securityTaxonomy'
import { logger } from '../logger'

export type SecurityAlertInput = {
  tenantId: number
  securityEventType: SecurityEventType
  severity: SecuritySeverity
  action: string
  resource?: string | null
  resourceId?: string | null
  ipAddress?: string | null
  detail?: string
  username?: string
}

function notificationTypeForSeverity(severity: SecuritySeverity): NotificationType {
  return severity === 'critical' ? 'security_alert_critical' : 'security_alert_high'
}

/**
 * @en Notifies all active `super_admin` users in-app and fans out email/WhatsApp via channel env.
 * @es Notifica in-app a todos los `super_admin` activos y envía email/WhatsApp vía env de canales.
 * @pt-BR Notifica in-app todos os `super_admin` ativos e envia email/WhatsApp via env dos canais.
 */
export async function dispatchSecurityAlert(
  prisma: PrismaClient,
  input: SecurityAlertInput,
): Promise<void> {
  const type = notificationTypeForSeverity(input.severity)
  const payload: NotificationPayload = {
    securityEventType: input.securityEventType,
    severity: input.severity,
    sourceTenantId: input.tenantId,
    action: input.action,
    resource: input.resource ?? undefined,
    resourceId: input.resourceId ?? undefined,
    ipAddress: input.ipAddress ?? undefined,
    detail: input.detail,
    username: input.username,
  }

  try {
    const recipients = await prisma.appUser.findMany({
      where: { active: true, role: 'super_admin' },
      select: { id: true, tenantId: true },
    })
    for (const user of recipients) {
      await createNotification(prisma, user.tenantId, user.id, type, payload)
    }
  } catch (err) {
    logger.warn(
      { err: err instanceof Error ? { name: err.name, message: err.message } : String(err) },
      '[security] in-app alert dispatch failed',
    )
  }

  await dispatchSecurityAlertChannels(type, payload)
}
