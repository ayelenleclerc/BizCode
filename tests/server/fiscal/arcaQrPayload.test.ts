import { describe, expect, it } from 'vitest'
import {
  ARCA_FE_QR_BASE_URL,
  buildArcaQrJsonPayload,
  buildArcaQrUrl,
  encodeArcaQrParam,
} from '../../../apps/server/fiscal/ar/arcaQrPayload'

describe('arcaQrPayload', () => {
  const base = {
    fecha: new Date('2026-01-10T12:00:00.000Z'),
    cuitEmisor: '30-12345678-9',
    prefijo: '0001',
    tipo: 'B',
    numero: 42,
    importeTotal: 121,
    clienteCuit: '20-12345678-6',
    cae: '70000000000007',
  }

  it('builds JSON payload with AFIP field shapes', () => {
    const json = buildArcaQrJsonPayload(base)
    expect(json.ver).toBe(1)
    expect(json.fecha).toBe('20260110')
    expect(json.cuit).toBe(30123456789)
    expect(json.ptoVta).toBe(1)
    expect(json.tipoCmp).toBe(6)
    expect(json.nroCmp).toBe(42)
    expect(json.importe).toBe(121)
    expect(json.moneda).toBe('PES')
    expect(json.tipoCodAut).toBe('E')
    expect(json.codAut).toBe(70000000000007)
  })

  it('builds verification URL under AFIP FE QR base', () => {
    const url = buildArcaQrUrl(base)
    expect(url.startsWith(ARCA_FE_QR_BASE_URL)).toBe(true)
    expect(url).toContain('?p=')
    const param = url.split('?p=')[1]
    expect(param.length).toBeGreaterThan(10)
    const decoded = JSON.parse(Buffer.from(param.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'))
    expect(decoded.tipoCmp).toBe(6)
  })

  it('encodeArcaQrParam uses base64url without padding', () => {
    const payload = buildArcaQrJsonPayload(base)
    const encoded = encodeArcaQrParam(payload)
    expect(encoded).not.toMatch(/=+$/)
    expect(encoded).not.toMatch(/[+/]/)
  })
})
