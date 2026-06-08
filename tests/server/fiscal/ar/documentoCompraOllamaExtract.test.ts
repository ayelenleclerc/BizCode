import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  extractDocumentoCompraWithOllama,
  mapOllamaFieldsToTemplateExtract,
} from '../../../../server/fiscal/ar/documentoCompraOllamaExtract'

describe('documentoCompraOllamaExtract', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    process.env.OLLAMA_URL = 'http://127.0.0.1:11434'
    process.env.OLLAMA_MODEL = 'nuextract'
  })

  afterEach(() => {
    delete process.env.OLLAMA_URL
    delete process.env.OLLAMA_MODEL
    globalThis.fetch = originalFetch
  })

  it('mapOllamaFieldsToTemplateExtract maps structured fields', () => {
    const result = mapOllamaFieldsToTemplateExtract({
      proveedor_cuit: '30-71234567-8',
      tipo_comprobante: 'B',
      prefijo: '0003',
      numero: 157,
      fecha_emision: '2025-11-20',
      total: 121,
      cae: '74239871234567',
      confianza: 0.6,
    })
    expect(result?.tipo).toBe('B')
    expect(result?.numero).toBe(157)
    expect(result?.total).toBe(121)
    expect(result?.cuitDigits).toBe('30712345678')
    expect(result?.confidence).toBeLessThanOrEqual(0.69)
  })

  it('extractDocumentoCompraWithOllama returns null when Ollama is not configured', async () => {
    delete process.env.OLLAMA_URL
    const result = await extractDocumentoCompraWithOllama('x'.repeat(40))
    expect(result).toBeNull()
  })

  it('extractDocumentoCompraWithOllama parses Ollama generate response', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({
          response: JSON.stringify({
            proveedor_cuit: '30-71234567-8',
            tipo_comprobante: 'B',
            prefijo: '0003',
            numero: 157,
            fecha_emision: '2025-11-20',
            total: 121,
            cae: '74239871234567',
            confianza: 0.55,
          }),
        }),
    }) as typeof fetch

    const result = await extractDocumentoCompraWithOllama(
      'PROVEEDOR SA CUIT 30-71234567-8 Factura B 00003-00000157 TOTAL 121',
    )
    expect(result?.tipo).toBe('B')
    expect(result?.numero).toBe(157)
    expect(result?.issuer).toBe('ollama-local')
  })
})
