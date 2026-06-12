import { describe, expect, it } from 'vitest'
import {
  buildMercadoPagoSignatureManifest,
  computeMercadoPagoSignatureHmac,
  parseMercadoPagoSignatureHeader,
  verifyMercadoPagoWebhookSignature,
} from '../../../server/lib/mercadopagoSignature'

describe('mercadopagoSignature (#176)', () => {
  it('parses x-signature header', () => {
    expect(parseMercadoPagoSignatureHeader('ts=1704908010,v1=abc123')).toEqual({
      ts: '1704908010',
      v1: 'abc123',
    })
  })

  it('builds manifest with lowercase data id', () => {
    expect(buildMercadoPagoSignatureManifest('12345', 'req-1', '99')).toBe(
      'id:12345;request-id:req-1;ts:99;',
    )
    expect(buildMercadoPagoSignatureManifest('ABC', 'req-1', '99')).toBe(
      'id:abc;request-id:req-1;ts:99;',
    )
  })

  it('verifies valid HMAC signature', () => {
    const secret = 'whsec-test'
    const ts = '1704908010'
    const requestId = 'req-abc'
    const dataId = '12345678'
    const manifest = buildMercadoPagoSignatureManifest(dataId, requestId, ts)
    const v1 = computeMercadoPagoSignatureHmac(secret, manifest)
    const xSignature = `ts=${ts},v1=${v1}`

    expect(
      verifyMercadoPagoWebhookSignature({
        secret,
        xSignature,
        xRequestId: requestId,
        dataId,
      }),
    ).toBe(true)
  })

  it('rejects invalid signature', () => {
    expect(
      verifyMercadoPagoWebhookSignature({
        secret: 'whsec-test',
        xSignature: 'ts=1,v1=bad',
        xRequestId: 'req',
        dataId: '99',
      }),
    ).toBe(false)
  })
})
