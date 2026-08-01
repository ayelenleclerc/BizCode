/**
 * @en Mercado Libre webhook HMAC signature helpers (#185).
 * @es Helpers de firma HMAC para webhooks Mercado Libre (#185).
 * @pt-BR Helpers de assinatura HMAC para webhooks Mercado Livre (#185).
 *
 * Algorithm mirrors Mercado Libre / Mercado Pago notification docs:
 * `x-signature` = `ts=...,v1=HMAC-SHA256(secret, "id:{dataId};request-id:{x-request-id};ts:{ts};")`
 * with alphanumeric dataId lowercased. Platform secret: `MELI_WEBHOOK_SECRET`.
 */

import { createHmac, timingSafeEqual } from 'node:crypto'

export type MeliSignatureParts = {
  ts: string
  v1: string
}

/**
 * @en Parses Mercado Libre `x-signature` header into timestamp and v1 digest (#185).
 * @es Parsea el header `x-signature` de Mercado Libre en timestamp y digest v1 (#185).
 * @pt-BR Faz parse do header `x-signature` do Mercado Livre em timestamp e digest v1 (#185).
 */
export function parseMeliSignatureHeader(xSignature: string): MeliSignatureParts | null {
  let ts: string | null = null
  let v1: string | null = null
  for (const part of xSignature.split(',')) {
    const [key, value] = part.split('=', 2).map((s) => s.trim())
    if (key === 'ts' && value) ts = value
    if (key === 'v1' && value) v1 = value
  }
  if (!ts || !v1) return null
  return { ts, v1 }
}

/**
 * @en Builds the Mercado Libre webhook manifest string (#185).
 * @es Arma el manifest del webhook de Mercado Libre (#185).
 * @pt-BR Monta o manifest do webhook do Mercado Livre (#185).
 */
export function buildMeliSignatureManifest(
  dataId: string,
  requestId: string,
  ts: string,
): string {
  const id = dataId.toLowerCase()
  return `id:${id};request-id:${requestId};ts:${ts};`
}

/**
 * @en Computes HMAC-SHA256 hex digest for Mercado Libre webhook validation (#185).
 * @es Calcula el digest HMAC-SHA256 para validar webhooks de Mercado Libre (#185).
 * @pt-BR Calcula o digest HMAC-SHA256 para validar webhooks do Mercado Livre (#185).
 */
export function computeMeliSignatureHmac(secret: string, manifest: string): string {
  return createHmac('sha256', secret).update(manifest).digest('hex')
}

/**
 * @en Verifies Mercado Libre webhook `x-signature` against `MELI_WEBHOOK_SECRET` (#185).
 * @es Verifica `x-signature` del webhook Mercado Libre contra `MELI_WEBHOOK_SECRET` (#185).
 * @pt-BR Verifica `x-signature` do webhook Mercado Livre contra `MELI_WEBHOOK_SECRET` (#185).
 */
export function verifyMeliWebhookSignature(input: {
  secret: string
  xSignature: string
  xRequestId: string
  dataId: string
}): boolean {
  const parts = parseMeliSignatureHeader(input.xSignature)
  if (!parts) return false
  const manifest = buildMeliSignatureManifest(input.dataId, input.xRequestId, parts.ts)
  const expected = computeMeliSignatureHmac(input.secret, manifest)
  try {
    const a = Buffer.from(expected, 'utf8')
    const b = Buffer.from(parts.v1, 'utf8')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}

/**
 * @en Reads platform Mercado Libre webhook secret from env (#185).
 * @es Lee el secreto de webhook Mercado Libre de plataforma desde env (#185).
 * @pt-BR Lê o segredo de webhook Mercado Livre da plataforma a partir do env (#185).
 */
export function resolveMeliWebhookSecret(): string | null {
  const secret = process.env.MELI_WEBHOOK_SECRET?.trim()
  return secret && secret.length > 0 ? secret : null
}
