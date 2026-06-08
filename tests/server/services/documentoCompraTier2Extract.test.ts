import { describe, expect, it, vi, beforeEach } from 'vitest'
import { tryExtractDocumentoCompraTier2 } from '../../../server/services/documentoCompraTier2Extract'

const mockExtractPdf = vi.hoisted(() => vi.fn())

vi.mock('../../../server/fiscal/ar/documentoCompraPdfText', () => ({
  extractPdfPlainText: mockExtractPdf,
}))

const sampleText =
  'PROVEEDOR SA CUIT: 30-71234567-8 Factura B Comp. 00003-00000157 Fecha 20/11/2025 ' +
  'TOTAL $ 121.000,50 CAE 74239871234567'

describe('documentoCompraTier2Extract', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns tier 2 result for PDF with matching template text', async () => {
    mockExtractPdf.mockResolvedValue(sampleText)
    const result = await tryExtractDocumentoCompraTier2(
      Buffer.from('%PDF'),
      'application/pdf',
      'pdf',
    )
    expect(result?.source).toBe('pdf_text_template')
    expect(result?.issuer).toBe('generic-afip-ar')
    expect(result?.confidence).toBeGreaterThanOrEqual(0.7)
    expect(result?.numero).toBe(157)
  })

  it('skips non-PDF files', async () => {
    const result = await tryExtractDocumentoCompraTier2(
      Buffer.from('image'),
      'image/png',
      'png',
    )
    expect(result).toBeNull()
    expect(mockExtractPdf).not.toHaveBeenCalled()
  })

  it('returns null when confidence is below threshold', async () => {
    mockExtractPdf.mockResolvedValue('random pdf text without fiscal markers')
    const result = await tryExtractDocumentoCompraTier2(
      Buffer.from('%PDF'),
      'application/pdf',
      'pdf',
    )
    expect(result).toBeNull()
  })
})
