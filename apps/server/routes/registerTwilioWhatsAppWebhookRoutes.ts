/**
 * @en Public Twilio WhatsApp inbound webhook for customer-care bot (#201).
 * @es Webhook público Twilio WhatsApp inbound del bot de atención (#201).
 * @pt-BR Webhook público Twilio WhatsApp inbound do bot de atendimento (#201).
 */

import type { Application, Request, Response } from 'express'
import express from 'express'
import twilio from 'twilio'
import { webhookIpAllowlist } from '../middleware/webhookIpAllowlist'
import { twilioWhatsAppWebhookHttpRateLimiter } from '../middleware/routeRateLimit'
import { isTwilioConfigured } from '../channels'
import { AtencionBotService } from '../services/AtencionBotService'
import { sanitizeLogField } from '../lib/sanitizeLogField'
import { logger } from '../logger'
import type { RestRouteContext } from './restRouteTypes'

/** @en Fixed Twilio form keys for signature validation (no user-controlled property names). */
const TWILIO_WHATSAPP_FORM_KEYS = [
  'MessageSid',
  'SmsSid',
  'SmsMessageSid',
  'AccountSid',
  'MessagingServiceSid',
  'From',
  'To',
  'Body',
  'NumMedia',
  'NumSegments',
  'SmsStatus',
  'MessageStatus',
  'ApiVersion',
  'ProfileName',
  'WaId',
  'ChannelMetadata',
  'ReferralNumMedia',
] as const

function headerString(value: string | string[] | undefined): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim()
  if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim()) {
    return value[0].trim()
  }
  return null
}

function formParam(body: Record<string, unknown>, key: string): string {
  const v = body[key]
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  return ''
}

/**
 * @en Builds Twilio signature params from a fixed key allowlist (CodeQL-safe).
 * @es Arma params de firma Twilio desde allowlist fija (seguro para CodeQL).
 * @pt-BR Monta params de assinatura Twilio a partir de allowlist fixa (seguro para CodeQL).
 */
export function collectTwilioWhatsAppFormParams(body: Record<string, unknown>): Record<string, string> {
  const params: Record<string, string> = Object.create(null) as Record<string, string>
  for (const key of TWILIO_WHATSAPP_FORM_KEYS) {
    const v = body[key]
    if (typeof v === 'string') {
      params[key] = v
    } else if (typeof v === 'number' || typeof v === 'boolean') {
      params[key] = String(v)
    }
  }
  // MediaUrl0..9 / MediaContentType0..9 — fixed index keys, not user-named properties.
  for (let i = 0; i < 10; i++) {
    const urlKey = `MediaUrl${i}`
    const typeKey = `MediaContentType${i}`
    const urlVal = body[urlKey]
    const typeVal = body[typeKey]
    if (typeof urlVal === 'string') params[urlKey] = urlVal
    if (typeof typeVal === 'string') params[typeKey] = typeVal
  }
  return params
}

/**
 * @en Reconstructs the public webhook URL for Twilio signature validation.
 * @es Reconstruye la URL pública del webhook para validar la firma Twilio.
 * @pt-BR Reconstrói a URL pública do webhook para validar a assinatura Twilio.
 */
export function resolveTwilioWebhookUrl(req: Request): string {
  const configured = process.env.TWILIO_WHATSAPP_WEBHOOK_URL?.trim()
  if (configured) return configured
  const proto = (req.get('x-forwarded-proto') ?? req.protocol ?? 'https').split(',')[0]?.trim() || 'https'
  const host = (req.get('x-forwarded-host') ?? req.get('host') ?? 'localhost').split(',')[0]?.trim()
  return `${proto}://${host}${req.originalUrl}`
}

/**
 * @en Validates `X-Twilio-Signature` when Twilio auth token is configured.
 * @es Valida `X-Twilio-Signature` cuando hay auth token de Twilio.
 * @pt-BR Valida `X-Twilio-Signature` quando há auth token Twilio.
 */
export function validateTwilioWhatsAppSignature(
  req: Request,
  params: Record<string, string>,
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim()
  if (!authToken) return false
  const signature = headerString(req.headers['x-twilio-signature'])
  if (!signature) return false
  const url = resolveTwilioWebhookUrl(req)
  return twilio.validateRequest(authToken, signature, url, params)
}

/**
 * @en Registers `POST /api/webhooks/twilio/whatsapp` (form-urlencoded; Twilio signature).
 * @es Registra `POST /api/webhooks/twilio/whatsapp` (form-urlencoded; firma Twilio).
 * @pt-BR Registra `POST /api/webhooks/twilio/whatsapp` (form-urlencoded; assinatura Twilio).
 */
export function registerTwilioWhatsAppWebhookRoutes(app: Application, ctx: RestRouteContext): void {
  const bot = new AtencionBotService(ctx.prisma)

  app.post(
    '/api/webhooks/twilio/whatsapp',
    webhookIpAllowlist,
    twilioWhatsAppWebhookHttpRateLimiter,
    express.urlencoded({ extended: false }),
    (req: Request, res: Response) => {
      if (!isTwilioConfigured()) {
        res.status(503).json({ success: false, error: 'Twilio not configured' })
        return
      }

      const body = (req.body ?? {}) as Record<string, unknown>
      const params = collectTwilioWhatsAppFormParams(body)

      if (!validateTwilioWhatsAppSignature(req, params)) {
        logger.warn(
          { from: sanitizeLogField(formParam(body, 'From')) },
          '[twilio-whatsapp-webhook] invalid_signature',
        )
        res.status(403).json({ success: false, error: 'Invalid Twilio signature' })
        return
      }

      const from = formParam(body, 'From')
      const messageBody = formParam(body, 'Body')

      void bot
        .handleInbound({ fromRaw: from, body: messageBody })
        .then(() => {
          if (!res.headersSent) {
            // Empty 200 — reply is sent via Twilio REST outbound, not TwiML.
            res.status(200).type('text/plain').send('')
          }
        })
        .catch((err) => {
          logger.warn(
            { err: err instanceof Error ? { name: err.name, message: err.message } : String(err) },
            '[twilio-whatsapp-webhook] handler_failed',
          )
          if (!res.headersSent) {
            res.status(200).type('text/plain').send('')
          }
        })
    },
  )
}
