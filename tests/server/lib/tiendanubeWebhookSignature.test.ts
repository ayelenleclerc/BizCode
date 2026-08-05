/**
 * @en Tiendanube webhook HMAC unit tests (#187).
 * @es Tests unitarios de firma HMAC de webhooks Tiendanube (#187).
 * @pt-BR Testes unitários de assinatura HMAC de webhooks Tiendanube (#187).
 */

import { describe, expect, it } from 'vitest'
import {
  computeTiendanubeWebhookHmac,
  verifyTiendanubeWebhookSignature,
} from '../../../apps/server/lib/tiendanubeWebhookSignature'

describe('tiendanubeWebhookSignature', () => {
  it('verifies HMAC-SHA256 of raw body with app secret', () => {
    const secret = 'tn-app-secret'
    const rawBody = '{"store_id":123,"event":"order/paid","id":999}'
    const hmac = computeTiendanubeWebhookHmac(secret, rawBody)
    expect(
      verifyTiendanubeWebhookSignature({ secret, rawBody, hmacHeader: hmac }),
    ).toBe(true)
    expect(
      verifyTiendanubeWebhookSignature({ secret, rawBody, hmacHeader: 'deadbeef' }),
    ).toBe(false)
  })
})
