import { describe, expect, it, vi, beforeEach } from 'vitest'
import {
  DOCUMENTO_COMPRA_TIER3_CONFIDENCE_FACTOR,
  tryExtractDocumentoCompraTier3,
} from '../../../server/services/documentoCompraTier3Extract'

const mockPreprocess = vi.hoisted(() => vi.fn())
const mockOcr = vi.hoisted(() => vi.fn())

vi.mock('../../../server/fiscal/ar/documentoCompraImagePreprocess', () => ({
  preprocessDocumentoCompraImage: mockPreprocess,
}))

vi.mock('../../../server/fiscal/ar/documentoCompraOcr', () => ({
  runDocumentoCompraOcr: mockOcr,
}))

const sampleText =
  'PROVEEDOR SA CUIT: 30-71234567-8 Factura B Comp. 00003-00000157 Fecha 20/11/2025 ' +
  'TOTAL $ 121.000,50 CAE 74239871234567'

describe('documentoCompraTier3Extract', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPreprocess.mockResolvedValue(Buffer.from('png'))
  })

  it('returns OCR template result for images with sufficient confidence', async () => {
    mockOcr.mockResolvedValue(sampleText)
    const result = await tryExtractDocumentoCompraTier3(
      Buffer.from('image-bytes'),
      'image/jpeg',
      'jpg',
    )
    expect(result?.source).toBe('ocr_template')
    expect(result?.numero).toBe(157)
    expect(result?.confidence).toBeGreaterThanOrEqual(0.6)
    expect(result?.confidence).toBeLessThanOrEqual(1 * DOCUMENTO_COMPRA_TIER3_CONFIDENCE_FACTOR)
  })

  it('skips PDF files', async () => {
    const result = await tryExtractDocumentoCompraTier3(
      Buffer.from('%PDF'),
      'application/pdf',
      'pdf',
    )
    expect(result).toBeNull()
    expect(mockOcr).not.toHaveBeenCalled()
  })

  it('returns null when OCR text is too short', async () => {
    mockOcr.mockResolvedValue('short')
    const result = await tryExtractDocumentoCompraTier3(
      Buffer.from('image'),
      'image/png',
      'png',
    )
    expect(result).toBeNull()
  })
})
