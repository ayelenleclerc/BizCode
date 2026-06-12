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
import { resolveSmtpTransportConfig } from './config/smtpTransport'
import { notifyInventoryStakeholders, notifyManagers, notifyFinanceStakeholders } from './notifications'
import type { NotificationType, NotificationPayload } from './notifications'
import { logger } from './logger'

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
    case 'invoice_overdue': {
      const facturaRef = payload.facturaId != null ? ` #${payload.facturaId}` : ''
      const mora =
        payload.diasMora != null && payload.diasMora > 0
          ? ` (${payload.diasMora} días de mora)`
          : ''
      const amountPart = amount ? ` por ${amount}` : ''
      return {
        subject: `[BizCode] Factura vencida${facturaRef} — ${rsocial}`,
        text: `Factura${facturaRef} de ${rsocial}${amountPart} está vencida${mora}. Revise el estado de cuenta del cliente.`,
      }
    }
    case 'invoice_due_soon':
      return {
        subject: `[BizCode] Factura próxima a vencer — ${rsocial}`,
        text: `Una factura de ${rsocial} está próxima a vencer. Coordine el cobro con anticipación.`,
      }
    case 'supplier_invoice_due_soon': {
      const ref = payload.facturaRef ? ` ${payload.facturaRef}` : ''
      const days =
        payload.diasHastaVencimiento != null && payload.diasHastaVencimiento > 0
          ? ` (vence en ${payload.diasHastaVencimiento} días)`
          : ''
      return {
        subject: `[BizCode] Factura a pagar próxima a vencer — ${rsocial}`,
        text: `Comprobante${ref} de ${rsocial}${amount ? ` por ${amount}` : ''} está próximo a vencer${days}.`,
      }
    }
    case 'supplier_invoice_overdue': {
      const ref = payload.facturaRef ? ` ${payload.facturaRef}` : ''
      const mora =
        payload.diasVencido != null && payload.diasVencido > 0
          ? ` (${payload.diasVencido} días vencido)`
          : ''
      return {
        subject: `[BizCode] Factura a pagar vencida — ${rsocial}`,
        text: `Comprobante${ref} de ${rsocial}${amount ? ` por ${amount}` : ''} está vencido${mora}.`,
      }
    }
    case 'supplier_invoice_overdue_critical': {
      const ref = payload.facturaRef ? ` ${payload.facturaRef}` : ''
      const mora =
        payload.diasVencido != null && payload.diasVencido > 0
          ? ` (${payload.diasVencido} días vencido)`
          : ''
      return {
        subject: `[BizCode] Factura a pagar vencida (crítica) — ${rsocial}`,
        text: `Comprobante${ref} de ${rsocial}${amount ? ` por ${amount}` : ''} supera el umbral crítico${mora}.`,
      }
    }
    case 'supplier_credit_limit_exceeded':
      return {
        subject: `[BizCode] Límite de crédito proveedor superado — ${rsocial}`,
        text: `El saldo de ${rsocial} (${amount}) superó el límite de crédito configurado (${limit}).`,
      }
    case 'chat_message':
      return {
        subject: '[BizCode] Nuevo mensaje interno',
        text: payload.preview ? `Nuevo mensaje: ${payload.preview}` : 'Tiene un nuevo mensaje interno.',
      }
    case 'stock_below_minimum': {
      const desc = payload.descripcion ?? `Artículo ${payload.codigo ?? ''}`
      return {
        subject: `[BizCode] Stock bajo mínimo — ${desc}`,
        text: `El artículo ${desc} (cód. ${payload.codigo ?? '—'}) quedó con stock ${payload.stock ?? 0} (mínimo ${payload.minimo ?? 0}).`,
      }
    }
    case 'module_trial_expiring': {
      const moduleKey = payload.moduleKey ?? 'módulo'
      const days = payload.daysRemaining ?? 7
      return {
        subject: `[BizCode] Trial de módulo por vencer — ${moduleKey}`,
        text: `El trial del módulo ${moduleKey} vence en ${days} días. Contrate el módulo para mantenerlo activo.`,
      }
    }
    case 'cheque_due_soon': {
      const numero = payload.chequeNumero ? ` ${payload.chequeNumero}` : ''
      const banco = payload.banco ? ` (${payload.banco})` : ''
      const days =
        payload.diasHastaVencimiento != null && payload.diasHastaVencimiento >= 0
          ? ` en ${payload.diasHastaVencimiento} días`
          : ''
      return {
        subject: `[BizCode] Cheque próximo a vencer${numero}`,
        text: `Un cheque${numero}${banco}${amount ? ` por ${amount}` : ''} vence${days}. Revise la cartera.`,
      }
    }
    case 'cheque_rechazado': {
      const numero = payload.chequeNumero ? ` ${payload.chequeNumero}` : ''
      const banco = payload.banco ? ` (${payload.banco})` : ''
      return {
        subject: `[BizCode] Cheque rechazado${numero} — ${rsocial}`,
        text: `El cheque${numero}${banco}${amount ? ` por ${amount}` : ''} de ${rsocial} fue rechazado. Actualice la cuenta corriente del cliente.`,
      }
    }
    case 'mercadopago_payment_received': {
      const ref = payload.facturaRef ? ` ${payload.facturaRef}` : ''
      return {
        subject: `[BizCode] Pago Mercado Pago recibido — ${rsocial}`,
        text: `${rsocial} pagó la factura${ref}${amount ? ` por ${amount}` : ''} vía Mercado Pago.`,
      }
    }
    case 'mercadopago_payment_failed': {
      const ref = payload.facturaRef ? ` ${payload.facturaRef}` : ''
      return {
        subject: `[BizCode] Pago Mercado Pago rechazado — ${rsocial}`,
        text: `El pago Mercado Pago de la factura${ref} de ${rsocial} fue rechazado o cancelado.`,
      }
    }
  }
}

