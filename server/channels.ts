/**
 * @en External notification channels (email via nodemailer, WhatsApp via Twilio).
 *     Configuration is read from environment variables at call time, so tests can
 *     set / clear them freely.  Every external dispatch is wrapped in try/catch:
 *     a misconfigured or unavailable channel must NEVER surface an error to the caller.
 * @es Canales externos de notificaciones (email vía nodemailer, WhatsApp vía Twilio).
 *     La configuración se lee de variables de entorno en el momento de la llamada.
 *     Todo dispatch externo está envuelto en try/catch: un canal mal configurado
 *     o no disponible nunca debe propagar un error al llamador.
 * @pt-BR Canais externos de notificações (email via nodemailer, WhatsApp via Twilio).
 *     Configuração lida de variáveis de ambiente no momento da chamada.
 *     Todo dispatch externo está em try/catch: canal mal configurado nunca deve
 *     propagar erro ao chamador.
 */

import nodemailer from 'nodemailer'
import type { PrismaClient } from '@prisma/client'
import { notifyManagers } from './notifications'
import type { NotificationType, NotificationPayload } from './notifications'

// ─── Message templates ────────────────────────────────────────────────────────

type MessageTemplate = { subject: string; text: string }

function buildMessage(type: NotificationType, payload: NotificationPayload): MessageTemplate {
  const rsocial = payload.rsocial ?? 'Cliente'
  const amount = payload.amount ? `$${Number(payload.amount).toLocaleString('es-AR')}` : ''
  const limit = payload.limit ? `$${Number(payload.limit).toLocaleString('es-AR')}` : ''

  switch (type) {
    case 'credit_limit_exceeded':
      return {
        subject: `[BizCode] Límite de crédito superado — ${rsocial}`,
        text: `El saldo de ${rsocial} (${amount}) superó el límite de crédito configurado (${limit}).`,
      }
    case 'invoice_overdue':
      return {
        subject: `[BizCode] Factura vencida — ${rsocial}`,
        text: `Hay una factura vencida de ${rsocial}. Revise el estado de cuenta del cliente.`,
      }
    case 'invoice_due_soon':
      return {
        subject: `[BizCode] Factura próxima a vencer — ${rsocial}`,
        text: `Una factura de ${rsocial} está próxima a vencer. Coordine el cobro con anticipación.`,
      }
  }
}

// ─── SMTP helpers ──────────────────────────────────────────────────────────────

export function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM,
  )
}

/**
 * @en Sends an email via nodemailer using SMTP env vars.
 *     Returns silently if SMTP is not configured or the send fails.
 * @es Envía un email vía nodemailer usando las env vars SMTP.
 *     Retorna en silencio si SMTP no está configurado o el envío falla.
 */
async function sendEmail(
  to: string[],
  subject: string,
  text: string,
): Promise<void> {
  if (!isSmtpConfigured() || to.length === 0) return
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST!,
      port: parseInt(process.env.SMTP_PORT!, 10),
      secure: parseInt(process.env.SMTP_PORT!, 10) === 465,
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    })
    await transporter.sendMail({
      from: process.env.SMTP_FROM!,
      to: to.join(', '),
      subject,
      text,
    })
  } catch (err) {
    console.warn('[channels] SMTP send failed:', err instanceof Error ? err.message : String(err))
  }
}

// ─── Twilio / WhatsApp helpers ────────────────────────────────────────────────

export function isTwilioConfigured(): boolean {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_WHATSAPP_FROM,
  )
}

/**
 * @en Sends a WhatsApp message via Twilio.
 *     Returns silently if Twilio is not configured or the send fails.
 * @es Envía un mensaje de WhatsApp vía Twilio.
 *     Retorna en silencio si Twilio no está configurado o el envío falla.
 */
async function sendWhatsApp(
  to: string[],
  body: string,
): Promise<void> {
  if (!isTwilioConfigured() || to.length === 0) return
  try {
    // Dynamic import to avoid loading Twilio SDK in environments where it is not needed.
    const twilio = await import('twilio')
    const client = twilio.default(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!,
    )
    await Promise.all(
      to.map((number) =>
        client.messages.create({
          from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM!}`,
          to: `whatsapp:${number}`,
          body,
        }),
      ),
    )
  } catch (err) {
    console.warn('[channels] Twilio send failed:', err instanceof Error ? err.message : String(err))
  }
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * @en Dispatches a notification through all configured channels:
 *     1. In-app (always) — via notifyManagers
 *     2. Email (if SMTP env vars are set) — to recipients with non-null email
 *     3. WhatsApp (if Twilio env vars are set) — to recipients with non-null telef
 *
 *     External channel failures are logged and swallowed; they must never block
 *     the calling business operation.
 *
 * @es Despacha una notificación por todos los canales configurados:
 *     1. In-app (siempre) — vía notifyManagers
 *     2. Email (si hay env vars SMTP) — a destinatarios con email no nulo
 *     3. WhatsApp (si hay env vars Twilio) — a destinatarios con telef no nulo
 *
 * @pt-BR Despacha uma notificação por todos os canais configurados:
 *     1. In-app (sempre) — via notifyManagers
 *     2. Email (se env vars SMTP presentes) — para destinatários com email não nulo
 *     3. WhatsApp (se env vars Twilio presentes) — para destinatários com telef não nulo
 */
export async function dispatchNotification(
  prisma: PrismaClient,
  tenantId: number,
  type: NotificationType,
  payload: NotificationPayload,
): Promise<void> {
  // 1. Always send in-app
  await notifyManagers(prisma, tenantId, type, payload)

  // 2. External channels — only if at least one is configured
  if (!isSmtpConfigured() && !isTwilioConfigured()) return

  // Fetch manager emails + phones for external channels
  const managers = await prisma.appUser.findMany({
    where: {
      tenantId,
      active: true,
      role: { in: ['owner', 'manager'] },
    },
    select: { id: true },
  })

  if (managers.length === 0) return

  // Fetch Cliente details for email/phone if available in payload
  const emailRecipients: string[] = []
  const phoneRecipients: string[] = []

  if (payload.clienteId) {
    try {
      const cliente = await prisma.cliente.findUnique({
        where: { id: payload.clienteId },
        select: { email: true, telef: true },
      })
      if (cliente?.email) emailRecipients.push(cliente.email)
      if (cliente?.telef) phoneRecipients.push(cliente.telef)
    } catch {
      // non-critical
    }
  }

  const msg = buildMessage(type, payload)

  // 3. Email
  void sendEmail(emailRecipients, msg.subject, msg.text)

  // 4. WhatsApp
  void sendWhatsApp(phoneRecipients, `${msg.subject}\n\n${msg.text}`)
}
