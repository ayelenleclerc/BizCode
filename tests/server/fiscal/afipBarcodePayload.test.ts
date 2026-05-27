import { describe, expect, it } from 'vitest'
import { buildAfipBarcodePayload } from '../../../server/fiscal/ar/afipBarcodePayload'

describe('afipBarcodePayload', () => {
  it('builds 39-digit Interleaved 2 of 5 payload', () => {
    const payload = buildAfipBarcodePayload({
      cuitEmisor: '30-12345678-9',
      tipo: 'B',
      prefijo: '0001',
      cae: '70000000000007',
      caeVto: new Date('2026-01-20T12:00:00.000Z'),
    })
    expect(payload).toMatch(/^\d{39}$/)
    expect(payload.startsWith('30123456789')).toBe(true)
    expect(payload.slice(11, 13)).toBe('06')
    expect(payload.slice(13, 17)).toBe('0001')
    expect(payload.endsWith('20260120')).toBe(true)
  })
})
