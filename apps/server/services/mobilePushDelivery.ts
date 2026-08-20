import type { PrismaClient } from '@prisma/client'
import { sendExpoPushMessages, type ExpoPushMessage } from './ExpoPushService'

type PushPayload = {
  clienteId?: number
  pedidoId?: number
  rsocial?: string
  amount?: string
  messageId?: number
  fromUserId?: number
  preview?: string
  [key: string]: unknown
}

/** @en Push types the user may mute from Profile (#172). */
export const MUTEABLE_PUSH_TYPES = [
  'pedido_confirmed',
  'pedido_cancelled',
  'cliente_credit_alert',
  'cliente_payment_received',
  'chat_message',
] as const

export type MuteablePushType = (typeof MUTEABLE_PUSH_TYPES)[number]

export function isMuteablePushType(value: string): value is MuteablePushType {
  return (MUTEABLE_PUSH_TYPES as readonly string[]).includes(value)
}

/**
 * @en Builds OS notification title/body + deep-link data for a notification type.
 * @es Arma título/cuerpo OS + data de deep link para un tipo de notificación.
 * @pt-BR Monta título/corpo OS + data de deep link para um tipo de notificação.
 */
export function buildPushContent(
  type: string,
  payload: PushPayload,
): { title: string; body: string; data: Record<string, unknown> } {
  const rsocial = typeof payload.rsocial === 'string' ? payload.rsocial : 'Cliente'
  const pedidoId = payload.pedidoId
  const amount =
    typeof payload.amount === 'string' && payload.amount.length > 0
      ? `$${Number(payload.amount).toLocaleString('es-AR')}`
      : ''

  switch (type) {
    case 'pedido_confirmed':
      return {
        title: 'Pedido aprobado',
        body: `Pedido #${pedidoId ?? ''} de ${rsocial} aprobado`,
        data: { type, pedidoId, clienteId: payload.clienteId },
      }
    case 'pedido_cancelled':
      return {
        title: 'Pedido rechazado',
        body: `Pedido #${pedidoId ?? ''} rechazado`,
        data: { type, pedidoId, clienteId: payload.clienteId },
      }
    case 'cliente_credit_alert':
      return {
        title: 'Alerta de crédito',
        body: `${rsocial} — revisá antes de visitar`,
        data: { type, clienteId: payload.clienteId },
      }
    case 'cliente_payment_received':
      return {
        title: 'Pago recibido',
        body: `${rsocial} pagó ${amount} — crédito disponible`.trim(),
        data: { type, clienteId: payload.clienteId },
      }
    case 'chat_message':
      return {
        title: 'Mensaje',
        body:
          typeof payload.preview === 'string' && payload.preview.length > 0
            ? `Mensaje: ${payload.preview}`
            : 'Tenés un mensaje nuevo',
        data: { type, messageId: payload.messageId, fromUserId: payload.fromUserId },
      }
    case 'reparto_sync_conflict':
      return {
        title: 'Conflicto de sync de ruta',
        body:
          typeof payload.detail === 'string' && payload.detail.length > 0
            ? payload.detail
            : 'Una acción offline del chofer no se aplicó',
        data: { type, ...payload },
      }
    default:
      return {
        title: 'BizCode',
        body: type,
        data: { type, ...payload },
      }
  }
}

/**
 * @en Delivers Expo push for one user when type is not muted and tokens exist.
 * @es Entrega push Expo a un usuario si el tipo no está silenciado y hay tokens.
 * @pt-BR Entrega push Expo a um usuário se o tipo não estiver silenciado e houver tokens.
 */
export async function deliverMobilePush(
  prisma: PrismaClient,
  tenantId: number,
  userId: number,
  type: string,
  payload: PushPayload,
): Promise<void> {
  const prefs = await prisma.pushNotificationPreference.findUnique({
    where: { tenantId_userId: { tenantId, userId } },
    select: { mutedTypes: true },
  })
  if (prefs?.mutedTypes.includes(type)) {
    return
  }

  const tokens = await prisma.devicePushToken.findMany({
    where: { tenantId, userId },
    select: { token: true },
  })
  if (tokens.length === 0) {
    return
  }

  const content = buildPushContent(type, payload)
  const messages: ExpoPushMessage[] = tokens.map((row) => ({
    to: row.token,
    title: content.title,
    body: content.body,
    data: content.data,
    sound: 'default',
  }))

  const result = await sendExpoPushMessages(messages)
  if (result.invalidTokens.length > 0) {
    await prisma.devicePushToken.deleteMany({
      where: { token: { in: result.invalidTokens } },
    })
  }
}
