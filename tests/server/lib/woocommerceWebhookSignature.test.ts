/**
 * @en WooCommerce webhook HMAC unit tests (#188).
 * @es Tests unitarios de firma HMAC de webhooks WooCommerce (#188).
 * @pt-BR Testes unitários de assinatura HMAC de webhooks WooCommerce (#188).
 */

import { describe, expect, it } from 'vitest'
import {
  computeWooCommerceWebhookHmac,
  verifyWooCommerceWebhookSignature,
} from '../../../apps/server/lib/woocommerceWebhookSignature'

describe('woocommerceWebhookSignature', () => {
  it('verifies base64 HMAC-SHA256 of raw body with per-tenant webhook secret', () => {
    const secret = 'wc-webhook-secret'
    const rawBody = '{"id":4001,"status":"processing"}'
    const hmac = computeWooCommerceWebhookHmac(secret, rawBody)

    expect(hmac).toMatch(/^[A-Za-z0-9+/]+=*$/)
    expect(
      verifyWooCommerceWebhookSignature({ secret, rawBody, signatureHeader: hmac }),
    ).toBe(true)
  })

  it('rejects an invalid or mismatched signature', () => {
    const secret = 'wc-webhook-secret'
    const rawBody = '{"id":4001,"status":"processing"}'

    expect(
      verifyWooCommerceWebhookSignature({ secret, rawBody, signatureHeader: 'not-base64-hmac' }),
    ).toBe(false)
    expect(
      verifyWooCommerceWebhookSignature({
        secret: 'other-secret',
        rawBody,
        signatureHeader: computeWooCommerceWebhookHmac(secret, rawBody),
      }),
    ).toBe(false)
  })

  it('rejects when the raw body was tampered with', () => {
    const secret = 'wc-webhook-secret'
    const hmac = computeWooCommerceWebhookHmac(secret, '{"id":4001,"status":"processing"}')
    expect(
      verifyWooCommerceWebhookSignature({
        secret,
        rawBody: '{"id":4001,"status":"cancelled"}',
        signatureHeader: hmac,
      }),
    ).toBe(false)
  })
})
