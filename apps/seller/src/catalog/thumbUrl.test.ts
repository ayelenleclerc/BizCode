import { describe, expect, it } from 'vitest'
import { articuloInitials, toAbsoluteUploadUrl } from './thumbUrl'

describe('thumbUrl (#257)', () => {
  it('builds initials placeholder', () => {
    expect(articuloInitials('Leche Entera')).toBe('LE')
    expect(articuloInitials('Yogur')).toBe('YO')
    expect(articuloInitials('  ')).toBe('?')
  })

  it('resolves relative upload paths against API origin', () => {
    expect(toAbsoluteUploadUrl('/uploads/articulos/1/20/a-thumb.webp', 'http://192.168.1.10:3001/api')).toBe(
      'http://192.168.1.10:3001/uploads/articulos/1/20/a-thumb.webp',
    )
    expect(toAbsoluteUploadUrl(null, 'http://localhost:3001/api')).toBeNull()
    expect(toAbsoluteUploadUrl('https://cdn.example/x.webp')).toBe('https://cdn.example/x.webp')
  })
})
