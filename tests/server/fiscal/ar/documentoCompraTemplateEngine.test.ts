import { describe, expect, it } from 'vitest'
import {
  extractWithDocumentoCompraTemplates,
  mapTemplateExtractToDocumentoCompraPreview,
} from '../../../../server/fiscal/ar/documentoCompraTemplateEngine'
import type { DocumentoCompraTemplate } from '../../../../server/fiscal/ar/documentoCompraTemplateTypes'

const arTemplate: DocumentoCompraTemplate = {
  issuer: 'generic-arca-ar-test',
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
  'Aceite girasol 1L x 24 $1.250,00 $30.000,00 NETO TOTAL $ 121.000,50 CAE 74239871234567'

describe('documentoCompraTemplateEngine', () => {
  it('extracts Argentina template fields from digital PDF text', () => {
    const result = extractWithDocumentoCompraTemplates(sampleText, [arTemplate])
    expect(result).not.toBeNull()
    expect(result?.issuer).toBe('generic-arca-ar-test')
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
    expect(preview.items.length).toBeGreaterThanOrEqual(1)
    expect(preview.cuitExtracted).toBe('30712345678')
  })

  it('returns null when keywords are missing', () => {
    const result = extractWithDocumentoCompraTemplates('Invoice without fiscal markers', [arTemplate])
    expect(result).toBeNull()
  })

  it('extracts Brazil NF-e template fields', () => {
    const brTemplate: DocumentoCompraTemplate = {
      issuer: 'generic-nfe-brasil-test',
      keywords: ['NF-e', 'CNPJ'],
      fields: {
        invoice_number: 'N[°º\\.\\s]+(\\d+)',
        date: 'Data\\s+(\\d{2}/\\d{2}/\\d{4})',
        amount: 'VALOR TOTAL\\s+R?\\$?\\s*([\\d.,]+)',
        vat_id: 'CNPJ[:\\s]+([\\d./-]+)',
      },
      options: { decimal_separator: ',', thousands_separator: '.', date_formats: ['%d/%m/%Y'] },
    }
    const text =
      'NF-e N° 12345 CNPJ: 12.345.678/0001-90 Data 15/11/2025 VALOR TOTAL R$ 55.660,00'
    const result = extractWithDocumentoCompraTemplates(text, [brTemplate])
    expect(result?.issuer).toBe('generic-nfe-brasil-test')
    expect(result?.numero).toBe(12345)
    expect(result?.total).toBe(55660)
  })

  it('extracts Uruguay DGI template fields', () => {
    const uyTemplate: DocumentoCompraTemplate = {
      issuer: 'generic-dgi-uruguay-test',
      keywords: ['RUT', 'DGI'],
      fields: {
        invoice_number: 'N[°º\\.\\s]+(\\d+)',
        date: 'Fecha\\s+(\\d{2}/\\d{2}/\\d{4})',
        amount: 'TOTAL\\s+\\$?\\s*([\\d.,]+)',
        vat_id: 'RUT[:\\s]+([\\d-]+)',
      },
      options: { decimal_separator: ',', thousands_separator: '.', date_formats: ['%d/%m/%Y'] },
    }
    const text = 'DGI RUT: 21-1234567-8 Fecha 10/01/2026 N° 889 TOTAL $ 12.500,00'
    const result = extractWithDocumentoCompraTemplates(text, [uyTemplate])
    expect(result?.issuer).toBe('generic-dgi-uruguay-test')
    expect(result?.numero).toBe(889)
    expect(result?.total).toBe(12500)
  })
})