// ─── SMTP helpers ──────────────────────────────────────────────────────────────

export function isSmtpConfigured(): boolean {
  return resolveSmtpTransportConfig() !== null
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
  const smtp = resolveSmtpTransportConfig()
  if (!smtp) return
  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: smtp.auth,
    })
    await transporter.sendMail({
      from: smtp.from,
      to: to.join(', '),
      subject,
      text,
    })
  } catch (err) {
    logger.warn(
      { err: err instanceof Error ? { name: err.name, message: err.message } : String(err) },
      '[channels] SMTP send failed',
    )
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
    logger.warn(
      { err: err instanceof Error ? { name: err.name, message: err.message } : String(err) },
      '[channels] Twilio send failed',
    )
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
  if (type === 'stock_below_minimum') {
    await notifyInventoryStakeholders(prisma, tenantId, type, payload)
  } else {
    await notifyManagers(prisma, tenantId, type, payload)
  }

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

export type SupplierNotificationChannels = {
  inApp: boolean
  email: boolean
}

/**
 * @en Dispatches supplier payable alerts respecting tenant channel toggles (#275).
 * @es Despacha alertas de facturas a pagar respetando canales del tenant (#275).
 * @pt-BR Despacha alertas de faturas a pagar respeitando canais do tenant (#275).
 */
/**
 * @en Sends B2B portal magic-link email; no-op when SMTP is not configured (#240).
 * @es Envía email con magic link del portal B2B; no-op si SMTP no está configurado (#240).
 * @pt-BR Envia e-mail com magic link do portal B2B; no-op se SMTP não estiver configurado (#240).
 */
export async function sendPortalMagicLinkEmail(
  to: string,
  tenantName: string,
  verifyUrl: string,
): Promise<void> {
  if (!isSmtpConfigured()) return
  const smtp = resolveSmtpTransportConfig()
  if (!smtp) return
  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: smtp.auth,
    })
    await transporter.sendMail({
      from: smtp.from,
      to,
      subject: `[${tenantName}] Acceso al portal de clientes`,
      text: `Usá este enlace para ingresar al portal (válido 15 minutos):\n\n${verifyUrl}\n\nSi no solicitaste este acceso, ignorá este mensaje.`,
    })
  } catch (err) {
    logger.warn(
      { err: err instanceof Error ? { name: err.name, message: err.message } : String(err) },
      '[channels] portal magic link email failed',
    )
  }
}

/**
 * @en Sends customer account statement PDF by email; no-op when SMTP is not configured (#232).
 * @es Envía PDF de estado de cuenta por email; no-op si SMTP no está configurado (#232).
 * @pt-BR Envia PDF de extrato por email; no-op se SMTP não estiver configurado (#232).
 */
export async function sendClienteEstadoCuentaEmail(
  to: string,
  rsocial: string,
  saldo: string,
  pdf: Buffer,
): Promise<void> {
  if (!isSmtpConfigured()) return
  const smtp = resolveSmtpTransportConfig()
  if (!smtp) return
  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: smtp.auth,
    })
    await transporter.sendMail({
      from: smtp.from,
      to,
      subject: `Estado de cuenta — ${rsocial}`,
      text: `Adjuntamos el estado de cuenta de ${rsocial}. Saldo actual: $ ${saldo}.`,
      attachments: [
        {
          filename: 'estado-de-cuenta.pdf',
          content: pdf,
          contentType: 'application/pdf',
        },
      ],
    })
  } catch (err) {
    logger.warn(
      { err: err instanceof Error ? { name: err.name, message: err.message } : String(err) },
      '[channels] cliente estado cuenta email failed',
    )
  }
}

export async function dispatchSupplierNotification(
  prisma: PrismaClient,
  tenantId: number,
  type: NotificationType,
  payload: NotificationPayload,
  channels: SupplierNotificationChannels,
): Promise<void> {
  if (channels.inApp) {
    await notifyFinanceStakeholders(prisma, tenantId, type, payload)
  }

  // AppUser has no email field; external SMTP for supplier alerts is reserved for a future tenant contact address.
  if (!channels.email || !isSmtpConfigured()) return
}
