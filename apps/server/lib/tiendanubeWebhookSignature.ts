/**
 * @en Tiendanube webhook HMAC helpers (#187).
 * @es Helpers HMAC para webhooks Tiendanube (#187).
 * @pt-BR Helpers HMAC para webhooks Tiendanube (#187).
 *
 * Official docs: header `x-linkedstore-hmac-sha256` = HMAC-SHA256(app_secret, raw_body) hex.
 * Platform secret: `TIENDANUBE_WEBHOOK_SECRET` if set, else `TIENDANUBE_CLIENT_SECRET`.
 */

import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * @en Computes HMAC-SHA256 hex digest for a Tiendanube webhook raw body (#187).
 * @es Calcula el digest HMAC-SHA256 hex del cuerpo crudo del webhook Tiendanube (#187).
 * @pt-BR Calcula o digest HMAC-SHA256 hex do corpo bruto do webhook Tiendanube (#187).
 */
export function computeTiendanubeWebhookHmac(secret: string, rawBody: string | Buffer): string {
  return createHmac('sha256', secret).update(rawBody).digest('hex')
}

/**
 * @en Verifies `x-linkedstore-hmac-sha256` against the app secret (#187).
 * @es Verifica `x-linkedstore-hmac-sha256` contra el secreto de la app (#187).
 * @pt-BR Verifica `x-linkedstore-hmac-sha256` contra o segredo do app (#187).
 */
export function verifyTiendanubeWebhookSignature(input: {
  secret: string
  rawBody: string | Buffer
  hmacHeader: string
}): boolean {
  const expected = computeTiendanubeWebhookHmac(input.secret, input.rawBody)
  const provided = input.hmacHeader.trim()
  try {
    const a = Buffer.from(expected, 'utf8')
    const b = Buffer.from(provided, 'utf8')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/**
 * @en Resolves Tiendanube webhook HMAC secret from env (#187).
 * @es Resuelve el secreto HMAC de webhooks Tiendanube desde env (#187).
 * @pt-BR Resolve o segredo HMAC de webhooks Tiendanube a partir do env (#187).
 */
export function resolveTiendanubeWebhookSecret(): string | null {
  const override = process.env.TIENDANUBE_WEBHOOK_SECRET?.trim()
  if (override) return override
  const clientSecret = process.env.TIENDANUBE_CLIENT_SECRET?.trim()
  return clientSecret && clientSecret.length > 0 ? clientSecret : null
}
