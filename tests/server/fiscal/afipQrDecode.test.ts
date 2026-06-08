import { describe, expect, it } from 'vitest'
import {
  decodeAfipQrParam,
  extractAfipQrPayloadFromBuffer,
  mapAfipQrToDocumentoCompraPreview,
  parseAfipQrFechaToIso,
} from '../../../server/fiscal/ar/afipQrDecode'
import { buildAfipQrJsonPayload, buildAfipQrUrl, encodeAfipQrParam } from '../../../server/fiscal/ar/afipQrPayload'

const base = {
  fecha: new Date('2026-01-10T12:00:00.000Z'),
  cuitEmisor: '30-71234567-8',
  prefijo: '0003',
  tipo: 'B',
  numero: 157,
  importeTotal: 121000.5,
  clienteCuit: '20-34567890-1',
  cae: '74239871234567',
}

describe('afipQrDecode', () => {
  it('decodes base64url param round-trip', () => {
    const payload = buildAfipQrJsonPayload(base)
    const decoded = decodeAfipQrParam(encodeAfipQrParam(payload))
    expect(decoded.tipoCmp).toBe(6)
    expect(decoded.nroCmp).toBe(157)
    expect(decoded.importe).toBe(121000.5)
  })

  it('extracts payload from embedded PDF buffer text', () => {
    const url = buildAfipQrUrl(base)
    const buffer = Buffer.from(`%PDF-1.4 fake content ${url} trailer`)
    const payload = extractAfipQrPayloadFromBuffer(buffer)
    expect(payload?.cuit).toBe(30712345678)
    expect(payload?.ptoVta).toBe(3)
  })

  it('maps QR JSON to purchase preview with estimated IVA for tipo B', () => {
    const payload = buildAfipQrJsonPayload(base)
    const preview = mapAfipQrToDocumentoCompraPreview(payload, 5)
    expect(preview.tipo).toBe('B')
    expect(preview.prefijo).toBe('0003')
    expect(preview.numero).toBe(157)
    expect(preview.proveedorId).toBe(5)
    expect(preview.total).toBe(121000.5)
    expect(preview.cae).toBe('74239871234567')
    expect(preview.fecha).toBe('2026-01-10T12:00:00.000Z')
    expect(preview.fieldConfidence.tipo).toBe(1)
    expect(preview.fieldConfidence.iva1).toBe(0.7)
  })

  it('parseAfipQrFechaToIso accepts YYYYMMDD', () => {
    expect(parseAfipQrFechaToIso('20251120')).toBe('2025-11-20T12:00:00.000Z')
  })
})
