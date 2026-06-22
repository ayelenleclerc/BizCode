import { describe, expect, it } from 'vitest'
import { DOCUMENTO_COMPRA_OCR_LANG } from '../../../../apps/server/fiscal/ar/documentoCompraOcr'

describe('documentoCompraOcr', () => {
  it('includes Spanish, English and Portuguese OCR languages (#277 Fase G)', () => {
    expect(DOCUMENTO_COMPRA_OCR_LANG).toBe('spa+eng+por')
  })
})
