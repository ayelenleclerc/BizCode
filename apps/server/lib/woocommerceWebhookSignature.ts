/**
 * @en WooCommerce webhook HMAC helpers (#188).
 * @es Helpers HMAC para webhooks WooCommerce (#188).
 * @pt-BR Helpers HMAC para webhooks WooCommerce (#188).
 *
 * Official docs: header `X-WC-Webhook-Signature` = base64(HMAC-SHA256(webhook_secret, raw_body)).
 * The secret is configured per-tenant (`WooCommerceConfig.webhookSecretEncrypted`), set by the store
 * owner when creating the webhook under WooCommerce → Settings → Advanced → Webhooks.
 */

import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * @en Computes the base64 HMAC-SHA256 digest for a WooCommerce webhook raw body (#188).
 * @es Calcula el digest base64 HMAC-SHA256 del cuerpo crudo del webhook WooCommerce (#188).
 * @pt-BR Calcula o digest base64 HMAC-SHA256 do corpo bruto do webhook WooCommerce (#188).
 */
export function computeWooCommerceWebhookHmac(secret: string, rawBody: string | Buffer): string {
  return createHmac('sha256', secret).update(rawBody).digest('base64')
}

/**
 * @en Verifies `X-WC-Webhook-Signature` (base64 HMAC-SHA256) against the tenant webhook secret (#188).
 * @es Verifica `X-WC-Webhook-Signature` (base64 HMAC-SHA256) contra el secreto del tenant (#188).
 * @pt-BR Verifica `X-WC-Webhook-Signature` (base64 HMAC-SHA256) contra o segredo do tenant (#188).
 */
export function verifyWooCommerceWebhookSignature(input: {
  secret: string
  rawBody: string | Buffer
  signatureHeader: string
}): boolean {
  const expected = computeWooCommerceWebhookHmac(input.secret, input.rawBody)
  const provided = input.signatureHeader.trim()
  try {
    const a = Buffer.from(expected, 'utf8')
    const b = Buffer.from(provided, 'utf8')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
