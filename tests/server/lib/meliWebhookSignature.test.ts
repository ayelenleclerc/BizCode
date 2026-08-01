/**
 * @en Mercado Libre webhook signature unit tests (#185).
 * @es Tests unitarios de firma de webhook Mercado Libre (#185).
 */

import { describe, expect, it } from 'vitest'
import {
  buildMeliSignatureManifest,
  computeMeliSignatureHmac,
  parseMeliSignatureHeader,
  verifyMeliWebhookSignature,
} from '../../../apps/server/lib/meliWebhookSignature'

describe('meliWebhookSignature', () => {
  it('parses ts and v1 from x-signature', () => {
    expect(parseMeliSignatureHeader('ts=1704908010,v1=abc123')).toEqual({
      ts: '1704908010',
      v1: 'abc123',
    })
    expect(parseMeliSignatureHeader('bad')).toBeNull()
  })

  it('verifies HMAC-SHA256 manifest with lowercased data id', () => {
    const secret = 'meli-secret'
    const dataId = 'MLA123'
    const requestId = 'req-1'
    const ts = '1704908010'
    const manifest = buildMeliSignatureManifest(dataId, requestId, ts)
    expect(manifest).toBe('id:mla123;request-id:req-1;ts:1704908010;')
    const v1 = computeMeliSignatureHmac(secret, manifest)
    expect(
      verifyMeliWebhookSignature({
        secret,
        xSignature: `ts=${ts},v1=${v1}`,
        xRequestId: requestId,
        dataId,
      }),
    ).toBe(true)
    expect(
      verifyMeliWebhookSignature({
        secret,
        xSignature: `ts=${ts},v1=deadbeef`,
        xRequestId: requestId,
        dataId,
      }),
    ).toBe(false)
  })
})
