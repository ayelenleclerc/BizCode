import { describe, expect, it, vi } from 'vitest'
import {
  POD_MAX_FIRMA_BYTES,
  base64PayloadByteLength,
  canvasToPngDataUrl,
  compressSignatureDataUrl,
  isSignatureCanvasBlank,
} from './podMedia'

const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

describe('podMedia (client)', () => {
  it('canvasToPngDataUrl delegates to canvas', () => {
    const canvas = {
      toDataURL: vi.fn().mockReturnValue(TINY_PNG),
    } as unknown as HTMLCanvasElement
    expect(canvasToPngDataUrl(canvas)).toBe(TINY_PNG)
  })

  it('base64PayloadByteLength matches server helper behavior', () => {
    expect(base64PayloadByteLength(TINY_PNG)).toBeGreaterThan(0)
  })

  it('compressSignatureDataUrl passes when under limit', () => {
    expect(compressSignatureDataUrl(TINY_PNG, POD_MAX_FIRMA_BYTES)).toBe(TINY_PNG)
  })

  it('compressSignatureDataUrl throws when over limit', () => {
    const huge = `data:image/png;base64,${'A'.repeat(POD_MAX_FIRMA_BYTES * 2)}`
    expect(() => compressSignatureDataUrl(huge, POD_MAX_FIRMA_BYTES)).toThrow('POD_FIRMA_TOO_LARGE')
  })

  it('isSignatureCanvasBlank returns true when getContext is missing', () => {
    const canvas = document.createElement('canvas')
    vi.spyOn(canvas, 'getContext').mockReturnValue(null)
    expect(isSignatureCanvasBlank(canvas)).toBe(true)
    vi.restoreAllMocks()
  })

  it('compressPhotoFile returns jpeg data url', async () => {
    const file = new File([new Uint8Array([1, 2, 3])], 'photo.png', { type: 'image/png' })
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn(async () => ({
        width: 8,
        height: 8,
        close: vi.fn(),
      })),
    )
    const drawImage = vi.fn()
    const toDataURL = vi.fn().mockReturnValue('data:image/jpeg;base64,YWJj')
    vi.spyOn(document, 'createElement').mockReturnValue({
      width: 0,
      height: 0,
      getContext: () => ({ drawImage, fillRect: vi.fn() }),
      toDataURL,
    } as unknown as HTMLCanvasElement)

    const { compressPhotoFile } = await import('./podMedia')
    const result = await compressPhotoFile(file, 200 * 1024)
    expect(result).toContain('image/jpeg')
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })
})
