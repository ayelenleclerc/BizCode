import { createHmac, timingSafeEqual } from 'node:crypto'

export type MercadoPagoSignatureParts = {
  ts: string
  v1: string
}

/**
 * @en Parses Mercado Pago `x-signature` header into timestamp and v1 digest (#176).
 * @es Parsea el header `x-signature` de Mercado Pago en timestamp y digest v1 (#176).
 * @pt-BR Faz parse do header `x-signature` do Mercado Pago em timestamp e digest v1 (#176).
 */
export function parseMercadoPagoSignatureHeader(xSignature: string): MercadoPagoSignatureParts | null {
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
 * @en Builds the Mercado Pago webhook manifest string (#176).
 * @es Arma el manifest del webhook de Mercado Pago (#176).
 * @pt-BR Monta o manifest do webhook do Mercado Pago (#176).
 */
export function buildMercadoPagoSignatureManifest(
  dataId: string,
  requestId: string,
  ts: string,
): string {
  const id = dataId.toLowerCase()
  return `id:${id};request-id:${requestId};ts:${ts};`
}

/**
 * @en Computes HMAC-SHA256 hex digest for Mercado Pago webhook validation (#176).
 * @es Calcula el digest HMAC-SHA256 para validar webhooks de Mercado Pago (#176).
 * @pt-BR Calcula o digest HMAC-SHA256 para validar webhooks do Mercado Pago (#176).
 */
export function computeMercadoPagoSignatureHmac(secret: string, manifest: string): string {
  return createHmac('sha256', secret).update(manifest).digest('hex')
}

/**
 * @en Verifies Mercado Pago webhook `x-signature` against the tenant webhook secret (#176).
 * @es Verifica `x-signature` del webhook de Mercado Pago contra el secreto del tenant (#176).
 * @pt-BR Verifica `x-signature` do webhook do Mercado Pago contra o segredo do tenant (#176).
 */
export function verifyMercadoPagoWebhookSignature(input: {
  secret: string
  xSignature: string
  xRequestId: string
  dataId: string
}): boolean {
  const parts = parseMercadoPagoSignatureHeader(input.xSignature)
  if (!parts) return false
  const manifest = buildMercadoPagoSignatureManifest(input.dataId, input.xRequestId, parts.ts)
  const expected = computeMercadoPagoSignatureHmac(input.secret, manifest)
  try {
    const a = Buffer.from(expected, 'utf8')
    const b = Buffer.from(parts.v1, 'utf8')
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch {
    return false
  }
}
