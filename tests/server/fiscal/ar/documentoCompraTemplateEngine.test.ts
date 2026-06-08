import { describe, expect, it } from 'vitest'
import {
  extractWithDocumentoCompraTemplates,
  mapTemplateExtractToDocumentoCompraPreview,
} from '../../../../server/fiscal/ar/documentoCompraTemplateEngine'
import type { DocumentoCompraTemplate } from '../../../../server/fiscal/ar/documentoCompraTemplateTypes'

const arTemplate: DocumentoCompraTemplate = {
  issuer: 'generic-afip-ar-test',
  keywords: ['CUIT', 'CAE'],
  fields: {
    invoice_number: '(?:Comp\\.?|Factura|Nro\\.?)\\s+(\\d{4,5}[-–]\\d{1,8})',
    date: 'Fecha\\s+(\\d{2}/\\d{2}/\\d{4})',
    amount: 'TOTAL\\s+\\$?\\s*([\\d.,]+)',
    vat_id: 'CUIT[:\\s]+(\\d{2}[-]?\\d{8}[-]?\\d{1})',
    cae: 'CAE\\s+(\\d{14})',
    tipo_letra: 'Factura\\s+([ABC])\\b',
  },
  options: {
    currency: 'ARS',
    date_formats: ['%d/%m/%Y'],
    decimal_separator: ',',
    thousands_separator: '.',
  },
}

const sampleText =
  'ACME PROVEEDOR SA CUIT: 30-71234567-8 Factura B Comp. 00003-00000157 Fecha 20/11/2025 ' +
  'NETO TOTAL $ 121.000,50 CAE 74239871234567'

describe('documentoCompraTemplateEngine', () => {
  it('extracts Argentina template fields from digital PDF text', () => {
    const result = extractWithDocumentoCompraTemplates(sampleText, [arTemplate])
    expect(result).not.toBeNull()
    expect(result?.issuer).toBe('generic-afip-ar-test')
    expect(result?.tipo).toBe('B')
    expect(result?.prefijo).toBe('0003')
    expect(result?.numero).toBe(157)
    expect(result?.cuitDigits).toBe('30712345678')
    expect(result?.cae).toBe('74239871234567')
    expect(result?.total).toBe(121000.5)
    expect(result?.confidence).toBeGreaterThanOrEqual(0.8)
  })

  it('maps template extract to purchase preview', () => {
    const extracted = extractWithDocumentoCompraTemplates(sampleText, [arTemplate])
    expect(extracted).not.toBeNull()
    const preview = mapTemplateExtractToDocumentoCompraPreview(extracted!, 9)
    expect(preview.proveedorId).toBe(9)
    expect(preview.tipo).toBe('B')
    expect(preview.neto1).toBeGreaterThan(0)
    expect(preview.iva1).toBeGreaterThan(0)
    expect(preview.fieldConfidence.total).toBeGreaterThanOrEqual(0.8)
  })

  it('returns null when keywords are missing', () => {
    const result = extractWithDocumentoCompraTemplates('Invoice without fiscal markers', [arTemplate])
    expect(result).toBeNull()
  })
})
