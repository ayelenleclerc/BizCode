import { describe, expect, it } from 'vitest'
import { articuloImagePublicUrl } from './articuloImageUrl'

describe('articuloImagePublicUrl (#235/#257)', () => {
  it('prefixes uploads path and normalizes backslashes', () => {
    expect(articuloImagePublicUrl('1/20/a-thumb.webp')).toBe('/uploads/articulos/1/20/a-thumb.webp')
    expect(articuloImagePublicUrl('1\\20\\a-thumb.webp')).toBe('/uploads/articulos/1/20/a-thumb.webp')
  })
})
