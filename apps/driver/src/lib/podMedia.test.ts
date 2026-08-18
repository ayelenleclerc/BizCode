import { describe, expect, it, vi } from 'vitest'
import {
  POD_MAX_FIRMA_BYTES,
  POD_MAX_PHOTO_DIM,
  base64PayloadByteLength,
  compressPhotoUri,
  compressSignatureDataUrl,
  resizeDimensions,
  toJpegDataUrl,
} from './podMedia'

const TINY_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

describe('podMedia (driver #161)', () => {
  it('base64PayloadByteLength matches data-URL payload size', () => {
    expect(base64PayloadByteLength(TINY_PNG)).toBeGreaterThan(0)
    expect(base64PayloadByteLength('')).toBe(0)
    expect(base64PayloadByteLength('data:image/png;base64,')).toBe(0)
  })

  it('toJpegDataUrl prefixes raw base64', () => {
    expect(toJpegDataUrl('YWJj')).toBe('data:image/jpeg;base64,YWJj')
    expect(toJpegDataUrl('data:image/jpeg;base64,YWJj')).toBe('data:image/jpeg;base64,YWJj')
  })

  it('resizeDimensions keeps images already under maxDim', () => {
    expect(resizeDimensions(800, 600, POD_MAX_PHOTO_DIM)).toEqual({ width: 800, height: 600 })
  })

  it('resizeDimensions scales the longest side to maxDim', () => {
    expect(resizeDimensions(2560, 1280, POD_MAX_PHOTO_DIM)).toEqual({ width: 1280, height: 640 })
  })

  it('compressSignatureDataUrl passes when under limit', () => {
    expect(compressSignatureDataUrl(TINY_PNG, POD_MAX_FIRMA_BYTES)).toBe(TINY_PNG)
  })

  it('compressSignatureDataUrl throws when over limit', () => {
    const huge = `data:image/png;base64,${'A'.repeat(POD_MAX_FIRMA_BYTES * 2)}`
    expect(() => compressSignatureDataUrl(huge, POD_MAX_FIRMA_BYTES)).toThrow('POD_FIRMA_TOO_LARGE')
  })

  it('compressPhotoUri lowers JPEG quality until under maxBytes', async () => {
    const oversized = `data:image/jpeg;base64,${'A'.repeat(80)}`
    const compact = `data:image/jpeg;base64,${'A'.repeat(8)}`
    const manipulate = vi.fn(async (_uri: string, _resize: unknown, compress: number) =>
      compress > 0.7 ? oversized : compact,
    )

    const result = await compressPhotoUri('file://photo.jpg', 20, {
      width: 100,
      height: 80,
      manipulate,
    })

    expect(result).toBe(compact)
    expect(manipulate.mock.calls.length).toBeGreaterThan(1)
  })

  it('compressPhotoUri throws POD_FOTO_TOO_LARGE when still over limit', async () => {
    const huge = `data:image/jpeg;base64,${'A'.repeat(80)}`
    await expect(
      compressPhotoUri('file://photo.jpg', 10, {
        width: 10,
        height: 10,
        manipulate: async () => huge,
      }),
    ).rejects.toThrow('POD_FOTO_TOO_LARGE')
  })
})
